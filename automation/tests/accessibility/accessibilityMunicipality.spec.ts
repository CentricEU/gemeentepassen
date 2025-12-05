import {test, expect} from '@playwright/test';
import {AccessibilityScan} from '../../resources/utils/axe-test';
import * as userData from '../../resources/files/userData';
import {LoginPage} from '../../resources/pages/loginPage';
import defineConfig from '../../playwright.config';
import * as NL_translation from '../../resources/files/i18n/nl-NL';

const accessibilityTest = new AccessibilityScan();
const {municipalityUrl} = defineConfig.use;

test.describe.skip('Accessibility Testing Municipality', () => {
    test('Login page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto(municipalityUrl);

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Dashboard page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto(municipalityUrl);
        await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
        await expect(page.locator('p')).toBeVisible();

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Supplier approved page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto(municipalityUrl);
        await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
        await expect(page.locator('p')).toBeVisible();
        await page.goto(municipalityUrl + '/suppliers');

        await expect(page.locator('li:nth-of-type(2) > a')).toHaveText(NL_translation.general.pages.suppliers);

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Offers page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto(municipalityUrl);
        await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
        await expect(page.locator('p')).toBeVisible();
        await page.goto(municipalityUrl + '/offers');

        await expect(page.locator('li:nth-of-type(2) > a')).toHaveText('In afwachting van aanbiedingen');

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Grants page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto(municipalityUrl);
        await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
        await expect(page.locator('p')).toBeVisible();
        await page.goto(municipalityUrl + '/grants');

        await expect(page.locator('li:nth-of-type(2) > a')).toHaveText(NL_translation.general.pages.grants);

        await accessibilityTest.accessibilityScanResults(page);
    });

    test('Passholders page should not have any automatically detectable accessibility issues', async ({page}) => {
        await page.goto(municipalityUrl);
        await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
        await expect(page.locator('p')).toBeVisible();
        await page.goto(municipalityUrl + '/passholders');

        await expect(page.locator('li:nth-of-type(2) > a')).toHaveText(NL_translation.general.pages.passholders);

        await accessibilityTest.accessibilityScanResults(page);
    });
});