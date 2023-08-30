import { ExpectStatic } from "vitest";
import { afterThis } from "./afterThis";
import { CurrentTest, UpdateMode } from "../domain/entities";
import { CurrentTestClient } from "../domain/repositories";

export class CurrentTestVitestClient implements CurrentTestClient {
    constructor(private expect: ExpectStatic) {}

    get(): CurrentTest {
        const state = this.expect.getState();
        const testPath = state.testPath;
        const parts = (state.currentTestName || "").split(" > ");
        const name = parts[parts.length - 1];
        if (!name || !testPath) throw new Error("Cannot get current test");
        return { path: testPath, name: name, updateMode: this.getUpdateMode() };
    }

    expectToMatchSnapshot(expectedContents: string, snapshotPath: string) {
        return this.expect(expectedContents).toMatchFileSnapshot(snapshotPath);
    }

    runOnTeardown(block: () => Promise<void>) {
        return afterThis(block);
    }

    private getUpdateMode(): UpdateMode {
        const snapshotState = this.expect.getState().snapshotState as unknown;
        const state = snapshotState as { _updateSnapshot: UpdateMode };
        return state._updateSnapshot;
    }
}
