# CLAUDE.md — Playwright Sample Tests

Guidance for AI assistants working in this repository.

## Purpose

This is a **sample Playwright test framework** whose primary job is to exercise the **TestDino reporting dashboard**. It is not a production app test suite. Tests produce rich metadata (tags, annotations, flaky patterns, multi-browser coverage, sharding) that appear in TestDino.

## Tech stack

- **Playwright** (`@playwright/test` ^1.57) — test runner
- **@testdino/playwright** (local `testdino-playwright-1.1.0.tgz`) — real-time reporter
- **Page Object Model** — all UI interactions go through `pages/`

## Key config (`playwright.config.js`)

| Setting       | Value                                                                       | Notes                                                       |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `testDir`     | `./tests`                                                                   |                                                             |
| `snapshotDir` | `./__screenshots__`                                                         | Visual baselines live here                                  |
| `timeout`     | `30_000`                                                                    | Do not lower below 30s; page objects use multi-second waits |
| `retries`     | `2` in CI and locally                                                       | Required for flaky-test demos to register as flaky          |
| `workers`     | `5`                                                                         |                                                             |
| `baseURL`     | `https://storedemo.testdino.com/products`                                   | UI tests navigate relative to this                          |
| `reporter`    | `@testdino/playwright` only                                                 | No HTML/JSON reporter; results stream to TestDino           |
| `token`       | hardcoded in config                                                         | TestDino API token                                          |
| `serverUrl`   | `https://stg-analytics.testdino.com` in CI, `http://localhost:3005` locally | TestDino analytics endpoint                                 |
| `artifacts`   | `true` in CI, `false` locally                                               | Upload reporter artifacts only for CI runs                  |

## Project / tag system

Six Playwright projects each filter tests by tag via `grep`:

- `@chromium`, `@firefox`, `@webkit`, `@ios`, `@android`, `@api`, `@coverage`, `@quota-burn`

**Every test must have a tag** or it will not run in any project. Use describe-level tags for suites:

```js
test.describe('My Suite', { tag: '@chromium' }, () => { ... });
```

The `android` project currently has no tagged tests.

## TestDino annotations

When adding or editing tests, include annotations for dashboard metadata:

```js
test('name', {
  tag: '@chromium',
  annotation: [
    { type: 'testdino:priority', description: 'p0' },      // p0 | p1 | p2
    { type: 'testdino:feature', description: 'Feature' },
    { type: 'testdino:owner', description: 'team-or-person' },
    { type: 'testdino:link', description: 'https://jira.example.com/TICKET' },
    { type: 'testdino:notify-slack', description: '#channel' },
    { type: 'testdino:context', description: 'What this test validates' },
    { type: 'testdino:flaky-reason', description: 'Why it may flake' },  // optional
  ],
}, async () => { ... });
```

## Code conventions

### Page Objects (`pages/`)

- `BasePage.js` — shared `navigateTo`, `getPageTitle`
- `AllPages.js` — facade that instantiates all page objects; tests create one per `beforeEach`
- Each page extends `BasePage`, uses a `locators` object, and exposes action methods
- Import with `.js` extension: `import LoginPage from './LoginPage.js'`

### Test files (`tests/`)

- Use `// @ts-check` and ESM `import` (not `require`)
- Shared `let allPages` + `test.beforeEach` pattern for UI tests
- API tests use `{ request }` fixture and `dummyjson.com` (override with `API_BASE_URL` env)
- Do **not** add hollow tests (empty bodies or all-commented steps that pass silently)
- Do **not** leave large blocks of commented-out test code — remove or implement

### Visual tests

- Baselines stored in `__screenshots__/`
- Use **distinct snapshot names** per UI state (e.g. `username-input-empty.png`, `username-input-filled.png`)
- Never reuse the same snapshot name after changing the UI — that guarantees a false failure

### Flaky tests (`flaky-tests.spec.js`)

Intentionally unstable tests for dashboard demos. Exactly 10 cases, tagged `@chromium` at the describe level. Each fails on attempt 0 and passes on retry. Do not "fix" their flakiness unless explicitly asked.

### Failed tests (`failed-tests.spec.js`)

Intentionally failing tests for dashboard demos. Exactly 10 cases, tagged `@chromium`. Always fail, even on retry. Do not "fix" unless explicitly asked.

### Passed tests (`passed-tests.spec.js`)

Intentionally passing tests for dashboard demos. Exactly 10 cases, tagged `@chromium`. Always pass on the first attempt.

### Skipped tests (`skipped-tests.spec.js`)

Intentionally skipped tests for dashboard demos. Exactly 10 cases, tagged `@chromium`. Uses `test.skip()` — do not un-skip unless explicitly asked.

### Quota burn (`quota-burn.spec.js`)

Instant-pass cases that burn **one billable execution each** (`passed`) for billing limit / usage-alert testing. Tagged `@quota-burn`; project `quota-burn`.

- **Opt-in:** unset `QUOTA_BURN_COUNT` → one skipped placeholder (not billable). Never enable this env in weekday CI.
- **Always use** `npm run test:quota-burn` (`scripts/quota-burn.sh`). It chunks totals into ≤250-case runs (default chunk 200). One process with ~1.5k+ instant cases overflows Kafka max message size; HTTP fallback then fails with `ENOTFOUND ingestion-service` on the host.
- Per-run clamp: 250. Total clamp (script): 5000. Retries forced to 0. Project `workers: 2`.
- Import from `@playwright/test` (not `support/test.js`) so the auto coverage `page` fixture does not launch a browser.
- Prefer lowering the project's `executions` limit (e.g. 40) over burning free-tier 5k.

```sh
QUOTA_BURN_COUNT=20 npm run test:quota-burn
QUOTA_BURN_COUNT=5000 npm run test:quota-burn
QUOTA_BURN_COUNT=5000 QUOTA_BURN_CHUNK=150 npm run test:quota-burn
```

## Environment variables

| Variable                                                            | Required                                    | Used by                                     |
| ------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| `USERNAME`, `PASSWORD`                                              | UI login tests                              | `login.spec.js`, `navigation.spec.js`, etc. |
| `NEW_PASSWORD`                                                      | Password change test                        | `navigation.spec.js`                        |
| `FIRST_NAME`, `STREET_NAME`, `CITY`, `STATE`, `COUNTRY`, `ZIP_CODE` | Checkout tests                              | page objects / checkout flows               |
| `API_BASE_URL`                                                      | Optional (default: `https://dummyjson.com`) | API specs                                   |
| `QUOTA_BURN_COUNT`                                                  | Required for `npm run test:quota-burn`      | Total billable passes (script chunks; max 5k) |
| `QUOTA_BURN_CHUNK`                                                  | Optional (default 200, max 250)             | Cases per Playwright process                  |
| `CI`, `GITHUB_RUN_ID`, `GITHUB_RUN_ATTEMPT`                         | Auto in CI                                  | `ciRunId` grouping                          |

## Common commands

```sh
npm install
npx playwright install
npx playwright test                          # full suite
npx playwright test --project=chromium     # one browser
npx playwright test tests/login.spec.js      # one file
npx playwright test --list                   # dry run
npx playwright test --update-snapshots       # refresh visual baselines
QUOTA_BURN_COUNT=20 npm run test:quota-burn  # burn N executions (opt-in)
```

## CI (`.github/workflows/test.yml`)

- Runs in `mcr.microsoft.com/playwright:v1.61.0-noble` container
- 5 shards via matrix (`shardIndex` 1–5)
- Secrets passed via workflow `env:` on the test step
- Installs `testdino-playwright-1.1.0.tgz` explicitly after `npm ci`

## What to avoid

1. Setting `timeout` below 30s — page objects use `waitForTimeout(2000–3000)`
2. Adding tests without browser/API tags
3. Adding empty or commented-out test bodies
4. Re-adding HTML/JSON reporters unless explicitly requested (this project uses the TestDino reporter directly)
5. Creating commits or PRs unless the user asks

## File map

```
pages/
  AllPages.js          # Page object aggregator
  BasePage.js          # Base class
  LoginPage.js, HomePage.js, CartPage.js, ...  # Feature pages

tests/
  login.spec.js        # @chromium auth
  cart_checkout.spec.js # @ios cart
  product.spec.js      # @firefox, @webkit
  navigation.spec.js   # @firefox, @ios
  orders.spec.js       # @ios addresses
  visual.spec.js       # @chromium visual regression
  flaky-tests.spec.js  # @chromium intentional flake demos (10)
  failed-tests.spec.js # @chromium intentional failure demos (10)
  passed-tests.spec.js # @chromium intentional pass demos (10)
  skipped-tests.spec.js # @chromium intentional skip demos (10)
  quota-burn.spec.js   # @quota-burn opt-in execution burner (QUOTA_BURN_COUNT)
  get-users.spec.js    # @api
  post-api.spec.js     # @api
  updateUser.spec.js   # @api
  delete-api.spec.js   # @api
```
