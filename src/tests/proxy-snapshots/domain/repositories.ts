import { SymbolImport, Maybe, Snapshot, CurrentTest } from "./entities";

// Snapshot

export interface SnapshotRepository {
    get(options: SnapshotRepositoryGetOptions): Promise<Maybe<Snapshot>>;
    expectToMatch(options: SnapshotRepositoryExpectOptions): ExpectToMatchResult;
}

export type SnapshotRepositoryGetOptions = {
    test: CurrentTest;
    type: SymbolImport;
};

export type SnapshotRepositoryExpectOptions = SnapshotRepositoryGetOptions & {
    snapshot: Snapshot | undefined;
    currentSnapshot: Snapshot;
};

export type ExpectToMatchResult = Promise<{
    snapshotPath: string;
    contents: string;
}>;

// Current test

export interface CurrentTestClient {
    get(): CurrentTest;
    expectToMatchSnapshot(expectedContents: string, snapshotPath: string): Promise<void>;
    runOnTeardown(block: () => Promise<void>): void;
}

// Fixtures

export interface FixturesRepository {
    generate(options: FixturesRepositorySaveOptions): Promise<void>;
}

export type FixturesRepositorySaveOptions = {
    filePath: string;
    fixtures: unknown;
};
