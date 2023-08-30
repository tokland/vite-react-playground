import { expect } from "vitest";

import { Async } from "../domain/entities/generic/Async";
import { GenericStructInstance } from "../domain/entities/generic/Struct";
import {
    TsSerializerStore,
    serializer,
    baseSerializers,
} from "./proxy-snapshots/data/TsSerializerStore";
import {
    BaseObj,
    GetProxySnapshotUseCase,
} from "./proxy-snapshots/domain/usecases/GetProxySnapshotUseCase";
import { CurrentTestVitestClient } from "./proxy-snapshots/data/CurrentTestVitestClient";
import { SnapshotTsFileRepository } from "./proxy-snapshots/data/SnapshotTsFileRepository";
import * as entities from "../domain/entities";
import { SymbolImport, Rollback } from "./proxy-snapshots/domain/entities";

const asyncSerializer = serializer<Async<any>>()({
    hasType: obj => !!obj && Object.getPrototypeOf(obj) === Async.prototype,
    isEqual: (_obj1, _obj2) => false,
    modules: { Async },
    toTs: async (obj, { serializer, modulesRef }) => {
        const value = await obj.toPromise();
        const code = await serializer.toTs(value);
        return `${modulesRef.Async}.success(${code})`;
    },
});

const structSerializer = serializer<GenericStructInstance>()({
    hasType: obj => !!obj && typeof obj === "object" && "_getAttributes" in obj,
    isEqual: (obj1, obj2, serializer) =>
        serializer.isEqual(obj1._getAttributes(), obj2._getAttributes()),
    modules: entities,
    toTs: async (obj, { serializer, modulesRef }) => {
        const modulesRefAsString: Record<string, string> = modulesRef;
        const className = obj.constructor.name;
        const classRef = modulesRefAsString[className];
        if (!classRef) throw new Error(`Struct not found: ${className}`);
        const attributes = obj._getAttributes();
        return `${classRef}.create(${await serializer.toTs(attributes)})`;
    },
});

export const tsSerializerStore = new TsSerializerStore(
    [asyncSerializer, structSerializer, ...baseSerializers],
    { modulesImport: { path: __filename, name: "modules" } },
);

export const modules = tsSerializerStore.getModules();

const getProxySnapshotUseCase = new GetProxySnapshotUseCase({
    currentTestClient: new CurrentTestVitestClient(expect),
    snapshotRepository: new SnapshotTsFileRepository(tsSerializerStore),
});

type GetProxyOptions = { type: SymbolImport; rollback?: Rollback };

export async function getProxy<Obj extends BaseObj>(obj: Obj, options: GetProxyOptions) {
    return getProxySnapshotUseCase.execute(obj, {
        dataTypeStore: tsSerializerStore.dataTypeStore,
        ...options,
    });
}
