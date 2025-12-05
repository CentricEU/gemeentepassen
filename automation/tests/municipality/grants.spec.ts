import {test, expect} from '@playwright/test';
import {LoginPage} from '../../resources/pages/loginPage';
import * as userData from '../../resources/files/userData';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import * as api from '../../resources/api/loginAndLogout';
import * as apiGrant from '../../resources/api/createGrant';
import defineConfig from '../../playwright.config';
import {GrantsPage} from '../../resources/pages/grantsPage';
import {GrantModal} from '../../resources/modals/grantModal';
import {DataBase} from '../../resources/db/dbConnection';
import {CommonFunctions} from '../../resources/utils/commonFunctions';
import {TableFunctions} from "../../resources/utils/tableFunctions";
import * as faker from 'faker';

const db = new DataBase();
const {municipalityUrl} = defineConfig.use;

async function validateGrantInTable(page: any, grantName: string) {
    // Validate grant created in table
    await page.reload();
    await page.waitForTimeout(1000);
    const grantCreatedExist = await TableFunctions.validateValueInTable(page, grantName, 2);
    expect(grantCreatedExist).toBeTruthy();
}

async function validateRowCount(page: any, expectedRowCount: number) {
    // Validate the number of rows in table
    const rowCount = await TableFunctions.countRows(page);
    expect(rowCount).toEqual(expectedRowCount);
}

test.beforeEach(async ({page, context}) => {
    // Prepare the environment
    const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_MUNICIPALITY_ADMIN', userData.municipality.username, userData.municipality
        .password);
    await api.logoutUser(page, token);
    await db.executeQueryFromFile('../../resources/db/deleteCreatedGrants.sql');
    // Login to app
    await page.goto(municipalityUrl);
    await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
    await expect(page.locator('p')).toBeVisible();
    // Go to Grants page
    await page.goto(municipalityUrl + '/grants');
    await expect(page.locator('li').filter({hasText: NL_translation.general.pages.grants})).toBeVisible();
});

test.describe('Create Grant', () => {
    test('Landing on Grants page and validate the information displayed', async ({page}) => {
        await GrantsPage.validateGrantsDashboard(page);
    });

    test('Create grant with owner pass', async ({page}) => {
        const {today, futureDate} = await CommonFunctions.getTodayAndFutureDate(5);
        const ownerPass = faker.commerce.product();

        await GrantModal.createGrant(page, ownerPass, today, futureDate, 'owner');
        await validateGrantInTable(page, ownerPass);
        await validateRowCount(page, 1);
    });

    test('Create grant with child pass', async ({page}) => {
        const {today, futureDate} = await CommonFunctions.getTodayAndFutureDate(10);
        const childPass = faker.commerce.product();

        await GrantModal.createGrant(page, childPass, today, futureDate, 'child');
        await validateGrantInTable(page, childPass);
    });
})

test.describe('Grant page with table', () => {
    test.beforeEach(async ({page}) => {
        const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_MUNICIPALITY_ADMIN', userData.municipality.username, userData.municipality
            .password);
        await apiGrant.createGrant(page, token);
    })

    test('Validate actions buttons from the table', async ({page}) => {
        await page.reload();
        await validateRowCount(page, 1);
        await GrantsPage.validateActionButtonsVisibility(page);

    });

    test('Verify results per page working as expected', async ({page}) => {
        const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_MUNICIPALITY_ADMIN', userData.municipality.username, userData.municipality
            .password);
        for (let i = 0; i < 10; i++) {
            await apiGrant.createGrant(page, token);
        }

        await page.reload();

        const grantsCount = await GrantsPage.getNrOfRowsFromPagination(page);
        expect(grantsCount).toEqual(11);

        await GrantsPage.changeResultsPerPage(page, 5);
        await page.waitForTimeout(1000);
        await validateRowCount(page, 5)
    });

    test('Verify pagination is working as expected', async ({page}) => {
        const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_MUNICIPALITY_ADMIN', userData.municipality.username, userData.municipality
            .password);
        for (let i = 0; i < 12; i++) {
            await apiGrant.createGrant(page, token);
        }

        await page.reload();
        await GrantsPage.changeResultsPerPage(page, 5);
        await page.waitForTimeout(1000);

        await CommonFunctions.navigateToPage(page, 'next');
        await page.waitForTimeout(1000);
        await validateRowCount(page, 5);

        await CommonFunctions.navigateToPage(page, 'last');
        await page.waitForTimeout(1000);
        await validateRowCount(page, 3)

        await CommonFunctions.navigateToPage(page, 'previous');
        await page.waitForTimeout(1000);
        await validateRowCount(page, 5)

        await CommonFunctions.navigateToPage(page, 'first');
        await page.waitForTimeout(1000);
        await validateRowCount(page, 5)
    });
});