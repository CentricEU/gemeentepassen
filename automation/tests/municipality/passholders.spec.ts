import {test, expect} from '@playwright/test';
import {LoginPage} from '../../resources/pages/loginPage';
import * as userData from '../../resources/files/userData';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import * as api from '../../resources/api/loginAndLogout';
import {PassholderPage} from '../../resources/pages/passholderPage';
import {PassholderModal} from '../../resources/modals/passholderModal';
import {DataBase} from '../../resources/db/dbConnection';
import defineConfig from '../../playwright.config';
import {TableFunctions} from "../../resources/utils/tableFunctions";
import {BasePage} from "../../resources/pages/basePage";

const db = new DataBase();
const {municipalityUrl} = defineConfig.use;

test.beforeEach(async ({page, context}) => {
    // Prepare the environment
    const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_MUNICIPALITY_ADMIN', userData.municipality.username, userData.municipality
        .password);
    await api.logoutUser(page, token);
    await db.executeQueryFromFile('../../resources/db/deletePassholders.sql');

    // Login to app
    await page.goto(municipalityUrl);
    await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
    await expect(page.locator('p')).toBeVisible();
    // Go to Grants page
    await page.goto(municipalityUrl + '/passholders');
    await expect(page.locator('li').filter({hasText: NL_translation.general.pages.passholders})).toBeVisible();
});


test('Landing on Passholders page and validate the information displayed.', async ({page}) => {
    await PassholderPage.validatePassholderDashboard(page);
});

test('Validate warning message when the user import wrong format.', async ({page}) => {
    await PassholderModal.importWrongFormat(page);
});

test('Download the CSV Template and validate it.', async ({page}) => {
    await PassholderModal.downloadCSVTemplateAndValidate(page);
})

test('Import CSV passholders.', async ({page}) => {
    await PassholderModal.importCorrectFormat(page);
});

test('Validate action buttons from the passholders table.', async ({page}) => {
    const actionButtons = ['Pasbezitter bekijken', 'Verwijderen'];
    await PassholderModal.importCorrectFormat(page);
    await BasePage.validateActionButtonsVisibility(page, actionButtons);

    // Validate the number of the rows in table
    const rowCount = await TableFunctions.countRows(page);
    expect(rowCount).toEqual(3);
});

test('Delete selected passholder.', async ({page}) => {
    await PassholderModal.importCorrectFormat(page);

    const rowCountBeforeDelete = await TableFunctions.countRows(page);
    await PassholderPage.deletePassholder(page);
    await page.waitForTimeout(1000);
    const rowCountAfterDelete = await TableFunctions.countRows(page);
    expect(rowCountAfterDelete).toEqual(rowCountBeforeDelete - 1);
})