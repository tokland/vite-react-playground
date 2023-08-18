import pathM from "path";
import util from "util";
import fs from "fs";
import sanitize from "sanitize-filename";

import { FilePath, Import, Maybe, Snapshot, SnapshotEntry, Test } from "../domain/entities";
import { assert } from "../../../domain/utils/ts-utils";
import { prettify } from "./prettify";
import { GetOptions, SnapshotRepository } from "../domain/repositories";

export function call<Obj>() {
    return function <Getter extends (obj: Obj) => any>(options: CallOptions<Obj, Getter>) {
        return { type: "call", ...options };
    };
}

const exists = util.promisify(fs.exists);

export class SnapshotTsFileRepository implements SnapshotRepository {
    async get(options: GetOptions): Promise<Maybe<Snapshot>> {
        const { builders } = options;
        const snapshotPath = this.getSnapshotPath(options);

        if (!(await exists(snapshotPath))) return;

        try {
            const imported = await import(snapshotPath);
            const modules = builders.getModules();
            const persisted = imported.default(modules) as PersistedSnapshot;
            return this.getEntityFromPersisted(persisted);
        } catch (err: any) {
            console.error(`Error when importing ${snapshotPath}:`, err);
            this.delete(snapshotPath);
        }
    }

    public async expectToMatch(options: ExpectOptions) {
        const { builders, currentSnapshot, snapshot, type, modulesImport: modulesI } = options;
        const snapshotPath = this.getSnapshotPath(options);
        const index = currentSnapshot.length;
        const proxyUsed = (snapshot && snapshot.length > 0) || index > 0;
        const callFnName = call.name;

        const getPath = (to: string) => {
            const projectRoot = process.cwd();
            const destDir = pathM.isAbsolute(to) ? to : pathM.join(projectRoot, to);
            const snapshotsDir = pathM.dirname(snapshotPath);
            return pathM.relative(snapshotsDir, destDir).replace(/\.ts$/, "");
        };

        const jsCode = proxyUsed
            ? `
        import { ${callFnName} } from "${getPath(__filename)}";
        import { ${type.name} } from "${getPath(type.path)}";
        import { ${modulesI.name} as ${builders.modulesRef} } from "${getPath(modulesI.path)}";

        export default function get() {
            return [
                ${(
                    await Promise.all(
                        currentSnapshot.map(
                            async entry => `
                                ${callFnName}<${type.name}>()({
                                  fn: ${getJsFunctionFromPath(entry.path)},
                                  args: ${await builders.toJs(entry.args)},
                                  returns: ${await builders.toJs(entry.returns)},
                                })
                            `,
                        ),
                    )
                ).join(",")}
            ];
        }`
            : `export default function get() { return []; }`;

        const contents = prettify(jsCode);
        return { snapshotPath, contents };
    }

    private getSnapshotPath(options: { test: Test; type: Import }) {
        const { test, type } = options;
        const testFilename = pathM.basename(test.path || "").replace(/.tsx?$/, "");
        const parts = [testFilename, type.name, test.name];
        const filename = sanitize(parts.filter(s => s).join("-") + ".ts").replace(/\s+/g, "_");
        const testFolder = pathM.dirname(assert(test.path));
        return pathM.join(testFolder, "snapshots", filename);
    }

    private delete(snapshotPath: FilePath) {
        if (!fs.existsSync(snapshotPath)) return;
        console.debug(`Delete snapshot file: ${snapshotPath}`);
        fs.rmSync(snapshotPath);
    }

    private getEntityFromPersisted(persistedSnapshot: PersistedSnapshot): Snapshot | undefined {
        if (!persistedSnapshot) return undefined;

        return persistedSnapshot.map((item): SnapshotEntry => {
            return {
                type: "call",
                path: getPathFromJsFunction(item.fn),
                args: item.args,
                returns: item.returns,
            };
        });
    }
}

type ExpectOptions = GetOptions & {
    snapshot: Snapshot | undefined;
    currentSnapshot: Snapshot;
    modulesImport: Import;
};

type PersistedSnapshot = PersistedSnapshotEntry[] | undefined;

type PersistedSnapshotEntry = FunctionCallPersisted;

type FunctionCallPersisted = TypedCall<unknown, (...args: unknown[]) => any>;

type TypedCall<Obj, Fn> = { type: "call"; fn: Fn } & ExtractSignature<Obj, Fn>;

type ExtractSignature<Obj, Fn> = Fn extends (obj: Obj) => (...args: infer Args) => infer U
    ? { args: Args; returns: U }
    : never;

type CallOptions<Obj, Getter extends (obj: Obj) => any> = Omit<TypedCall<Obj, Getter>, "type">;

function getPathFromJsFunction(fn: Function): string[] {
    return fn.toString().split("=>")[1]?.split(".").slice(1) || [];
}

function getJsFunctionFromPath(path: string[]): string {
    return `(obj) => obj.${path.join(".")}`;
}
