// @ts-check
import { expect, test } from './support/test.js';

/**
 * Coverage demo tests against the local Istanbul-instrumented Vite app.
 * Run profiles with: npm run test:coverage:low|mid|high
 */
test.describe('Coverage Low Profile', { tag: ['@coverage', '@coverage-low'] }, () => {
  test(
    'loads the demo app without exercising interactions',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p2' },
        { type: 'testdino:feature', description: 'Code Coverage' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Baseline load only — lower coverage profile' },
      ],
    },
    async ({ page }) => {
      await page.goto('/');

      await expect(page.getByTestId('coverage-title')).toHaveText('TestDino Coverage Demo');
      await expect(page.getByTestId('greeting')).toHaveText('Hello, TestDino');
      await expect(page.getByTestId('sum')).toHaveText('0');
    },
  );
});

test.describe('Coverage Mid Profile', { tag: ['@coverage', '@coverage-mid'] }, () => {
  test(
    'increments counter and checks positive status',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Code Coverage' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Partial UI flow — medium coverage profile' },
      ],
    },
    async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('increment-btn').click();
      await expect(page.getByTestId('sum')).toHaveText('1');
      await expect(page.getByTestId('status')).toHaveText('Counter is positive: 1');

      await page.getByTestId('greet-btn').click();
      await expect(page.getByTestId('greeting')).toHaveText('Hello, Coverage');
    },
  );
});

test.describe('Coverage High Profile', { tag: ['@coverage', '@coverage-high'] }, () => {
  test(
    'runs full counter flow and utility branches',
    {
      annotation: [
        { type: 'testdino:priority', description: 'p0' },
        { type: 'testdino:feature', description: 'Code Coverage' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:context', description: 'Full flow plus utility branches — high coverage profile' },
      ],
    },
    async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('increment-btn').click();
      await page.getByTestId('greet-btn').click();
      await expect(page.getByTestId('status')).toHaveText('Sum preview: 11');

      await page.getByTestId('reset-btn').click();
      await expect(page.getByTestId('sum')).toHaveText('0');
      await expect(page.getByTestId('status')).toHaveText('Counter is zero');

      const utilityResults = await page.evaluate(async () => {
        const module = await import('/src/utils.js');
        return {
          emptyGreeting: module.greet(''),
          price: module.formatPrice(19.5),
          freePrice: module.formatPrice(0),
          invalidPrice: module.formatPrice(-1),
          validEmail: module.validateEmail('qa@testdino.com'),
          invalidEmail: module.validateEmail('invalid'),
          goldDiscount: module.calculateDiscount(100, 'gold'),
          silverDiscount: module.calculateDiscount(100, 'silver'),
          noDiscount: module.calculateDiscount(100, 'none'),
        };
      });

      expect(utilityResults.emptyGreeting).toBe('Hello');
      expect(utilityResults.price).toBe('$19.50');
      expect(utilityResults.freePrice).toBe('Free');
      expect(utilityResults.invalidPrice).toBe('Invalid');
      expect(utilityResults.validEmail).toBe(true);
      expect(utilityResults.invalidEmail).toBe(false);
      expect(utilityResults.goldDiscount).toBe(80);
      expect(utilityResults.silverDiscount).toBe(90);
      expect(utilityResults.noDiscount).toBe(100);
    },
  );
});
