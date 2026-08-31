import { test, expect } from "@playwright/test";
import { BaseTest } from "../base-test";
import LoginMPage from "../../page-objects/municipality/loginMpage";
import { Applications } from "../../utils/enums/applications.enum";
import { env } from "../../utils/test-utils";
import { NavigationPage } from "../../page-objects/municipality/navigationPage";
import { UserManagementPage } from "../../page-objects/municipality/userManagementpage";
import { deleteDbUserByUserName } from "../../db/queries/users-queries";
import { ToasterMessages } from "../../utils/expects/toaster-messages";
import { Toaster } from "../../page-objects/common/toaster";
import { userManagementTestData } from "../../utils/test-data";
import { Table } from "../../page-objects/common/table";

let loginPage: LoginMPage;
let navigationPage: NavigationPage;
let userManagementPage: UserManagementPage;
let usersToDelete: string[] = [];

test.beforeEach(async ({ page }) => {
  await BaseTest.navigateToHomePage(page, Applications.MUNICIPALITY);
  loginPage = new LoginMPage(page);
  await loginPage.login(env.EMAIL_MUNICIPALITY_SUPER_ADMIN, env.PASSWORD);
});

test.afterEach(async ({ page }) => {
    await page.close();
});

test.afterAll(async () => {
    for (const username of usersToDelete) {
        await deleteDbUserByUserName(username);
    }
});

test.describe("Super Admin user management", () => {  
  test("Check that Super Admin can add another Super Admin", async ({ page }) => {
    navigationPage= new NavigationPage(page);
    userManagementPage = await navigationPage.goToUserManagementPage();
    await userManagementPage.addSuperAdminUser();
    usersToDelete.push(userManagementTestData.email);
    const toasterText=new Toaster(page);
    const toasterMessage= await toasterText.getToasterMessage();
    expect(toasterMessage).toEqual(ToasterMessages.USER_ADDED);
    const table = new Table(page);
    const role = (await table.getCellValue(0, 3))?.trim();
    expect(role).toEqual(userManagementTestData.roleSuperAdmin);
  });
});