import {test, expect} from '@playwright/test';
import {AccessibilityScan} from '../../resources/utils/axe-test';
import {LoginPage} from '../../resources/pages/loginPage';
import * as userData from '../../resources/files/userData';
import * as NL_translation from '../../resources/files/i18n/nl-NL';

const accessibilityTest = new AccessibilityScan();

test.describe('Accessibility Testing Supplier', () => {
    test('Login page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto('/');

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Register page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto('/' + 'register');

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Dashboard page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto('/');
        await LoginPage.loginIntoAppWithValidation(page, userData.supplier.username, userData.supplier.password);

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Edit profile page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto('/');
        await LoginPage.loginIntoAppWithValidation(page, userData.supplier.username, userData.supplier.password);
        await page.goto('/' + 'profile/edit');

        await expect(page.locator('.breadcrumbs-container > li:nth-of-type(2)')).toHaveText(NL_translation.general.pages.editProfile);

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Offer page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto('/');
        await LoginPage.loginIntoAppWithValidation(page, userData.supplier.username, userData.supplier.password);
        await page.goto('/' + 'offers');

        await expect(page.locator('.breadcrumbs-container > li:nth-of-type(2)')).toHaveText(NL_translation.general.pages.offers);

        await accessibilityTest.accessibilityScanResults(page);
    });
});