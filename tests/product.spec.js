// @ts-check
import { expect, test } from './support/test.js';
import AllPages from '../pages/AllPages.js';

let allPages;

test.beforeEach(async ({ page }) => {
  allPages = new AllPages(page);
  await page.goto('/');
});

test.describe('Product Reviews', () => {
  test.describe('Submit Review', () => {
    test(
      'User can submit a product review',
      {
        tag: '@firefox',
        annotation: [
          { type: 'testdino:priority', description: 'p2' },
          { type: 'testdino:feature', description: 'Product Reviews' },
          { type: 'testdino:link', description: 'https://jira.example.com/REVIEW-001' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          { type: 'testdino:context', description: 'Product review submission functionality' },
        ],
      },
      async () => {
        await test.step('Navigate to all product section and select a product', async () => {
          await allPages.homePage.clickOnShopNowButton();
          await allPages.allProductsPage.assertAllProductsTitle();
          await allPages.allProductsPage.clickNthProduct(1);
        });

        await test.step('Submit a product review and verify submission', async () => {
          await allPages.productDetailsPage.clickOnReviewsTab();
          await allPages.productDetailsPage.assertReviewsTab();

          await allPages.productDetailsPage.clickOnWriteAReviewBtn();
          await allPages.productDetailsPage.fillReviewForm();
          await allPages.productDetailsPage.assertSubmittedReview({
            name: 'John Doe',
            title: 'Great Product',
            opinion: 'This product exceeded my expectations. Highly recommend!',
          });
        });
      },
    );
  });

  test.describe('Edit & Delete Review', () => {
    test(
      'User can edit and delete a product review',
      {
        tag: '@firefox',
        annotation: [
          { type: 'testdino:priority', description: 'p2' },
          { type: 'testdino:feature', description: 'Product Reviews' },
          { type: 'testdino:link', description: 'https://jira.example.com/REVIEW-002' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          { type: 'testdino:context', description: 'Product review edit and delete functionality' },
        ],
      },
      async () => {
        await test.step('Navigate to all product section and select a product', async () => {
          await allPages.homePage.clickOnShopNowButton();
          await allPages.allProductsPage.assertAllProductsTitle();
          await allPages.allProductsPage.clickNthProduct(1);
        });

        await test.step('Submit a product review and verify submission', async () => {
          await allPages.productDetailsPage.clickOnReviewsTab();
          await allPages.productDetailsPage.assertReviewsTab();

          await allPages.productDetailsPage.clickOnWriteAReviewBtn();
          await allPages.productDetailsPage.fillReviewForm();
          await allPages.productDetailsPage.assertSubmittedReview({
            name: 'John Doe',
            title: 'Great Product',
            opinion: 'This product exceeded my expectations. Highly recommend!',
          });
        });

        await test.step('Edit the submitted review and verify changes', async () => {
          await allPages.productDetailsPage.clickOnEditReviewBtn();
          await allPages.productDetailsPage.updateReviewForm();
          await allPages.productDetailsPage.assertUpdatedReview({
            title: 'Updated Review Title',
            opinion: 'This is an updated review opinion.',
          });
        });

        await test.step('Delete the submitted review and verify deletion', async () => {
          await allPages.productDetailsPage.clickOnDeleteReviewBtn();
        });
      },
    );
  });
});

test.describe('Product Filters', () => {
  test.describe('Price Range Filter', () => {
    test(
      'User can filter products by price range',
      {
        tag: '@webkit',
        annotation: [
          { type: 'testdino:priority', description: 'p2' },
          { type: 'testdino:feature', description: 'Product Filters' },
          { type: 'testdino:link', description: 'https://jira.example.com/FILTER-001' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          {
            type: 'testdino:context',
            description: 'Price range filtering functionality on WebKit browsers',
          },
        ],
      },
      async () => {
        await allPages.homePage.clickOnShopNowButton();
        await allPages.homePage.clickOnFilterButton();
        await allPages.homePage.AdjustPriceRangeSlider('100', '200');
        await allPages.homePage.clickOnFilterButton();
      },
    );
  });
});

test.describe('Wishlist Flow', () => {
  test.describe('Wishlist to Cart Checkout', () => {
    test(
      'User can add wishlist item to cart and checkout',
      {
        tag: '@webkit',
        annotation: [
          { type: 'testdino:priority', description: 'p1' },
          { type: 'testdino:feature', description: 'Wishlist Flow' },
          { type: 'testdino:link', description: 'https://jira.example.com/WISHLIST-001' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          {
            type: 'testdino:context',
            description: 'Complete wishlist to cart checkout flow on WebKit browsers',
          },
        ],
      },
      async () => {
        await test.step('Add product to wishlist and then add to cart', async () => {
          await allPages.homePage.clickOnShopNowButton();
          await allPages.inventoryPage.addToWishlist();
          await allPages.inventoryPage.assertWishlistIcon();
          await allPages.inventoryPage.clickOnWishlistIconHeader();
          await allPages.inventoryPage.assertWishlistPage();
          await allPages.inventoryPage.clickOnWishlistAddToCard();
        });

        await test.step('Checkout product added to cart', async () => {
          await allPages.cartPage.clickOnCartIcon();
          await allPages.cartPage.clickOnCheckoutButton();
          await allPages.checkoutPage.verifyCheckoutTitle();
          await allPages.checkoutPage.selectCashOnDelivery();
          await allPages.checkoutPage.verifyCashOnDeliverySelected();
          await allPages.checkoutPage.clickOnPlaceOrder();
          await allPages.checkoutPage.verifyOrderPlacedSuccessfully();
        });
      },
    );
  });
});

test.describe('Order Placement', () => {
  test.describe('Login to Order Completion', () => {
    test(
      'User can complete order from login to placement',
      {
        tag: '@webkit',
        annotation: [
          { type: 'testdino:priority', description: 'p0' },
          { type: 'testdino:feature', description: 'Order Placement' },
          { type: 'testdino:link', description: 'https://jira.example.com/ORDER-004' },
          { type: 'testdino:owner', description: '@Kriti Verma' },
          { type: 'testdino:notify-slack', description: '@Kriti Verma' },
          {
            type: 'testdino:context',
            description: 'Critical end-to-end order placement flow from login to completion',
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

  test.describe('Place and Cancel Order', () => {
    test(
      'User can place and cancel an order',
      {
        tag: '@webkit',
        annotation: [
          { type: 'testdino:priority', description: 'p0' },
          { type: 'testdino:feature', description: 'Order Placement' },
          { type: 'testdino:link', description: 'https://jira.example.com/ORDER-005' },
          { type: 'testdino:owner', description: '@Kriti Verma' },
          { type: 'testdino:notify-slack', description: '@Kriti Verma' },
          {
            type: 'testdino:context',
            description: 'Critical order placement and cancellation flow',
          },
        ],
      },
      async () => {
        const productName = 'GoPro HERO10 Black';
        const productPriceAndQuantity = '$599.99 × 1';
        const productQuantity = '1';
        const orderStatusProcessing = 'Processing';
        const orderStatusCanceled = 'Canceled';

        await test.step('Add product to cart and checkout', async () => {
          await allPages.inventoryPage.clickOnAllProductsLink();
          await allPages.inventoryPage.searchProduct(productName);
          await allPages.inventoryPage.verifyProductTitleVisible(productName);
          await allPages.inventoryPage.clickOnAddToCartIcon();

          await allPages.cartPage.clickOnCartIcon();
          await allPages.cartPage.verifyCartItemVisible(productName);
          await allPages.cartPage.clickOnCheckoutButton();
        });

        await test.step('Place order and click on continue shopping', async () => {
          await allPages.checkoutPage.verifyCheckoutTitle();
          await allPages.checkoutPage.verifyProductInCheckout(productName);
          await allPages.checkoutPage.selectCashOnDelivery();
          await allPages.checkoutPage.verifyCashOnDeliverySelected();
          await allPages.checkoutPage.clickOnPlaceOrder();
          await allPages.checkoutPage.verifyOrderPlacedSuccessfully();
          await allPages.checkoutPage.verifyOrderItemName(productName);
          await allPages.inventoryPage.clickOnContinueShopping();
        });

        await test.step('Verify order in My Orders', async () => {
          await allPages.loginPage.clickOnUserProfileIcon();
          await allPages.orderPage.clickOnMyOrdersTab();
          await allPages.orderPage.verifyMyOrdersTitle();
          await allPages.orderPage.clickOnPaginationButton(2);
          await allPages.orderPage.verifyProductInOrderList(productName);
          await allPages.orderPage.verifyPriceAndQuantityInOrderList(productPriceAndQuantity);
          await allPages.orderPage.verifyOrderStatusInList(orderStatusProcessing, productName);
          await allPages.orderPage.clickOnPaginationButton(1);
          await allPages.orderPage.clickViewDetailsButton(1);
          await allPages.orderPage.verifyOrderDetailsTitle();
          await allPages.orderPage.verifyOrderSummary(
            productName,
            productQuantity,
            '$599.99',
            orderStatusProcessing,
          );
        });

        await test.step('Cancel order and verify status is updated to Canceled', async () => {
          await allPages.orderPage.clickCancelOrderButton(2);
          await allPages.orderPage.confirmCancellation();
          await allPages.orderPage.verifyCancellationConfirmationMessage();
          await allPages.orderPage.verifyMyOrdersCount();
          await allPages.orderPage.clickOnMyOrdersTab();
          await allPages.orderPage.verifyMyOrdersTitle();
          await allPages.orderPage.clickOnPaginationButton(2);
          await allPages.orderPage.verifyOrderStatusInList(orderStatusCanceled, productName);
        });
      },
    );
  });
});

test.describe('Guest to Login Checkout', () => {
  test.describe('Add to Cart before Login', () => {
    test(
      'Guest can add to cart before login and checkout after login',
      {
        tag: '@webkit',
        annotation: [
          { type: 'testdino:priority', description: 'p1' },
          { type: 'testdino:feature', description: 'Guest to Login Checkout' },
          { type: 'testdino:link', description: 'https://jira.example.com/GUEST-001' },
          { type: 'testdino:owner', description: 'qa-team' },
          { type: 'testdino:notify-slack', description: '#e2e-alerts' },
          {
            type: 'testdino:context',
            description: 'Guest user cart persistence through login and checkout process',
          },
        ],
      },
      async () => {
        await test.step('Navigate and add product to cart before logging in', async () => {
          await allPages.homePage.clickOnShopNowButton();
          await allPages.homePage.clickProductImage();
          await allPages.homePage.clickAddToCartButton();
          await allPages.homePage.validateAddCartNotification();
        });

        await test.step('Complete order', async () => {
          await allPages.cartPage.clickOnCartIcon();
          await allPages.cartPage.clickOnCheckoutButton();
          await allPages.checkoutPage.verifyCheckoutTitle();
          await allPages.checkoutPage.selectCashOnDelivery();
          await allPages.checkoutPage.verifyCashOnDeliverySelected();
          await allPages.checkoutPage.clickOnPlaceOrder();
          await allPages.checkoutPage.verifyOrderPlacedSuccessfully();
        });
      },
    );
  });
});
