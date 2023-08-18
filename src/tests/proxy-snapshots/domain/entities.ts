import { Builders } from "./Builders";

export type Maybe<T> = T | undefined;

export type UpdateMode = "new" | "all" | "none";

export type Test = { path: FilePath; name: string };

export type FilePath = string;

export type Snapshot = SnapshotEntry[];

export type SnapshotEntry = FunctionCallWithResult;

export type FunctionCall = {
    type: "call";
    path: string[];
    args: unknown[];
};

type FunctionCallWithResult = FunctionCall & { returns: unknown };

export function areFunctionCallsEqual(
    builders: Builders,
    entry1: FunctionCall,
    entry2: FunctionCall,
): boolean {
    return (
        entry1.type === entry2.type &&
        builders.isEqual(entry1.path, entry2.path) &&
        builders.isEqual(entry1.args, entry2.args)
    );
}

export type Rollback = {
    setup?(): Promise<void>;
    teardown?(): Promise<void>;
};

export const emptyRollback: Rollback = {
    setup: undefined,
    teardown: undefined,
};

export type Import = { name: string; path: FilePath };

export type Fixtures = unknown;
