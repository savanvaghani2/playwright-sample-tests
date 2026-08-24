// @ts-check
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// Use the GitHub Actions run identifier in CI so all shards share one run.
// Locally use a unique id per Playwright process so duration trends can build
// across repeated invocations (required for degrading-test detection).
const ciRunId =
  process.env.TESTDINO_CI_RUN_ID ||
  (isCI
    ? `ci-run-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || 1}`
    : `local-run-${Date.now()}`);

const serverUrl = isCI ? 'https://stg-analytics.testdino.com' : 'http://localhost:3005';

const artifacts = isCI;
const coverageEnabled = process.env.COVERAGE === 'true';

const token = isCI
  ? 'td_api_24831a8db96509cbe0ee22033dc98de46246f1f76e6a2a63a101e7d88ae65ad0'
  : // Local  - Savan Team
    'td_api_de36ca9059cfc62a17d0a0226c2d91b1dcc39c546a1e47cfa4b46b90bb11c6ca';

export default defineConfig({
  testDir: './tests',
  snapshotDir: './__screenshots__', // ✅ Baseline image storage
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 1, // Enable retries for flaky test behavior
  workers: isCI ? 5 : 5,

  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  reporter: [
    [
      '@testdino/playwright',
      {
        serverUrl,
        token,
        ciRunId,
        debug: false,
        artifacts: false,
        tags: ['@api', '@local', '@staging', '@chromium'],
        ...(coverageEnabled && {
          coverage: {
            enabled: true,
            include: ['**/src/**'],
            exclude: ['**/node_modules/**', 'tests/**', 'pages/**'],
            thresholds: {
              lines: 40,
              branches: 25,
              functions: 30,
              statements: 40,
            },
          },
        }),
      },
    ],
  ],

  webServer: coverageEnabled
    ? {
        command: 'npm run start:test',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !isCI,
        timeout: 120_000,
      }
    : undefined,

  use: {
    baseURL: 'https://storedemo.testdino.com/products',
    headless: true,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      grep: /@chromium/, // only run tests tagged @chromium
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grep: /@firefox/, // only run tests tagged @firefox
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      grep: /@webkit/, // only run tests tagged @webkit
    },
    {
      name: 'android',
      use: { ...devices['Pixel 5'] },
      grep: /@android/, // only run tests tagged @android
    },
    {
      name: 'ios',
      use: { ...devices['iPhone 14'] },
      grep: /@ios/, // only run tests tagged @ios
    },
    {
      name: 'api',
      use: { ...devices['API'] },
      grep: /@api/, // only run tests tagged @api
    },
    {
      name: 'coverage',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5173',
      },
      grep: /@coverage/,
    },
    {
      // Opt-in via QUOTA_BURN_COUNT — without it the suite is one skipped (free) case.
      // No browser / traces: instant passes only; each still bills one execution.
      // workers:2 — keep reporter flush rate under Kafka max message size.
      name: 'quota-burn',
      use: {
        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
      workers: 2,
      grep: /@quota-burn/,
    },
  ],
});



// td_api_0f3173d12c7a90cdc78c7405c6f4fe8c2c42af160a33f3611ba4af15646a83e1 // testdino api token PROD - ayush@testdino.com - Savan Test Org
// td_api_24831a8db96509cbe0ee22033dc98de46246f1f76e6a2a63a101e7d88ae65ad0 // testdino api token STAGE - krupa.alphabin+1@gmail.com - Savan Test
