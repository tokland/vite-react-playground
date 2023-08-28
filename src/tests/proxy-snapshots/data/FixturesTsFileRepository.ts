import path from "path";
import fs from "fs";
import util from "util";
import { GenericTsSerializerStore } from "./TsSerializerStore";
import { prettify } from "./prettify";
import { FixturesRepository, FixturesRepositorySaveOptions } from "../domain/repositories";

export class FixturesTsFileRepository implements FixturesRepository {
    constructor(private tsSerializer: GenericTsSerializerStore) {}

    async generate(options: FixturesRepositorySaveOptions): Promise<void> {
        const { tsSerializer: tsSerializer } = this;
        const { filePath, fixtures } = options;
        const { modulesImport: modulesI } = this.tsSerializer;
        const modulesPath = getPath(filePath, modulesI.path);
        const writeFile = util.promisify(fs.writeFile);

        const jsCode = `
            import { ${modulesI.name} as ${tsSerializer.modulesRef} } from "${modulesPath}";
    
            const fixtures = ${await tsSerializer.toTs(fixtures)};
    
            export default fixtures;
        `;

        await writeFile(filePath, prettify(jsCode));
        console.debug(`Fixtures updated: ${filePath}`);
    }
}

function getPath(filePath: string, modulePath: string) {
    const from = path.dirname(filePath);
    const to = modulePath.replace(/\.ts/, "");
    return "./" + path.relative(from, to);
}
