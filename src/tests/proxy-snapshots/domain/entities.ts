// Generic

export type Maybe<T> = T | undefined;

export type FilePath = string;

export type SymbolImport = { name: string; path: FilePath };

// Current Test

export type CurrentTest = {
    path: FilePath;
    name: string;
    updateMode: UpdateMode;
};

export type UpdateMode = "new" | "all" | "none";

// Snapshots

export type Snapshot = SnapshotEntry[];

export type SnapshotEntry = FunctionCallWithResult;

export type FunctionCall = {
    type: "call";
    path: string[];
    args: unknown[];
};

type FunctionCallWithResult = FunctionCall & { returns: unknown };

export type Fixtures = object;

// Rollback

export type Rollback = {
    setup?(): Promise<void>;
    teardown?(): Promise<void>;
};

export const emptyRollback: Rollback = {
    setup: undefined,
    teardown: undefined,
};

// Data Types

export type DataType<T> = {
    hasType(obj: unknown): boolean;
    isEqual(obj1: T, obj2: T, dataTypeStore: DataTypeStore): boolean;
};

export function areCallsEqual(
    dataTypeStore: DataTypeStore,
    call1: FunctionCall,
    call2: FunctionCall,
): boolean {
    return (
        call1.type === call2.type &&
        dataTypeStore.isEqual(call1.path, call2.path) &&
        dataTypeStore.isEqual(call1.args, call2.args)
    );
}

export class DataTypeStore {
    constructor(protected dataTypes: Array<DataType<unknown>>) {}

    isEqual(obj1: unknown, obj2: unknown): boolean {
        const dataType = this.dataTypes.find(dataType => {
            return dataType.hasType(obj1) && dataType.hasType(obj2);
        });

        return dataType ? dataType.isEqual(obj1, obj2, this) : false;
    }
}
