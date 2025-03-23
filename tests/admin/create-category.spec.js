import { test, expect } from '@playwright/test';
import { ADMIN_USER, DUMMY_CATEGORY, DUPLICATE_DUMMY_CATEGORY, UPDATED_DUMMY_PRODUCT } from './dummyData';

test('Creating a new category', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Login as admin user
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(ADMIN_USER.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(ADMIN_USER.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to Create Category
    await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();
    // assert categories elements are present
    await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter new category' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    // success
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill(DUMMY_CATEGORY.name);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(`${DUMMY_CATEGORY.name} is created`)).toBeVisible();
    await expect(page.getByRole('cell', { name: DUMMY_CATEGORY.name })).toBeVisible();
});

test('Creating a new category with empty string', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Login as admin user
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(ADMIN_USER.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(ADMIN_USER.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to Create Category
    await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();
    // assert categories elements are present
    await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter new category' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    const newCategoryname = '     ';
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter new category' }).fill(newCategoryname);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Category name cannot be empty or contain only whitespace')).toBeVisible();
    await expect(page.locator('tbody')).toContainText(newCategoryname);
});

test('should fail when trying to create a duplicate category', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Login as admin user
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(ADMIN_USER.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(ADMIN_USER.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to Create Category
    await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();
    // assert categories elements are present
    await expect(page.getByRole('heading', { name: 'Manage Category' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter new category' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    // create a new category
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter new category' }).fill(DUPLICATE_DUMMY_CATEGORY.name);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(`${DUPLICATE_DUMMY_CATEGORY.name} is created`)).toBeVisible();
    await expect(page.getByRole('cell', { name: DUPLICATE_DUMMY_CATEGORY.name })).toBeVisible();

    // create a similar category -> should fail
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter new category' }).fill(DUPLICATE_DUMMY_CATEGORY.name);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Category Already Exists')).toBeVisible();
});