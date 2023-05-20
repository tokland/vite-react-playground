import { describe, expect, test } from "vitest";
import { IndexedSet } from "../IndexedSet";

type Obj = { id: string; name: string };

function getId(obj: { id: string }): string {
    return obj.id;
}

const objs = {
    mary: { id: "mary", name: "Mary" },
    john: { id: "john", name: "John" },
    zelda: { id: "zelda", name: "Zelda" },
} satisfies Record<string, Obj>;

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
    const set = IndexedSet.empty(getId).update(objs.mary).update(objs.john);

    test("get non-existing key", () => {
        expect(set.get({ id: "some-non-existing-id" })).toBeUndefined();
    });

    test("get existing key", () => {
        expect(set.get({ id: "mary" })).toBe(objs.mary);
        expect(set.get({ id: "john" })).toBe(objs.john);
    });

    test("equals", () => {
        const johnAndMary = IndexedSet.fromArray([objs.john, objs.mary], getId);
        const maryAndJohn = IndexedSet.fromArray([objs.mary, objs.john], getId);
        const maryAndZelda = IndexedSet.fromArray([objs.mary, objs.zelda], getId);

        expect(johnAndMary.equals(johnAndMary)).toBe(true);
        expect(johnAndMary.equals(maryAndJohn)).toBe(true);
        expect(johnAndMary.equals(maryAndZelda)).toBe(false);
    });

    test("toArray", () => {
        const set = IndexedSet.fromArray([objs.john, objs.mary], getId);
        const array = set.toArray();

        expect(array.length).toEqual(2);
        expect(array).toEqual(expect.arrayContaining([objs.john, objs.mary]));
    });

    test("toCollection", () => {
        const set = IndexedSet.fromArray([objs.john, objs.mary], getId);
        const collection = set.toCollection();

        expect(collection.size).toEqual(2);
        expect(collection.get(0)).toEqual(objs.john);
        expect(collection.get(1)).toEqual(objs.mary);
    });
});
