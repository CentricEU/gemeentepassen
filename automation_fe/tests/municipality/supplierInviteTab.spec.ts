import { test, expect } from "@playwright/test";
import { BaseTest } from "../base-test";
import LoginMPage from "../../page-objects/municipality/loginMpage";
import { Applications } from "../../utils/enums/applications.enum";
import { env } from "../../utils/test-utils";
import { NavigationPage } from "../../page-objects/municipality/navigationPage";
import InvitationTabPage from "../../page-objects/municipality/invitationTabPage";
import WarningModal from "../../page-objects/common/warningModal";
import { sendInvitationTestData } from "../../utils/test-data";
import { deleteDbInviteSupplierByEmail } from "../../db/queries/invite-supplier-queries";
import { ToasterMessages } from "../../utils/expects/toaster-messages";

let loginPage: LoginMPage;
let navigationPage: NavigationPage;
let invitationTabPage: InvitationTabPage;
let invitesToDelete: string[] = [];

test.beforeEach(async ({ page }) => {
  await BaseTest.navigateToHomePage(page, Applications.MUNICIPALITY);
  loginPage = new LoginMPage(page);
  await loginPage.login(env.EMAIL_MUNICIPALITY_ADMIN, env.PASSWORD);
  navigationPage= new NavigationPage(page);
  invitationTabPage = await navigationPage.goToInvitationTab();
});

test.afterEach(async ({ page }) => {
    await page.close();
});

test.afterAll(async () => {
    for (const email of invitesToDelete) {
        await deleteDbInviteSupplierByEmail(email);
    }
});

test.describe("Check invitation tab functionality", () => {
  test("Check send invitation button become active only after all mandatory fields are filled.", async ({ page }) => {
    await invitationTabPage.clickInviteSuppliersBtn();
    const isSendButtonDisabledInitially = await invitationTabPage.isSendInvitationButtonDisabled();
    expect(isSendButtonDisabledInitially).toBeTruthy();
    await invitationTabPage.fillInvitationForm();
    const isSendButtonEnabledAfterFilling = await invitationTabPage.isSendInvitationButtonEnabled();
    expect(isSendButtonEnabledAfterFilling).toBeTruthy();
    await invitationTabPage.clickCancelButton();
    const warningModal = new WarningModal(page);
    await warningModal.cancelWarning();
});

  test("Check invite supplier functionality with valid data.", async () => {
    await invitationTabPage.clickInviteSuppliersBtn();
    await invitationTabPage.fillInvitationForm();
    await invitationTabPage.sendInvitationBtn.click();
    invitesToDelete.push(sendInvitationTestData.email);
    const toasterMessage = await loginPage.getToasterMessage();
    expect(toasterMessage).toBe(ToasterMessages.INVITATION_SENT); 
});

});
