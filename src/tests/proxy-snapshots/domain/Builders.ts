type StringP = string | Promise<string>;

interface Builder<T, Modules> {
    hasType(obj: unknown): boolean;
    isEqual(obj1: T, obj2: T, builders: Builders): boolean;
    toJs(obj: T, builders: Builders): StringP;
    modules: Modules;
}

type BuilderOptions<T, Modules> = Omit<Builder<T, Modules>, "modules"> & { modules?: Modules };

export function builder<T>() {
    return function <Modules = {}>(options: BuilderOptions<T, Modules>): Builder<T, Modules> {
        return { modules: {} as Modules, ...options };
    };
}

const nullBuilder = builder<null>()({
    hasType: obj => obj === null,
    isEqual: (obj1, obj2) => obj1 === obj2,
    toJs: _obj => "null",
});

const undefinedBuilder = builder<undefined>()({
    hasType: obj => obj === undefined,
    isEqual: (obj1, obj2) => obj1 === obj2,
    toJs: _obj => "undefined",
});

const booleanBuilder = builder<boolean>()({
    hasType: obj => typeof obj === "undefined",
    isEqual: (obj1, obj2) => obj1 === obj2,
    toJs: obj => obj.toString(),
});

const numberBuilder = builder<number>()({
    hasType: obj => typeof obj === "number",
    isEqual: (obj1, obj2) => obj1 === obj2,
    toJs: obj => obj.toString(),
});

const stringBuilder = builder<string>()({
    hasType: obj => typeof obj === "string",
    isEqual: (obj1, obj2) => obj1 === obj2,
    toJs: obj => JSON.stringify(obj),
});

const symbolBuilder = builder<symbol>()({
    hasType: obj => typeof obj === "symbol",
    isEqual: (obj1, obj2) => obj1 === obj2,
    toJs: obj => "Symbol.for(" + JSON.stringify(obj.description) + ")",
});

const dateBuilder = builder<Date>()({
    hasType: obj => Boolean(obj && obj.constructor === Date),
    isEqual: (obj1, obj2) => obj1.getTime() === obj2.getTime(),
    toJs: obj => "new Date(" + obj.getTime() + ")",
});

const setBuilder = builder<Set<unknown>>()({
    hasType: obj => Boolean(obj && obj.constructor === Set),
    isEqual: (set1, set2) => set1.size === set2.size && Array.from(set1).every(x1 => set2.has(x1)),
    toJs: async (set, builder) => {
        const arrayJs = await builder.toJs(Array.from(set));
        return `new Set(${arrayJs})`;
    },
});

const mapBuilder = builder<Map<unknown, unknown>>()({
    hasType: obj => Boolean(obj && obj.constructor === Map),
    isEqual: (map1, map2, builders) =>
        map1.size === map2.size &&
        Array.from(map1).every(([k1, v1]) => builders.isEqual(v1, map2.get(k1))),
    toJs: async (map, builder) => {
        const pairs = await builder.toJs(Array.from(map));
        return "new Map(" + pairs + ")";
    },
});

const arrayBuilder = builder<Array<unknown>>()({
    hasType: obj => Array.isArray(obj),
    isEqual: (obj1, obj2, builders) =>
        obj1.length === obj2.length && obj1.every((val1, idx) => builders.isEqual(val1, obj2[idx])),
    toJs: async (obj, builders) => {
        const values = await Promise.all(obj.map(x => builders.toJs(x)));
        return "[" + values.join(",") + "]";
    },
});

const objectBuilder = builder<Array<unknown>>()({
    hasType: obj => Object.getPrototypeOf(obj) === Object.getPrototypeOf({}),
    isEqual: (obj1, obj2, store) => {
        const keys1 = Object.keys(obj1) as Array<keyof typeof obj1>;
        const keys2 = Object.keys(obj2) as Array<keyof typeof obj2>;

        return (
            keys1.length === keys2.length &&
            keys1.every(key1 => store.isEqual(obj1[key1], obj2[key1]))
        );
    },
    toJs: async (obj, store) => {
        const items = Reflect.ownKeys(obj).map(async key => {
            const isSymbol = typeof key === "symbol";
            const keyJs = isSymbol ? `[${await store.toJs(key)}]` : JSON.stringify(key);
            const valueJs = await store.toJs(obj[key as keyof typeof obj]);
            return `${keyJs}: ${valueJs}`;
        });

        return "{" + (await Promise.all(items)).join(",") + "}";
    },
});

export const baseBuilders = [
    nullBuilder,
    undefinedBuilder,
    booleanBuilder,
    numberBuilder,
    stringBuilder,
    symbolBuilder,
    arrayBuilder,
    objectBuilder,
    dateBuilder,
    setBuilder,
    mapBuilder,
];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

export class Builders<T extends Builder<any, any> = Builder<any, any>> {
    public modulesRef = "_modules";

    constructor(private builders: T[]) {}

    isEqual(obj1: unknown, obj2: unknown): boolean {
        const builder = this.builders.find(builder => {
            return builder.hasType(obj1) && builder.hasType(obj2);
        });
        if (!builder) throw new Error(`No builder found: ${obj1}, ${obj2}`);
        return builder ? builder.isEqual(obj1, obj2, this) : false;
    }

    toJs(obj: unknown): StringP {
        const builder = this.builders.find(builder => builder.hasType(obj));
        if (!builder) throw new Error(`No builder found: ${obj}`);
        return builder.toJs(obj, this);
    }

    moduleProp(prop: string): string {
        return `${this.modulesRef}.${prop}`;
    }

    getModules(): UnionToIntersection<NonNullable<T["modules"]>> {
        return this.builders
            .flatMap(builder => builder.modules)
            .reduce((acc, obj) => ({ ...acc, ...obj }), {});
    }
}
