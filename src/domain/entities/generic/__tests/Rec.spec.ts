import { Rec } from "../Rec";
import { expectTypeOf } from "expect-type";

const rec1 = Rec.from({ x: 1, s: "hello", n: null });
const rec2 = Rec.from({ x: 2, n: true, z: 123 });

describe("Rec", () => {
    test("keys", () => {
        const keys = rec1.keys();
        expectTypeOf(keys).toEqualTypeOf<Array<"x" | "s" | "n">>();
        expect(keys).toEqual(["x", "s", "n"]);
    });

    test("pick", () => {
        const picked = rec1.pick(["x", "n"]);
        expectTypeOf(picked).toEqualTypeOf<Rec<{ x: number; n: null }>>();
        expect(picked.toObj()).toEqual({ x: 1, n: null });
    });

    test("pickBy", () => {
        expect(rec1.pickBy(key => key === "x").toObj()).toEqual({ x: 1 });
    });

    test("omit", () => {
        expect(rec1.omit(["x", "n"]).toObj()).toEqual({ s: "hello" });
    });

    test("omitBy", () => {
        expect(rec1.omitBy(key => key === "x").toObj()).toEqual({ s: "hello", n: null });
    });
});

test("merge", () => {
    const merged = rec1.merge(rec2);
    expectTypeOf(merged).toEqualTypeOf<Rec<{ x: number; s: string; n: boolean; z: number }>>();
    expect(merged.toObj()).toEqual({ x: 2, s: "hello", n: true, z: 123 });
});
