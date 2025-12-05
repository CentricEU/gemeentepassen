import {Page, expect} from '@playwright/test';
import {CommonFunctions} from '../utils/commonFunctions';
import {SupplierProfileGenerator} from '../utils/generateSupplierProfile';
import * as NL_translation from '../../resources/files/i18n/nl-NL';

const profileGenerator = new SupplierProfileGenerator();

export class EditProfilePage {
    // General Information Locators
    private static companyNameTitleLocator = 'p.bold';
    private static ownerNameLocator = '[formcontrolname="ownerName"]';
    private static legalFormDropdownLocator = '[formcontrolname="legalForm"]';
    private static groupDropdownLocator = '[formcontrolname="group"]';
    private static categoryDropdownLocator = '[formcontrolname="category"]';
    private static subcategoryDropdownLocator = '[formcontrolname="subcategory"]';

    // Contact Information Locators
    private static companyBranchAddressLocator = '[formcontrolname="companyBranchAddress"]';
    private static branchProvinceLocator = '[formcontrolname="branchProvince"]';
    private static branchZipCodeLocator = '[formcontrolname="branchZip"]';
    private static branchLocationLocator = '[formcontrolname="branchLocation"]';
    private static accountManagerLocator = '[formcontrolname="accountManager"]';

    private static saveChangesBtnLocator = '.button-default .button-content';

    static async changeImageProfile(page: Page) {
        await page.waitForLoadState('domcontentloaded');

        // Locate the input field within the parent element
        const fileInput = page.locator('input[type="file"]');

        // Set the file path for the input field
        await fileInput.setInputFiles('automation/resources/files/profileChangeImage.jpg');

        // Scroll into view of the save button
        await page.locator(this.saveChangesBtnLocator).scrollIntoViewIfNeeded();
        await page.click(this.saveChangesBtnLocator);

        const saveProfileChangesSuccessMessage = `...Your changes have been saved.`
        await CommonFunctions.validateMessageToaster(page, saveProfileChangesSuccessMessage);
    }

    static async clearGeneralInformationAndValidateErrorMessage(page: Page) {
        await page.waitForSelector(this.companyNameTitleLocator, {state: 'visible'});

        // Check if the company name contains the expected text
        const companyName = page.locator(this.companyNameTitleLocator).first();
        await expect(companyName).toContainText('Centric');

        const clearOwnerName = page.getByRole('button', {name: 'generalInformation.'});
        await clearOwnerName.click();

        const dropdownLocators = [
            this.legalFormDropdownLocator,
            this.groupDropdownLocator,
            this.categoryDropdownLocator,
        ];

        for (const locator of dropdownLocators) {
            await this.clearDropdown(page, locator, 'role');
        }

        const errorMessages = [
            NL_translation.generalInformation.ownerNameFormControlRequired,
            NL_translation.generalInformation.legalFormFormControlRequired,
            NL_translation.generalInformation.groupFormControlRequired,
            NL_translation.generalInformation.catgeoryFormControlRequired,
        ];

        await CommonFunctions.validateErrorMessage(page, errorMessages);

        const saveChangesBtn = page.locator(this.saveChangesBtnLocator);
        await expect(saveChangesBtn).toBeDisabled();
    }

    static async setupNewGeneralInformationValues(page: Page, legalFormValue: string, groupValue: string, categoryValue: string, subcategoryValue: string) {
        const randomNr = await CommonFunctions.generateRandomNumber(6);
        await CommonFunctions.clickAndType(page, this.ownerNameLocator, 'Automation Tester ' + randomNr);

        await CommonFunctions.selectValueFromDropdownList(page, this.legalFormDropdownLocator, legalFormValue);
        await CommonFunctions.selectValueFromDropdownList(page, this.groupDropdownLocator, groupValue);
        await CommonFunctions.selectValueFromDropdownList(page, this.categoryDropdownLocator, categoryValue);
        await CommonFunctions.selectValueFromDropdownList(page, this.subcategoryDropdownLocator, subcategoryValue);

        const saveChangesBtn = page.locator(this.saveChangesBtnLocator);
        await expect(saveChangesBtn).toBeEnabled();
        await saveChangesBtn.click()

        const saveProfileChangesSuccessMessage = `...Your changes have been saved.`
        await CommonFunctions.validateMessageToaster(page, saveProfileChangesSuccessMessage);
    }

    static async clearContactInformationAndValidateErrorMessage(page: Page) {
        await page.waitForSelector(this.companyBranchAddressLocator, {state: 'visible'});

        const dropdownLocators = [
            this.companyBranchAddressLocator,
            this.branchProvinceLocator,
            this.branchZipCodeLocator,
            this.branchLocationLocator,
            this.accountManagerLocator,
        ];

        for (const locator of dropdownLocators) {
            await this.clearDropdown(page, locator, 'role');
        }

        const errorMessages = [
            NL_translation.contactInformation.companyBranchAddressFormControlRequired,
            NL_translation.contactInformation.branchProvinceFormControlRequired,
            NL_translation.contactInformation.branchZipFormControlRequired,
            '',
            NL_translation.contactInformation.branchLocationFormControlRequired,
            NL_translation.contactInformation.accountManagerFormControlRequired
        ];

        await CommonFunctions.validateErrorMessage(page, errorMessages);

        const saveChangesBtn = page.locator(this.saveChangesBtnLocator);
        await expect(saveChangesBtn).toBeDisabled();
    }

    static async setupNewContactInformationValues(page: Page) {
        // Generate a supplier profile
        const generatedProfile = profileGenerator.generateProfile();

        console.log(generatedProfile.companyBranchAddress)
        await CommonFunctions.clickAndType(page, this.companyBranchAddressLocator, generatedProfile.companyBranchAddress);
        await CommonFunctions.clickAndType(page, this.branchProvinceLocator, generatedProfile.branchProvince);
        await CommonFunctions.clickAndType(page, this.branchZipCodeLocator, generatedProfile.branchZipCode);
        await CommonFunctions.clickAndType(page, this.branchLocationLocator, generatedProfile.branchLocation);
        await CommonFunctions.clickAndType(page, this.accountManagerLocator, generatedProfile.accountManager);

        const saveChangesBtn = page.locator(this.saveChangesBtnLocator);
        await expect(saveChangesBtn).toBeEnabled();
        await saveChangesBtn.click()

        const saveProfileChangesSuccessMessage = NL_translation.general.success.changesSavedText;
        await CommonFunctions.validateMessageToaster(page, saveProfileChangesSuccessMessage);

    }

    private static async clearDropdown(page: Page, locator: string, locatorType: 'role' | 'label') {
        const clearButton = locatorType === 'role'
            ? page.locator(locator).getByRole('button')
            : page.locator(locator).getByLabel('...close');

        await clearButton.click();
    }
}
