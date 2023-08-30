import { test, expect, Page } from "@playwright/test";

test("counter actions increase/decrease", async ({ page }) => {
    const testPage = new TestPage(page);
    const counterPage = new CounterPage(testPage);

    await testPage.goto("/");
    await testPage.click({ link: "Counter 1" });

    await counterPage.expectValue(0);

    await counterPage.increment();
    await counterPage.expectValue(1);

    await counterPage.increment();
    await counterPage.expectValue(2);

    await counterPage.decrement();
    await counterPage.expectValue(1);
});

test("persistence of values when tab is reloaded", async ({ page }) => {
    const testPage = new TestPage(page);
    const counterPage = new CounterPage(testPage);

    await testPage.goto("/");
    await testPage.click({ link: "Counter 1" });

    await counterPage.expectValue(0);

    await counterPage.increment();
    await counterPage.expectValue(1);

    await testPage.wait(1000);
    await testPage.reload();
    await counterPage.expectValue(1);
});

class TestPage {
    constructor(private page: Page) {}

    async goto(path: string) {
        await this.page.goto(path);
    }

    async click(options: { link: string } | { button: string }) {
        if ("link" in options) {
            await this.page.getByRole("link", { name: options.link }).click();
        } else if ("button" in options) {
            await this.page.getByRole("button", { name: options.button }).click();
        }
    }

    async wait(ms: number) {
        await this.page.waitForTimeout(ms);
    }

    async reload() {
        await this.page.reload();
    }

    async expectText(text: string, options: { id: string }) {
        const contents = await this.page.getByTestId(options.id).textContent();
        expect(contents).toEqual(text);
    }
}

class CounterPage {
    constructor(private testPage: TestPage) {}

    async increment() {
        await this.testPage.click({ button: "+1" });
    }

    async decrement() {
        await this.testPage.click({ button: "-1" });
    }

    async expectValue(value: number) {
        await this.testPage.expectText(value.toString(), { id: "counter-value" });
    }
}
