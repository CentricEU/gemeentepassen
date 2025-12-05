import {test, expect} from '@playwright/test';
import {CommonFunctions} from '../../resources/utils/commonFunctions';
import {RegisterPage} from '../../resources/pages/registerPage';
import {SupplierProfileGenerator} from '../../resources/utils/generateSupplierProfile'
import {LoginPage} from '../../resources/pages/loginPage';
import {DataBase} from '../../resources/db/dbConnection';
import * as auth from '../../resources/api/loginAndLogout';
import * as NL_translation from '../../resources/files/i18n/nl-NL';

const supplierProfileGenerator = new SupplierProfileGenerator();
const db = new DataBase();

let registerProfileUser: any;

test.beforeEach(async ({page}) => {
    await page.goto('/' + 'register');
    await expect(page.locator('img')).toBeVisible();
});

test('Register Setup Profile and validate login', async ({page}) => {
    const registerProfilePassword = await CommonFunctions.generateRandomPassword(page, 12);
    registerProfileUser = supplierProfileGenerator.generateProfile();

    await expect(page.locator('h1.title')).toContainText(NL_translation.register.title)
    await RegisterPage.registerProfile(page, registerProfileUser, registerProfilePassword);

    await expect(page.locator(`button[type='submit']`)).toBeVisible();

    // Confirm supplier account
    await db.executeQueryFromFile('../../resources/db/updateCreatedUser.sql', [registerProfileUser.email]);

    await page.goto('/login');
    await expect(page).toHaveURL('/login');

    await LoginPage.loginIntoApp(page, registerProfileUser.email, registerProfilePassword);
    await expect(page.locator('h2.title')).toBeVisible();
    await expect(page.locator('h2.title')).toContainText('Automation');
    console.log('Register profile user: ' + registerProfileUser.email);
});


test.afterEach(async ({page}) => {
    try {
        // Logout the user after each test
        if (registerProfileUser) {
            const {token} = await auth.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', registerProfileUser.email, registerProfileUser.password);
            await auth.logoutUser(page, token);
        }

        await db.executeQueryFromFile('../../resources/db/deleteUser.sql', registerProfileUser.email);
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});



