import * as rcpromise from "real-cancellable-promise";

export class Async<T, E> {
    private constructor(private _promise: () => rcpromise.CancellablePromise<T>) {}

    static success<T, E>(data: T): Async<T, E> {
        return new Async(() => rcpromise.CancellablePromise.resolve(data));
    }

    static error<T, E>(error: E): Async<T, E> {
        return new Async(() => rcpromise.CancellablePromise.reject(error));
    }

    static fromComputation<T, E>(
        computation: (resolve: (value: T) => void, reject: (error: E) => void) => Cancel,
    ): Async<T, E> {
        let cancel: Cancel = () => {};

        return new Async(() => {
            const promise = new Promise<T>((resolve, reject) => {
                cancel = computation(resolve, error => reject(error));
            });

            return new rcpromise.CancellablePromise(promise, cancel || (() => {}));
        });
    }

    run(onSuccess: (data: T) => void, onError: (error: E) => void): Cancel {
        return this._promise().then(onSuccess, err => {
            if (err instanceof rcpromise.Cancellation) {
                // no-op
            } else {
                onError(err);
            }
        }).cancel;
    }

    map<U, E>(fn: (data: T) => U): Async<U, E> {
        return new Async(() => this._promise().then(fn));
    }

    mapError<E2>(fn: (error: E) => E2): Async<T, E2> {
        return new Async(() =>
            this._promise().catch((error: E) => {
                throw fn(error);
            }),
        );
    }

    flatMap<U, E>(fn: (data: T) => Async<U, E>): Async<U, E> {
        return new Async(() => this._promise().then(data => fn(data)._promise()));
    }

    chain<U, E>(fn: (data: T) => Async<U, E>): Async<U, E> {
        return this.flatMap(fn);
    }

    toPromise(): Promise<T> {
        return this._promise();
    }

    static join2<T, S, E>(async1: Async<T, E>, async2: Async<S, E>): Async<[T, S], E> {
        return new Async(() => {
            return rcpromise.CancellablePromise.all<T, S>([async1._promise(), async2._promise()]);
        });
    }

    static joinObj<Obj extends Record<string, Async<any, any>>, E>(
        obj: Obj,
        options: ParallelOptions = { concurrency: 1 },
    ): Async<{ [K in keyof Obj]: Obj[K] extends Async<infer U, infer E> ? U : never }, E> {
        const asyncs = Object.values(obj);

        return Async.parallel(asyncs, options).map(values => {
            const keys = Object.keys(obj);
            const pairs = keys.map((key, idx) => [key, values[idx]]);
            return Object.fromEntries(pairs);
        });
    }

    static sequential<T, E>(asyncs: Async<T, E>[]): Async<T[], E> {
        return Async.block(async $ => {
            const output: T[] = [];
            for (const async of asyncs) {
                const res = await $(async);
                output.push(res);
            }
            return output;
        });
    }

    static parallel<T, E>(asyncs: Async<T, E>[], options: ParallelOptions): Async<T[], E> {
        return new Async(() =>
            rcpromise.buildCancellablePromise(async $ => {
                const queue: rcpromise.CancellablePromise<void>[] = [];
                const output: T[] = new Array(asyncs.length);

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

    static sleep(ms: number): Async<number, unknown> {
        return new Async(() => rcpromise.CancellablePromise.delay(ms)).map(() => ms);
    }

    static void(): Async<void, unknown> {
        return Async.success(undefined);
    }

    static block<U, E>(blockFn: (captureAsync: CaptureAsync<E>) => Promise<U>): Async<U, E> {
        return new Async((): rcpromise.CancellablePromise<U> => {
            return rcpromise.buildCancellablePromise(capturePromise => {
                const captureAsync: CaptureAsync<E> = async => {
                    return capturePromise(async._promise());
                };

                captureAsync.error = function <T>(error: E) {
                    return capturePromise(rcpromise.CancellablePromise.reject(error)) as Promise<T>;
                };

                return blockFn(captureAsync);
            });
        });
    }
}

export type Cancel = (() => void) | undefined;

interface CaptureAsync<E> {
    <T>(async: Async<T, E>): Promise<T>;
    error: <T>(error: E) => Promise<T>;
}

type ParallelOptions = { concurrency: number };

export function getJSON2<U>(url: string): Async<U, Error | TypeError | SyntaxError> {
    const abortController = new AbortController();

    return Async.fromComputation((resolve, reject) => {
        fetch(url, { method: "get", signal: abortController.signal })
            .then(res => res.json() as U)
            .then(data => resolve(data))
            .catch((error: unknown) => {
                if (error instanceof TypeError || error instanceof SyntaxError) {
                    reject(error);
                } else {
                    reject(new Error("Unknown error"));
                }
            });

        return () => abortController.abort();
    });
}
