import { defineConfig, devices } from '@playwright/test'

// Visual regression only — the `playground.html` gallery is the "core set"
// (PREMIUM infra checklist). Unit/component behavior stays in Vitest;
// this only catches unintended pixel changes across every component.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
})
