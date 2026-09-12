// @ts-check
import { test } from './support/test.js';
import AllPages from '../pages/AllPages.js';

let allPages;

test.beforeEach(async ({ page }) => {
  allPages = new AllPages(page);
  await page.goto('/');
});

test.describe('Cart Module', () => {
  test.describe('Product Removal', () => {
    test(
      'User can delete a selected product from the cart',
      {
        tag: '@ios',
        annotation: [
          { type: 'testdino:priority', description: 'p1' },
          { type: 'testdino:feature', description: 'Cart' },
          { type: 'testdino:link', description: 'https://jira.example.com/CART-001' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          {
            type: 'testdino:context',
            description: 'Tests cart product removal functionality on iOS devices',
          },
        ],
      },
      async () => {
        const productName = 'GoPro HERO10 Black';
        await allPages.inventoryPage.clickOnAllProductsLink();
        await allPages.inventoryPage.searchProduct(productName);
        await allPages.inventoryPage.verifyProductTitleVisible(productName);
        await allPages.inventoryPage.clickOnAddToCartIcon();

        await allPages.cartPage.clickOnCartIcon();
        await allPages.cartPage.verifyCartItemVisible(productName);
        await allPages.cartPage.clickOnDeleteProductIcon();
        await allPages.cartPage.verifyCartItemDeleted(productName);
      },
    );
  });
});
