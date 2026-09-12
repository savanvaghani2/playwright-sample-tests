// @ts-check
import { test, expect } from './support/test.js';

/**
 * Intentionally passing tests for TestDino dashboard demos (10 cases).
 * Tagged @chromium — always pass on the first attempt.
 */
test.describe('Passed Test Suite', { tag: '@chromium' }, () => {
  test(
    'Passed: homepage loads successfully',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p0' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Verifies demo store homepage loads' },
      ],
    },
    async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/storedemo\.testdino\.com/);
    },
  );

  test(
    'Passed: page title is present',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Verifies page has a non-empty title' },
      ],
    },
    async ({ page }) => {
      await page.goto('/');
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    },
  );

  test(
    'Passed: example.com returns 200',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'External page navigation smoke check' },
      ],
    },
    async ({ page }) => {
      const response = await page.goto('https://example.com');
      expect(response?.status()).toBe(200);
    },
  );

  test(
    'Passed: example.com title matches',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Title assertion on example.com' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle(/Example Domain/);
    },
  );

  test(
    'Passed: body element is visible',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Basic DOM visibility check' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page.locator('body')).toBeVisible();
    },
  );

  test(
    'Passed: arithmetic assertion',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p3' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        {
          type: 'testdino:context',
          description: 'Pure logic assertion with no browser dependency',
        },
      ],
    },
    async () => {
      expect(2 + 2).toBe(4);
    },
  );

  test(
    'Passed: string contains check',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p3' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'String matching assertion' },
      ],
    },
    async () => {
      expect('TestDino Playwright Reporter').toContain('TestDino');
    },
  );

  test(
    'Passed: array length check',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p3' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Collection length assertion' },
      ],
    },
    async () => {
      expect(['chromium', 'firefox', 'webkit']).toHaveLength(3);
    },
  );

  test(
    'Passed: playwright.dev loads',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Playwright docs homepage smoke check' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      await expect(page).toHaveTitle(/Playwright/);
    },
  );

  test(
    'Passed: navigation link exists',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Passed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        {
          type: 'testdino:context',
          description: 'Verifies nav element is present on Playwright docs',
        },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      await expect(page.locator('nav').first()).toBeVisible();
    },
  );
});
