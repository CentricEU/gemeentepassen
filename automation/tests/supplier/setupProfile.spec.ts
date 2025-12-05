import {test, expect} from '@playwright/test';
import {CommonFunctions} from '../../resources/utils/commonFunctions';
import {SetupProfileModal} from '../../resources/modals/setupProfileModal';
import {RegisterPage} from '../../resources/pages/registerPage';
import {SupplierProfileGenerator} from '../../resources/utils/generateSupplierProfile';
import {LoginPage} from '../../resources/pages/loginPage';
import {DataBase} from '../../resources/db/dbConnection';
import * as auth from '../../resources/api/loginAndLogout';

const supplierProfileGenerator = new SupplierProfileGenerator();
const db = new DataBase();

let setupProfileUser: any;

test.beforeEach(async ({page}) => {
    await page.goto('/' + 'register');
    await expect(page.locator('img')).toBeVisible();
});


test('Setup Profile after register user', async ({page}) => {
    const setupProfilePass = await CommonFunctions.generateRandomPassword(page, 12);
    setupProfileUser = supplierProfileGenerator.generateProfile();

    await RegisterPage.registerProfile(page, setupProfileUser, setupProfilePass);

    await expect(page.locator(`button[type='submit']`)).toBeVisible();

    // Confirm supplier account
    await db.executeQueryFromFile('../../resources/db/updateCreatedUser.sql', [setupProfileUser.email]);

    await page.goto('/login');
    await LoginPage.loginIntoApp(page, setupProfileUser.email, setupProfilePass);
    await expect(page.locator('h2.title')).toContainText('Automation');

    await SetupProfileModal.setupProfile(page, setupProfileUser);
    console.log('Setup profile user: ' + setupProfileUser.email);
});

test.afterEach(async ({page, browser}) => {
    try {
        // Logout the user after each test
        if (setupProfileUser) {
            const {token} = await auth.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', setupProfileUser.email, setupProfileUser.password);
            await auth.logoutUser(page, token);
        }

        // Delete the user from the database
        await db.executeQueryFromFile('../../resources/db/deleteUser.sql', setupProfileUser.email);
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});