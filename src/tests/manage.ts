import path from "path";
import { getAppRepositories } from "../compositionRoot";
import { builders, modules } from "./AppProxySnapshots";
import { cli } from "./proxy-snapshots/scripts/cli";

async function buildFixtures() {
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
        builders: builders,
        getFixtures: buildFixtures,
        filePath: path.join(__dirname, "fixtures.ts"),
        modulesRef: { path: __filename, name: "modules" },
    });
}

export { modules };
