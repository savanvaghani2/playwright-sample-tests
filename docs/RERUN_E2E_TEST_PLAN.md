# Re-run only failed tests: e2e test plan (local + staging)

Manual e2e plan for the re-run feature, driven from this repo on two self-hosted GitHub runners.
Feature SoT: `microservices/docs/RERUN_FAILED_TESTS.md`. Where that doc and the code disagree, the code wins (see §8).

Confidence tags: `[Sure]` read in code or measured, `[Maybe]` strong inference, `[Guess]` unverified.

---

## 1. What is under test

Two server paths, picked by the sheet on the run-detail page (`RerunSheet.tsx`, `selection.ts` `inRunAvailability`):

| Path | Trigger | YAML | Mechanism |
|---|---|---|---|
| **In-run** ("This commit", eligible) | `POST integration …/github/ci-rerun` | **No change.** Workflow runs `npx tdpw test`; only the CLI version moves (`package.json`) | GitHub `rerun-failed-jobs` → attempt k+1 of the same GitHub run → CLI auto mode lists its ids, asks `POST /reporter/ci-reruns/selection`, runs the failures as `--shard=1/1 --test-list` |
| **Dispatch** ("Latest", or "This commit" when in-run is not eligible) | `POST integration …/github/rerun-dispatch` | **Change.** Workflow declares `testdino_rerun_*` inputs (§6.3 of the SoT) and pins checkout to `testdino_rerun_sha` | New `workflow_dispatch` run → `npx tdpw test --rerun <scope> --from-run <id>` |
| CLI direct | `npx tdpw test --rerun … --from-run …` on the runner | n/a | Same resolver as dispatch (door A) |

In-run eligibility, from code `[Sure]`: provider `github-actions`, numeric `pipelineId`, `canDispatch`, same repo as the connection, scope `failed` or `failed-and-flaky`, no custom selection (frontend `selection.ts:333`). Server side, the run must be finalized, come from GitHub Actions, match the `pipelineId` and have `failed > 0` (data-handler `rerunintent/handler.go:114`).
In-run **narrows** only when the source run's `launcher = tdpw` and `reporterVersion ≥ 2.7.7` (`≥ 2.7.8` for a split run). Otherwise the failed jobs re-run **in full** and the sheet says why (`old-cli` / `not-tdpw`).

---

## 2. Verified state (2026-10-05)

| Fact | State | Evidence |
|---|---|---|
| In-run server code (`ci-rerun`, `rerunintent`, CI door, `workflow_run` relay) | **staging only, not on master** | `git ls-tree origin/staging` vs `origin/master` |
| Staging deploy | at `origin/staging` head `36fd29dc`, deploy green 2026-10-05 07:06Z. **No redeploy needed** unless staging moves | `gh run list --workflow staging-deploy.yml` |
| CLI auto mode (narrowing, 2.7.8) | **unpublished**, open PR testdino-playwright-cli#62, one failing check | npm latest = `2.7.6` |
| Orchestration (`tdpw orchestrate`) | **not on master or staging**; only `feat/test-orchestration-demo` | 0 matching files on either ref |
| Self-hosted runners on `savanvaghani2/playwright-sample-tests` | `td-local` + `td-stg` (§3), launchd services | `GET /repos/…/actions/runners` |
| Repo secrets | `TESTDINO_STAGING_URL` / `TESTDINO_STAGING_TOKEN` added (staging project `project_1a12d558e575dfa808c88619`), plus `TESTDINO_TOKEN_LOCAL` | `gh secret list` |
| `npx playwright test --list` with the config reporter | opened an empty run on TestDino that never completes; `playwright.config.js` now swaps in the `list` reporter under `--list` | staging runs #9-#12 |
| Retried shard identity | a narrowed job runs `--shard=1/1` but **reports its original shard N/M**; the group finalizes via the `workflow_run` relay (~2 s) or the reaper idle (~2-3 min) | CLI `src/cli/types.ts:36`, microservices `906af8be` |
| Sample config `ciRunId` default | `ci-run-<run_id>-<attempt>`, so every attempt is a new TestDino run | `playwright.config.js:12-14` |

**Consequences**

1. **Orchestration cannot be tested on staging.** `[Sure]` Staging has no orchestrator. Its only role in this feature is as a *source* run for a dispatch/CLI re-run (the resolver ignores machines, SoT D-O4). That is testable only on the **local** runner against a stack built from the demo branch, which is out of scope. Marked N/A on staging (§5, O1).
2. **The "no YAML change" path needs the 2.7.8 CLI from PR #62**, vendored as `temp-cli/testdino-playwright-2.7.8.tgz` and referenced from **`package.json`** (`file:` dependency). It must **not** come from a YAML install step, or the test stops proving "no YAML change".
3. **The local stack must be built from `staging`, not `master`.** `master` has no in-run code. Redeploy local from a `staging` worktree.

---

## 3. Runners (2, both on this Mac)

| Runner | Labels | Dir | Talks to | Used by |
|---|---|---|---|---|
| `td-local` | `self-hosted, macOS, testdino-local` | `~/actions-runners/local` | `http://localhost:3005` (local docker stack built from `staging`) | existing `testdino-rerun-local.yml`, `testdino-orchestrate-staging.yml`, new `rerun-e2e-*.yml` when `target=local` |
| `td-stg` | `self-hosted, macOS, testdino-stg` | `~/actions-runners/staging` | `https://stg-analytics.testdino.com` | new `rerun-e2e-*.yml` when `target=staging` |

One runner each means a 4-shard matrix runs its jobs **one after another**. Narrowing and grouping are unaffected; only wall time grows. Register a second instance of a label later if that hurts.

Setup per runner (registration token via `gh api -X POST repos/savanvaghani2/playwright-sample-tests/actions/runners/registration-token`):

```bash
mkdir -p ~/actions-runners/<local|staging> && cd $_
# download actions-runner-osx-arm64 (latest) and extract
./config.sh --url https://github.com/savanvaghani2/playwright-sample-tests \
  --token <reg-token> --name td-<local|stg> --labels testdino-<local|stg> --unattended
./svc.sh install && ./svc.sh start      # launchd; `./run.sh` for foreground
```

**Server-side wiring each target needs** (user action, UI):

| | Local | Staging |
|---|---|---|
| Project + API key | local project → `TESTDINO_TOKEN_LOCAL` (exists) | staging project on `lab.testdino.com` → new secret `TESTDINO_STAGING_TOKEN` |
| GitHub App on this repo with `actions: write` + `workflow_run` events | local App (already installed, SoT §3) | **staging App installed on `savanvaghani2/playwright-sample-tests`** and connected to the staging project |
| `workflow_run` relay (fast finalize) | needs the App webhook tunnelled to local integration; without it the reaper finalizes in ~2-3 min | live (`infra/staging/overrides/integration.yml:39`) |

---

## 4. Repo changes this plan needs

1. `tests/rerun-e2e.spec.js`, tag `@rerun-e2e`, project `api` (no browser, no network), deterministic by attempt:
   - `pass-*`: always pass.
   - `recover-*`: fail when `GITHUB_RUN_ATTEMPT == 1`, pass after. **Proves the check turns green.**
   - `sticky-*`: always fail. **Proves attempt k+2 narrows off attempt k+1.**
   - `flaky-*`: fail on `testInfo.retry == 0`, pass on retry 1 (config `retries: 1`).
   - Spread so that with `--shard=x/4` failures land in **shards 2 and 3 only**. Confirm with `npx playwright test --list --shard=x/4 --grep @rerun-e2e` before the first run.
   - Mode switches by env: `RERUN_E2E_MODE=flaky-only` (no fail, only flaky), `nontest-fail` (tests pass, a later step exits 1).
2. `temp-cli/testdino-playwright-2.7.8.tgz` built from PR #62 head + `package.json` `"@testdino/playwright": "file:temp-cli/testdino-playwright-2.7.8.tgz"` on a branch. The old-CLI scenarios check out a commit pinned to `2.7.6`.
3. `.github/workflows/rerun-e2e-plain.yml`: **"no YAML change" family.** `workflow_dispatch` inputs `target` (local|staging), `shape` (single|sharded|split|reporter-only), `mode`. **No `testdino_rerun_*` inputs.** `runs-on: [self-hosted, testdino-${{ inputs.target }}]`. Jobs per shape:
   - `single`: one job, `npx tdpw test --project=api --grep @rerun-e2e`.
   - `sharded`: matrix 4, `--shard=${i}/4`, `fail-fast: false`.
   - `split`: 3 legs sharing `--split-id`, leg 2 sharded 2-way (mirrors `testdino-split-staging.yml`).
   - `reporter-only`: one job, `npx playwright test` with the reporter from config (no `tdpw`).
4. `.github/workflows/rerun-e2e-yaml.yml`: **"with YAML change" family.** Same shapes plus the SoT §6.3 inputs, `actions/checkout` `ref: ${{ inputs.testdino_rerun_sha || github.sha }}`, env-not-`${{ }}` in `run:`. When `testdino_rerun_from` is set it runs **one unsharded job**, because `--rerun` refuses `--shard`/`--split` (SoT D17).
5. Both files merged to **`main`**. `rerun-targets` reads the workflow list from the default branch registry (SoT D9), so a workflow only on a feature branch is never offered.

---

## 5. Scenario matrix

Columns: **Src** = source run shape. **YAML** = plain (no change) / yaml (inputs declared). **CLI** = version recorded on the source run. **Click** = what is pressed in the sheet. Every row is run on **staging** unless marked; repeat the S-rows on **local** once after staging passes.

### 5.1 In-run, no YAML change (`rerun-e2e-plain.yml`)

| ID | Src | CLI | Click | Expect |
|---|---|---|---|---|
| P1 | single | 2.7.8 | This commit, failed | Sheet: "only the failed tests". GitHub attempt 2 re-runs the one job; it runs only `recover-*` + `sticky-*`; `recover` pass, `sticky` fail; new TestDino run `rerun_of` = source, `ci_attempt=2` |
| P2 | P1's attempt 2 | 2.7.8 | This commit, failed (on the attempt-2 run) | attempt 3 runs only `sticky-*` (latest outcomes come from attempt 2, D28) |
| P3 | sharded 4 | 2.7.8 | This commit, failed | Only shard jobs 2 and 3 re-run; each runs only its own failures; reports shard 2/4, 3/4; both group into one run "attempt 2"; finalize within seconds (relay) |
| P4 | sharded 4, `recover-*` only | 2.7.8 | This commit | Check turns **green** on the original GitHub run |
| P5 | split (2 unsharded + 1 sharded leg) | 2.7.8 | This commit, failed | Each failed leg lists its own share and runs its failures; re-run group carries `rerun_of` even when a leg with no failures arrives first (`0e980ea9`) |
| P6 | single | **2.7.6** | This commit | Sheet: "Every test runs again… update to 2.7.7"; job re-runs **in full**; button reads "Re-run failed jobs" |
| P7 | split | **2.7.7** (if a tarball exists, else skip) | This commit | Sheet holds split to 2.7.8: runs in full |
| P8 | reporter-only | 2.7.8 reporter | This commit | Sheet: jobs re-run in full, suggests `npx tdpw test` (D37) |
| P9 | single | 2.7.8 | This commit, **failed-and-flaky** | In-run offered; flaky tests in a **green** job are not re-run (D25). Note what the sheet promises |
| P10 | single, `flaky-only` mode | 2.7.8 | open sheet | In-run **not** offered; no workflow declares `testdino_rerun_from` → copy-command only |
| P11 | single | 2.7.8 | custom selection (untick one) | In-run not offered; dispatch refused (no `_test_ids` input) → copy-command only |
| P12 | single, `nontest-fail` mode | 2.7.8 | This commit | Intent refused (`The run has no failed tests.`) or not offered; GitHub not called |

### 5.2 Dispatch, with YAML change (`rerun-e2e-yaml.yml`)

| ID | Src | Click | Expect |
|---|---|---|---|
| Y1 | single | This commit, failed | Uses **in-run** (D26 picks it), not dispatch. Same as P1. Confirms one card, server-picked mechanism |
| Y2 | single | **Latest**, failed (push a commit first) | New `workflow_dispatch` run on the branch tip; `--rerun failed --from-run <id>`; SHA = tip, not source |
| Y3 | single | Latest, run commit == tip | Sheet collapses to one option (D11 positive match) |
| Y4 | single | flaky only | Dispatch (in-run ineligible); `testdino_rerun_scope=flaky`; only `flaky-*` run |
| Y5 | single | custom: untick one `sticky` | Dispatch with `testdino_rerun_exclude_ids`; This commit pins `testdino_rerun_sha`; the job asserts checkout SHA == source SHA |
| Y6 | single | custom: pick 2 | Dispatch with `testdino_rerun_test_ids`; exactly 2 run |
| Y7 | sharded 4 | Latest | One **unsharded** dispatched job runs all failures from shards 2+3 |
| Y8 | split | Latest | One unsharded job; `rerun_of` = the split group run |
| Y9 | single | Latest with extra tags | `testdino_rerun_tags` reaches `--rerun-tags`; the re-run carries source tags + extra |
| Y10 | any | CLI direct on the runner: `--rerun failed --from-run <id>`, then `--rerun failed --shard=1/2` | First runs the failures; second refused before any network call (D17) |

### 5.3 Edge and refusal cases

| ID | Setup | Expect |
|---|---|---|
| E1 | After P1, press GitHub's own "Re-run failed jobs" | Full run, no narrowing (no intent for that attempt, D30) |
| E2 | Double-click / two tabs on This commit | Second → 409; first's intent intact (D31) |
| E3 | Click while the source GitHub run is still in progress | `CI_RUN_IN_PROGRESS`; dispatch still offered |
| E4 | Sharded 4 with `fail-fast: true`, shard 3 cancelled | Shard 3 re-runs in full (never ran, D28); shard 2 narrows |
| E5 | Same-commit dispatch to a workflow without `testdino_rerun_sha` (temporary file) | 400, Latest still offered (D7) |
| E6 | Source branch deleted, then This commit (custom selection, so dispatch is used) | Dispatch on the default branch with the SHA pinned; Latest disabled (D7/D11) |
| E7 | Staging project paused | CI door 404 → retried job runs in full + one WARN line (D29) |
| E8 | Sharded without `--ci-run-id` (`TESTDINO_CI_RUN_ID` unset, config default overridden) | `[Maybe]` attempt-2 shards form their own run; confirm they do not join attempt 1's finalized group |
| O1 | Orchestrated source run | **N/A on staging** (no orchestrator). Local-only, needs the demo branch stack |

---

## 6. Evidence per scenario

Record these for each row, ids only, no screenshots unless the sheet copy is the subject:

- GitHub: run URL, attempt number, which jobs re-ran (`gh run view <id> --attempt N --json jobs`).
- Job log: CLI auto-mode line (`narrow:true` / reason), the `--test-list` count, the tests Playwright actually ran.
- TestDino: re-run's `test_run_…` id, `rerun_of`, `ci_attempt`, test count, final status, time from GitHub completion to TestDino finalize.
- Sheet: the line under "This commit" and the CTA text.

Pass = the executed test set equals the expected set exactly (not "fewer than full"), and `rerun_of` is set on every re-run.

---

## 7. Order of work

1. Register both runners (§3).
2. Staging wiring (user): project + token secret, staging App on this repo, project connected.
3. Build and vendor the 2.7.8 tarball; add the probe spec and both workflows; merge to `main`.
4. Run 5.1 → 5.2 → 5.3 on staging; then P1, P3, P5, Y2 on local (local stack built from `staging`).
5. File every mismatch against the owning service's `ISSUE.md`; fix SoT drift (§8) in a microservices PR.

---

## 8. SoT drift found while writing this

| SoT says | Code says |
|---|---|
| Status line: built on `feat/rerun-selection`, verified 2026-09-18 | In-run (§14) is on **staging only**; master lacks it |
| §14 "the I5 version" (unnamed) | `IN_RUN_MIN_CLI_VERSION = '2.7.7'`, split `2.7.8` (`selection.ts:307-312`); neither is published |
| D32 / E4: the narrowed job's reporter sends `1/1`, so no shard group opens | CLI reports the **original** shard N/M (`77b5a78`); the group closes via the `workflow_run` relay (`906af8be`) or the reaper |
| No mention of the `workflow_run` relay | `906af8be`: integration relays `workflow_run completed` → ingestion sweeps the attempt (~2 s vs ~2-3 min) |
| §6.3 snippet has no sharded-matrix guidance | `--rerun` + `--shard` is refused (D17); a customer copying the snippet into a sharded matrix fails every shard on dispatch. Y7 checks our workflow; the docs need a line |
