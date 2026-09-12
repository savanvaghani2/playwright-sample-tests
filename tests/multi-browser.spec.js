// @ts-check
import { test, expect } from './support/test.js';

/**
 * Multi-browser smoke suite (10 cases × 5 browsers).
 * Each test carries all five browser tags so Playwright projects pick them up:
 * chromium, firefox, webkit, android, ios.
 */
const BROWSER_TAGS = ['@chromium', '@firefox', '@webkit', '@android', '@ios'];

const annotate = (priority, context) => ({
  tag: BROWSER_TAGS,
  annotation: [
    { type: 'testdino:priority', description: priority },
    { type: 'testdino:feature', description: 'Multi Browser' },
    { type: 'testdino:owner', description: 'qa-team' },
    { type: 'testdino:context', description: context },
  ],
});

test.describe('Multi Browser Suite', { tag: BROWSER_TAGS }, () => {
  test(
    'Multi-browser 1: demo store homepage loads',
    annotate('p0', 'Homepage loads on every browser project'),
    async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/storedemo\.testdino\.com/);
    },
  );

  test(
    'Multi-browser 2: page title is present',
    annotate('p1', 'Non-empty document title across browsers'),
    async ({ page }) => {
      await page.goto('/');
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    },
  );

  test(
    'Multi-browser 3: example.com returns 200',
    annotate('p2', 'External navigation smoke check'),
    async ({ page }) => {
      const response = await page.goto('https://example.com');
      expect(response?.status()).toBe(200);
    },
  );

  test(
    'Multi-browser 4: example.com title matches',
    annotate('p2', 'Title assertion on example.com'),
    async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle(/Example Domain/);
    },
  );

  test(
    'Multi-browser 5: body element is visible',
    annotate('p2', 'Basic DOM visibility check'),
    async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page.locator('body')).toBeVisible();
    },
  );

  test(
    'Multi-browser 6: arithmetic assertion',
    annotate('p3', 'Pure logic assertion shared across browser projects'),
    async () => {
      expect(2 + 2).toBe(4);
    },
  );

  test(
    'Multi-browser 7: string contains check',
    annotate('p3', 'String matching assertion'),
    async () => {
      expect('TestDino Playwright Reporter').toContain('TestDino');
    },
  );

  test(
    'Multi-browser 8: browser tag list length',
    annotate('p3', 'Confirms five browser tags are defined'),
    async () => {
      expect(BROWSER_TAGS).toHaveLength(5);
    },
  );

  test(
    'Multi-browser 9: playwright.dev loads',
    annotate('p2', 'Playwright docs homepage smoke check'),
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      await expect(page).toHaveTitle(/Playwright/);
    },
  );

  test(
    'Multi-browser 10: navigation link exists',
    annotate('p2', 'Nav element present on Playwright docs'),
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      await expect(page.locator('nav').first()).toBeVisible();
    },
  );
});
