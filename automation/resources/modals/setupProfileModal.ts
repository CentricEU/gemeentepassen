import {Page, expect} from '@playwright/test';
import {CommonFunctions} from '../utils/commonFunctions';
import {DashboardSupplier} from '../../resources/pages/supplierDashboard';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import {UploadFile} from "../utils/uploadFile";

export class SetupProfileModal {
    static async
    // Setup profile locators
    private static setupProfileTitleLocator = 'h3';
    private static ownerNameLocator = '[formcontrolname="ownerName"]';
    private static legalFormDropdownLocator = '[formcontrolname="legalForm"]';
    private static groupDropdownLocator = '[formcontrolname="group"]';
    private static categoryDropdownLocator = '[formcontrolname="category"]';
    private static subcategoryDropdownLocator = '[formcontrolname="subcategory"]';
    private static nextButtonToContactInformationLocator = '.button-default';
    // private static contactInformationTitleLocator = 'div:nth-of-type(2) > centric-step-header[role="tab"] > .centric-step-label';
    private static companyBranchAddressLocator = '[formcontrolname="companyBranchAddress"]';
    private static branchProvinceLocator = '[formcontrolname="branchProvince"]';
    private static branchZipCodeLocator = '[formcontrolname="branchZip"]';
    private static branchLocationLocator = '[formcontrolname="branchLocation"]';
    private static accountManagerLocator = '[formcontrolname="accountManager"]';
    private static finishSetupLocator = '.button-success.centric-inner-button';
    private static nextButtonToWorkingHoursLocator = '.action-button.button-default';
    private static approvalMessageInfo = 'mat-dialog-container frontend-custom-dialog p';

    static async setupProfile(page: Page, profileData: any) {
        const setupProfileTitle = page.locator(this.setupProfileTitleLocator);
        await expect(setupProfileTitle).toContainText(NL_translation.setupProfile.setup.replace("{{email}}", profileData.email));

        // Upload image
        await UploadFile.uploadFileSuccessfully(page, 'resources/files/profileImages.jpg', 'profileImages.jpg', 'image');

        await CommonFunctions.clickAndType(page, this.ownerNameLocator, profileData.ownerName);

        await CommonFunctions.selectValueFromDropdownList(page, this.legalFormDropdownLocator, 'De coöperatie');
        await CommonFunctions.selectValueFromDropdownList(page, this.groupDropdownLocator, 'Sociaal');
        await CommonFunctions.selectValueFromDropdownList(page, this.categoryDropdownLocator, 'Cultuur');
        await CommonFunctions.selectValueFromDropdownList(page, this.subcategoryDropdownLocator, 'Theater');

        await page.click(this.nextButtonToContactInformationLocator);

        // const contactInformationTitle = await page.textContent(this.contactInformationTitleLocator)
        // expect(contactInformationTitle).toContain(NL_translation.contactInformation.header);

        await CommonFunctions.clickAndType(page, this.companyBranchAddressLocator, profileData.companyBranchAddress);
        await CommonFunctions.clickAndType(page, this.branchProvinceLocator, profileData.branchProvince);
        await CommonFunctions.clickAndType(page, this.branchZipCodeLocator, profileData.branchZipCode);
        await CommonFunctions.clickAndType(page, this.branchLocationLocator, profileData.branchLocation);
        await CommonFunctions.clickAndType(page, this.accountManagerLocator, profileData.accountManager);

        await page.click(this.nextButtonToWorkingHoursLocator);
        await this.setWorkingHours(page, 'Monday', '10:00', '17:00');

        await page.click(this.finishSetupLocator);

        const setupProfileSuccessMessage = NL_translation.setupProfile.successfulInfoMessage;
        await CommonFunctions.validateMessageToaster(page, setupProfileSuccessMessage);

        await DashboardSupplier.validateApprovalInfo(page);
    }

    static async setWorkingHours(page: Page, day, startTime, endTime) {
        // Enable the checkbox for the specified day
        const checkboxLabel = page.locator(`[ng-reflect-label="${day}"]`);
        const checkboxInput = checkboxLabel.locator('input[type="checkbox"]');

        if (!await checkboxInput.isChecked()) {
            console.log(`${day} checkbox is not checked, clicking...`);
            await checkboxLabel.click();
        } else {
            console.log(`${day} checkbox is already checked.`);
        }

        // Find the first input element that matches the selector
        const startInputs = await page.$$(`input[id='id-time-from'][aria-label='Tijd van invoer']:not([disabled])`);

        // Check if the start input is disabled
        for (const startInput of startInputs) {
            const disabled = await startInput.getAttribute('disabled');
            if (!disabled) {
                console.log(`Filling start time ${startTime} for ${day}`);
                await startInput.fill(startTime);
                break;
            } else {
                console.log(`Start input for ${day} is disabled.`);
            }
        }

        // Find the end input elements that match the selector
        const endInputs = await page.$$('input[id="id-time-to"][aria-label="Tijd tot invoer"]:not([disabled])');

        // Check if any end input is not disabled and set the end time
        for (const endInput of endInputs) {
            const disabled = await endInput.getAttribute('disabled');
            if (!disabled) {
                console.log(`Filling end time ${endTime} for ${day}`);
                await endInput.fill(endTime);
                break;
            } else {
                console.log(`End input for ${day} is disabled.`);
            }
        }
    }
}
