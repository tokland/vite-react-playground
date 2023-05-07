import { HashMap as RimbuHashMap } from "@rimbu/hashed";

type Hash = string | number | symbol;

export type Hasher<T> = (value: T) => Hash;

export class IndexedSet<T extends THash, THash> {
    private constructor(private hashMap: RimbuHashMap<Hash, T>, private getKey: Hasher<THash>) {}

    get<TH extends THash>(value: TH): T | undefined {
        const key = this.getKey(value);
        return this.hashMap.get(key);
    }

    add(value: T): IndexedSet<T, THash> {
        const key = this.getKey(value);
        const updated = this.hashMap.set(key, value);
        return new IndexedSet(updated, this.getKey);
    }

    equals(set: IndexedSet<T, THash>): boolean {
        return this.size === set.size && mapsHaveSameValues(this.hashMap, set.hashMap);
    }

    toArray(): T[] {
        return this.hashMap.streamValues().toArray();
    }

    get size(): number {
        return this.hashMap.size;
    }

    static empty<T extends T0, T0>(getHash: Hasher<T0>): IndexedSet<T, T0> {
        return new IndexedSet(RimbuHashMap.empty(), getHash);
    }

    static fromArray<T extends THash, THash>(
        values: T[],
        getHash: Hasher<THash>,
    ): IndexedSet<T, THash> {
        const hashMap = RimbuHashMap.from(values.map(value => [getHash(value), value] as const));
        return new IndexedSet(hashMap, getHash);
    }
}

function mapsHaveSameValues<T>(map1: RimbuHashMap<Hash, T>, map2: RimbuHashMap<Hash, T>) {
    const values1 = new Set(map1.streamValues().toArray());
    return map2.streamValues().every(value => values1.has(value));
}
