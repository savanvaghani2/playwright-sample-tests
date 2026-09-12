// @ts-check
import { test, expect } from './support/test.js';

test.describe('Visual Comparison - GitHub Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://github.com/login');

    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          transition: none !important;
          caret-color: transparent !important;
        }
      `,
    });

    await page.waitForLoadState('networkidle');
  });

  test(
    'Username input matches visual baseline for empty and filled states',
    {
      tag: '@chromium',
      annotation: [
        { type: 'testdino:priority', description: 'p1' },
        { type: 'testdino:feature', description: 'Visual Comparison' },
        { type: 'testdino:link', description: 'https://jira.example.com/VISUAL-001' },
        { type: 'testdino:owner', description: 'qa-team' },
        { type: 'testdino:notify-slack', description: '#e2e-alerts' },
        {
          type: 'testdino:context',
          description: 'Visual regression testing for GitHub login form changes',
        },
        {
          type: 'testdino:flaky-reason',
          description: 'Visual comparisons may fail due to rendering differences or timing issues',
        },
      ],
    },
    async ({ page }) => {
      const usernameInput = page.getByRole('textbox', {
        name: 'Username or email address',
      });

      await expect(usernameInput).toHaveScreenshot('username-input-empty.png');

      await usernameInput.fill('test');

      await expect(usernameInput).toHaveScreenshot('username-input-filled.png');
    },
  );
});
