import * as rcpromise from "real-cancellable-promise";

export class Async<E, D> {
    private constructor(private _promise: () => rcpromise.CancellablePromise<D>) {}

    static success<E, D>(data: D): Async<E, D> {
        return new Async(() => rcpromise.CancellablePromise.resolve(data));
    }

    static error<E, D>(error: E): Async<E, D> {
        return new Async(() => rcpromise.CancellablePromise.reject(error));
    }

    static fromComputation<E, D>(
        computation: (resolve: (value: D) => void, reject: (error: E) => void) => Cancel,
    ): Async<E, D> {
        let cancel: Cancel = () => {};

        return new Async(() => {
            const promise = new Promise<D>((resolve, reject) => {
                cancel = computation(resolve, error => reject(error));
            });

            return new rcpromise.CancellablePromise(promise, cancel || (() => {}));
        });
    }

    run(onSuccess: (data: D) => void, onError: (error: E) => void): Cancel {
        return this._promise().then(onSuccess, err => {
            if (err instanceof rcpromise.Cancellation) {
                // no-op
            } else {
                onError(err);
            }
        }).cancel;
    }

    map<U>(fn: (data: D) => U): Async<E, U> {
        return new Async(() => this._promise().then(fn));
    }

    mapError<E2>(fn: (error: E) => E2): Async<E2, D> {
        return new Async(() =>
            this._promise().catch((error: E) => {
                throw fn(error);
            }),
        );
    }

    flatMap<U, E>(fn: (data: D) => Async<U, E>): Async<U, E> {
        return new Async(() => this._promise().then(data => fn(data)._promise()));
    }

    chain<U, E>(fn: (data: D) => Async<U, E>): Async<U, E> {
        return this.flatMap(fn);
    }

    toPromise(): Promise<D> {
        return this._promise();
    }

    static join2<E, T, S>(async1: Async<E, T>, async2: Async<E, S>): Async<E, [T, S]> {
        return new Async(() => {
            return rcpromise.CancellablePromise.all<T, S>([async1._promise(), async2._promise()]);
        });
    }

    static joinObj<E, Obj extends Record<string, Async<any, any>>>(
        obj: Obj,
        options: ParallelOptions = { concurrency: 1 },
    ): Async<
        Obj[keyof Obj] extends Async<infer E, any> ? E : never,
        { [K in keyof Obj]: Obj[K] extends Async<any, infer U> ? U : never }
    > {
        const asyncs = Object.values(obj);

        return Async.parallel(asyncs, options).map(values => {
            const keys = Object.keys(obj);
            const pairs = keys.map((key, idx) => [key, values[idx]]);
            return Object.fromEntries(pairs);
        });
    }

    static sequential<E, D>(asyncs: Async<E, D>[]): Async<E, D[]> {
        return Async.block(async $ => {
            const output: D[] = [];
            for (const async of asyncs) {
                const res = await $(async);
                output.push(res);
            }
            return output;
        });
    }

    static parallel<E, D>(asyncs: Async<E, D>[], options: ParallelOptions): Async<E, D[]> {
        return new Async(() =>
            rcpromise.buildCancellablePromise(async $ => {
                const queue: rcpromise.CancellablePromise<void>[] = [];
                const output: D[] = new Array(asyncs.length);

                for (const [idx, async] of asyncs.entries()) {
                    const queueItem$ = async._promise().then(res => {
                        queue.splice(queue.indexOf(queueItem$), 1);
                        output[idx] = res;
                    });

                    queue.push(queueItem$);

                    if (queue.length >= options.concurrency)
                        await $(rcpromise.CancellablePromise.race(queue));
                }

                await $(rcpromise.CancellablePromise.all(queue));
                return output;
            }),
        );
    }

    static sleep(ms: number): Async<any, number> {
        return new Async(() => rcpromise.CancellablePromise.delay(ms)).map(() => ms);
    }

    static void(): Async<void, unknown> {
        return Async.success(undefined);
    }

    static block<E, U>(blockFn: (capture: CaptureAsync<E>) => Promise<U>): Async<E, U> {
        return new Async((): rcpromise.CancellablePromise<U> => {
            return rcpromise.buildCancellablePromise(capturePromise => {
                const captureAsync: CaptureAsync<E> = async => {
                    return capturePromise(async._promise());
                };

                captureAsync.throw = function <D>(error: E) {
                    throw error;
                };

                return blockFn(captureAsync);
            });
        });
    }

    static block_<E>() {
        return function <U>(blockFn: (capture: CaptureAsync<E>) => Promise<U>): Async<E, U> {
            return Async.block<E, U>(blockFn);
        };
    }
}

export type Cancel = (() => void) | undefined;

interface CaptureAsync<E> {
    <D>(async: Async<E, D>): Promise<D>;
    throw: (error: E) => never;
}

type ParallelOptions = { concurrency: number };

export function getJSON2<U>(url: string): Async<TypeError | SyntaxError, U> {
    const abortController = new AbortController();

    return Async.fromComputation((resolve, reject) => {
        // exceptions: TypeError | AbortError(DOMException)
        fetch(url, { method: "get", signal: abortController.signal })
            .then(res => res.json() as U) // exceptions: SyntaxError
            .then(data => resolve(data))
            .catch((error: unknown) => {
                if (error instanceof TypeError || error instanceof SyntaxError) {
                    reject(error);
                }
                if (error instanceof DOMException) {
                    // no-op
                } else {
                    reject(new TypeError("Unknown error"));
                }
            });

        return () => abortController.abort();
    });
}
