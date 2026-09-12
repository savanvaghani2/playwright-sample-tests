// @ts-check
import { test, expect } from './support/test.js';

/**
 * Edge cases for test-history identity resolution (the pw_test_id selector).
 *
 * Ingestion derives each test's title_path_hash from its full title_path
 * ([root suite, ...describe blocks, leaf title]) + file. So identity is unique
 * per (describe ancestry + leaf title + file), NOT per leaf title alone. These
 * specs seed every collision shape the history endpoint must handle:
 *
 *   A. UNIQUE title            → 1 identity, never ambiguous (control).
 *   B. Same title, 2 files     → 2 identities, suite_file_path disambiguates.
 *   C. Same title, same file,
 *      2 describe blocks       → 2 identities sharing title AND file — the core
 *                                bug: suite_file_path can't split them, only
 *                                pw_test_id / title_path_hash can.
 *   D. Same title, same file,
 *      3 describe blocks       → 3-way same-file collision (stress).
 *
 * Each test emits a mix of PASS and FAIL so the resolved timeline carries real
 * verdicts to verify. History is opened from a run row, which has pw_test_id in
 * hand — so the pw_test_id selector resolves each of these unambiguously.
 */

const AN = (feature) => ({
  annotation: [
    { type: 'testdino:priority', description: 'p1' },
    { type: 'testdino:feature', description: feature },
    { type: 'testdino:owner', description: 'qa-team' },
  ],
});

// ── A. Unique title — the control. One identity, no collision. ──────────────
test.describe('History Unique', { tag: '@chromium' }, () => {
  test('unique passing history test', AN('History Edge'), async () => {
    expect(1 + 1).toBe(2); // pass
  });

  test('unique failing history test', AN('History Edge'), async () => {
    expect(1 + 1).toBe(3); // fail — gives the timeline a fail verdict
  });
});

// ── B. Same leaf title in TWO DIFFERENT files. suite_file_path disambiguates.
// (This file is file #1; the sibling lives in ambiguous-history-b.spec.js.)
const CROSS_FILE_TITLE = 'shared title across files';
test.describe('History Cross File One', { tag: '@chromium' }, () => {
  test(CROSS_FILE_TITLE, AN('History Edge'), async () => {
    expect('a').toBe('a'); // pass
  });
});

// ── C. Same leaf title, SAME file, TWO describe blocks. The core bug. ───────
const SAME_FILE_TITLE = 'should validate fields and show proper error messages';

test.describe('Pipeline Validation', { tag: '@chromium' }, () => {
  test(SAME_FILE_TITLE, AN('Ambiguous History'), async () => {
    expect('validation'.length).toBeGreaterThan(0); // pass
  });
});

test.describe('Pipeline Error Messages', { tag: '@chromium' }, () => {
  test(SAME_FILE_TITLE, AN('Ambiguous History'), async () => {
    expect(false).toBe(true); // fail — the sibling identity fails
  });
});

// ── D. Same leaf title, SAME file, THREE describe blocks. 3-way collision. ──
const THREE_WAY_TITLE = 'renders the row correctly';

test.describe('Table View', { tag: '@chromium' }, () => {
  test(THREE_WAY_TITLE, AN('Ambiguous History 3-Way'), async () => {
    expect([1, 2, 3]).toHaveLength(3); // pass
  });
});

test.describe('Grid View', { tag: '@chromium' }, () => {
  test(THREE_WAY_TITLE, AN('Ambiguous History 3-Way'), async () => {
    expect('grid').toContain('grid'); // pass
  });
});

test.describe('List View', { tag: '@chromium' }, () => {
  test(THREE_WAY_TITLE, AN('Ambiguous History 3-Way'), async () => {
    expect(0).toBeGreaterThan(1); // fail
  });
});
