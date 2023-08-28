import {
    areCallsEqual,
    DataTypeStore,
    emptyRollback,
    FunctionCall,
    SymbolImport,
    Maybe,
    Rollback,
    CurrentTest,
} from "../entities";
import { Snapshot, SnapshotEntry } from "../entities";
import { SnapshotRepository, CurrentTestRepository } from "../repositories";

type ConstructorOptions = {
    currentTestRepository: CurrentTestRepository;
    snapshotRepository: SnapshotRepository;
};

type ExecuteOptions = {
    dataTypeStore: DataTypeStore;
    type: SymbolImport;
    rollback: Rollback;
};

export class GetProxySnapshotUseCase {
    constructor(private options: ConstructorOptions) {}

    async execute<Obj extends BaseObj>(obj: Obj, options: ExecuteOptions) {
        const { snapshotRepository, currentTestRepository } = this.options;
        const test = currentTestRepository.get();
        const snapshot = await snapshotRepository.get({ ...options, test });

        return new ProxyObject(obj, {
            ...this.options,
            ...options,
            snapshot: snapshot,
            snapshotRepository: snapshotRepository,
            test: test,
        }).get();
    }
}

export type BaseObj = Record<string, any>;

type ProxyObjectOptions = ConstructorOptions &
    ExecuteOptions & { snapshot: Maybe<Snapshot>; test: CurrentTest };

class ProxyObject<Obj extends BaseObj> {
    private test: CurrentTest;
    private state: State;
    private dataTypeStore: DataTypeStore;
    private snapshot: Maybe<Snapshot>;
    private currentTestRepository: CurrentTestRepository;
    private snapshotRepository: SnapshotRepository;

    constructor(private obj: Obj, private options: ProxyObjectOptions) {
        this.state = { currentSnapshot: [] };
        this.currentTestRepository = options.currentTestRepository;
        this.dataTypeStore = options.dataTypeStore;
        this.snapshotRepository = options.snapshotRepository;
        this.snapshot = options.snapshot;
        this.test = options.test;
    }

    async get(): Promise<Obj> {
        this.setupAutomaticExpectAfterTest();
        await this.setupRollback();
        return this.proxyObj(this.obj);
    }

    private setupAutomaticExpectAfterTest() {
        this.currentTestRepository.runOnTeardown(async () => {
            const { snapshotPath, contents } = await this.snapshotRepository.expectToMatch({
                test: this.currentTestRepository.get(),
                type: this.options.type,
                snapshot: this.snapshot,
                currentSnapshot: this.state.currentSnapshot,
            });

            await this.currentTestRepository.expectToMatchSnapshot(contents, snapshotPath);
        });
    }

    private log(msg: string, ...args: any[]): void {
        console.debug(`[proxy-snapshots] ${msg}`, ...args);
    }

    private async setupRollback() {
        const { snapshot, test } = this;
        const isRollbackEnabled =
            test.updateMode === "all" || (test.updateMode === "new" && !snapshot);
        if (!isRollbackEnabled) return;

        const { setup, teardown } = this.options.rollback || emptyRollback;

        if (setup) await setup();
        if (teardown) this.currentTestRepository.runOnTeardown(teardown);
    }

    private proxyObj<Obj extends BaseObj>(obj: Obj, path: string[] = []): Obj {
        const this_ = this;

        return new Proxy(obj, {
            get(target: typeof obj, property: string) {
                const value = target[property];
                const newPath = [...path, property];

                if (typeof value === "function") {
                    return (...args: unknown[]) => {
                        const transition = this_.proxyCall(target, newPath, args, value);
                        this_.state = transition.state;
                        if (transition.type === "error") throw transition.error;
                        return transition.returns;
                    };
                } else if (typeof value === "object") {
                    return this_.proxyObj(value, newPath);
                } else {
                    return value;
                }
            },
        });
    }

    private proxyCall(target: any, path: string[], args: any[], fn: Function): Transition {
        const { snapshot, dataTypeStore: dataTypes, test, state } = this;
        const index = state.currentSnapshot.length;
        const expectedEntry = snapshot?.[index];
        const entry: FunctionCall = { type: "call", path, args };
        const callMatches = expectedEntry && areCallsEqual(dataTypes, entry, expectedEntry);

        if (test.updateMode !== "all" && callMatches) {
            return this.addEntry(state, expectedEntry);
        } else if (test.updateMode === "all" || (test.updateMode === "new" && !snapshot)) {
            const returns = fn.apply(target, args);
            const call: SnapshotEntry = { type: "call", path, args, returns: returns };
            return this.addEntry(state, call);
        } else {
            return this.snapshotError(state, path, args);
        }
    }

    private addEntry(state: State, entry: SnapshotEntry): Transition {
        return {
            type: "success",
            state: { currentSnapshot: [...state.currentSnapshot, entry] },
            returns: entry.returns,
        };
    }

    private snapshotError(state: State, path: string[], args: unknown[]): Transition {
        const entry: SnapshotEntry = { type: "call", path, args, returns: undefined };
        const index = state.currentSnapshot.length;
        const prevSnapshotTail = this.snapshot?.slice(index) || [];
        const newCurrentSnapshot = [...state.currentSnapshot, entry, ...prevSnapshotTail];

        return {
            type: "error",
            state: { currentSnapshot: newCurrentSnapshot },
            error: `Snapshot call failed`,
        };
    }
}

type Transition =
    | { type: "success"; state: State; returns: unknown }
    | { type: "error"; state: State; error: string };

type State = { currentSnapshot: Snapshot };
