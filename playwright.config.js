// @ts-nocheck
import 'dotenv/config';

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

// Everything environment-specific hangs off TD_ENV (.env), so switching targets
// is a one-line edit there and never an edit here. CI has no .env, so it falls
// back to staging unless the workflow says otherwise.
// A GitHub runner's localhost is the runner, not your Mac, so a CI job aimed at
// the local stack has to come back through a tunnel. Reserved ngrok domain by
// default; override in .env (or as a CI variable) when the tunnel moves.
const LOCAL_TUNNEL_URL =
  process.env.TD_LOCAL_TUNNEL_URL || 'https://railwayless-iris-ebulliently.ngrok-free.app';

const SERVER_URLS = {
  local: isCI ? LOCAL_TUNNEL_URL : 'http://localhost:3005',
  staging: 'https://stg-analytics.testdino.com',
  prod: 'https://reporter.testdino.com',
};

const env = (process.env.TD_ENV || (isCI ? 'staging' : 'local')).toLowerCase();
if (!SERVER_URLS[env]) {
  throw new Error(
    `TD_ENV="${env}" is not one of: ${Object.keys(SERVER_URLS).join(', ')}. Fix it in .env.`,
  );
}

// An explicit URL wins so a branch deploy or tunnel needs no new entry above.
const serverUrl = process.env.TESTDINO_SERVER_URL || SERVER_URLS[env];

// Environment-specific first: a leftover generic TESTDINO_TOKEN must not
// silently outrank the token that belongs to the selected TD_ENV. TDPW_TOKEN is
// what the CLI reads, so honouring it keeps CI and this config in agreement.
const token =
  process.env[`TESTDINO_TOKEN_${env.toUpperCase()}`] ||
  process.env.TESTDINO_TOKEN ||
  process.env.TDPW_TOKEN;

if (!token) {
  throw new Error(
    `No TestDino token for TD_ENV=${env}. Set TESTDINO_TOKEN_${env.toUpperCase()} in .env.`,
  );
}

const coverageEnabled = process.env.COVERAGE === 'true';

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
        debug: process.env.TESTDINO_DEBUG === 'true',
        artifacts: process.env.TESTDINO_ARTIFACTS === 'true',
        // The env tag is derived, so a run can never be labelled with the
        // environment it did not report to.
        tags: ['@api', `@${env}`, '@chromium'],
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
    baseURL: process.env.BASE_URL || 'https://storedemo.testdino.com/products',
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
