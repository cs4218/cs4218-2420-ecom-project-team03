import { test, expect } from '@playwright/test';
import { ADMIN_USER, DUMMY_PRODUCT, UPDATED_DUMMY_PRODUCT } from './dummyData';

test.describe.serial("Admin Product", () => {
  test('Creating a Product', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Login as admin user
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(ADMIN_USER.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(ADMIN_USER.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to Create Product
    await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Product' }).click();

    // Fill up details
    await page.locator('#rc_select_0').click();
    await page.getByTitle('Electronics').locator('div').click();
    await page.getByText('Upload Photo').click();
    await page.getByRole('textbox', { name: 'Write a name' }).click();
    await page.getByRole('textbox', { name: 'Write a name' }).fill(DUMMY_PRODUCT.name);
    await page.getByRole('textbox', { name: 'Write a description' }).click();
    await page.getByRole('textbox', { name: 'Write a description' }).fill(DUMMY_PRODUCT.description);
    await page.getByPlaceholder('Write a price').click();
    await page.getByPlaceholder('Write a price').fill(DUMMY_PRODUCT.price);
    await page.getByPlaceholder('Write a quantity').click();
    await page.getByPlaceholder('Write a quantity').fill(DUMMY_PRODUCT.quantity);
    await page.locator('#rc_select_1').click();
    await page.getByText(DUMMY_PRODUCT.shipping).click();
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

    // Check if product was successfully created
    await expect(page.getByText("Product Created Successfully")).toBeVisible();
    await expect(page.getByText(DUMMY_PRODUCT.name)).toBeVisible();
    await expect(page.getByText(DUMMY_PRODUCT.description)).toBeVisible();

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByText(DUMMY_PRODUCT.name)).toBeVisible();

    await page.getByRole('button', { name: 'More Details' }).first().click();
    await expect(page.getByText(`Name : ${DUMMY_PRODUCT.name}`)).toBeVisible();
    await expect(page.getByText(`Description : ${DUMMY_PRODUCT.description}`)).toBeVisible();
    await expect(page.getByText(`Price : $${DUMMY_PRODUCT.price}`)).toBeVisible();
    await expect(page.getByText(`Category : Electronics`)).toBeVisible();
  });

  test("Update a Product", async ({ page }) => {
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
    await page.click(`a[href="/dashboard/admin/product/${UPDATED_DUMMY_PRODUCT.name}"]`);

    // Trigger delete
    const nameInput = page.getByTestId('name-input');
    await expect(nameInput).toHaveValue(UPDATED_DUMMY_PRODUCT.name);

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
});