import { Builders } from "../Builders";
import {
    areFunctionCallsEqual,
    emptyRollback,
    FunctionCall,
    Import,
    Maybe,
    Rollback,
    UpdateMode,
} from "../entities";
import { Snapshot, SnapshotEntry } from "../entities";
import { SnapshotTsFileRepository } from "../../data/SnapshotTsFileRepository";
import { TestLibVitest } from "../../data/TestLibVitest";

type ConstructorOptions = {
    testLib: TestLibVitest;
    snapshotRepository: SnapshotTsFileRepository;
};

type ExecuteOptions = {
    builders: Builders;
    type: Import;
    modulesImport: Import;
    rollback: Rollback;
};

export class GetProxySnapshotUseCase {
    constructor(private options: ConstructorOptions) {}

    async execute<Obj extends BaseObj>(obj: Obj, options: ExecuteOptions) {
        const { snapshotRepository, testLib } = this.options;
        const test = testLib.getCurrentTest();
        const snapshot = await snapshotRepository.get({ ...options, test });

        return new ProxyObject(obj, {
            ...this.options,
            ...options,
            snapshot: snapshot,
            snapshotRepository: snapshotRepository,
        }).get();
    }
}

export type BaseObj = Record<string, any>;

type ProxyObjectOptions = ConstructorOptions & ExecuteOptions & { snapshot: Maybe<Snapshot> };

class ProxyObject<Obj extends BaseObj> {
    private state: State;
    private builders: Builders;
    private snapshot: Maybe<Snapshot>;
    private updateMode: UpdateMode;
    private testLib: TestLibVitest;
    private snapshotRepository: SnapshotTsFileRepository;

    constructor(private obj: Obj, private options: ProxyObjectOptions) {
        this.state = { currentSnapshot: [] };
        this.updateMode = options.testLib.getUpdateMode();
        this.testLib = options.testLib;
        this.builders = options.builders;
        this.snapshotRepository = options.snapshotRepository;
        this.snapshot = options.snapshot;
    }

    async get(): Promise<Obj> {
        this.setupAutomaticExpectAfterTest();
        await this.setupRollback();
        return this.proxyObj(this.obj);
    }

    private setupAutomaticExpectAfterTest() {
        this.testLib.runOnTeardown(async () => {
            const { snapshotPath, contents } = await this.snapshotRepository.expectToMatch({
                test: this.testLib.getCurrentTest(),
                type: this.options.type,
                builders: this.builders,
                snapshot: this.snapshot,
                currentSnapshot: this.state.currentSnapshot,
                modulesImport: this.options.modulesImport,
            });

            await this.testLib.expectToMatchSnapshot(contents, snapshotPath);
        });
    }

    private log(msg: string, ...args: any[]): void {
        console.debug(`[proxy-snapshots] ${msg}`, ...args);
    }

    private async setupRollback() {
        const { snapshot, updateMode } = this;
        const isRollbackEnabled = updateMode === "all" || (updateMode === "new" && !snapshot);
        if (!isRollbackEnabled) return;

        const { setup, teardown } = this.options.rollback || emptyRollback;

        if (teardown) {
            this.testLib.runOnTeardown(teardown);
        }

        if (setup) {
            await setup();
        }
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
        const { snapshot, builders, updateMode, state } = this;
        const index = state.currentSnapshot.length;
        const expectedEntry = snapshot?.[index];
        const entry: FunctionCall = { type: "call", path, args };
        const callMatches = expectedEntry && areFunctionCallsEqual(builders, entry, expectedEntry);

        if (updateMode !== "all" && callMatches) {
            return this.addEntry(state, expectedEntry);
        } else if (updateMode === "all" || (updateMode === "new" && !snapshot)) {
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
            error: `Snapshot call failed (index=${index}). Fix the snapshot (manually or pressing key u)`,
        };
    }
}

type Transition =
    | { type: "success"; state: State; returns: unknown }
    | { type: "error"; state: State; error: string };

type State = { currentSnapshot: Snapshot };
