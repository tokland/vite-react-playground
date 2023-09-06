import { Collection } from "./Collection";
import * as tim from "typed-immutable-map";

/* Immutable Hash Map. Like ES2015 Map, keys can be of any type. */

export class HashMap<K, V> {
    protected constructor(protected _map: tim.HashMap<K, V>) {}

    /* Constructors */

    static empty<K, V>() {
        return new HashMap<K, V>(tim.empty());
    }

    static fromPairs<K, V>(pairs: Array<[K, V]>): HashMap<K, V> {
        return new HashMap(tim.fromIterable(pairs));
    }

    static fromObject<K extends keyof any, V>(obj: Record<K, V>) {
        return new HashMap<K, V>(tim.fromObject(obj));
    }

    /* Methods */

    get(key: K): V | undefined {
        return tim.get(key, this._map);
    }

    set(key: K, value: V): HashMap<K, V> {
        const updated = tim.set(key, value, this._map);
        return new HashMap(updated);
    }

    equals(map: HashMap<K, V>): boolean {
        const mapsHaveEqualSize = () => this.size === map.size;
        const allValuesEqual = () => this.keys().every(k => this.get(k) === map.get(k));
        return mapsHaveEqualSize() && allValuesEqual();
    }

    keys(): K[] {
        return Array.from(tim.keys(this._map));
    }

    values(): V[] {
        return Array.from(tim.values(this._map));
    }

    toPairs(): Array<[K, V]> {
        return Array.from(tim.entries(this._map));
    }

    get size(): number {
        return this._map.size;
    }

    pick(keys: K[]): HashMap<K, V> {
        return this.pickBy(([key, _value]) => keys.includes(key));
    }

    pickBy(pred: (pair: readonly [K, V]) => boolean): HashMap<K, V> {
        return new HashMap(tim.filter((value, key) => pred([key!, value]), this._map));
    }

    omit(keys: K[]): HashMap<K, V> {
        return this.pickBy(([key, _value]) => !keys.includes(key));
    }

    omitBy(pred: (pair: readonly [K, V]) => boolean): HashMap<K, V> {
        return this.pickBy(([key, value]) => !pred([key, value]));
    }

    toCollection(): Collection<[K, V]> {
        return Collection.from(this.toPairs());
    }

    hasKey(key: K): boolean {
        return tim.has(key, this._map);
    }

    invert(): HashMap<V, K> {
        const invertedPairs = this.toPairs().map<[V, K]>(([key, value]) => [value, key]);
        return HashMap.fromPairs(invertedPairs);
    }

    invertMulti(): HashMap<V, K[]> {
        return this.toCollection().groupFromMap(([key, value]) => [value, key]);
    }

    mapValues<V2>(mapper: (pair: [K, V]) => V2): HashMap<K, V2> {
        return new HashMap(tim.map((value, key) => mapper([key!, value]), this._map));
    }

    mapKeys<K2>(_mapper: (pair: [K, V]) => K2): HashMap<K2, V> {
        const pairs = this.toPairs().map(([key, value]) => {
            return [_mapper([key, value]), value] as [K2, V];
        });
        return HashMap.fromPairs(pairs);
    }

    merge(other: HashMap<K, V>): HashMap<K, V> {
        return HashMap.fromPairs(this.toPairs().concat(other.toPairs()));
    }

    forEach(fn: (pair: readonly [K, V]) => void): void {
        tim.forEach((value, key) => fn([key!, value]), this._map);
    }

    toObject(): K extends keyof any ? Record<K, V> : Record<string, V> {
        return tim.toObject(this._map) as K extends keyof any ? Record<K, V> : Record<string, V>;
    }
}
