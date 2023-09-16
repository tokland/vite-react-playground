import { describe, expect, test, it, vi, expectTypeOf } from "vitest";
import { Async } from "../Async2";

describe("Basic builders", () => {
    test("Async.success", async () => {
        const value$ = Async.success(10);

        expectTypeOf(value$).toEqualTypeOf<Async<unknown, number>>();
        await expectAsync(value$, { toEqual: 10 });
    });

    test("Async.error", async () => {
        const error = new CodedError("message: Error 1", { code: "E001" });
        const value$ = Async.error(error);

        expectTypeOf(value$).toEqualTypeOf<Async<CodedError, unknown>>();
        await expectAsync(value$, { toThrow: error });
    });
});

describe("run", () => {
    it("calls the sucess branch with the value", async () => {
        const success = vi.fn();
        const reject = vi.fn();

        Async.success(1).run(success, reject);
        await nextTick();

        expect(success).toHaveBeenCalledTimes(1);
        expect(success.mock.calls[0]).toEqual([1]);
        expect(reject).not.toHaveBeenCalled();
    });

    it("calls the error branch with the error", async () => {
        const success = vi.fn();
        const reject = vi.fn();

        const async = Async.error({ errorCode: "E12" });
        async.run(success, reject);
        await nextTick();

        expect(success).not.toHaveBeenCalled();
        expect(reject).toHaveBeenCalledTimes(1);
        const error = reject.mock.calls[0]?.[0];
        expect(error).toEqual({ errorCode: "E12" });
    });
});

describe("toPromise", () => {
    it("convert an Async to promise", async () => {
        await expect(Async.success(1).toPromise()).resolves.toEqual(1);
    });
});

describe("helpers", () => {
    test("Async.sleep", async () => {
        await expect(Async.sleep(1).toPromise()).resolves.toEqual(1);
    });

    test("Async.void", async () => {
        await expect(Async.void().toPromise()).resolves.toBeUndefined();
    });
});

describe("Transformation", () => {
    test("map", async () => {
        const value1$ = Async.success(1);
        const value2$ = value1$.map(x => x.toString());

        await expectAsync(value2$, { toEqual: "1" });
    });

    test("mapError", async () => {
        const value1$ = Async.error(1);
        const value2$ = value1$.mapError(x => x.toString());

        await expectAsync(value2$, { toThrow: "1" });
    });

    describe("flatMap/chain", () => {
        it("builds an async value mapping to another async", async () => {
            const value1$ = Async.success(1);
            const value2$ = value1$
                .flatMap(value => Async.success(value + 2))
                .chain(value => Async.success(value + 3))
                .flatMap(value => Async.success(value + 4));

            await expectAsync(value2$, { toEqual: 10 });
        });
    });
});

describe("Async.block", () => {
    describe("when all awaited values in the block are successful", () => {
        it("returns the returned value as an async", async () => {
            const result$ = Async.block(async $ => {
                const value1 = await $(Async.success(1));
                const value2 = await $(Async.success(2));
                const value3 = await $(Async.success(3));
                return value1 + value2 + value3;
            });

            await expect(result$.toPromise()).resolves.toEqual(6);
        });
    });

    describe("when any the awaited values in the block is an error", () => {
        it("returns that error as the async result", async () => {
            const result$ = Async.block<string, number>(async $ => {
                const value1 = await $(Async.success(1));
                const value2 = await $(Async.error("message") as Async<string, number>);
                const value3 = await $(Async.success(3));
                return value1 + value2 + value3;
            });

            await expect(result$.toPromise()).rejects.toThrow("message");
        });
    });

    describe("when any the awaited values in the block is an error", () => {
        it("returns that error as the async result", async () => {
            const result$ = Async.block_<string>()(async $ => {
                const value1 = await $(Async.success(1));
                const value2 = await $(Async.error<string, number>("message"));
                const value3 = await $(Async.success(3));
                return value1 + value2 + value3;
            });

            await expect(result$.toPromise()).rejects.toThrow("message");
        });
    });

    describe("when the helper $.error is called", () => {
        it("returns that async error as the async result", async () => {
            const result$ = Async.block<string, number>(async $ => {
                if (parseInt("2") > 1) return $.error("message");
                return $(Async.success(1));
            });

            expect(result$.toPromise()).rejects.toThrow("message");
        });
    });
});

describe("fromComputation", () => {
    describe("for a successful computation", () => {
        it("return a success async", async () => {
            const value$ = Async.fromComputation((resolve, _reject) => {
                resolve(1);
                return () => {};
            });

            await expect(value$.toPromise()).resolves.toEqual(1);
        });
    });

    describe("for an unsuccessful computation", () => {
        it("return an error async", async () => {
            const value$ = Async.fromComputation<unknown, string>((_resolve, reject) => {
                reject("message");
                return () => {};
            });

            await expect(value$.toPromise()).rejects.toThrow("message");
        });
    });
});

describe("cancel", () => {
    it("cancels the async and the error branch is not called", async () => {
        const success = vi.fn();
        const reject = vi.fn();

        const cancel = Async.sleep(1).run(success, reject);
        cancel?.();
        await nextTick();

        expect(success).not.toHaveBeenCalled();
        expect(reject).toHaveBeenCalledTimes(0);
    });
});

describe("join2", () => {
    it("returns a single async with the pair of values", async () => {
        const join$ = Async.join2(Async.success(123), Async.success("hello"));
        await expect(join$.toPromise()).resolves.toEqual([123, "hello"]);
    });

    it("returns an error if some of the inputs is an error", async () => {
        const join$ = Async.join2(Async.success(123), Async.error("Some error"));
        await expect(join$.toPromise()).rejects.toThrow("Some error");
    });
});

describe("joinObj", () => {
    it("returns an async with the object of values", async () => {
        const join$ = Async.joinObj({
            n: Async.success(123),
            s: Async.success("hello"),
        });

        await expect(join$.toPromise()).resolves.toEqual({
            n: 123,
            s: "hello",
        });
    });

    it("returns an error if some of the inputs is an error", async () => {
        const join$ = Async.joinObj({
            n: Async.success(123),
            s: Async.error("Some error"),
        });

        await expect(join$.toPromise()).rejects.toThrow("Some error");
    });
});

describe("sequential", () => {
    it("returns an async containing all the values as an array", async () => {
        const values$ = Async.sequential([Async.success(1), Async.success(2), Async.success(3)]);
        await expect(values$.toPromise()).resolves.toEqual([1, 2, 3]);
    });
});

describe("parallel", async () => {
    test("concurrency smaller than length", async () => {
        const asyncs = [Async.sleep(3), Async.sleep(1), Async.sleep(2)];
        const values$ = Async.parallel(asyncs, { concurrency: 2 });
        await expect(values$.toPromise()).resolves.toEqual([3, 1, 2]);
    });

    test("concurrency larger than length", async () => {
        const asyncs = [Async.sleep(3), Async.sleep(1), Async.sleep(2)];
        const values$ = Async.parallel(asyncs, { concurrency: 4 });
        await expect(values$.toPromise()).resolves.toEqual([3, 1, 2]);
    });
});

function nextTick() {
    return new Promise(process.nextTick);
}

async function expectAsync<D, E>(
    value$: Async<D, E>,
    options: { toEqual: D; toThrow?: undefined } | { toEqual?: undefined; toThrow: E },
): Promise<void> {
    if (options.toEqual) {
        await expect(value$.toPromise()).resolves.toEqual(options.toEqual);
    } else {
        await expect(value$.toPromise()).rejects.toMatchObject(options.toThrow as any);
    }
}

class CodedError extends Error {
    code: string;

    constructor(message: string, data: { code: string }) {
        super(message);
        this.code = data.code;
    }
}
