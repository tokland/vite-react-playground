import { DataType, DataTypeStore, SymbolImport } from "../domain/entities";

type StringP = string | Promise<string>;

interface TsSerializer<T, Modules> extends DataType<T> {
    modules: Modules;
    toTs(
        obj: T,
        serializer: GenericTsSerializerStore,
        modulesRef: Record<keyof Modules, keyof Modules>,
    ): StringP;
}

type SerializerOptions<T, Modules> = Omit<TsSerializer<T, Modules>, "modules"> & {
    modules?: Modules;
};

export function serializer<T>() {
    return function <Modules = {}>(
        options: SerializerOptions<T, Modules>,
    ): TsSerializer<T, Modules> {
        return { modules: {} as Modules, ...options };
    };
}

const nullSerializer = serializer<null>()({
    hasType: obj => obj === null,
    isEqual: () => true,
    toTs: _obj => "null",
});

const undefinedSerializer = serializer<undefined>()({
    hasType: obj => obj === undefined,
    isEqual: () => true,
    toTs: _obj => "undefined",
});

const booleanSerializer = serializer<boolean>()({
    hasType: obj => typeof obj === "boolean",
    isEqual: (bool1, bool2) => bool1 === bool2,
    toTs: bool => bool.toString(),
});

const numberSerializer = serializer<number>()({
    hasType: obj => typeof obj === "number",
    isEqual: (num1, num2) => num1 === num2,
    toTs: num => num.toString(),
});

const stringSerializer = serializer<string>()({
    hasType: obj => typeof obj === "string",
    isEqual: (str1, str2) => str1 === str2,
    toTs: str => JSON.stringify(str),
});

const dateSerializer = serializer<Date>()({
    hasType: obj => !!obj && obj.constructor === Date,
    isEqual: (date1, date2) => date1.getTime() === date2.getTime(),
    toTs: obj => "new Date(" + obj.getTime() + ")",
});

const promiseSerializer = serializer<Promise<unknown>>()({
    hasType: obj => !!obj && obj.constructor === Promise,
    isEqual: () => false, // We cannot compare promises without awaiting for the result
    toTs: async (promise, serializer) => "Promise.resolve(" + serializer.toTs(await promise) + ")",
});

const arraySerializer = serializer<Array<unknown>>()({
    hasType: obj => Array.isArray(obj),
    isEqual: (values1, values2, serializer) =>
        values1.length === values2.length &&
        values1.every((val1, idx) => serializer.isEqual(val1, values2[idx])),
    toTs: async (obj, serializer) => {
        const values = await Promise.all(obj.map(x => serializer.toTs(x)));
        return `[${values.join(",")}]`;
    },
});

const setSerializer = serializer<Set<unknown>>()({
    hasType: obj => !!obj && obj.constructor === Set,
    isEqual: (set1, set2, serializer) => {
        const values1 = Array.from(set1);
        const values2 = Array.from(set2);
        return (
            set1.size === set2.size &&
            values1.some(x1 => values2.some(x2 => serializer.isEqual(x1, x2)))
        );
    },
    toTs: async (set, serializer) => {
        const arrayJs = await serializer.toTs(Array.from(set));
        return `new Set(${arrayJs})`;
    },
});

const mapSerializer = serializer<Map<unknown, unknown>>()({
    hasType: obj => !!obj && obj.constructor === Map,
    isEqual: (map1, map2, serializer) =>
        map1.size === map2.size &&
        Array.from(map1).every(([k1, v1]) => serializer.isEqual(v1, map2.get(k1))),
    toTs: async (map, serializer) => {
        const pairs = await serializer.toTs(Array.from(map));
        return `new Map(${pairs})`;
    },
});

const objectSerializer = serializer<Array<unknown>>()({
    hasType: obj => !!obj && Object.getPrototypeOf(obj) === Object.getPrototypeOf({}),
    isEqual: (obj1, obj2, serializer) => {
        const keys1 = Object.keys(obj1) as Array<keyof typeof obj1>;
        const keys2 = Object.keys(obj2) as Array<keyof typeof obj2>;

        return (
            keys1.length === keys2.length &&
            keys1.every(key1 => serializer.isEqual(obj1[key1], obj2[key1]))
        );
    },
    toTs: async (obj, serializer) => {
        const pairs = Reflect.ownKeys(obj).map(async key => {
            if (typeof key === "symbol")
                throw new Error(`Symbol keys are not supported: ${key.toString()}`);
            const keyRepr = JSON.stringify(key);
            const keyNeedsQuotes = keyRepr !== `"${key}"`;
            const keyJs = keyNeedsQuotes ? `[${keyRepr}]` : key;
            const value = obj[key as keyof typeof obj];
            const valueJs = await serializer.toTs(value);
            return `${keyJs}: ${valueJs}`;
        });

        return "{" + (await Promise.all(pairs)).join(",") + "}";
    },
});

export const baseSerializers = [
    nullSerializer,
    undefinedSerializer,
    booleanSerializer,
    numberSerializer,
    stringSerializer,
    arraySerializer,
    objectSerializer,
    dateSerializer,
    promiseSerializer,
    setSerializer,
    mapSerializer,
];

export type GenericTsSerializerStore = TsSerializerStore<TsSerializer<any, any>>;

export class TsSerializerStore<S extends TsSerializer<any, any>> extends DataTypeStore {
    public modulesRef = "_modules";

    public modulesImport: SymbolImport;

    constructor(private serializers: S[], options: { modulesImport: SymbolImport }) {
        super(serializers);
        this.modulesImport = options.modulesImport;
    }

    toTs(obj: unknown): StringP {
        const serializer = this.serializers.find(serializer => serializer.hasType(obj));
        if (!serializer) throw new Error(`No serializer found: ${obj}`);
        const modulesRef = this.getModulesRef(serializer);
        return serializer.toTs(obj, this, modulesRef);
    }

    getModules(): UnionToIntersection<S["modules"]> {
        return this.serializers
            .map(serializer => serializer.modules)
            .reduce((modulesAcc, modules) => ({ ...modulesAcc, ...modules }), {});
    }

    get dataTypeStore(): DataTypeStore {
        return new DataTypeStore(this.serializers);
    }

    private getModulesRef(serializer: S) {
        return Object.fromEntries(
            Object.keys(serializer.modules).map(moduleName => {
                return [moduleName, `${this.modulesRef}.${moduleName}`] as const;
            }),
        );
    }
}

// https://github.com/sindresorhus/type-fest/blob/main/source/union-to-intersection.d.ts

type UnionToIntersection<Union> = (
    Union extends any ? (distributedUnion: Union) => void : never
) extends (mergedIntersection: infer Intersection) => void
    ? Intersection
    : never;
