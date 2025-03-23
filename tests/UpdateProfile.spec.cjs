const { test, expect } = require('@playwright/test');

const timestamp = Date.now();
const user = {
  name: 'userA',
  email: `userA+${timestamp}@email.com`,
  password: 'userApw',
  phone: '123',
  address: 'home 123',
  dob: '1999-06-02',
  answer: 'Bowling',
};


// Test user actions
async function registerUser(page, user) {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(user.name);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(user.phone);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(user.address);
    await page.getByPlaceholder('Enter Your DOB').fill(user.dob);
    await page.getByRole('textbox', { name: /favorite sports/i }).fill(user.answer);
    await page.getByRole('button', { name: 'REGISTER' }).click();
}

async function loginUser(page, user) {
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
}

test.describe.serial('User profile update flow', () => {
    test('Register new user', async ({ page }) => {
        await registerUser(page, user);
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    });

    test('Login and verify profile data', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await loginUser(page, user);
        await page.getByRole('button', { name: 'userA' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.getByRole('main')).toContainText('userA');
    });

    test('Update profile and verify changes', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await loginUser(page, user);
        await page.getByRole('button', { name: 'userA' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Profile' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('userB');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('1234');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('home 1234');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.getByRole('button', { name: 'userB' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.getByRole('main')).toContainText('userB');
    });
});
