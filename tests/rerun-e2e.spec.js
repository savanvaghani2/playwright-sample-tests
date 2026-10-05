// @ts-check
import { expect, test } from './support/test.js';

// Deterministic outcomes for the re-run e2e plan (docs/RERUN_E2E_TEST_PLAN.md).
// Order matters: with --shard=x/2 shard 1 is green (holds the flaky test) and every failure lands in shard 2.
const attempt = Number(process.env.GITHUB_RUN_ATTEMPT || 1);
const mode = process.env.RERUN_E2E_MODE || 'mixed';
const recoverFails = mode === 'mixed' || mode === 'recover-only' ? attempt === 1 : false;
const stickyFails = mode === 'mixed';

const TAG = { tag: ['@api', '@rerun-e2e'] };
const pass = () => expect(true).toBe(true);

test.describe('rerun e2e', () => {
  test('flaky-a', TAG, async ({}, testInfo) => {
    expect(testInfo.retry, 'fails on the first try only').toBeGreaterThan(0);
  });
  test('pass-1', TAG, pass);
  test('pass-2', TAG, pass);
  test('pass-3', TAG, pass);
  test('pass-4', TAG, pass);
  test('pass-5', TAG, pass);

  test('recover-a', TAG, () => {
    expect(recoverFails, `attempt ${attempt}`).toBe(false);
  });
  test('sticky-a', TAG, () => {
    expect(stickyFails, 'always fails in mixed mode').toBe(false);
  });
  test('recover-b', TAG, () => {
    expect(recoverFails, `attempt ${attempt}`).toBe(false);
  });
  test('pass-6', TAG, pass);
  test('pass-7', TAG, pass);
  test('pass-8', TAG, pass);
});
