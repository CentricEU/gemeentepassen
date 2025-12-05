import {test, expect} from '@playwright/test';
import {LoginPage} from '../../resources/pages/loginPage';
import {CommonFunctions} from '../../resources/utils/commonFunctions';
import * as userData from '../../resources/files/userData';
import * as api from '../../resources/api/loginAndLogout';
import * as NL_translation from '../../resources/files/i18n/nl-NL';

test.beforeEach(async ({page}) => {
    await page.goto('/');
    await expect(page.locator('img')).toBeVisible();
});

test('Valid Login to L4L', async ({page}) => {
    const responsePromise = page.waitForResponse('**/api/authenticate');

    // Use the login function
    await LoginPage.loginIntoApp(page, userData.supplier.username, userData.supplier.password);

    await expect(page.locator('img[alt="Logo image"]')).toBeVisible();
    await expect(page.locator('frontend-dashboard .welcome')).toBeVisible();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
});

test('Invalid Login to L4L', async ({page}) => {
    const responsePromise = page.waitForResponse('**/api/authenticate');

    const wrongPass = await CommonFunctions.generateRandomPassword(page, 12);
    await LoginPage.loginIntoApp(page, userData.supplier.username, wrongPass);

    // Wait for the intercepted request and check its status code
    const response = await responsePromise;
    expect(response.status()).toBe(401);

    const warningMessage = NL_translation.errors.authentication_failed;

    // Validate warning message when password is wrong
    await expect(page.locator('.toast-content').first()).toBeVisible();
    await expect(page.locator('.toast-content').first()).toContainText(warningMessage);
});

test('Check if the user stays logged in when reopening the application', async ({page}) => {
    await LoginPage.loginIntoApp(page, userData.supplier.username, userData.supplier.password);
    await expect(page.locator('frontend-dashboard .welcome')).toBeVisible();

    // Refresh the page
    await page.reload();

    // Wait for the elements after reload
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('h2.title')).toContainText('Automation');
})

test.afterEach(async ({page}) => {
    const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', userData.supplier.username, userData.supplier.password);
    await api.logoutUser(page, token);
});