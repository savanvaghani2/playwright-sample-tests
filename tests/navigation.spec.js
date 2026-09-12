// @ts-check
import { expect, test } from './support/test.js';
import AllPages from '../pages/AllPages.js';

let allPages;

test.beforeEach(async ({ page }) => {
  allPages = new AllPages(page);
  await page.goto('/');
});

test.describe('Navigation Module', () => {
  test.describe('Navbar Validation', () => {
    test(
      'All navbar links navigate correctly',
      {
        tag: '@firefox',
        annotation: [
          { type: 'testdino:priority', description: 'p1' },
          { type: 'testdino:feature', description: 'Navigation' },
          { type: 'testdino:link', description: 'https://jira.example.com/NAV-001' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          {
            type: 'testdino:context',
            description: 'Navigation bar functionality across all pages',
          },
        ],
      },
      async () => {
        await allPages.homePage.clickBackToHomeButton();
        await allPages.homePage.clickAllProductsNav();
        await allPages.allProductsPage.assertAllProductsTitle();
        await allPages.homePage.clickOnContactUsLink();
        await allPages.contactUsPage.assertContactUsTitle();

        await allPages.homePage.clickAboutUsNav();
        await allPages.homePage.assertAboutUsTitle();
      },
    );
  });
});

test.describe('Contact Us Module', () => {
  test.describe('Contact Form Submission', () => {
    test(
      'User can submit the contact form',
      {
        tag: '@firefox',
        annotation: [
          { type: 'testdino:priority', description: 'p2' },
          { type: 'testdino:feature', description: 'Contact Us' },
          { type: 'testdino:link', description: 'https://jira.example.com/CONTACT-001' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          { type: 'testdino:context', description: 'Contact form submission and validation' },
        ],
      },
      async () => {
        await allPages.homePage.clickOnContactUsLink();
        await allPages.contactUsPage.assertContactUsTitle();
        await allPages.contactUsPage.fillContactUsForm();
        await allPages.contactUsPage.verifySuccessContactUsFormSubmission();
      },
    );
  });
});

test.describe('User Settings', () => {
  test.describe('Change Password Flow', () => {
    test(
      'User can change password successfully',
      {
        tag: '@ios',
        annotation: [
          { type: 'testdino:priority', description: 'p1' },
          { type: 'testdino:feature', description: 'User Settings' },
          { type: 'testdino:link', description: 'https://jira.example.com/SETTINGS-001' },
          { type: 'testdino:owner', description: '@Kriti Verma' },
          { type: 'testdino:notify-slack', description: '@Kriti Verma' },
          {
            type: 'testdino:context',
            description: 'Password change functionality with revert capability',
          },
          {
            type: 'testdino:flaky-reason',
            description: 'Password update may take time depending on server response',
          },
        ],
      },
      async () => {
        await test.step('Change password and verify notification', async () => {
          await allPages.userPage.clickOnUserProfileIcon();
          await allPages.userPage.clickOnSecurityButton();
          await allPages.userPage.enterNewPassword();
          await allPages.userPage.enterConfirmNewPassword();
          await allPages.userPage.clickOnUpdatePasswordButton();
          await allPages.userPage.getUpdatePasswordNotification();
        });

        await test.step('Revert back to original password', async () => {
          await allPages.userPage.clickOnUserProfileIcon();
          await allPages.userPage.clickOnSecurityButton();
          await allPages.userPage.revertPasswordBackToOriginal();
          await allPages.userPage.getUpdatePasswordNotification();
        });
      },
    );
  });
});
