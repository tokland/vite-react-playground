export class Rec<T extends BaseObj> {
    protected obj: T;

    protected constructor(obj: T) {
        this.obj = obj;
    }

    /* Builders */

    static from<T extends BaseObj>(obj: T): Rec<T> {
        return new Rec(obj);
    }

    keys(): Array<keyof T> {
        return Object.keys(this.obj) as Array<keyof T>;
    }

    toObj(): T {
        return this.obj;
    }

    pickBy(filter: (key: keyof T) => boolean): Rec<Partial<T>> {
        const pairs = Object.entries(this.obj);
        const newObj = Object.fromEntries(pairs.filter(([k, _v]) => filter(k as keyof T)));
        return new Rec(newObj) as unknown as Rec<Partial<T>>;
    }

    pick<K extends keyof T>(keys: K[]): Rec<Pick<T, K>> {
        return this.pickBy(key => keys.includes(key as K)) as unknown as Rec<Pick<T, K>>;
    }

    omit<K extends keyof T>(keys: K[]): Rec<Omit<T, K>> {
        return this.pickBy(key => !keys.includes(key as K)) as unknown as Rec<Omit<T, K>>;
    }

    omitBy(filter: (key: keyof T) => boolean): Rec<Partial<T>> {
        return this.pickBy(key => !filter(key));
    }

    merge<T2 extends BaseObj>(rec2: Rec<T2>): Rec<Omit<T, keyof T2> & T2> {
        return new Rec({ ...this.obj, ...rec2.obj } as Omit<T, keyof T2> & T2);
    }
}

type BaseObj = Record<string, unknown>;
