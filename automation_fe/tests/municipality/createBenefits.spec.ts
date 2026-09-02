import { test, expect } from "@playwright/test";
import { BaseTest } from "../base-test";
import { Applications } from "../../utils/enums/applications.enum";
import LoginMPage from "../../page-objects/municipality/loginMpage";
import { env } from "../../utils/test-utils";
import LogoutPage from "../../page-objects/common/logoutPage";
import { NavigationPage } from "../../page-objects/municipality/navigationPage";
import { Benefits } from "../../page-objects/municipality/benefitsPage";
import { Errors } from "../../page-objects/common/errors";
import { ErrorMessages } from "../../utils/expects/error-messages";
import WarningModal from "../../page-objects/common/warningModal";
import { BenefitData } from "../../utils/benefit-data";
import { Input } from "../../page-objects/common/input";
import { deleteBenefitByName } from "../../db/queries/benefits-queries";
import { Table } from "../../page-objects/common/table";
import { ToasterMessages } from "../../utils/expects/toaster-messages";
import { Toaster } from "../../page-objects/common/toaster";


let loginPage: LoginMPage;
let navigationPage: NavigationPage;
let benefitsPage: Benefits;
let error: Errors;
let input: Input;
let benefitsToDelete: string[] = [];


test.beforeEach(async ({ page }) => {
  await BaseTest.navigateToHomePage(page, Applications.MUNICIPALITY);
  loginPage = new LoginMPage(page);
  await loginPage.login(env.EMAIL_MUNICIPALITY_ADMIN, env.PASSWORD);
  navigationPage= new NavigationPage(page);
  benefitsPage = await navigationPage.goToBenefitsPage();
});

test.afterEach(async ({ page }) => {
  const warningModal = new WarningModal(page);

  try {
    if (await warningModal.isWarningModalVisible()) {
       await warningModal.cancelWarning();
    }
  } catch (e) {
  }

  const logoutPage = new LogoutPage(page);
  await logoutPage.logout();

  await page.close();
});

test.afterAll(async () => {
    for (const name of benefitsToDelete) {
        await deleteBenefitByName(name);
    }
});

test.describe("Check Error messages when create a Benefit", () => {
  test("Check not allow description input longer than 256 characters", async ({ page }) => {
    error = new Errors(page);
    await benefitsPage.clickCreateBenefitsButton();
    const longDescription = "a".repeat(257);
    await benefitsPage.description.fill(longDescription);
    const validationMessage = await error.getErrorText();
    expect(validationMessage).toContain(ErrorMessages.ONE_CHARACTER_OVER_THE_LIMIT);
    await benefitsPage.clickCancelButton();
  });

  test("Check not allow name input longer than 64 characters", async ({ page }) => {
    await benefitsPage.clickCreateBenefitsButton();
    const longName = "a".repeat(65);
    await benefitsPage.name.fill(longName);
    await benefitsPage.name.blur();
    const actualValue = await benefitsPage.name.inputValue()
    expect(actualValue.length).toBe(64);
    await benefitsPage.clickCancelButton();
  });

  test("Check Save button become active only after all mandatory fields are filled.", async ({ page }) => {
    await benefitsPage.clickCreateBenefitsButton();
    const isSaveButtonDisabledInitially = await benefitsPage.isSaveButtonDisabled();
    expect(isSaveButtonDisabledInitially).toBeTruthy();
    await benefitsPage.fillMandatoryFieldsWithData(BenefitData);
    const isSaveButtonEnabledAfterFilling = await benefitsPage.isSaveButtonEnabled();
    expect(isSaveButtonEnabledAfterFilling).toBeTruthy();
    await benefitsPage.clickCancelButton();
  });

  test("Check validation errors for all required fields", async ({ page }) => {
    await benefitsPage.clickCreateBenefitsButton();
    input = new Input(page);
    error = new Errors(page);

    await input.fillAndClearInput(benefitsPage.name, BenefitData.name);
    const deploymentValidationMessage = await error.getErrorByIndex(0);
    expect(deploymentValidationMessage).toContain(ErrorMessages.BENEFIT_NAME_REQUIRED);

    await input.fillAndClearInput(benefitsPage.description, BenefitData.description);
    const descriptionValidationMessage = await error.getErrorByIndex(1);
    expect(descriptionValidationMessage).toContain(ErrorMessages.DESCRIPTION_REQUIRED);
    
    await input.fillAndClearInput(benefitsPage.amount, BenefitData.amount);
    const amountValidationMessage = await error.getErrorByIndex(2);
    expect(amountValidationMessage).toContain(ErrorMessages.AMOUNT_REQUIRED);

    await input.fillAndClearInput(benefitsPage.startDate, BenefitData.startDate);
    const dateValidationMessage = await error.getErrorByIndex(3);
    expect(dateValidationMessage).toContain(ErrorMessages.DATE_VALIDATION);
    await benefitsPage.clickCancelButton();
  });
});

test.describe("Check adding a Benefit", () => {
  test("Check add benefit with valid data", async ({ page }) => {
    await benefitsPage.addBenefit(BenefitData);
    const toasterText=new Toaster(page);
    const toasterMessage= await toasterText.getToasterMessage();
    expect(toasterMessage).toEqual(ToasterMessages.BENEFIT_ADDED);
    benefitsToDelete.push(BenefitData.name);
    const table = new Table(page);
    await page.reload();
    const name = (await table.getCellValue(0, 0))?.trim();
    expect(name).toEqual(BenefitData.name);
  });

  test("Chack amount is displayed with correct format in the table", async ({ page }) => {
    const benefitData = { ...BenefitData, name: `${BenefitData.name}_${Date.now()}_1` };
    await benefitsPage.addBenefit(benefitData);
    benefitsToDelete.push(benefitData.name);
    const table = new Table(page);
    await page.reload();
    const amount = (await table.getCellValue(0, 3))?.trim().replace(/\u00A0/g, " ");
    expect(amount).toEqual("€ 100,00");
  });

});
