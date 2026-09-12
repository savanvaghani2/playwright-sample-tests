// @ts-check
/**
 * Re-export Playwright test APIs with TestDino coverage fixtures.
 * UI tests must import from here (not @playwright/test) when coverage is enabled.
 */
export { test, expect } from '@testdino/playwright';
