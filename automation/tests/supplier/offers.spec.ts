import {test, expect, Page} from '@playwright/test';
import {LoginPage} from '../../resources/pages/loginPage';
import * as userData from '../../resources/files/userData';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import {OffersPage} from "../../resources/pages/offersPage";
import {OfferModal} from "../../resources/modals/offersModal";
import {CommonFunctions} from "../../resources/utils/commonFunctions";
import {DataBase} from "../../resources/db/dbConnection";
import {TableFunctions} from "../../resources/utils/tableFunctions";
import * as faker from "faker";
import * as api from "../../resources/api/loginAndLogout";

const db = new DataBase();

async function validateOfferInTable(page: Page, offerTitle: string) {
    await page.waitForTimeout(1000);
    const offerCreatedExist = await TableFunctions.validateValueInTable(page, offerTitle, 3);
    expect(offerCreatedExist).toBeTruthy();
}

test.beforeEach(async ({page}) => {
    await db.executeQueryFromFile('../../resources/db/deleteOffers.sql', [userData.supplier.username]);

    await page.goto('/');
    await LoginPage.loginIntoAppWithValidation(page, userData.supplier.username, userData.supplier.password);
    await page.goto('/' + 'offers');
    await expect(page.locator('li:nth-of-type(2)')).toHaveText(NL_translation.general.pages.offers);
});

test('Landing on Offers page and validate the information displayed.', async ({page}) => {
    await OffersPage.validateOffersDashboard(page);
});

test('Create citizen offer without any restrictions', async ({page}) => {
    const {today, futureDate} = await CommonFunctions.getTodayAndFutureDate(20);
    const offerTitle = faker.commerce.productName();
    await OfferModal.createOfferWithoutRestrictions(page, 'Citizen', 'Percentage', offerTitle, 12, today, futureDate);

    await CommonFunctions.validateMessageToaster(page, NL_translation.general.success.offerSavedText);

    await validateOfferInTable(page, offerTitle);
})

test('Create citizen offer with frequency of use restrictions', async ({page}) => {
    const {today, futureDate} = await CommonFunctions.getTodayAndFutureDate(20);
    const offerTitle = faker.commerce.productName();
    await OfferModal.createOfferWithFrequencyOfUseRestrictions(page, 'Citizen with pass', 'Koop één krijg één gratis', offerTitle, 12, today, futureDate);

    await CommonFunctions.validateMessageToaster(page, NL_translation.general.success.offerSavedText);

    await validateOfferInTable(page, offerTitle);
})

test('Create citizen offer with age restrictions', async ({page}) => {
    const {today, futureDate} = await CommonFunctions.getTodayAndFutureDate(20);
    const offerTitle = faker.commerce.productName();
    await OfferModal.createOfferWithAgeRestrictions(page, 'Citizen with pass', '...Credit', offerTitle, 12, today, futureDate, 45);

    await CommonFunctions.validateMessageToaster(page, NL_translation.general.success.offerSavedText);

    await validateOfferInTable(page, offerTitle);
})

test('Create citizen offer with time restrictions', async ({page}) => {
    const {today, futureDate} = await CommonFunctions.getTodayAndFutureDate(20);
    const offerTitle = faker.commerce.productName();
    await OfferModal.createOfferWithTimeRestrictions(page, 'Citizen with pass', '...Credit', offerTitle, 12, today, futureDate, '09:00', '17:00');

    await CommonFunctions.validateMessageToaster(page, NL_translation.general.success.offerSavedText);

    await validateOfferInTable(page, offerTitle);
})

test('Create citizen offer with eligible price range restrictions', async ({page}) => {
    const {today, futureDate} = await CommonFunctions.getTodayAndFutureDate(20);
    const offerTitle = faker.commerce.productName();
    await OfferModal.createOfferWithEligiblePriceRangeRestrictions(page, 'Citizen with pass', '...Credit', offerTitle, 1200, today, futureDate, 100, 200);

    await CommonFunctions.validateMessageToaster(page, NL_translation.general.success.offerSavedText);

    await validateOfferInTable(page, offerTitle);
})

test('Create citizen offer with all restrictions', async ({page}) => {
    const {today, futureDate} = await CommonFunctions.getTodayAndFutureDate(20);
    const offerTitle = faker.commerce.productName();
    await OfferModal.createOfferWithAllRestrictions(page, 'Citizen with pass', '...Credit', offerTitle, 1200, today, futureDate, '10:00', '16:00', 100, 200);

    await CommonFunctions.validateMessageToaster(page, NL_translation.general.success.offerSavedText);

    await validateOfferInTable(page, offerTitle);
})

test.afterEach(async ({page}) => {
    const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', userData.supplier.username, userData.supplier.password);
    await api.logoutUser(page, token);
});