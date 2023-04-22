import { test } from "@playwright/test";

test("test", async ({ page }) => {
    await page.goto("http://localhost:5000/");

    await page.getByRole("link", { name: "Counter 1" }).click();
    await page.getByRole("button", { name: "+1" }).click();
    await page.getByRole("button", { name: "+1" }).click();
    await page.getByRole("button", { name: "-1" }).click();
});
