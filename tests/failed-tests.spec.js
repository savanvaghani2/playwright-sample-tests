// @ts-check
import { test, expect } from './support/test.js';

/**
 * Intentionally failing tests for TestDino dashboard demos (10 cases).
 * Tagged @chromium — always fail, even on retry. Do not "fix" unless asked.
 */
test.describe('Failed Test Suite', { tag: '@chromium' }, () => {
  test(
    'Failed: incorrect page title assertion',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p0' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Title does not match expected value' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle('Wrong Title');
    },
  );

  test(
    'Failed: element not found',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Locator does not exist on page' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page.getByRole('button', { name: 'Nonexistent Button' })).toBeVisible();
    },
  );

  test(
    'Failed: arithmetic mismatch',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Intentional logic assertion failure' },
      ],
    },
    async () => {
      expect(2 + 2).toBe(5);
    },
  );

  test(
    'Failed: URL mismatch',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Page URL does not match expected path' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page).toHaveURL(/nonexistent-path/);
    },
  );

  test(
    'Failed: text content mismatch',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Expected text not found in page body' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page.locator('body')).toContainText('This text does not exist');
    },
  );

  test(
    'Failed: hidden element visibility',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Hidden element expected to be visible' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await page.evaluate(() => {
        const el = document.createElement('div');
        el.id = 'hidden-el';
        el.style.display = 'none';
        el.textContent = 'hidden';
        document.body.appendChild(el);
      });
      await expect(page.locator('#hidden-el')).toBeVisible();
    },
  );

  test(
    'Failed: response status check',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: '404 page expected to return 200' },
      ],
    },
    async ({ page }) => {
      const response = await page.goto('https://example.com/nonexistent-page-404');
      expect(response?.status()).toBe(200);
    },
  );

  test(
    'Failed: array length mismatch',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p3' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Collection length assertion failure' },
      ],
    },
    async () => {
      expect(['a', 'b']).toHaveLength(5);
    },
  );

  test(
    'Failed: checkbox not checked',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Unchecked checkbox expected to be checked' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://example.com');
      await page.setContent('<input type="checkbox" id="cb" />');
      await expect(page.locator('#cb')).toBeChecked();
    },
  );

  test(
    'Failed: thrown error',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Failed Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Explicit thrown error for dashboard demo' },
      ],
    },
    async () => {
      throw new Error('Intentional failure for dashboard demo');
    },
  );
});
