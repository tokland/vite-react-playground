import path from "path";
import { getAppRepositories } from "../compositionRoot";
import { tsSerializerStore } from "./AppProxySnapshots";
import { FixturesTsFileRepository } from "./proxy-snapshots/data/FixturesTsFileRepository";
import { cli } from "./proxy-snapshots/scripts/cli";

async function getFixtures() {
    const repositories = getAppRepositories();

    return {
        counter: {
            id1: await repositories.counter.get("1").toPromise(),
            id2: await repositories.counter.get("2").toPromise(),
        },
    };
}

if (require.main === module) {
    cli({
        filePath: path.join(__dirname, "fixtures.ts"),
        getFixtures: getFixtures,
        fixturesRepository: new FixturesTsFileRepository(tsSerializerStore),
    });
}
