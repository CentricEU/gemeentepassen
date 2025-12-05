import {expect, test} from "@playwright/test";
import {LoginPage} from "../../../resources/pages/loginPage";
import * as userData from '../../../resources/files/userData';
import * as NL_translation from '../../../resources/files/i18n/nl-NL';
import {DataBase} from "../../../resources/db/dbConnection";
import {InvitationsPage} from "../../../resources/pages/invitationsPage";
import defineConfig from "../../../playwright.config";
import {SuppliersPage} from "../../../resources/pages/suppliersPage";
import {InvitationModal} from "../../../resources/modals/invitationModal";
import {TableFunctions} from "../../../resources/utils/tableFunctions";
import * as faker from "faker";
import * as api from '../../../resources/api/loginAndLogout';
import {BasePage} from "../../../resources/pages/basePage";
import {CommonFunctions} from "../../../resources/utils/commonFunctions";

const {municipalityUrl} = defineConfig.use;

const db = new DataBase();

test.beforeEach(async ({page}) => {
    // Prepare the environment
    const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_MUNICIPALITY_ADMIN', userData.municipality.username, userData.municipality
        .password);
    await api.logoutUser(page, token);
    await db.executeQueryFromFile('../../resources/db/deleteInvitations.sql');

    await page.goto(municipalityUrl);
    await LoginPage.loginIntoApp(page, userData.municipality.username, userData.municipality.password);
    await expect(page.locator('p')).toBeVisible();
    await page.goto(municipalityUrl + '/suppliers');
    await SuppliersPage.clickOnTab(page, 'Uitnodigingen');
});

test.describe('Invitations Test', () => {
    test('Landing on Invitation page and validate the information displayed.', async ({page}) => {
        await InvitationsPage.validateInvitationsDashboard(page);
    })

    test('Send invitation to a single email', async ({page}) => {
        const email = faker.internet.email();

        await BasePage.clickButtonFromWelcomePage(page, NL_translation.general.inviteSuppliers);

        await InvitationModal.sendInvitation(page, email);

        await CommonFunctions.validateMessageToaster(page, NL_translation.inviteSuppliers.sentSuccessfully)

        await page.waitForTimeout(2000);
        const emailSendExist = await TableFunctions.validateValueInTable(page, email, 1);
        expect(emailSendExist).toBeTruthy();
    });

    test('Send invitations to multiple emails', async ({page}) => {
        const emails = [faker.internet.email(), faker.internet.email(), faker.internet.email()];

        await BasePage.clickButtonFromWelcomePage(page, NL_translation.general.inviteSuppliers);

        await InvitationModal.sendInvitations(page, emails);

        await CommonFunctions.validateMessageToaster(page, NL_translation.inviteSuppliers.sentSuccessfully)

        await page.waitForTimeout(2000);
        for (const email of emails) {
            const emailSendExist = await TableFunctions.validateValueInTable(page, email, 1);
            expect(emailSendExist).toBeTruthy();
        }

        const rowCount = await TableFunctions.countRows(page);
        expect(rowCount).toEqual(3);
    });

    test('Resend the invitation for a user who already received an invitation', async ({page}) => {
        const email = faker.internet.email();

        await BasePage.clickButtonFromWelcomePage(page, NL_translation.general.inviteSuppliers);

        await InvitationModal.sendInvitation(page, email);

        await CommonFunctions.validateMessageToaster(page, NL_translation.inviteSuppliers.sentSuccessfully);
        await page.waitForSelector('.centric-toast-container', {state: 'hidden'});

        await InvitationModal.clickSendAgainButtonForEmail(page, email, '...Send again');
        await InvitationModal.resendInvitation(page, email);
        await CommonFunctions.validateMessageToaster(page, NL_translation.inviteSuppliers.sentSuccessfully)
    })
})