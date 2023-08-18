import { test, expect } from "vitest";

import { Counter } from "../../domain/entities/Counter";
import { getRepositoriesWithProxiedServices } from "../../compositionRootTest";
import fixtures from "../../tests/fixtures";

test("get", async () => {
    const repository = await getTestRepository();
    const counter1FromRepo = await repository.get("id1").toPromise();

    const initialCounter = new Counter({ id: "id1", value: 0 });
    expect(counter1FromRepo).toEqual(initialCounter);
});

test("save", async () => {
    const repository = await getTestRepository();

    await repository.save(fixtures.counter.id1).toPromise();
});

async function getTestRepository() {
    const repositories = await getRepositoriesWithProxiedServices();
    return repositories.counter;
}
