// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from './support/test.js';

/**
 * Intentionally degrading tests for TestDino dashboard demos (10 cases).
 * Tagged @chromium — first suite run is fast; each later Playwright invocation
 * waits longer so "Degrading tests" can detect meaningful slowdowns.
 *
 * Tuned so TestDino's meaningfullyness gate can pass after >= 5 distinct runs:
 *   - duration_trend_slope > 0
 *   - total_runs >= 5  (needs unique ciRunId per Playwright invocation)
 *   - avg_duration_ms IS NOT NULL
 *   - slope × total_runs >= 50 ms
 *   - slope × total_runs >= 0.15 × avg_duration_ms
 *
 * Delay model: duration ≈ baseMs + runIndex * msPerRun
 * With msPerRun ≈ 2.2–3.5s, after 5 runs absolute drift ≈ 11–17.5s and
 * relative drift ≫ 15% of avg — both gates clear.
 *
 * State file: .degrade-run-count (project root; survives Playwright wiping test-results/)
 * Reset: delete that file, or set RESET_DEGRADE_RUN=1
 *
 * Do not "optimize" these delays unless explicitly asked.
 */

const STATE_FILE = path.join(process.cwd(), '.degrade-run-count');

/**
 * Bump and return the 0-based run index for this Playwright invocation.
 * Run 0 = fast, run 1+ = progressively slower.
 * @returns {number}
 */
function bumpRunIndex() {
  if (process.env.RESET_DEGRADE_RUN === '1') {
    try {
      fs.unlinkSync(STATE_FILE);
    } catch {
      // ignore missing file
    }
  }

  let previous = -1;
  try {
    previous = Number.parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim(), 10);
    if (!Number.isFinite(previous) || previous < -1) previous = -1;
  } catch {
    previous = -1;
  }

  const runIndex = previous + 1;
  fs.writeFileSync(STATE_FILE, String(runIndex), 'utf8');
  return runIndex;
}

/**
 * @param {number} runIndex
 * @param {number} baseMs Fast first-run duration
 * @param {number} msPerRun Extra delay added for each subsequent suite run
 * @returns {number}
 */
function degradeDelayMs(runIndex, baseMs, msPerRun) {
  return baseMs + runIndex * msPerRun;
}

/**
 * @param {number} ms
 */
async function intentionalSlowdown(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

test.describe.configure({ mode: 'serial' });

test.describe('Degrading Test Suite', { tag: '@chromium' }, () => {
  /** @type {number} */
  let runIndex = 0;

  test.beforeAll(() => {
    runIndex = bumpRunIndex();
    // eslint-disable-next-line no-console
    console.log(`[degrading] suite run #${runIndex + 1} (index=${runIndex})`);
  });

  test(
    'Degrading: checkout form validation lag',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p0' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Checkout validation grows slower on each run' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 120, 2800));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: product search response time',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p0' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Search latency increases on each suite run' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 100, 3200));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: cart quantity update',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Cart mutation path slows on later runs' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 150, 2600));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: inventory stock sync',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Inventory sync backpressure grows per run' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 200, 3500));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: order history pagination',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Order list pagination slows on later runs' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 80, 2400));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: address autocomplete',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Address suggestions resolve slower each run' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 90, 2200));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: payment method list load',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Payment options fetch degrades across runs' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 130, 3000));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: image gallery lazy load',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Gallery assets take longer on later runs' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 110, 2700));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: wishlist toggle round-trip',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Wishlist mutation latency creeps up each run' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 100, 2300));
      expect(true).toBe(true);
    },
  );

  test(
    'Degrading: account settings save',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Degrading Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Settings save path slows on each suite run' },
      ],
    },
    async () => {
      test.setTimeout(120_000);
      await intentionalSlowdown(degradeDelayMs(runIndex, 140, 3100));
      expect(true).toBe(true);
    },
  );
});
