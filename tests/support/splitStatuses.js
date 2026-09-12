// @ts-check
import { expect, test } from './test.js';

/**
 * Status-mix cases for split / orchestrate demos.
 *
 * Originally 20 per status in one file (80 cases). That file was a single
 * dispatch unit, so one machine ate the whole hold-time while the others sat
 * idle. Each API spec now registers a 5-per-status slice (20 cases) so
 * failed/flaky/passed/skipped land evenly across the four files.
 *
 * This module returns DESCRIPTORS and never calls test() itself. Playwright
 * derives a test's location from the call stack of test(), so registering here
 * attributed all 80 cases to this file — and `orchestrate discover` then queued
 * `support/splitStatuses.js [api]` as a dispatch unit no machine can execute
 * (loaded standalone it registers nothing). The unit exhausted its attempts and
 * could-not-execute is write-once terminal, so every run finalized `incomplete`
 * while its coverage was in fact complete. Keep the test() calls in the specs.
 *
 * Override with SPLIT_CASES / SPLIT_STEP_MS (matrix-local.sh uses 3 / 120).
 *
 * @param {string} prefix  Distinguishes titles across files (GET, POST, …)
 */
export function splitStatusSuites(prefix) {
  const casesPerStatus = Number(process.env.SPLIT_CASES || 5);
  const stepMs = Number(process.env.SPLIT_STEP_MS || 1200);

  const hold = async () => {
    await new Promise((resolve) => setTimeout(resolve, stepMs));
  };

  const annotate = (feature, context) => ({
    annotation: [
      { type: 'testdino:priority', description: 'p2' },
      { type: 'testdino:feature', description: feature },
      { type: 'testdino:owner', description: 'qa-team' },
      { type: 'testdino:context', description: context },
    ],
  });

  const indexes = Array.from({ length: casesPerStatus }, (_, i) => i + 1);
  const slice = (title, feature, context, body) =>
    indexes.map((i) => ({
      title: title(i),
      annotation: annotate(feature, context),
      body: () => body(i),
    }));

  return [
    {
      name: 'Split Passed Suite',
      cases: slice(
        (i) => `Split passed ${prefix} ${i}: settles clean`,
        'Split Passed',
        'Always passes on the first attempt',
        async (i) => {
          await hold();
          expect(i).toBeGreaterThan(0);
        },
      ),
    },
    {
      name: 'Split Failed Suite',
      cases: slice(
        (i) => `Split failed ${prefix} ${i}: assertion never holds`,
        'Split Failed',
        'Fails on every attempt, including retries',
        async (i) => {
          await hold();
          expect(i, 'deliberate failure for split-mode status coverage').toBe(-1);
        },
      ),
    },
    {
      // Playwright reports flaky only when attempt 0 fails and a retry passes.
      name: 'Split Flaky Suite',
      cases: slice(
        (i) => `Split flaky ${prefix} ${i}: passes on retry`,
        'Split Flaky',
        'Fails attempt 0, passes on the first retry',
        async () => {
          await hold();
          expect(test.info().retry, 'first attempt fails by design').toBeGreaterThan(0);
        },
      ),
    },
    {
      name: 'Split Skipped Suite',
      skip: true,
      cases: slice(
        (i) => `Split skipped ${prefix} ${i}: not applicable`,
        'Split Skipped',
        'Skipped so the run carries a skipped population',
        async () => {
          await hold();
        },
      ),
    },
  ];
}
