import { test, expect } from "@playwright/test";
import { BaseTest } from "../base-test";
import LoginMPage from "../../page-objects/municipality/loginMpage";
import { Applications } from "../../utils/enums/applications.enum";
import { env } from "../../utils/test-utils";
import { NavigationPage } from "../../page-objects/municipality/navigationPage";
import { UserManagementPage } from "../../page-objects/municipality/userManagementpage";
import { Errors } from "../../page-objects/common/errors";
import { Input } from "../../page-objects/common/input";
import { userManagementTestData } from "../../utils/test-data";
import { ErrorMessages } from "../../utils/expects/error-messages";
import { deleteDbUserByUserName } from "../../db/queries/users-queries";
import { Toaster } from "../../page-objects/common/toaster";
import { ToasterMessages } from "../../utils/expects/toaster-messages";
import { Table } from "../../page-objects/common/table";


let loginPage: LoginMPage;
let navigationPage: NavigationPage;
let userManagementPage: UserManagementPage;
let error: Errors;
let input: Input;
let usersToDelete: string[] = [];


test.beforeEach(async ({ page }) => {
  await BaseTest.navigateToHomePage(page, Applications.MUNICIPALITY);
  loginPage = new LoginMPage(page);
  await loginPage.login(env.EMAIL_MUNICIPALITY_ADMIN, env.PASSWORD);
  navigationPage= new NavigationPage(page);
  userManagementPage = await navigationPage.goToUserManagementPage();
});

test.afterEach(async ({ page }) => {
    await page.close();
});

test.afterAll(async () => {
    for (const username of usersToDelete) {
        await deleteDbUserByUserName(username);
    }
});

test.describe("Municipality User Management Page Tests", () => {
    test("Check validation errors for all required fields", async ({ page }) => {
        await userManagementPage.clickAddUserButton();
        input = new Input(page);
        error = new Errors(page);

        await input.fillAndClearInput(userManagementPage.firstNameInput, userManagementTestData.firstName);
        const firstNameError = await error.getErrorByIndex(0);
        expect(firstNameError).toContain(ErrorMessages.FIRST_NAME_REQUIRED);
        await input.fillAndClearInput(userManagementPage.lastNameInput, userManagementTestData.lastName);
        const lastNameError = await error.getErrorByIndex(1);
        expect(lastNameError).toContain(ErrorMessages.LAST_NAME_REQUIRED);
        await input.fillAndClearInput(userManagementPage.emailInput, userManagementTestData.email);
        const emailError = await error.getErrorByIndex(2);
        expect(emailError).toContain(ErrorMessages.EMAIL_REQUIRED);
        await userManagementPage.clickCancelButton();
    });

    test("Check validation error for invalid email format", async ({ page }) => {
        await userManagementPage.clickAddUserButton();
        const invalidEmail = "invalid-email";
        await userManagementPage.emailInput.fill(invalidEmail);
        error = new Errors(page);
        const emailValidationMessage = await error.getErrorText();
        expect(emailValidationMessage).toContain(ErrorMessages.EMAIL_INVALID);
        await userManagementPage.clickCancelButton();
    });

    test("Check that data is displayed correctly in the table after adding a user", async ({ page }) => {
        await userManagementPage.addUser();
        const toasterText=new Toaster(page);
        const toasterMessage= await toasterText.getToasterMessage();
        expect(toasterMessage).toEqual(ToasterMessages.USER_ADDED);
        page.reload();
        usersToDelete.push(userManagementTestData.email);
        const table = new Table(page);
        const rowData = await table.getRowData(0, ["name", "email", "date", "role"]);

        expect(rowData.name).toEqual(`${userManagementTestData.firstName} ${userManagementTestData.lastName}`);
        expect(rowData.email).toEqual(userManagementTestData.email);
        expect(rowData.date).toEqual(userManagementTestData.date);
        expect(rowData.role).toEqual(userManagementTestData.roleAdmin);
    });

});