import { it, expect } from "vitest";
import { getCompositionRootWithProxiedRepos } from "../../../compositionRootTest";
import { Counter } from "../../entities/Counter";

it("returns counter by ID", async () => {
    const compositionRoot = await getCompositionRootWithProxiedRepos();
    const counter1FromUseCase = await compositionRoot.counters.get.execute("id1").toPromise();

    const initialCounter = new Counter({ id: "id1", value: 0 });
    expect(counter1FromUseCase).toEqual(initialCounter);
});
