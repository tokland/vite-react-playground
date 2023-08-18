import { SaveOptions } from "../data/FixturesTsFileRepository";
import { Builders } from "./Builders";
import { Import, Maybe, Snapshot, Test, UpdateMode } from "./entities";

export interface SnapshotRepository {
    get(options: GetOptions): Promise<Maybe<Snapshot>>;
}

export type GetOptions = { test: Test; type: Import; builders: Builders };

export interface TestLib {
    getUpdateMode(): UpdateMode;
    getCurrentTest(): Test;
    expectToMatchSnapshot(expectedContents: string, snapshotPath: string): Promise<void>;
    runOnTeardown(block: () => Promise<void>): void;
}

export interface FixturesRepository {
    save(options: SaveOptions): Promise<void>;
}
