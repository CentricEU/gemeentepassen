import {expect, test} from "@playwright/test";
import * as userData from '../../../resources/files/userData';
import * as NL_translation from '../../../resources/files/i18n/nl-NL';
import {LoginPage} from "../../../resources/pages/loginPage";
import {DataBase} from "../../../resources/db/dbConnection";
import defineConfig from "../../../playwright.config";
import {BasePage} from "../../../resources/pages/basePage";
import {createGrantsAndOffer} from "../../../resources/api/createOffer";
import {TableFunctions} from "../../../resources/utils/tableFunctions";
import {PendingOffersPage} from "../../../resources/pages/pendingOffersPage";
import {ReviewOfferModal} from "../../../resources/modals/reviewOfferModal";
import {CommonFunctions} from "../../../resources/utils/commonFunctions";

const {municipalityUrl} = defineConfig.use;
const db = new DataBase();

async function validateRowCount(page: any, expectedRowCount: number) {
    // Validate the number of rows in table
    const rowCount = await TableFunctions.countRows(page);
    expect(rowCount).toEqual(expectedRowCount);
}

test.beforeEach(async ({page}) => {
    await db.executeQueryFromFile('../../resources/db/deletePendingOffers.sql');

    await page.goto(municipalityUrl);
    await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
    await expect(page.locator('p')).toBeVisible();
    await page.goto(municipalityUrl + '/offers');
    await BasePage.validateBreadcrumbs(page, [NL_translation.general.pages.dashboard, NL_translation.general.pages.pendingOffers]);
});

test.describe('Pending Offers', () => {
    test('Landing on Pending Offers page and validate the information displayed', async ({page}) => {
        await BasePage.validateDashboardPage(page, NL_translation.general.pages.grants, NL_translation.grants.noData.title, NL_translation.grants.noData.description)
    });

    test('Validate values from table of Pending Offers page', async ({page}) => {
        const actionButtons = ['Beoordelen'];
        await createGrantsAndOffer(page, 1);
        await page.reload();

        await validateRowCount(page, 1);
        await BasePage.validateActionButtonsVisibility(page, actionButtons);

        await TableFunctions.validateValueInTable(page, 'Centric', 1);
        await TableFunctions.validateValueInTable(page, 'In afwachting', 2);
    })

    test('Close the Approve Offer popup using Cancel button', async ({page}) => {
        await createGrantsAndOffer(page, 1);
        await page.reload();

        await validateRowCount(page, 1);
        await PendingOffersPage.clickBeoordelenButtonByValue(page, 'Centric');
        await ReviewOfferModal.validatePopupDisplayed(page);
        await ReviewOfferModal.clickCancelButton(page);

        await validateRowCount(page, 1);
    })

    test('Approve offer from Pending Offers page', async ({page}) => {
        await createGrantsAndOffer(page, 1);
        await page.reload();

        await validateRowCount(page, 1);
        await PendingOffersPage.clickBeoordelenButtonByValue(page, 'Centric');

        await ReviewOfferModal.validatePopupDisplayed(page);
        await ReviewOfferModal.validateValuesOffer(page);

        await ReviewOfferModal.clickApproveButton(page);
        await CommonFunctions.validateMessageToaster(page, NL_translation.offer.approve.successfulApproval);
        await BasePage.validateDashboardPage(page, NL_translation.general.pages.grants, NL_translation.grants.noData.title, NL_translation.grants.noData.description);
    })
});