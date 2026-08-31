import test, { expect } from "@playwright/test";
import { Applications } from "../../utils/enums/applications.enum";
import { env } from "../../utils/test-utils";
import { BaseTest } from "../base-test";
import LoginMPage from "../../page-objects/municipality/loginMpage";
import LogoutPage from "../../page-objects/common/logoutPage";
import { PAGE_TITLES, URL_PATTERNS } from "../../utils/test-data";
import { AssertionHelper } from "../../utils/helpers/assertions";
import { ToasterMessages } from "../../utils/expects/toaster-messages";
import { Input } from "../../page-objects/common/input";
import { Errors } from "../../page-objects/common/errors";
import { ErrorMessages } from "../../utils/expects/error-messages";


let loginPage: LoginMPage;
let error: Errors;
let input: Input;

test.beforeEach(async ({ page }) => {
  await BaseTest.navigateToHomePage(page, Applications.MUNICIPALITY);
  loginPage = new LoginMPage(page);
});

test.afterEach(async ({ page }) => {
    await page.close();
});

test.describe("Municipality Successful Login Test", () => {
  test("Successful Login @smoke", async ({ page }) => {
    await loginPage.login(env.EMAIL_MUNICIPALITY_ADMIN, env.PASSWORD);
    await AssertionHelper.assertPageTitle(page, PAGE_TITLES.MUNICIPALITY);
    const logoutPage = new LogoutPage(page);
    await logoutPage.logout();
    await AssertionHelper.assertUrlMatches(page, URL_PATTERNS.LOGIN);
  });
});


test.describe("Municipality Login Validation Tests", () => {  
  test("Unsuccessful login with invalid email", async ({ }) => {
    await loginPage.login("invalid@User.com", env.PASSWORD);
    const toasterMessage = await loginPage.getToasterMessage();
    expect(toasterMessage).toContain(ToasterMessages.INVALID_AUTHENTICATION);
  });

  test("Unsuccessful login with invalid password", async ( ) => {
    await loginPage.login(env.EMAIL_MUNICIPALITY_ADMIN, "invalidPassword");
    const toasterMessage = await loginPage.getToasterMessage();
    expect(toasterMessage).toContain(ToasterMessages.INVALID_AUTHENTICATION);
  });

  test("Check that password is mandatory", async ({ page }) => {
    input= new Input(page);
    error = new Errors(page);
    await input.fillAndClearInput(loginPage.passwordInput, "TestPassword");
    const passwordValidationMessage = await error.getErrorText();
    expect(passwordValidationMessage).toContain(ErrorMessages.PASSWORD_REQUIRED);
  });

  test("Check that email is mandatory", async ({ page }) => {
    input= new Input(page);
    error = new Errors(page);
    await input.fillAndClearInput(loginPage.emailInput, "TestEmail@example.com");
    const emailValidationMessage = await error.getErrorText();
    expect(emailValidationMessage).toContain(ErrorMessages.EMAIL_REQUIRED);
  });

});

test.describe("Municipality Successful Logout Test", () => {  
  test("Successful Logout", async ({ page }) => {
    await loginPage.login(env.EMAIL_MUNICIPALITY_ADMIN, env.PASSWORD);
    const logoutPage = new LogoutPage(page);
    await logoutPage.logout();
    await AssertionHelper.assertUrlMatches(page, URL_PATTERNS.LOGIN);
  });
});
  
