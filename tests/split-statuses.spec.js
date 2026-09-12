// @ts-check
import { test, expect } from './support/test.js';

/**
 * Status coverage for manual-split runs (`npm run test:split`).
 *
 * 20 cases in EVERY terminal status so the split/shard live view and the run
 * detail can be checked against a full outcome mix. Deliberately network-free —
 * the demo-store specs take seconds per case, which would push a 3-split group
 * far past the one-minute budget this suite is sized for.
 *
 * Each case holds a worker for STEP_MS so the run stays live long enough to watch
 * the per-split / per-shard progress; total wall clock stays under a minute at
 * the configured worker count.
 *
 * Tagged @api: no browser page is needed, and the API project is the cheapest to
 * start. Do not point these at storedemo — that is what the demo specs are for.
 */

// 20 per status is the split-verification default; the topology matrix overrides
// both knobs down so eight execution shapes still finish quickly.
const CASES_PER_STATUS = Number(process.env.SPLIT_CASES || 20);
const STEP_MS = Number(process.env.SPLIT_STEP_MS || 1200);

const hold = async () => {
  await new Promise((resolve) => setTimeout(resolve, STEP_MS));
};

const annotate = (feature, context) => ({
  annotation: [{ type: 'testdino:priority', description: 'p2' }, { type: 'testdino:feature', description: feature }, { type: 'testdino:owner', description: 'qa-team' }, { type: 'testdino:context', description: context }],
});

const indexes = Array.from({ length: CASES_PER_STATUS }, (_, i) => i + 1);

test.describe('Split Passed Suite', { tag: '@api' }, () => {
  for (const i of indexes) {
    test(
      `Split passed ${i}: settles clean`,
      annotate('Split Passed', 'Always passes on the first attempt'),
      async () => {
        await hold();
        expect(i).toBeGreaterThan(0);
      },
    );
  }
});

test.describe('Split Failed Suite', { tag: '@api' }, () => {
  for (const i of indexes) {
    test(
      `Split failed ${i}: assertion never holds`,
      annotate('Split Failed', 'Fails on every attempt, including retries'),
      async () => {
        await hold();
        expect(i, 'deliberate failure for split-mode status coverage').toBe(-1);
      },
    );
  }
});

// Playwright reports flaky only when attempt 0 fails and a retry passes, so these
// key off test.info().retry rather than any real race.
test.describe('Split Flaky Suite', { tag: '@api' }, () => {
  for (const i of indexes) {
    test(
      `Split flaky ${i}: passes on retry`,
      annotate('Split Flaky', 'Fails attempt 0, passes on the first retry'),
      async () => {
        await hold();
        expect(test.info().retry, 'first attempt fails by design').toBeGreaterThan(0);
      },
    );
  }
});

test.describe('Split Skipped Suite', { tag: '@api' }, () => {
  for (const i of indexes) {
    test.skip(
      `Split skipped ${i}: not applicable`,
      annotate('Split Skipped', 'Skipped so the run carries a skipped population'),
      async () => {
        await hold();
      },
    );
  }
});
