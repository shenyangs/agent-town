import {fileURLToPath} from 'node:url';
import { defineConfig, devices } from '@playwright/test';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= fileURLToPath(new URL('./.browsers', import.meta.url));
export default defineConfig({
  testDir: 'tests', testMatch: ['*.spec.ts'], timeout: 45_000, retries: 0, workers: 1,
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4201', viewport: {width: 1440, height: 900}, video: 'on', screenshot: 'on' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4201', reuseExistingServer: false, timeout: 90_000 },
  outputDir: process.env.npm_lifecycle_event === 'demo' ? 'artifacts/playwright/demo' : 'artifacts/playwright/e2e', reporter: [['list']],
});
