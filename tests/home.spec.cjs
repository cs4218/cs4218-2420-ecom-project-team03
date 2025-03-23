import { test, expect } from '@playwright/test';

test('load all products and categories', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('main')).toContainText('Clothing');
  await expect(page.getByRole('main')).toContainText('Book');
  await expect(page.getByRole('main')).toContainText('Electronics');
  await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
  await expect(page.getByRole('main')).toContainText('Novel');
  await expect(page.getByRole('main')).toContainText('NUS T-shirt');
  await expect(page.getByRole('main')).toContainText('Smartphone');
  await expect(page.getByRole('main')).toContainText('Laptop');
  await expect(page.getByRole('main')).toContainText('Textbook');
  const cards = page.locator('.card');
  await expect(cards).toHaveCount(6);
});

test('No categories + 0-19.99', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByText('$0 to 19.99').click();
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(2);
    await expect(page.locator('div').filter({ hasText: /^Novel\$14\.99A bestselling novel\.\.\.More DetailsADD TO CART$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirt\$4\.99Plain NUS T-shirt for sale\.\.\.More DetailsADD TO CART$/ }).first()).toBeVisible();
});

test('Clothing + 20-39.99', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await page.getByText('$20 to 39.99').click();
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(0);
});

test('Clothing, Book + 40-59.99', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await page.getByText('$40 to 59.99').click();
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(1);
    await expect(page.getByRole('main').locator('div').filter({ hasText: 'The Law of Contract in Singapore$54.99A bestselling book in Singapore...More' }).nth(3)).toBeVisible();
});

test('Book, Electronics + 60-79.99', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.getByText('$60 to 79.99').click();
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(1);
    await expect(page.locator('div').filter({ hasText: /^Textbook\$79\.99A comprehensive textbook\.\.\.More DetailsADD TO CART$/ }).nth(1)).toBeVisible();
});

test('Clothing, Electronics + 80-99.99', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.getByRole('main').getByText('Clothing').click
    await page.getByText('$80 to 99.99').click();
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(0);
});

test('Clothing, Book, Electronics + 100 or more', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.getByText('$100 or more').click();
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(2);
    await expect(page.locator('div').filter({ hasText: /^Smartphone\$999\.99A high-end smartphone\.\.\.More DetailsADD TO CART$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Laptop\$1,499\.99A powerful laptop\.\.\.More DetailsADD TO CART$/ }).first()).toBeVisible();
});

test('Clothing, Book + none', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await page.getByRole('checkbox', { name: 'Book' }).check();
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(4);
    await expect(page.locator('div').filter({ hasText: /^Novel\$14\.99A bestselling novel\.\.\.More DetailsADD TO CART$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Textbook\$79\.99A comprehensive textbook\.\.\.More DetailsADD TO CART$/ }).first()).toBeVisible();
    await expect(page.getByRole('main').locator('div').filter({ hasText: 'The Law of Contract in Singapore$54.99A bestselling book in Singapore...More' }).nth(3)).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^NUS T-shirt\$4\.99Plain NUS T-shirt for sale\.\.\.More DetailsADD TO CART$/ }).first()).toBeVisible();
});