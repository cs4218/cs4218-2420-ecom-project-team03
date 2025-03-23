import { test, expect } from '@playwright/test';

const userCredentials = {
  name: "Test User",
  email: "user@example.com",
  password: "Password123",
  phone: "89991234",
  address: "Test Address",
  role: 0,
};

const adminCredentials = {
    name: "Admin User",
    email: "admin@example.com",
    password: "Password123",
    phone: "123-456-7890",
    address: "Test Address",
    role: 1,
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

  await page.route('**/api/v1/auth/user-auth', (route) => {
    route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
              ok: true,
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
};

const loginAdmin = async (page) => {
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
                success: true,
                user: adminCredentials,
                message: 'Login successful',
                token: "mockToken",
              },
            ),
      });
    });
  
    await page.route('**/api/v1/auth/admin-auth', (route) => {
      route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
                ok: true,
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
  
    // Login as an admin
    await page.goto('localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('testuser@example.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('Password');
    await page.getByRole('button', { name: 'LOGIN' }).click();
};

test.describe('Test for Admin users', () => {
  // Mock API responses if necessary
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.getByRole('button', { name: 'ADMIN USER' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForURL("**/dashboard/admin");
  });

  test('should display admin dashboard for an admin user', async ({ page }) => {
      await expect(page.getByText('Admin Name : Admin User')).toBeVisible();
      await expect(page.getByText('Admin Email : admin@example.com')).toBeVisible();
      await expect(page.getByText('Admin Contact : 123-456-7890')).toBeVisible();
  });

  test('should navigate to create category page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Category' }).click();
    await expect(page.getByText('Manage Category')).toBeVisible();
  });

  test('should navigate to create product page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Product' }).click();
    await expect(page.getByTestId('create-product-header')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page.getByText('All Products List')).toBeVisible();
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page.getByText('All Orders')).toBeVisible();
  });
});

test('should display user dashboard for a non-admin user', async ({ page }) => {
  await loginUser(page);
  await page.getByRole('button', { name: 'TEST USER' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.waitForURL("**/dashboard/user");
  await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible();
  await expect(page.getByText('user@example.com')).toBeVisible();
  await expect(page.getByText('Test Address')).toBeVisible();
});