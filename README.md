# Playwright Sample Tests

Sample end-to-end and API test suite for the [TestDino](https://testdino.com/) Playwright reporting dashboard. Tests run against the [Store Demo](https://storedemo.testdino.com/products) app and external APIs, with results streamed in real time via the `@testdino/playwright` reporter.

---

## Project structure

```
playwright-sample-tests/
├── pages/                  # Page Object Models
├── tests/                  # Test specs (E2E, API, visual, flaky demos)
├── __screenshots__/        # Visual regression baselines
├── playwright.config.js    # Playwright + TestDino reporter config
├── testdino-playwright-1.1.0.tgz
└── .github/workflows/      # CI with 5-way sharding
```

---

## Prerequisites

- Node.js 20+
- npm

---

## Setup

```sh
npm install
npx playwright install
```

For UI login tests, export credentials in your shell before running:

```sh
export USERNAME=your_store_demo_username
export PASSWORD=your_store_demo_password
```

Optional exports for password-change and checkout tests: `NEW_PASSWORD`, `FIRST_NAME`, `STREET_NAME`, `CITY`, `STATE`, `COUNTRY`, `ZIP_CODE`.

---

## Running tests

Run the full suite (83 tests across 14 files):

```sh
npx playwright test
```

Run a specific browser project:

```sh
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=ios
npx playwright test --project=api
```

Run a single file:

```sh
npx playwright test tests/login.spec.js
```

Update visual regression baselines:

```sh
npx playwright test tests/visual.spec.js --project=chromium --update-snapshots
```

---

## Browser projects and tags

Each Playwright project runs only tests tagged for that browser. Tag tests when defining them:

```js
test('my test', { tag: '@chromium' }, async ({ page }) => { ... });
```

| Project  | Tag         | Tests                                |
| -------- | ----------- | ------------------------------------ |
| chromium | `@chromium` | E2E, visual, flaky demos             |
| firefox  | `@firefox`  | Navigation, product reviews, profile |
| webkit   | `@webkit`   | Filters, wishlist, orders            |
| ios      | `@ios`      | Cart, settings, addresses            |
| android  | `@android`  | _(no tests yet)_                     |
| api      | `@api`      | REST API tests against dummyjson.com |

Apply a tag to an entire `describe` block:

```js
test.describe('Flaky Test Suite', { tag: '@chromium' }, () => { ... });
```

---

## TestDino reporter

Results are sent directly to TestDino via the built-in reporter in `playwright.config.js`:

```js
reporter: [
  [
    '@testdino/playwright',
    {
      serverUrl, // staging in CI, localhost locally
      token: 'td_api_...', // hardcoded in playwright.config.js
      ciRunId,
      artifacts, // enabled in CI, disabled locally
    },
  ],
];
```

### Test metadata annotations

Enrich dashboard reporting with TestDino annotations:

```js
annotation: [
  { type: 'testdino:priority', description: 'p0' },
  { type: 'testdino:feature', description: 'Authentication' },
  { type: 'testdino:owner', description: 'qa-team' },
  { type: 'testdino:link', description: 'https://jira.example.com/AUTH-002' },
  { type: 'testdino:notify-slack', description: '#e2e-alerts' },
  { type: 'testdino:context', description: 'What this test validates' },
  { type: 'testdino:flaky-reason', description: 'Why this test may be flaky' },
];
```

### CI run grouping

In CI, all shards share one dashboard run via `ciRunId`:

```
ci-run-{GITHUB_RUN_ID}-{GITHUB_RUN_ATTEMPT}
```

Locally, runs are grouped by date: `local-run-YYYY-MM-DD`.

---

## CI/CD

GitHub Actions runs tests on push, pull request, weekdays at 03:30 UTC, and manual dispatch. The workflow uses 5 parallel shards.

Required GitHub secrets:

| Secret                                                              | Purpose                |
| ------------------------------------------------------------------- | ---------------------- |
| `USERNAME`                                                          | Store demo login       |
| `PASSWORD`                                                          | Store demo login       |
| `NEW_PASSWORD`                                                      | Password change tests  |
| `FIRST_NAME`, `STREET_NAME`, `CITY`, `STATE`, `COUNTRY`, `ZIP_CODE` | Checkout/address tests |

---

### Quota burn (billing limits / usage alerts)

Instant-pass tests that each consume **one billable execution**. Opt-in via env so normal CI does not burn quota (unset → one skipped placeholder).

`npm run test:quota-burn` chunks large totals (default 200 cases/run). A single Playwright process with thousands of instant cases overflows Kafka max message size; HTTP fallback then fails locally with `ENOTFOUND ingestion-service` (Docker DNS from the host).

Prefer a staging project with a **low** `executions` limit (e.g. 40), then step toward alert thresholds (50 / 75 / 90 / 100):

```sh
QUOTA_BURN_COUNT=20 npm run test:quota-burn   # e.g. 20/40 → 50%
QUOTA_BURN_COUNT=10 npm run test:quota-burn   # → 75%
QUOTA_BURN_COUNT=6  npm run test:quota-burn   # → 90%
QUOTA_BURN_COUNT=4  npm run test:quota-burn   # → 100%

# Large burns (chunked automatically; optional QUOTA_BURN_CHUNK=150):
QUOTA_BURN_COUNT=5000 npm run test:quota-burn
```

Retries are disabled for this project. Skipped / interrupted tests do not bill — do not use `skipped-tests.spec.js` to move the meter.

### Dashboard status demo (all 4 outcomes)

Run these four files together to populate pass, fail, flaky, and skipped on the dashboard:

```sh
npx playwright test tests/passed-tests.spec.js tests/failed-tests.spec.js tests/flaky-tests.spec.js tests/skipped-tests.spec.js --project=chromium
```

Expected result: **10 passed · 10 failed · 10 flaky · 10 skipped**

| File                    | Status  | Count |
| ----------------------- | ------- | ----- |
| `passed-tests.spec.js`  | Passed  | 10    |
| `failed-tests.spec.js`  | Failed  | 10    |
| `flaky-tests.spec.js`   | Flaky   | 10    |
| `skipped-tests.spec.js` | Skipped | 10    |

---

## Test suites

| File                    | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `login.spec.js`         | Authentication (login/logout)                     |
| `cart_checkout.spec.js` | Cart operations                                   |
| `product.spec.js`       | Reviews, filters, wishlist, orders                |
| `navigation.spec.js`    | Navbar, contact form, password change             |
| `orders.spec.js`        | Address management                                |
| `visual.spec.js`        | Visual regression (GitHub login)                  |
| `passed-tests.spec.js`  | 10 intentional passing tests for dashboard demos  |
| `failed-tests.spec.js`  | 10 intentional failing tests for dashboard demos  |
| `flaky-tests.spec.js`   | 10 intentional flaky patterns for dashboard demos |
| `skipped-tests.spec.js` | 10 intentional skipped tests for dashboard demos  |
| `quota-burn.spec.js`    | Opt-in instant passes to burn execution quota     |
| `get-users.spec.js`     | GET user API tests                                |
| `post-api.spec.js`      | POST user API tests                               |
| `updateUser.spec.js`    | PUT/PATCH user API tests                          |
| `delete-api.spec.js`    | DELETE user API tests                             |

---

## License

MIT
