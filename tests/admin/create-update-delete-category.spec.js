import { test, expect } from '@playwright/test';
import { ADMIN_USER, DUMMY_CATEGORY, DUPLICATE_DUMMY_CATEGORY, UPDATED_DUMMY_CATEGORY } from './dummyData';

test.describe.serial("Test for categories management", () => {
    test.describe.serial("Create Category", () => {
        test('should successfully create a new category', async ({ page }) => {
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
        
        test('should handle category creation using an empty string', async ({ page }) => {
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
        
        test('should handle category creation using a duplicate category name', async ({ page }) => {
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
    });
    
    test.describe.serial("Update Category", () => {
        test('should successfully update a category', async ({ page }) => {
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
        
            // edit DUMMY_CATEGORY
            const categoryRow = page
            .getByRole('cell', { name: DUMMY_CATEGORY.name })
            .locator('xpath=ancestor::tr');
            await expect(categoryRow).toBeVisible();
            await categoryRow.getByRole('button', { name: 'Edit' }).click();
        
            // ensure update category form is rendered
            await expect(page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' })).toBeVisible();
            await expect(page.getByTestId('update-category-form').getByRole('button', { name: 'Submit' })).toBeVisible();
        
            // update the category
            await page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' }).click();
            await page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' }).fill(UPDATED_DUMMY_CATEGORY.name);
            await page.getByTestId('update-category-form').getByRole('button', { name: 'Submit' }).click();
        
            // updated category is present
            await expect(page.getByText(`${UPDATED_DUMMY_CATEGORY.name} is updated`)).toBeVisible();
            await expect(page.getByRole('cell', { name: UPDATED_DUMMY_CATEGORY.name })).toBeVisible();
        });
        
        test('should handle when trying to update to using existing category name', async ({ page }) => {
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
        
            // edit UPDATED_DUMMY_CATEGORY
            const categoryRow = page
            .getByRole('cell', { name: UPDATED_DUMMY_CATEGORY.name })
            .locator('xpath=ancestor::tr');
            await expect(categoryRow).toBeVisible();
            await categoryRow.getByRole('button', { name: 'Edit' }).click();
        
            // ensure form is rendered
            await expect(page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' })).toBeVisible();
            await expect(page.getByTestId('update-category-form').getByRole('button', { name: 'Submit' })).toBeVisible();
        
            // update name to an existing one
            await page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' }).click();
            await page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' }).press('ControlOrMeta+a');
            await page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' }).fill(DUPLICATE_DUMMY_CATEGORY.name);
            await page.getByTestId('update-category-form').getByRole('button', { name: 'Submit' }).click();
            // should fail
            await expect(page.getByText('Category Already Exists')).toBeVisible();
            await page.getByRole('button', { name: 'Close' }).click();
            // UPDATED_CATEGORY still remains unchanged
            await expect(page.locator('tbody')).toContainText(UPDATED_DUMMY_CATEGORY.name);
        });
        
        test('should handle when trying to update with an empty string', async ({ page }) => {
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
        
            // edit UPDATED_DUMMY_CATEGORY
            const categoryRow = page
            .getByRole('cell', { name: UPDATED_DUMMY_CATEGORY.name })
            .locator('xpath=ancestor::tr');
            await expect(categoryRow).toBeVisible();
            await categoryRow.getByRole('button', { name: 'Edit' }).click();
        
            // ensure form is rendered
            await expect(page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' })).toBeVisible();
            await expect(page.getByTestId('update-category-form').getByRole('button', { name: 'Submit' })).toBeVisible();
        
            // update name to an existing one
            await page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' }).click();
            await page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' }).press('ControlOrMeta+a');
            await page.getByTestId('update-category-form').getByRole('textbox', { name: 'Enter new category' }).fill('');
            await page.getByTestId('update-category-form').getByRole('button', { name: 'Submit' }).click();
            // should fail
            await expect(page.getByText('Category name cannot be empty or contain only whitespace')).toBeVisible();
            await page.getByRole('button', { name: 'Close' }).click();
            // UPDATED_CATEGORY still remains unchanged
            await expect(page.locator('tbody')).toContainText(UPDATED_DUMMY_CATEGORY.name);
        });
    });
    
    test.describe.serial("Delete Category", () => {
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
    });
});
