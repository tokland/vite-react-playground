import { describe, expect, test } from "vitest";
import { IndexedSet } from "../IndexedSet";

describe("constructors", () => {
    test("empty", () => {
        const set = IndexedSet.empty(getId);
        expect(set.size).toEqual(0);
    });

    test("fromArray", () => {
        const values = [objs.john, objs.mary];
        const set = IndexedSet.fromArray(values, getId);
        expect(set.size).toEqual(2);
    });
});

describe("operations", () => {
    const set = IndexedSet.empty(getId).add(objs.mary).add(objs.john);

    test("get non-existing key", () => {
        expect(set.get("some-non-existing-key")).toBeUndefined();
    });

    test("get existing key", () => {
        expect(set.get("m1")).toBe(objs.mary);
        expect(set.get("j1")).toBe(objs.john);
    });

    test("equals", () => {
        const set1 = IndexedSet.fromArray([objs.john, objs.mary], getId);
        const set2 = IndexedSet.fromArray([objs.mary, objs.john], getId);
        const set3 = IndexedSet.fromArray([objs.mary, objs.zelda], getId);

        expect(set1.equals(set2)).toBe(true);
        expect(set1.equals(set3)).toBe(false);
    });

    test("toArray", () => {
        const set = IndexedSet.fromArray([objs.john, objs.mary], getId);
        const array = set.toArray();

        expect(array.length).toEqual(2);
        expect(array).toEqual(expect.arrayContaining([objs.john, objs.mary]));
    });
});

type Obj = { id: string; name: string };

function getId(obj: Obj): string {
    return obj.id;
}

const objs = {
    mary: { id: "m1", name: "Mary" },
    john: { id: "j1", name: "John" },
    zelda: { id: "z1", name: "Zelda" },
} satisfies Record<string, Obj>;
