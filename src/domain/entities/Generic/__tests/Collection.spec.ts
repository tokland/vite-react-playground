import { describe, expect, test } from "vitest";

import _c, { Collection } from "../Collection";
import { expectTypeOf } from "expect-type";

describe("Collection", () => {
    test("range", () => {
        expect(Collection.range(2, 5).toArray()).toEqual([2, 3, 4]);
        expect(Collection.range(2, -1).toArray()).toEqual([]);
    });

    test("map", () => {
        const values = _c([1, 2, 3]).map(x => 2 * x);
        expect(values.toArray()).toEqual([2, 4, 6]);
    });

    test("flatMap", () => {
        const values = _c([1, 2, 3]).flatMap(x => _c([x, -x]));
        expect(values.toArray()).toEqual([1, -1, 2, -2, 3, -3]);
    });

    test("flatten", () => {
        expect(
            _c([[1, 2], [3], [], [4, 5]])
                .flatten()
                .toArray(),
        ).toEqual([1, 2, 3, 4, 5]);
    });

    test("filter/select", () => {
        const values = _c([1, 2, 3, 0, 3]).select(x => x > 1);
        expect(values.toArray()).toEqual([2, 3, 3]);
    });

    test("reject", () => {
        const values = _c([1, 2, 3]).reject(x => x > 1);
        expect(values.toArray()).toEqual([1]);
    });

    test("enumerate", () => {
        expect(_c(["a", "b", "c"]).enumerate().toArray()).toEqual([
            [0, "a"],
            [1, "b"],
            [2, "c"],
        ]);
    });

    test("compact", () => {
        const values = _c([1, undefined, 2, null, 3]).compact();

        expect(values.toArray()).toEqual([1, 2, 3]);
        expectTypeOf(values).toEqualTypeOf<Collection<number>>();
    });

    test("compactMap", () => {
        const values = _c([1, 2, 3]).compactMap(x => (x > 1 ? x.toString() : undefined));

        expect(values.toArray()).toEqual(["2", "3"]);
        expectTypeOf(values).toEqualTypeOf<Collection<string>>();
    });

    test("append", () => {
        expect(_c([1, 2]).append(3).toArray()).toEqual([1, 2, 3]);
    });

    test("includes", () => {
        const values = _c([1, 2, 3]);

        expect(values.includes(2)).toEqual(true);
        expect(values.includes(4)).toEqual(false);
    });

    test("every/all", () => {
        const values = _c([1, 2, 3]);

        expect(values.every(x => x > 0)).toEqual(true);
        expect(values.every(x => x > 1)).toEqual(false);
        expect(values.every(x => x > 3)).toEqual(false);

        expect(values.all(x => x > 0)).toEqual(true);
        expect(values.all(x => x > 1)).toEqual(false);
        expect(values.all(x => x > 3)).toEqual(false);
    });

    test("some/any", () => {
        const values = _c([1, 2, 3]);

        expect(values.some(x => x > 0)).toEqual(true);
        expect(values.some(x => x > 1)).toEqual(true);
        expect(values.some(x => x > 3)).toEqual(false);

        expect(values.any(x => x > 0)).toEqual(true);
        expect(values.any(x => x > 1)).toEqual(true);
        expect(values.any(x => x > 3)).toEqual(false);
    });

    test("find", () => {
        const values = _c([1, 2, 3]);

        const valueFound = values.find(value => value === 2);
        expect(valueFound).toEqual(2);
        expectTypeOf(valueFound).toEqualTypeOf<number | undefined>();

        const valueNotFound = values.find(value => value === 4);
        expect(valueNotFound).toEqual(undefined);
        expectTypeOf(valueNotFound).toEqualTypeOf<number | undefined>();

        const valueDefault = values.find(value => value === 4, { or: 10 });
        expect(valueDefault).toEqual(10);
        expectTypeOf(valueDefault).toEqualTypeOf<number>();
    });

    test("splitAt", () => {
        const values = _c([0, 1, 2, 3, 4, 5]);

        expect(
            values
                .splitAt([1, 3])
                .value()
                .map(xs => xs.value()),
        ).toEqual([[0], [1, 2], [3, 4, 5]]);
    });

    test("join", () => {
        expect(_c(["a", "b", "c"]).join(" - ")).toEqual("a - b - c");
    });

    test("get", () => {
        const xs = _c(["a", "b"]);

        expect(xs.get(-1)).toEqual(undefined);
        expect(xs.get(0)).toEqual("a");
        expect(xs.get(1)).toEqual("b");
        expect(xs.get(2)).toEqual(undefined);
    });

    test("getMany", () => {
        const xs = _c(["a", "b", "c"]);

        expect(xs.getMany([]).toArray()).toEqual([]);
        expect(xs.getMany([0, 2]).toArray()).toEqual(["a", "c"]);
        expect(xs.getMany([1, 3]).toArray()).toEqual(["b", undefined]);
    });

    test("intersperse", () => {
        const xs = _c(["a", "b", "c"]);

        expect(xs.intersperse("x").toArray()).toEqual(["a", "x", "b", "x", "c"]);
    });

    test("uniq", () => {
        expect(_c([1, 2, 2, 3, 1]).uniq().toArray()).toEqual([1, 2, 3]);
    });

    test("uniqBy", () => {
        expect(
            _c(["a", "ab", "b", "c", "abc", "de", "xyz"])
                .uniqBy(s => s.length)
                .toArray(),
        ).toEqual(["a", "ab", "abc"]);
    });

    test("reduce", () => {
        expect(_c([1, 2, 3]).reduce((acc, x) => acc + x, 10)).toEqual(16);
    });

    test("sort (strings)", () => {
        expect(_c(["a", "c", "b"]).sort().toArray()).toEqual(["a", "b", "c"]);
        expect(_c(["22", "3", "1"]).sort().toArray()).toEqual(["1", "22", "3"]);
    });

    test("sort (numbers)", () => {
        expect(_c([2, 33, 1, 4]).sort().toArray()).toEqual([1, 2, 4, 33]);
    });

    test("sortBy", () => {
        const values = _c([2, 33, 1, 4]);

        expect(values.sortBy(x => x).toArray()).toEqual([1, 2, 4, 33]);
        expect(values.sortBy(x => -x).toArray()).toEqual([33, 4, 2, 1]);
        expect(values.sortBy(x => x.toString()).toArray()).toEqual([1, 2, 33, 4]);
    });

    test("sortBy with custom compareFn", () => {
        const values = _c([2, 33, 1, 4]);

        expect(
            values
                .sortBy(x => x, { compareFn: (a, b) => (a === 1 ? -1 : b === 1 ? +1 : 0) })
                .toArray(),
        ).toEqual([1, 2, 33, 4]);
    });

    test("first", () => {
        expect(_c([1, 2, 3]).first()).toEqual(1);
        expect(_c([]).first()).toEqual(undefined);
    });

    test("last", () => {
        expect(_c([1, 2, 3]).last()).toEqual(3);
        expect(_c([]).last()).toEqual(undefined);
    });

    test("take", () => {
        expect(_c([1, 2, 3]).take(-10).toArray()).toEqual([]);
        expect(_c([1, 2, 3]).take(2).toArray()).toEqual([1, 2]);
        expect(_c([1, 2, 3]).take(10).toArray()).toEqual([1, 2, 3]);
    });

    test("drop", () => {
        expect(_c([1, 2, 3]).drop(-0).toArray()).toEqual([1, 2, 3]);
        expect(_c([1, 2, 3]).drop(2).toArray()).toEqual([3]);
        expect(_c([1, 2, 3]).drop(10).toArray()).toEqual([]);
    });

    test("pairwise", () => {
        expect(_c([1, 2, 3, 4]).pairwise().toArray()).toEqual([
            [1, 2],
            [2, 3],
            [3, 4],
        ]);
    });

    test("chunk", () => {
        expect(_c([1, 2, 3, 4, 5]).chunk(2).toArray()).toEqual([[1, 2], [3, 4], [5]]);
    });

    test("cartesian", () => {
        expect(_c([[]]).cartesian().toArray()).toEqual([]);

        expect(
            _c([[1, 2]])
                .cartesian()
                .toArray(),
        ).toEqual([[1], [2]]);

        expect(
            _c([
                [1, 2],
                [3, 4],
            ])
                .cartesian()
                .toArray(),
        ).toEqual([
            [1, 3],
            [1, 4],
            [2, 3],
            [2, 4],
        ]);

        expect(
            _c([[1, 2], [3, 4], [5]])
                .cartesian()
                .toArray(),
        ).toEqual([
            [1, 3, 5],
            [1, 4, 5],
            [2, 3, 5],
            [2, 4, 5],
        ]);
    });

    test("orderBy", () => {
        const unsortedObjects = [
            { id: 1, value: 10 },
            { id: 2, value: 5 },
            { id: 3, value: 10 },
            { id: 4, value: 5 },
        ];

        const sortedObjects = [
            { id: 4, value: 5 },
            { id: 2, value: 5 },
            { id: 3, value: 10 },
            { id: 1, value: 10 },
        ];

        expect(
            _c(unsortedObjects)
                .orderBy([
                    [obj => obj.value, "asc"],
                    [obj => obj.id, "desc"],
                ])
                .toArray(),
        ).toEqual(sortedObjects);
    });

    test("zipLongest", () => {
        expect(
            _c([1, 2, 3])
                .zipLongest(_c(["a", "b"]))
                .toArray(),
        ).toEqual([
            [1, "a"],
            [2, "b"],
            [3, undefined],
        ]);
    });

    test("zip", () => {
        const zipped = _c([1, 2, 3]).zip(_c(["a", "b"]));

        expectTypeOf(zipped).toEqualTypeOf<Collection<[number, string]>>();
        expect(zipped.toArray()).toEqual([
            [1, "a"],
            [2, "b"],
        ]);
    });

    test("prepend", () => {
        expect(_c([2, 3]).prepend(1).toArray()).toEqual([1, 2, 3]);
    });

    test("indexBy", () => {
        const values = _c(["a", "ab", "x", "xy"]).indexBy(s => s.length);

        expect(values.size).toEqual(2);
        expect(values.get(1)).toEqual("x");
        expect(values.get(2)).toEqual("xy");
    });

    test("groupBy", () => {
        const values = _c(["a", "ab", "x", "y", "xy"]).groupBy(s => s.length);

        expect(values.size).toEqual(2);
        expect(values.get(1)).toEqual(["a", "x", "y"]);
        expect(values.get(2)).toEqual(["ab", "xy"]);
    });

    test("groupBy", () => {
        const values = _c(["a", "ab", "x", "y", "xy"]).groupBy(s => s.length);

        expect(values.size).toEqual(2);
        expect(values.get(1)).toEqual(["a", "x", "y"]);
        expect(values.get(2)).toEqual(["ab", "xy"]);
    });

    test("groupAndMap", () => {
        const values = _c(["1", "12", "9", "89"]).groupFromMap(s => [s.length, parseInt(s)]);

        expect(values.size).toEqual(2);
        expect(values.get(1)).toEqual([1, 9]);
        expect(values.get(2)).toEqual([12, 89]);
    });

    test("toHashMap from pairs", () => {
        const hashMap = _c([1, 2]).toHashMap(x => [2 * x, x.toString()]);

        expect(hashMap.size).toEqual(2);
        expect(hashMap.get(2)).toEqual("1");
        expect(hashMap.get(4)).toEqual("2");
    });
});
