import pathM from "path";
import util from "util";
import fs from "fs";
import sanitize from "sanitize-filename";

import {
    FilePath,
    SymbolImport,
    Maybe,
    Snapshot,
    SnapshotEntry,
    CurrentTest,
} from "../domain/entities";
import { assert } from "../../../domain/utils/ts-utils";
import { prettify } from "./prettify";
import {
    SnapshotRepositoryExpectOptions,
    ExpectToMatchResult,
    SnapshotRepositoryGetOptions,
    SnapshotRepository,
} from "../domain/repositories";
import { GenericTsSerializerStore } from "./TsSerializerStore";

export function call<Obj>() {
    return function <Getter extends (obj: Obj) => any>(options: CallOptions<Obj, Getter>) {
        return { type: "call", ...options };
    };
}

export class SnapshotTsFileRepository implements SnapshotRepository {
    constructor(private tsSerializer: GenericTsSerializerStore) {}

    async get(options: SnapshotRepositoryGetOptions): Promise<Maybe<Snapshot>> {
        const { tsSerializer: tsSerializer } = this;
        const snapshotPath = this.getSnapshotPath(options);
        const exists = util.promisify(fs.exists);

        if (!(await exists(snapshotPath))) return;

        try {
            const imported = await import(snapshotPath);
            const modules = tsSerializer.getModules();
            const persisted = imported.default(modules) as PersistedSnapshot;
            return this.getSnapshotEntityFromPersisted(persisted);
        } catch (err: any) {
            console.error(`Error when importing ${snapshotPath}:`, err);
            await this.delete(snapshotPath);
        }
    }

    public async expectToMatch(options: SnapshotRepositoryExpectOptions): ExpectToMatchResult {
        const snapshotPath = this.getSnapshotPath(options);
        const jsCode = await this.getSnapshotContents(options);
        return { snapshotPath, contents: prettify(jsCode) };
    }

    private async getSnapshotContents(options: SnapshotRepositoryExpectOptions) {
        const { currentSnapshot, snapshot, type } = options;
        const { tsSerializer: tsSerializer } = this;
        const snapshotPath = this.getSnapshotPath(options);
        const modulesI = tsSerializer.modulesImport;
        const proxyUsed = (snapshot && snapshot.length > 0) || currentSnapshot.length > 0;
        const callFnName = call.name;
        const modulesPath = this.getImportPath(snapshotPath, modulesI.path);

        return proxyUsed
            ? `
        import { ${callFnName} } from "${this.getImportPath(snapshotPath, __filename)}";
        import { ${type.name} } from "${this.getImportPath(snapshotPath, type.path)}";
        import { ${modulesI.name} as ${tsSerializer.modulesRef} } from "${modulesPath}";

        export default function get() {
            return [
                ${(
                    await Promise.all(
                        currentSnapshot.map(
                            async entry => `
                                ${callFnName}<${type.name}>()({
                                  fn: ${getJsFunctionFromPath(entry.path)},
                                  args: ${await tsSerializer.toTs(entry.args)},
                                  returns: ${await tsSerializer.toTs(entry.returns)},
                                })
                            `,
                        ),
                    )
                ).join(",")}
            ];
        }`
            : `export default function get() { return []; }`;
    }

    private getImportPath(snapshotPath: FilePath, to: FilePath): FilePath {
        const projectRoot = process.cwd();
        const destDir = pathM.isAbsolute(to) ? to : pathM.join(projectRoot, to);
        const snapshotsDir = pathM.dirname(snapshotPath);
        return pathM.relative(snapshotsDir, destDir).replace(/\.ts$/, "");
    }

    private getSnapshotPath(options: { test: CurrentTest; type: SymbolImport }) {
        const { test, type } = options;
        const name = pathM.basename(test.path || "");
        const testFilename = name.replace(/\.(test|spec)\.tsx?$/, "");
        const parts = [testFilename, type.name, test.name];
        const filename = sanitize(parts.filter(s => s).join("-") + ".ts").replace(/\s+/g, "_");
        const testFolder = pathM.dirname(assert(test.path));
        return pathM.join(testFolder, "__proxy-snapshots", filename);
    }

    private async delete(snapshotPath: FilePath): Promise<boolean> {
        if (!(await fileExists(snapshotPath))) return false;
        console.debug(`Delete snapshot file: ${snapshotPath}`);
        fs.rmSync(snapshotPath);
        return true;
    }

    private getSnapshotEntityFromPersisted(items: PersistedSnapshot): Maybe<Snapshot> {
        return items?.map((item): SnapshotEntry => {
            return {
                type: item.type,
                path: getPathFromJsFunction(item.fn),
                args: item.args,
                returns: item.returns,
            };
        });
    }
}

const fileExists = util.promisify(fs.existsSync);

type PersistedSnapshot = PersistedSnapshotEntry[] | undefined;

type PersistedSnapshotEntry = FunctionCallPersisted;

type FunctionCallPersisted = TypedCall<unknown, (...args: unknown[]) => any>;

type TypedCall<Obj, Fn> = { type: "call"; fn: Fn } & ExtractSignature<Obj, Fn>;

type ExtractSignature<Obj, Fn> = Fn extends (obj: Obj) => (...args: infer Args) => infer U
    ? { args: Args; returns: U }
    : never;

type CallOptions<Obj, Getter extends (obj: Obj) => any> = Omit<TypedCall<Obj, Getter>, "type">;

function getPathFromJsFunction(fn: Function): string[] {
    const fnBody = fn.toString().split("=>")[1];
    if (!fnBody) throw new Error(`Cannot extract function body: ${fn.toString()}`);
    return fnBody.split(".").slice(1) || [];
}

function getJsFunctionFromPath(path: string[]): string {
    return `(obj) => obj.${path.join(".")}`;
}
