import {Page, expect} from '@playwright/test';
import {CommonFunctions} from '../utils/commonFunctions'
import * as NL_translation from '../../resources/files/i18n/nl-NL';

export class RegisterPage {
    // Register locators
    private static firstNameLocator = '[formcontrolname="firstName"]';
    private static lastNameLocator = '[formcontrolname="lastName"]'
    private static companyNameLocator = '[formcontrolname="company"]';
    private static kvkNumberLocator = '[formcontrolname="kvk"]';
    private static municipalityDropDown = '[formcontrolname="municipality"]';
    private static municipalityValueSelected = '.dropdown-content-list >> text="Automation"';
    private static emailAddressLocator = '[formcontrolname="email"]';
    private static passwordLocator = '[formcontrolname="password"]';
    private static confirmPasswordLocator = '[formcontrolname="confirmPassword"]';
    private static agreeTermsLocator = '.windmill-checkbox > .ng-untouched';
    private static registerBtnLocator = '.register-button';

    static async registerProfile(page: Page, profileData: any, password: string) {
        await CommonFunctions.clickAndType(page, this.firstNameLocator, profileData.firstName);
        await CommonFunctions.clickAndType(page, this.lastNameLocator, profileData.lastName);
        await CommonFunctions.clickAndType(page, this.companyNameLocator, profileData.companyName);
        await CommonFunctions.clickAndType(page, this.kvkNumberLocator, profileData.kvkNumber);

        await page.click(this.municipalityDropDown);
        await page.click(this.municipalityValueSelected);

        await CommonFunctions.clickAndType(page, this.emailAddressLocator, profileData.email);

        await CommonFunctions.clickAndType(page, this.passwordLocator, password);
        await CommonFunctions.clickAndType(page, this.confirmPasswordLocator, password);

        await page.check(this.agreeTermsLocator);
        await page.click(this.registerBtnLocator);

        const successfullyTittle = await page.textContent('h4');
        expect(successfullyTittle).toContain(NL_translation.register.accountConfirmation.title);

        const successfullyMessage = await page.textContent('p');
        expect(successfullyMessage).toContain(NL_translation.register.accountConfirmation.content.replace("{{email}}", profileData.email));
    }
}