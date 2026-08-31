import test, { expect } from "@playwright/test";
import { Applications } from "../../utils/enums/applications.enum";
import { BaseTest } from "../base-test";
import LoginSupplierPage from "../../page-objects/supplier/loginSupplierPage";
import RegisterSupplierPage from "../../page-objects/supplier/registerSupplierPage";
import { Errors } from "../../page-objects/common/errors";
import { ErrorMessages } from "../../utils/expects/error-messages";
import { deleteDbSupplierByUserName } from "../../db/queries/suppliers-queries";
import { registerSupplierTestData } from "../../utils/test-data";
import { Modal } from "../../page-objects/common/modal";


let loginPage: LoginSupplierPage;
let registerPage: RegisterSupplierPage
let error: Errors;
let usernamesToDelete: string[] = [];


test.beforeEach(async ({ page }) => {
  await BaseTest.navigateToHomePage(page, Applications.SUPPLIER);
  loginPage = new LoginSupplierPage(page);
  await loginPage.clickRegisterLink();
  registerPage = new RegisterSupplierPage(page);
});

test.afterEach(async ({ page }) => {
    await page.close();
});

test.afterAll(async () => {
    for (const username of usernamesToDelete) {
        await deleteDbSupplierByUserName(username);
    }
});

test.describe("Supplier Register Tests", () => {
  test("Check error when kvk number is smaller than 8", async ({ page }) => {
    const kvkSmallNumber = "1".repeat(7);
    await registerPage.kvkNumber.fill(kvkSmallNumber);
    error = new Errors(page);
    const kvkValidationMessage = await error.getErrorText();
    expect(kvkValidationMessage).toContain(ErrorMessages.KVK_NUMBER_LENGTH);
  });


   test("Check error is displayed for invalid email", async ({ page }) => {
    const invalidEmail = "invalid-email";
    await registerPage.email.fill(invalidEmail);
    error = new Errors(page);
    const emailValidationMessage = await error.getErrorText();
    expect(emailValidationMessage).toContain(ErrorMessages.EMAIL_INVALID);
  });

  test("Check error is displayed when passwords do not match", async ({ page }) => {
    await registerPage.password.fill("TestPassword123");
    await registerPage.confirmPassword.fill("DifferentPassword123");
    error = new Errors(page);
    const passwordMatchMessage = await error.getErrorText();
    expect(passwordMatchMessage).toContain(ErrorMessages.PASSWORDS_DO_NOT_MATCH);
  });

   test('Check success is displayed when password meets requirements', async ({ page }) => {
    await registerPage.password.fill('Test33@!');
    error = new Errors(page);
    const alertType = await error.getAlertType();
    expect(alertType).toContain('success');
  });

  test('Check warning is displayed when password does not meet requirements', async ({ page }) => {
    await registerPage.password.fill('Test33');
    error = new Errors(page);
    const alertType = await error.getAlertType();
    expect(alertType).toContain('warning');
  });

  test('Check registrations is successful with valid data', async ({ page }) => {
    await registerPage.register();
    usernamesToDelete.push(registerSupplierTestData.email);
    const modalTitle = new Modal(page);
    const modalTitleText = await modalTitle.getTitle();
    await expect(modalTitleText).toContain('Check je e-mail!');
  });
   
});