import { describe, expect, test } from "vitest";
import { IndexedSet } from "../IndexedSet";

const getId = (obj: { id: string }): string => obj.id;

describe("constructors", () => {
    test("empty", () => {
        const set = IndexedSet.empty(getId);
        expect(set.size).toEqual(0);
    });
});

const objs = {
    abc: { id: "abc" },
    xyz: { id: "xyz" },
};

describe("basic", () => {
    test("add/set", () => {
        const set = IndexedSet.empty(getId).add(objs.abc).add(objs.xyz);

        expect(set.get("not-existing")).toBeUndefined();
        expect(set.get("abc")).toEqual({ id: "abc" });
        expect(set.get("abc")).toBe(objs.abc);
    });
});
