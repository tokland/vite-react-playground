import { HashMap as RimbuHashMap } from "@rimbu/hashed";

type Hash = string | number;

type Hasher<T> = (value: T) => Hash;

export class IndexedSet<T> {
    private constructor(private hashMap: RimbuHashMap<Hash, T>, private getKey: Hasher<T>) {}

    get(hash: Hash): T | undefined {
        return this.hashMap.get(hash);
    }

    add(value: T): IndexedSet<T> {
        const key = this.getKey(value);
        const updated = this.hashMap.set(key, value);
        return new IndexedSet(updated, this.getKey);
    }

    get size(): number {
        return this.hashMap.size;
    }

    static empty<V>(getHash: Hasher<V>): IndexedSet<V> {
        return new IndexedSet(RimbuHashMap.empty(), getHash);
    }
}
