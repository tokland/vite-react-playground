import { it } from "vitest";
import { getCompositionRootWithProxiedRepos } from "../../../compositionRootTest";
import fixtures from "../../../tests/fixtures";

it("saves counter", async () => {
    const compositionRoot = await getCompositionRootWithProxiedRepos();

    await compositionRoot.counters.save.execute(fixtures.counter.id1).toPromise();
});
