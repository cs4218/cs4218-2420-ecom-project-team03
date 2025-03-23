import { test, expect } from '@playwright/test';

const userCredentials = {
  name: "Test User",
  email: "user@example.com",
  password: "Password123",
  phone: "89991234",
  address: "Test Address",
  role: 0,
};

const loginUser = async (page) => {
  await page.route('**/api/v1/auth/login', (route) => {
    route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
              success: true,
              user: userCredentials,
              message: 'Login successful',
              token: "mockToken",
            },
          ),
    });
  });

  await page.route('**/api/v1/category/get-category', (route) => {
      route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
              { _id: "1", name: "first-category", slug: "first-category" },
              { _id: "2", name: "second-category", slug: "second-category" },
            ]),
      });
  });

  // Login as a user
  await page.goto('localhost:3000/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('testuser@example.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('Password');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.goto('localhost:3000/cart');
};

const addItemToCart = async (page) => {
  await page.goto('localhost:3000');
  
    // Fill the search input and submit the form
    await page.fill('input[placeholder="Search"]', 'test');
    await page.click('button[type="submit"]');
  
    // Wait for the search results to be displayed
    await expect(page.getByRole('heading', { name: 'Found 2' })).toBeVisible();
  
    // Verify the search results
    await expect(page.locator('h5:has-text("Test Product")')).toBeVisible();
    await expect(page.locator('h5:has-text("Another Product")')).toBeVisible();
    await expect(page.getByText('$ 10.99')).toBeVisible();
    await expect(page.getByText('$ 19.99')).toBeVisible();

    // Click Add to Cart button
    await page.click('button:has-text("Add To Cart")');
    await expect(page.getByText('Item added to cart')).toBeVisible();
};

const enterCreditCardDetails = async (page) => {
  await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole("textbox", { name: "Credit Card Number" }).fill(TEST_CARD_NUMBER);
  await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole("textbox", { name: "Expiration Date" }).fill(TEST_CARD_EXPIRY_DATE);
  await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole("textbox", { name: "CVV" }).fill(TEST_CARD_CVV);
};

// Mock API responses if necessary
test.beforeEach(async ({ page }) => {
  // Mock the search API response
  await page.route('**/api/v1/product/search/*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          name: 'Test Product',
          description: 'This is a test product',
          price: 10.99,
        },
        {
          _id: '2',
          name: 'Another Product',
          description: 'This is another test product',
          price: 19.99,
        },
      ]),
    });
  });

  await page.route('**/api/v1/product/braintree/token', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ clientToken: 'mock-client-token' }),
    });
  });

  await page.route('**/api/v1/product/braintree/payment', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Payment successful' }),
    });
  });
});

test('should display cart with no items', async ({ page }) => {
  await page.goto('localhost:3000/cart');
  await expect(page.getByText('Your Cart Is Empty')).toBeVisible();
});

test('should remove product from cart', async ({ page }) => {
    await page.goto('localhost:3000');
  
    // Fill the search input and submit the form
    await page.fill('input[placeholder="Search"]', 'test');
    await page.click('button[type="submit"]');
  
    // Wait for the search results to be displayed
    await expect(page.getByRole('heading', { name: 'Found 2' })).toBeVisible();
  
    // Verify the search results
    await expect(page.locator('h5:has-text("Test Product")')).toBeVisible();
    await expect(page.locator('h5:has-text("Another Product")')).toBeVisible();
    await expect(page.getByText('$ 10.99')).toBeVisible();
    await expect(page.getByText('$ 19.99')).toBeVisible();

    // Click Add to Cart button
    await page.click('button:has-text("Add To Cart")');
    await expect(page.getByText('Item added to cart')).toBeVisible();

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('Cart Summary')).toBeVisible();
    await expect(page.getByText('Total : $10.99')).toBeVisible();

    await page.click('button:has-text("Remove")');
    await expect(page.getByText('Test Product')).not.toBeVisible();
    await expect(page.getByText('Your Cart Is Empty')).toBeVisible();
});

test('should calculate total price correctly', async ({ page }) => {
    await page.goto('localhost:3000');
  
    // Fill the search input and submit the form
    await page.fill('input[placeholder="Search"]', 'test');
    await page.click('button[type="submit"]');
  
    // Wait for the search results to be displayed
    await expect(page.getByRole('heading', { name: 'Found 2' })).toBeVisible();
  
    // Verify the search results
    await expect(page.locator('h5:has-text("Test Product")')).toBeVisible();
    await expect(page.locator('h5:has-text("Another Product")')).toBeVisible();
    await expect(page.getByText('$ 10.99')).toBeVisible();
    await expect(page.getByText('$ 19.99')).toBeVisible();

    // Click Add to Cart button
    await page.click('button:has-text("Add To Cart")');
    await page.click('button:has-text("Add To Cart")');
    await page.getByRole('link', { name: 'Cart' }).click();

    await expect(page.getByText('Cart Summary')).toBeVisible();
    await expect(page.getByText('Total : $21.98')).toBeVisible();
});

test('should hanlde invalid prices', async ({ page }) => {
  // Mock the search API response
  await page.route('**/api/v1/product/search/*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          name: 'Test Product',
          description: 'This is a test product',
          price: 'invalid price',
        },
        {
          _id: '2',
          name: 'Another Product',
          description: 'This is another test product',
          price: 19.99,
        },
      ]),
    });
  });

  await page.goto('localhost:3000');

  // Fill the search input and submit the form
  await page.fill('input[placeholder="Search"]', 'test');
  await page.click('button[type="submit"]');

  // Wait for the search results to be displayed
  await expect(page.getByRole('heading', { name: 'Found 2' })).toBeVisible();

  // Verify the search results
  await expect(page.locator('h5:has-text("Test Product")')).toBeVisible();
  await expect(page.locator('h5:has-text("Another Product")')).toBeVisible();
  await expect(page.getByText('$ invalid price')).toBeVisible();
  await expect(page.getByText('$ 19.99')).toBeVisible();

  // Click Add to Cart button
  await page.click('button:has-text("Add To Cart")');
  await page.click('button:has-text("Add To Cart")');
  await page.getByRole('link', { name: 'Cart' }).click();

  await expect(page.getByText('Cart Summary')).toBeVisible();
  await expect(page.getByText('Total : Error calculating total price')).toBeVisible();
});

test('should handle unauthenticated user', async ({ page }) => {
  await page.goto('localhost:3000/cart');
  await expect(page.getByText('Hello Guest')).toBeVisible();
  await expect(page.getByText('Please Login to checkout')).toBeVisible();
});

test('should handle authenticated user', async ({ page }) => {
    await loginUser(page);
    await addItemToCart(page);
    await page.goto('localhost:3000/cart');
    await expect(page.getByRole('button', { name: 'Make Payment' })).toBeVisible();
});

test('should handle payment for authenticated user', async ({ page }) => {
  await loginUser(page);
  await addItemToCart(page);
  await page.goto('localhost:3000/cart');
  await expect(page.getByRole('button', { name: 'Make Payment' })).toBeVisible();
});