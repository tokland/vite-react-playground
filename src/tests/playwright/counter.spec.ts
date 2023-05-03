import { test, expect, Page } from "@playwright/test";

test("counter actions", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Counter 1" }).click();
    await page.getByRole("button", { name: "+1" }).click();
    await page.getByRole("button", { name: "+1" }).click();
    expect(await text(page, { testId: "counter-value" })).toEqual("3");

    await page.getByRole("button", { name: "-1" }).click();
    expect(await text(page, { testId: "counter-value" })).toEqual("2");
});

function text(page: Page, options: { testId: string }): Promise<string | null> {
    return page.getByTestId(options.testId).textContent();
}
