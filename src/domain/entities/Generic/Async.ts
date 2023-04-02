import {
    buildCancellablePromise,
    CancellablePromise,
    Cancellation,
} from "real-cancellable-promise";

export class AsyncError extends Error {
    type = "asyncError";
}

export class AsyncCancel extends Error {
    type = "asyncCancel";
}

type Cancel = () => void;

export class Async<T> {
    private constructor(private _promise: () => CancellablePromise<T>) {}

    static success<T>(data: T): Async<T> {
        return new Async(() => CancellablePromise.resolve(data));
    }

    static error<T>(message: string): Async<T> {
        const error = buildError(message);
        return new Async(() => CancellablePromise.reject(error));
    }

    static fromComputation<T>(
        computation: (resolve: (value: T) => void, reject: (message: string) => void) => Cancel,
    ): Async<T> {
        let cancel: Cancel;

        return new Async(() => {
            const promise = new Promise<T>((resolve, reject) => {
                cancel = computation(resolve, message => reject(new AsyncError(message)));
            });

            return new CancellablePromise(promise, cancel);
        });
    }

    run(onSuccess: (data: T) => void, onError: (error: AsyncError) => void): Cancel {
        return this._promise().then(onSuccess, err => {
            if (err instanceof Cancellation) {
                onError(new AsyncCancel());
            } else if (err instanceof AsyncError) {
                onError(err);
            } else {
                onError(buildError("Unknown error"));
            }
        }).cancel;
    }

    map<U>(fn: (data: T) => U): Async<U> {
        return new Async(() => this._promise().then(fn));
    }

    flatMap<U>(fn: (data: T) => Async<U>): Async<U> {
        return new Async(() => this._promise().then(data => fn(data)._promise()));
    }

    chain = this.flatMap;

    toPromise(): Promise<T> {
        return this._promise();
    }

    static delay(ms: number): Async<number> {
        return new Async(() => CancellablePromise.delay(ms)).map(() => ms);
    }

    static void(): Async<void> {
        return Async.success(undefined);
    }

    static block<U>(blockFn: (captureAsync: CaptureAsync) => Promise<U>): Async<U> {
        return new Async((): CancellablePromise<U> => {
            return buildCancellablePromise(capturePromise => {
                const captureAsync: CaptureAsync = async => capturePromise(async._promise());

                captureAsync.error = function <T>(message: string) {
                    const err = buildError(message);
                    return capturePromise(CancellablePromise.reject(err)) as Promise<T>;
                };

                return blockFn(captureAsync);
            });
        });
    }
}

function buildError(message: string): AsyncError {
    return new AsyncError(message);
}

interface CaptureAsync {
    <T>(async: Async<T>): Promise<T>;
    error: <T>(message: string) => Promise<T>;
}
