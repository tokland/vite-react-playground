import { HashMap as RimbuHashMap } from "@rimbu/hashed";
import { Collection } from "./Collection";

export class HashMap<K, V> {
    /* Constructors */

    protected constructor(protected _map: RimbuHashMap<K, V>) {}

    static empty<K, V>() {
        return new HashMap<K, V>(RimbuHashMap.empty());
    }

    static fromPairs<K, V>(pairs: Array<[K, V]>) {
        return new HashMap(RimbuHashMap.from(pairs));
    }

    static fromObject<K extends string, V>(obj: Record<K, V>) {
        return HashMap.fromPairs(Object.entries(obj));
    }

    /* Methods */

    get(key: K): V | undefined {
        return this._map.get(key);
    }

    set(key: K, value: V): HashMap<K, V> {
        const updated = this._map.set(key, value);
        return new HashMap(updated);
    }

    equals(map: HashMap<K, V>): boolean {
        const mapsHaveEqualSize = () => this.size === map.size;
        const allValuesEqual = () => this._map.streamKeys().every(k => this.get(k) === map.get(k));
        return mapsHaveEqualSize() && allValuesEqual();
    }

    keys(): K[] {
        return this._map.streamKeys().toArray();
    }

    values(): V[] {
        return this._map.streamValues().toArray();
    }

    toPairs(): Array<[K, V]> {
        return this._map.toArray() as Array<[K, V]>;
    }

    get size(): number {
        return this._map.size;
    }

    pick(keys: K[]): HashMap<K, V> {
        return new HashMap(this._map.filter(([key, _value]) => keys.includes(key)));
    }

    pickBy(pred: (pair: readonly [K, V]) => boolean): HashMap<K, V> {
        return new HashMap(this._map.filter(pair => pred(pair)));
    }

    omit(keys: K[]): HashMap<K, V> {
        return new HashMap(this._map.filter(([key, _value]) => !keys.includes(key)));
    }

    omitBy(pred: (pair: readonly [K, V]) => boolean): HashMap<K, V> {
        return new HashMap(this._map.filter(pair => !pred(pair)));
    }

    toCollection(): Collection<[K, V]> {
        return Collection.from(this.toPairs());
    }

    hasKey(key: K): boolean {
        return this._map.hasKey(key);
    }

    invert(): HashMap<V, K> {
        const invertedPairs = this.toPairs().map<[V, K]>(([key, value]) => [value, key]);
        return HashMap.fromPairs(invertedPairs);
    }

    invertMulti(): HashMap<V, K[]> {
        return this.toCollection().groupFromMap(([key, value]) => [value, key]);
    }

    /* To implement / test */

    _forEach(_fn: (pair: [K, V]) => void): void {}

    _mapKeys<K2>(_mapper: (pair: [K, V]) => K2): HashMap<K2, V> {
        return HashMap.empty();
    }

    mapValues<V2>(mapper: (pair: [K, V]) => V2): HashMap<K, V2> {
        return new HashMap(this._map.mapValues((value, key) => mapper([key, value])));
    }

    _merge(_other: HashMap<K, V>): HashMap<K, V> {
        return this;
    }

    _mergeWith(
        _other: HashMap<K, V>,
        _mergeFn: (pair1: [K, V], pair2: [K, V]) => V,
    ): HashMap<K, V> {
        return this;
    }
}
