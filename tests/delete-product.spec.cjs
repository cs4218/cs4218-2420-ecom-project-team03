import { test, expect } from '@playwright/test';

const ADMIN_USER = {
    email: "cs4218@test.com",
    password: "cs4218@test.com"
};

const UPDATED_DUMMY_PRODUCT = {
    name: "test-product-2",
    description: "this is not a test product",
    price: "200",
    quantity: "1",
    shipping: 'No'
};

test('Deleting a Product', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Login as admin user
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(ADMIN_USER.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(ADMIN_USER.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to Update Product
    await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Products' }).click();
    await page.click('a[href="/dashboard/admin/product/test-product-2"]');

    // Trigger delete
    const nameInput = page.getByTestId('name-input');
    await expect(nameInput).toHaveValue('test-product-2');

    page.once('dialog', async dialog => {
        await dialog.accept('yes');
    });      
    await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();

    // Check if product was successfully created
    await expect(page.getByText("Product Deleted Successfully")).toBeVisible();
    await expect(page.getByRole('heading', { name: 'NUS T-shirt' })).toBeVisible();
    await expect(page.getByText(UPDATED_DUMMY_PRODUCT.name)).not.toBeVisible();
    await expect(page.getByText(UPDATED_DUMMY_PRODUCT.description)).not.toBeVisible();

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('heading', { name: 'NUS T-shirt' })).toBeVisible();
    await expect(page.getByRole('heading', { name: UPDATED_DUMMY_PRODUCT.name })).not.toBeVisible();
});