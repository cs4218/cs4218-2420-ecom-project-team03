import { test, expect } from '@playwright/test';
import { ADMIN_USER, UPDATED_DUMMY_PRODUCT } from './dummyData';

test('Updating a Product', async ({ page }) => {
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
    await page.click('a[href="/dashboard/admin/product/test-product"]');

    // Fill up details
    const nameInput = page.getByTestId('name-input');
    await expect(nameInput).toHaveValue('test-product');

    await page.getByTitle('Electronics').click();
    await page.getByTitle('Book').locator('div').click();
    await page.getByRole('textbox', { name: 'Write a name' }).click();
    await page.getByRole('textbox', { name: 'Write a name' }).fill(UPDATED_DUMMY_PRODUCT.name);
    await page.getByRole('textbox', { name: 'Write a description' }).click();
    await page.getByRole('textbox', { name: 'Write a description' }).fill(UPDATED_DUMMY_PRODUCT.description);
    await page.getByPlaceholder('Write a price').click();
    await page.getByPlaceholder('Write a price').fill(UPDATED_DUMMY_PRODUCT.price);
    await page.getByPlaceholder('Write a quantity').click();
    await page.getByPlaceholder('Write a quantity').fill(UPDATED_DUMMY_PRODUCT.quantity);
    await page.getByTitle('Yes').click();
    await page.getByTitle(UPDATED_DUMMY_PRODUCT.shipping).locator('div').click();
    await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

    // Check if product was successfully created
    await expect(page.getByText("Product Updated Successfully")).toBeVisible();
    await expect(page.getByText(UPDATED_DUMMY_PRODUCT.name)).toBeVisible();
    await expect(page.getByText(UPDATED_DUMMY_PRODUCT.description)).toBeVisible();

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByText(UPDATED_DUMMY_PRODUCT.name)).toBeVisible();

    await page.getByRole('button', { name: 'More Details' }).first().click();
    await expect(page.getByText(`Name : ${UPDATED_DUMMY_PRODUCT.name}`)).toBeVisible();
    await expect(page.getByText(`Description : ${UPDATED_DUMMY_PRODUCT.description}`)).toBeVisible();
    await expect(page.getByText(`Price : $${UPDATED_DUMMY_PRODUCT.price}`)).toBeVisible();
    await expect(page.getByText(`Category : Book`)).toBeVisible();
});