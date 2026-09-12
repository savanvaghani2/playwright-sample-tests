// @ts-check
import { expect, test } from './support/test.js';
import AllPages from '../pages/AllPages.js';

let allPages;

test.beforeEach(async ({ page }) => {
  allPages = new AllPages(page);
  await page.goto('/');
});

test.describe('Address Module', () => {
  test.describe('Add, Edit & Delete Address', () => {
    test(
      'Logged-in user can add, edit, and delete addresses',
      {
        tag: '@ios',
        annotation: [
          { type: 'testdino:priority', description: 'p1' },
          { type: 'testdino:feature', description: 'Address Management' },
          { type: 'testdino:link', description: 'https://jira.example.com/ADDRESS-001' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          {
            type: 'testdino:context',
            description:
              'Complete address management flow including add, edit, and delete operations',
          },
        ],
      },
      async () => {
        await test.step('Verify that user is able to add address successfully', async () => {
          await allPages.userPage.clickOnUserProfileIcon();
          await allPages.userPage.clickOnAddressTab();
          await allPages.userPage.clickOnAddAddressButton();
          await allPages.userPage.fillAddressForm();
          await allPages.userPage.verifytheAddressIsAdded();
        });

        await test.step('Verify that user is able to edit address successfully', async () => {
          await allPages.userPage.clickOnEditAddressButton();
          await allPages.userPage.updateAddressForm();
          await allPages.userPage.verifytheUpdatedAddressIsAdded();
        });

        await test.step('Verify that user is able to delete address successfully', async () => {
          await allPages.userPage.clickOnDeleteAddressButton();
        });
      },
    );
  });

  test.describe('Add Address for New User', () => {
    test(
      'New user can add an address',
      {
        tag: '@android',
        annotation: [
          { type: 'testdino:priority', description: 'p2' },
          { type: 'testdino:feature', description: 'Address Management' },
          { type: 'testdino:link', description: 'https://jira.example.com/ADDRESS-002' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          {
            type: 'testdino:context',
            description: 'New user address addition functionality on Android devices',
          },
        ],
      },
      async () => {
        await allPages.userPage.clickOnUserProfileIcon();
        await allPages.userPage.clickOnAddressTab();
        await allPages.userPage.clickOnAddAddressButton();
        await allPages.userPage.checkAddNewAddressMenu();
        await allPages.userPage.fillAddressForm();
      },
    );
  });
});

test.describe('Order Placement', () => {
  test.describe('Multiple Quantity Purchase', () => {
    test(
      'User can purchase multiple quantities in a single order',
      {
        tag: '@android',
        annotation: [
          { type: 'testdino:priority', description: 'p1' },
          { type: 'testdino:feature', description: 'Order Placement' },
          { type: 'testdino:link', description: 'https://jira.example.com/ORDER-003' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          {
            type: 'testdino:context',
            description: 'Multiple quantity purchase flow on Android devices',
          },
        ],
      },
      async () => {
        const productName = 'GoPro HERO10 Black';

        await allPages.inventoryPage.clickOnShopNowButton();
        await allPages.inventoryPage.clickOnAllProductsLink();
        await allPages.inventoryPage.searchProduct(productName);
        await allPages.inventoryPage.verifyProductTitleVisible(productName);
        await allPages.inventoryPage.clickOnAddToCartIcon();

        await allPages.cartPage.clickOnCartIcon();
        await allPages.cartPage.verifyCartItemVisible(productName);
        await allPages.cartPage.clickIncreaseQuantityButton();
        await allPages.cartPage.verifyIncreasedQuantity('3');
        await allPages.cartPage.clickOnCheckoutButton();
        await allPages.checkoutPage.verifyCheckoutTitle();
        await allPages.checkoutPage.verifyProductInCheckout(productName);
        await allPages.checkoutPage.selectCashOnDelivery();
        await allPages.checkoutPage.verifyCashOnDeliverySelected();
        await allPages.checkoutPage.clickOnPlaceOrder();
        await allPages.checkoutPage.verifyOrderPlacedSuccessfully();
      },
    );
  });
});
