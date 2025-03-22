import { test, expect } from '@playwright/test';

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

  // Mock the product photo API response
  await page.route('**/api/v1/product/product-photo/*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'image/jpeg',
      body: Buffer.from('mock-image-data'),
    });
  });
});

test('should display search results correctly', async ({ page }) => {
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
});

test('should display "No Products Found" when no products match the search query', async ({ page }) => {
  // Mock the search API response to return an empty array
  await page.route('**/api/v1/product/search/*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.goto('localhost:3000');

  // Fill the search input and submit the form
  await page.fill('input[placeholder="Search"]', 'nonexistent');
  await page.click('button[type="submit"]');

  // Wait for the "No Products Found" message to be displayed
  await expect(page.getByRole('heading', { name: 'No Products Found' })).toBeVisible();
});

test('should add to cart successfully', async ({ page }) => {
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
});

test('should naviagte to product details page', async ({ page }) => {
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
    await page.click('button:has-text("More Details")');
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
});