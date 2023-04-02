import { describe, expect, test, it, vi } from "vitest";

import { Async, AsyncCancel, AsyncError } from "../Async";

describe("Basic builders", () => {
    test("Async.success", async () => {
        const value$ = Async.success(10);
        expect(value$.toPromise()).resolves.toEqual(10);
    });

    test("Async.error", async () => {
        const value$ = Async.error("message");
        expect(value$.toPromise()).rejects.toThrow("message");
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

        Async.error("message").run(success, reject);
        await nextTick();

        expect(success).not.toHaveBeenCalled();
        expect(reject).toHaveBeenCalledTimes(1);
        expect(reject.mock.calls[0]).toEqual([new AsyncError("message")]);
    });
});

describe("toPromise", () => {
    it("convert an Async to a normal Promise", () => {
        expect(Async.success(1).toPromise()).resolves.toEqual(1);
    });
});

describe("helpers", () => {
    test("Async.delay", async () => {
        expect(Async.delay(1).toPromise()).resolves.toEqual(1);
    });

    test("Async.void", async () => {
        expect(Async.void().toPromise()).resolves.toBeUndefined();
    });
});

describe("Transformation", () => {
    describe("map", () => {
        it("transforms the async value", async () => {
            const value1$ = Async.success(1);
            const value2$ = value1$.map(x => x.toString());

            expect(value2$.toPromise()).resolves.toEqual("1");
        });
    });

    describe("flatMap/chain", () => {
        it("builds an async value mapping to another async", async () => {
            const value1$ = Async.success(1);
            const value2$ = value1$
                .flatMap(value => Async.success(value + 2))
                .flatMap(value => Async.success(value + 3));

            expect(value2$.toPromise()).resolves.toEqual(6);
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

            expect(result$.toPromise()).resolves.toEqual(6);
        });
    });

    describe("when any the awaited values in the block is an error", () => {
        it("returns that error as the async result", async () => {
            const result$ = Async.block(async $ => {
                const value1 = await $(Async.success(1));
                const value2 = await $(Async.error<number>("message"));
                const value3 = await $(Async.success(3));
                return value1 + value2 + value3;
            });

            expect(result$.toPromise()).rejects.toThrow(new AsyncError("message"));
        });
    });

    describe("when the helper $.error is called", () => {
        it("returns that async error as the async result", async () => {
            const result$ = Async.block(async ($): Promise<number> => {
                if (parseInt("2") > 1) return $.error("message");
                return $(Async.success(1));
            });

            expect(result$.toPromise()).rejects.toThrow(new AsyncError("message"));
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

            expect(value$.toPromise()).resolves.toEqual(1);
        });
    });

    describe("for an unsuccessful computation", () => {
        it("return an error async", async () => {
            const value$ = Async.fromComputation((_resolve, reject) => {
                reject("message");
                return () => {};
            });

            expect(value$.toPromise()).rejects.toThrow("message");
        });
    });
});

describe("cancel", () => {
    it("cancels the async and the error branch is called with AsyncCancel", async () => {
        const success = vi.fn();
        const reject = vi.fn();

        const cancel = Async.delay(1).run(success, reject);
        cancel();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(success).not.toHaveBeenCalled();
        expect(reject).toHaveBeenCalledTimes(1);
        expect(reject.mock.calls[0]).toEqual([new AsyncCancel()]);
    });
});

function nextTick() {
    return new Promise(process.nextTick);
}
