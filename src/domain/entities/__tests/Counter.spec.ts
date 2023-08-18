import fixtures from "../../../tests/fixtures";

describe("Counter", () => {
    test("add", async () => {
        const counter = fixtures.counter.id1;

        expect(counter.add(10).value).toEqual(10);
    });
});
