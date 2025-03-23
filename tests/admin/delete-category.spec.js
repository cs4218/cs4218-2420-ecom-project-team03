import { test, expect } from '@playwright/test';
import { ADMIN_USER, DUMMY_CATEGORY, DUPLICATE_DUMMY_CATEGORY, UPDATED_DUMMY_CATEGORY } from './dummyData';

test('should successfully delete', async ({ page }) => {
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

    // delete UPDATED_DUMMY_PRODUCT
    const categoryRow1 = page
    .getByRole('cell', { name: UPDATED_DUMMY_CATEGORY.name })
    .locator('xpath=ancestor::tr');
    await expect(categoryRow1).toBeVisible();
    await categoryRow1.getByRole('button', { name: 'Delete' }).click();

    // UPDATED_DUMMY_CATEGORY is successfully deleted
    await expect(page.getByText('Category is deleted')).toBeVisible();
    await expect(page.getByRole('cell', { name: UPDATED_DUMMY_CATEGORY.name })).not.toBeVisible();

    // delete DUPLICATE_DUMMY_CATEGORY
    const categoryRow2 = page
    .getByRole('cell', { name: DUPLICATE_DUMMY_CATEGORY.name })
    .locator('xpath=ancestor::tr');
    await expect(categoryRow2).toBeVisible();
    await categoryRow2.getByRole('button', { name: 'Delete' }).click();

    // DUPLICATE_DUMMY_CATEGORY is successfully deleted
    await expect(page.getByText('Category is deleted')).toBeVisible();
    await expect(page.getByRole('cell', { name: DUPLICATE_DUMMY_CATEGORY.name })).not.toBeVisible();
});