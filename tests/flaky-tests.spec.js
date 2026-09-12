// @ts-check
import { test, expect } from './support/test.js';

/**
 * Intentionally flaky tests for TestDino dashboard demos (10 cases).
 * Tagged @chromium — do not "fix" their flakiness unless explicitly asked.
 *
 * Playwright reports a test as "flaky" only when it FAILS on the first
 * attempt and PASSES on a retry. To make that deterministic for the
 * dashboard, each test fails on attempt 0 and passes on subsequent
 * retries (requires retries >= 1; configured in playwright.config.js).
 */
test.describe('Flaky Test Suite', { tag: '@chromium' }, () => {
  test(
    'Flaky: race condition on link click',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Click before element is ready' },
        { type: 'testdino:flaky-reason', description: 'Element not interactive on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      if (test.info().retry === 0) throw new Error('Click failed: element not ready');
      await expect(page).toHaveTitle(/Playwright/);
    },
  );

  test(
    'Flaky: network instability simulation',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Slow network during navigation' },
        { type: 'testdino:flaky-reason', description: 'Network timed out on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      if (test.info().retry === 0) throw new Error('Navigation failed: network too slow');
      await expect(page).toHaveTitle(/Playwright/);
    },
  );

  test(
    'Flaky: element visibility race',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Nav checked before paint completes' },
        { type: 'testdino:flaky-reason', description: 'Element not visible on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      if (test.info().retry === 0) throw new Error('Element not visible in time');
      await expect(page.locator('nav').first()).toBeVisible();
    },
  );

  test(
    'Flaky: async operation timing',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Async work may exceed fixed timeout' },
        { type: 'testdino:flaky-reason', description: 'Operation timed out on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      if (test.info().retry === 0) throw new Error('Operation timed out');
      await expect(page).toHaveTitle(/Example/);
    },
  );

  test(
    'Flaky: animation transition timing',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Click during possible animation' },
        { type: 'testdino:flaky-reason', description: 'Element still animating on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      if (test.info().retry === 0) throw new Error('Click failed: element animating');
      await expect(page.getByRole('link', { name: 'Get started' }).first()).toBeVisible();
    },
  );

  test(
    'Flaky: state-dependent behavior',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Depends on transient external state' },
        { type: 'testdino:flaky-reason', description: 'State not ready on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      if (test.info().retry === 0) throw new Error('Unexpected state on first attempt');
      expect(true).toBe(true);
    },
  );

  test(
    'Flaky: resource loading race',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Resource checked before navigation finishes' },
        { type: 'testdino:flaky-reason', description: 'Resource not loaded on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      if (test.info().retry === 0) throw new Error('Image not loaded yet');
      await expect(page.locator('img').first()).toBeVisible();
    },
  );

  test(
    'Flaky: scroll position race',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Footer viewport check before scroll settles' },
        { type: 'testdino:flaky-reason', description: 'Scroll not settled on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      if (test.info().retry === 0) throw new Error('Footer not in viewport yet');
      await expect(page.locator('footer').first()).toBeInViewport();
    },
  );

  test(
    'Flaky: localStorage race condition',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Read localStorage before async write completes' },
        { type: 'testdino:flaky-reason', description: 'Value not written on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await page.evaluate(() => localStorage.setItem('testKey', 'testValue'));
      if (test.info().retry === 0) throw new Error('localStorage race condition');
      const value = await page.evaluate(() => localStorage.getItem('testKey'));
      expect(value).toBe('testValue');
    },
  );

  test(
    'Flaky: concurrent user actions',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Flaky Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Parallel mouse, keyboard, and scroll actions' },
        { type: 'testdino:flaky-reason', description: 'Actions interfered on first attempt' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://playwright.dev/');
      await Promise.all([
        page.mouse.move(100, 100),
        page.keyboard.press('Tab'),
        page.evaluate(() => window.scrollBy(0, 100)),
      ]);
      if (test.info().retry === 0) throw new Error('Concurrent actions interfered');
      await expect(page).toHaveTitle(/Playwright/);
    },
  );
});
