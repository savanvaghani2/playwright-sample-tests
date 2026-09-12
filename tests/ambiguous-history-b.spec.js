// @ts-check
import { test, expect } from './support/test.js';

/**
 * Case B, file #2 — the same leaf title as ambiguous-history.spec.js's
 * "History Cross File One", but in a DIFFERENT file. The two form a
 * same-title / different-file collision that suite_file_path disambiguates
 * (unlike the same-file case in ambiguous-history.spec.js, which needs
 * pw_test_id / title_path_hash).
 */

const CROSS_FILE_TITLE = 'shared title across files';

test.describe('History Cross File Two', { tag: '@chromium' }, () => {
  test(
    CROSS_FILE_TITLE,
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'History Edge' },
        { type: 'testdino:owner', description: 'qa-team' },
      ],
    },
    async () => {
      expect(true).toBe(false); // fail — the different-file sibling fails
    },
  );
});
