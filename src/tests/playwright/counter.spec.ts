import { test, expect, Page } from "@playwright/test";

test("counter actions increase/decrease value", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Counter 1" }).click();
    await expect(text({ in: page, withId: "counter-value" })).resolves.toEqual("0");

    await page.getByRole("button", { name: "+1" }).click();
    await page.getByRole("button", { name: "+1" }).click();
    await expect(text({ in: page, withId: "counter-value" })).resolves.toEqual("2");

    await page.getByRole("button", { name: "-1" }).click();
    await expect(text({ in: page, withId: "counter-value" })).resolves.toEqual("1");
});

test("persistence of tab reload", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Counter 1" }).click();
    await expect(text({ in: page, withId: "counter-value" })).resolves.toEqual("0");

    await page.getByRole("button", { name: "+1" }).click();
    await expect(text({ in: page, withId: "counter-value" })).resolves.toEqual("1");
    await page.waitForTimeout(1000);

    await page.reload();
    await expect(text({ in: page, withId: "counter-value" })).resolves.toEqual("1");
});

function text(options: { in: Page; withId: string }): Promise<string | null> {
    const { in: page, withId: testId } = options;
    return page.getByTestId(testId).textContent();
}
