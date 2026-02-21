import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:1445",
    headless: true,
  },
  webServer: {
    command: "pnpm dev",
    port: 1445,
    reuseExistingServer: true,
    timeout: 15_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
