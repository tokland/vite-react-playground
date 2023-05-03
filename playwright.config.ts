import { defineConfig, devices } from "@playwright/test";

const port = 3000;
const serverUrl = `http://127.0.0.1:${port}`;

/* https://playwright.dev/docs/test-configuration */

export default defineConfig({
    testDir: "./src/tests/playwright",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: { baseURL: serverUrl, trace: "on-first-retry" },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: `yarn start --port ${port}`,
        url: serverUrl,
        reuseExistingServer: !process.env.CI,
    },
});
