import { expect } from "vitest";

import { Async } from "../domain/entities/generic/Async";
import { GenericStructInstance } from "../domain/entities/generic/Struct";
import { baseBuilders, Builders, builder } from "./proxy-snapshots/domain/Builders";
import {
    BaseObj,
    GetProxySnapshotUseCase,
} from "./proxy-snapshots/domain/usecases/GetProxySnapshotUseCase";
import { TestLibVitest } from "./proxy-snapshots/data/TestLibVitest";
import { SnapshotTsFileRepository } from "./proxy-snapshots/data/SnapshotTsFileRepository";
import * as entities from "../domain/entities";
import { emptyRollback, Import, Rollback } from "./proxy-snapshots/domain/entities";

const asyncBuilder = builder<Async<any>>()({
    hasType: obj => Object.getPrototypeOf(obj) === Async.prototype,
    isEqual: (_obj1, _obj2) => false,
    modules: { Async },
    toJs: async (obj, builders) => {
        const value = await obj.toPromise();
        const code = await builders.toJs(value);
        return `${builders.moduleProp("Async")}.success(${code})`;
    },
});

const structBuilder = builder<GenericStructInstance>()({
    hasType: obj => Boolean(obj && typeof obj === "object" && "_getAttributes" in obj),
    isEqual: (obj1, obj2, builders) =>
        builders.isEqual(obj1._getAttributes(), obj2._getAttributes()),
    modules: entities,
    toJs: async (obj, builders) => {
        const className = obj.constructor.name;
        const attrs = await builders.toJs(obj._getAttributes());
        return `${builders.moduleProp(className)}.create(${attrs})`;
    },
});

type GetProxyOptions = { type: Import; rollback?: Rollback };

export const builders = new Builders([...baseBuilders, asyncBuilder, structBuilder]);

export const modules = builders.getModules();

const getProxySnapshot = new GetProxySnapshotUseCase({
    testLib: new TestLibVitest(expect),
    snapshotRepository: new SnapshotTsFileRepository(),
});

export async function getProxy<Obj extends BaseObj>(obj: Obj, options: GetProxyOptions) {
    return getProxySnapshot.execute(obj, {
        rollback: emptyRollback,
        builders: builders,
        modulesImport: { path: __filename, name: "modules" },
        ...options,
    });
}
