import path from "path";
import fs from "fs";
import util from "util";
import { Builders } from "../domain/Builders";
import { prettify } from "./prettify";
import { FixturesRepository } from "../domain/repositories";
import { Import } from "../domain/entities";

const writeFile = util.promisify(fs.writeFile);

export type SaveOptions = {
    filePath: string;
    builders: Builders;
    fixtures: unknown;
    modulesRef: Import;
};

export class FixturesTsFileRepository implements FixturesRepository {
    async save(options: SaveOptions): Promise<void> {
        const { filePath, builders, fixtures, modulesRef } = options;
        const modulesPath = getPath(filePath, modulesRef.path);

        const jsCode = `
            import { ${modulesRef.name} as ${builders.modulesRef} } from "${modulesPath}";
    
            const fixtures = ${await builders.toJs(fixtures)};
    
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
