// @ts-check
import { test, expect } from './support/test.js';

/**
 * Intentionally skipped tests for TestDino dashboard demos (10 cases).
 * Tagged @chromium — do not un-skip unless explicitly asked.
 */
test.describe('Skipped Test Suite', { tag: '@chromium' }, () => {
  test.skip(
    'Skipped: social login with Google',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'OAuth flow not configured in demo store' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/products');
      await page.getByRole('button', { name: 'Sign in with Google' }).click();
    },
  );

  test.skip(
    'Skipped: Apple Pay checkout',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Apple Pay sandbox credentials unavailable' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/products');
      await page.getByRole('button', { name: 'Apple Pay' }).click();
    },
  );

  test.skip(
    'Skipped: multi-currency price display',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p3' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Currency switcher not deployed to staging' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/products');
      await page.getByRole('combobox', { name: 'Currency' }).selectOption('EUR');
      await expect(page.locator('[data-testid="price"]')).toContainText('€');
    },
  );

  test.skip(
    'Skipped: guest order tracking',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Guest tracking page behind feature flag' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/track-order');
      await page.getByPlaceholder('Order ID').fill('ORD-12345');
      await page.getByRole('button', { name: 'Track' }).click();
    },
  );

  test.skip(
    'Skipped: product comparison tool',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p3' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Compare feature in development' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/products');
      await page.getByRole('checkbox', { name: 'Compare' }).first().check();
      await page.getByRole('link', { name: 'Compare selected' }).click();
    },
  );

  test.skip(
    'Skipped: bulk cart import via CSV',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p3' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'CSV import endpoint not live' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/cart');
      await page.getByRole('button', { name: 'Import CSV' }).click();
    },
  );

  test.skip(
    'Skipped: two-factor authentication setup',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: '2FA blocked by AUTH-401' },
        { type: 'testdino:link', description: 'https://jira.example.com/AUTH-401' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/settings/security');
      await page.getByRole('button', { name: 'Enable 2FA' }).click();
    },
  );

  test.skip(
    'Skipped: subscription renewal reminder',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Email service mock not wired in demo env' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/subscriptions');
      await page.getByRole('button', { name: 'Send reminder' }).click();
    },
  );

  test.skip(
    'Skipped: inventory low-stock alert',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Alert webhook not configured' },
      ],
    },
    async ({ page }) => {
      await page.goto('https://storedemo.testdino.com/admin/inventory');
      await expect(page.getByText('Low stock alert sent')).toBeVisible();
    },
  );

  test.skip(
    'Skipped: dark mode persistence across sessions',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p3' },
        { type: 'testdino:feature', description: 'Skipped Demos' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Theme preference API pending release' },
      ],
    },
    async ({ page, context }) => {
      await page.goto('https://storedemo.testdino.com/products');
      await page.getByRole('button', { name: 'Dark mode' }).click();
      await context.clearCookies();
      await page.reload();
      await expect(page.locator('html')).toHaveClass(/dark/);
    },
  );
});
