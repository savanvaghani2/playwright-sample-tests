// @ts-check
import { test } from './support/test.js';
import AllPages from '../pages/AllPages.js';

let allPages;

test.beforeEach(async ({ page }) => {
  allPages = new AllPages(page);
  await page.goto('/');
});

async function login(username = process.env.USERNAME, password = process.env.PASSWORD) {
  await allPages.loginPage.clickOnUserProfileIcon();
  await allPages.loginPage.validateSignInPage();
  await allPages.loginPage.login(username, password);
}

async function logout() {
  await allPages.loginPage.clickOnUserProfileIcon();
  await allPages.loginPage.clickOnLogoutButton();
}

test.describe('Authentication', () => {
  test.describe('Login & Logout', () => {
    test(
      'User can login and logout successfully',
      {
        tag: '@chromium',
        annotation: [
          { type: 'testdino:priority', description: 'p0' },
          { type: 'testdino:feature', description: 'Authentication' },
          { type: 'testdino:link', description: 'https://jira.example.com/AUTH-002' },
          { type: 'testdino:owner', description: '@Kriti Verma' },
          { type: 'testdino:notify-slack', description: '@Kriti Verma' },
          { type: 'testdino:context', description: 'Critical login and logout functionality' },
        ],
      },
      async () => {
        await login();
        await logout();
      },
    );
  });
});
