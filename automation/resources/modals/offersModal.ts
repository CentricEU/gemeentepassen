import {Page} from '@playwright/test';
import {CommonFunctions} from '../utils/commonFunctions';
import * as faker from 'faker';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import {BasePage} from '../pages/basePage';

export class OfferModal extends BasePage {
    // Offer Modal Locators
    private static locators = {
        offerTitle: '[formcontrolname="title"]',
        offerType: '.dropdown-search-input',
        discountAmount: '[ng-reflect-name="amount"]',
        offerDescription: 'centric-textarea2 div',
        saveButton: '.button-default:nth-of-type(2)',
        acceptedGrants: '[formcontrolname="grantsIds"]',
        ageRestrictionField: '[formcontrolname="ageRestrictionOtherValue"]',
        timeFromInput: 'input[id="id-time-from"]',
        timeToInput: 'input[id="id-time-to"]',
        minValueInput: 'windmill-input[formcontrolname="minPrice"] input',
        maxValueInput: 'windmill-input[formcontrolname="maxPrice"] input',
    };

    static async createOffer(page: Page, type: string, offerType: string, offerTitle: string, amountValue: any, fromDate: string, toDate: string): Promise<void> {
        const offerDescription = faker.commerce.productDescription();

        await this.clickButtonFromWelcomePage(page, NL_translation.offer.addOffer);
        await this.selectOfferType(page, type);

        await CommonFunctions.clickAndType(page, this.locators.offerTitle, offerTitle);
        await CommonFunctions.selectValueFromDropdownList(page, this.locators.offerType, offerType);

        await this.fillDiscountAmount(page, offerType, amountValue);
        await this.fillOfferDescription(page, offerDescription);
        await this.selectDateRange(page, fromDate, toDate);
    }

    static async createOfferWithoutRestrictions(page: Page, type: string, offerType: string, offerTitle: string, amountValue: any, fromDate: string, toDate: string) {
        await this.createOffer(page, type, offerType, offerTitle, amountValue, fromDate, toDate);
        await page.click(this.locators.saveButton, {force: true});
    }

    static async createOfferWithFrequencyOfUseRestrictions(page: Page, type: string, offerType: string, offerTitle: string, amountValue: any, fromDate: string, toDate: string) {
        await this.createOffer(page, type, offerType, offerTitle, amountValue, fromDate, toDate);
        await CommonFunctions.checkCheckboxByLabel(page, 'Frequentie van gebruik');
        await CommonFunctions.selectRadioOptionByLabel(page, 'Maandelijks');
        await page.click(this.locators.saveButton, {force: true});
    }

    static async createOfferWithAgeRestrictions(page: Page, type: string, offerType: string, offerTitle: string, amountValue: any, fromDate: string, toDate: string, ageRestriction: number) {
        await this.createOffer(page, type, offerType, offerTitle, amountValue, fromDate, toDate);
        await CommonFunctions.checkCheckboxByLabel(page, 'Leeftijdsbeperking');
        await this.selectAgeRestriction(page, ageRestriction);
        await page.click(this.locators.saveButton, {force: true});
    }

    static async createOfferWithTimeRestrictions(page: Page, type: string, offerType: string, offerTitle: string, amountValue: any, fromDate: string, toDate: string, timeFrom: string, timeTo: string) {
        await this.createOffer(page, type, offerType, offerTitle, amountValue, fromDate, toDate);
        await CommonFunctions.checkCheckboxByLabel(page, 'Tijdslots');
        await this.setTimeRange(page, timeFrom, timeTo);
        await page.click(this.locators.saveButton, {force: true});
    }

    static async createOfferWithEligiblePriceRangeRestrictions(page: Page, type: string, offerType: string, offerTitle: string, amountValue: any, fromDate: string, toDate: string, minValue: any, maxValue: any) {
        await this.createOffer(page, type, offerType, offerTitle, amountValue, fromDate, toDate);
        await CommonFunctions.checkCheckboxByLabel(page, 'Passende prijsklasse');
        await this.setPriceRange(page, minValue, maxValue);
        await page.click(this.locators.saveButton, {force: true});
    }

    static async createOfferWithAllRestrictions(page: Page, type: string, offerType: string, offerTitle: string, amountValue: any, fromDate: string, toDate: string, timeFrom: any, timeTo: any, minValue: any, maxValue: any) {
        await this.createOffer(page, type, offerType, offerTitle, amountValue, fromDate, toDate);
        await this.addAllRestrictions(page, timeFrom, timeTo, minValue, maxValue);
        await page.click(this.locators.saveButton, {force: true});
    }

    private static async selectOfferType(page: Page, type: string) {
        if (type === 'Citizen') {
            await this.selectRadioButton(page, 'citizenOfferType', 'offer.citizen');
        } else if (type === 'Citizen with pass') {
            await this.selectRadioButton(page, 'citizenOfferType', 'offer.citizenWithPass');
        }
    }

    private static async fillDiscountAmount(page: Page, offerType: string, amountValue: any) {
        switch (offerType) {
            case 'Percentage':
            case '...Credit':
                await CommonFunctions.clickAndType(page, this.locators.discountAmount, amountValue.toString());
                break;
            case 'Koop één krijg één gratis':
                await CommonFunctions.selectValueFromDropdownList(page, this.locators.offerType, offerType);
                break;
            case 'Grant':
                // TODO need to add function for selecting the grants
                await CommonFunctions.selectValueFromDropdownList(page, this.locators.acceptedGrants, 'Test');
                break;
        }
    }

    private static async fillOfferDescription(page: Page, offerDescription: string) {
        const descriptionLocator = page.locator(this.locators.offerDescription).first();
        await descriptionLocator.click();
        await descriptionLocator.type(offerDescription);
    }

    private static async selectAgeRestriction(page: Page, ageRestriction: number) {
        if (ageRestriction >= 18 && ageRestriction <= 20) {
            await CommonFunctions.selectRadioOptionByLabel(page, 'Boven de 18 jaar');
        } else if (ageRestriction >= 21) {
            await CommonFunctions.selectRadioOptionByLabel(page, 'Boven de 21 jaar');
        } else if (ageRestriction <= 18) {
            await CommonFunctions.selectRadioOptionByLabel(page, 'Anders');
            await CommonFunctions.clickAndType(page, this.locators.ageRestrictionField, ageRestriction.toString());
        }
    }

    private static async setTimeRange(page: Page, timeFrom: string, timeTo: string) {
        await page.fill(this.locators.timeFromInput, timeFrom);
        await page.fill(this.locators.timeToInput, timeTo);
    }

    private static async setPriceRange(page: Page, minValue: any, maxValue: any) {
        await page.fill(this.locators.minValueInput, minValue.toString());
        await page.fill(this.locators.maxValueInput, maxValue.toString());
    }

    private static async addAllRestrictions(page: Page, timeFrom: any, timeTo: any, minValue: any, maxValue: any) {
        await CommonFunctions.checkCheckboxByLabel(page, 'Frequentie van gebruik');
        await CommonFunctions.selectRadioOptionByLabel(page, 'Maandelijks');
        await CommonFunctions.checkCheckboxByLabel(page, 'Leeftijdsbeperking');
        await CommonFunctions.selectRadioOptionByLabel(page, 'Boven de 21 jaar');
        await CommonFunctions.checkCheckboxByLabel(page, 'Tijdslots');
        await this.setTimeRange(page, timeFrom, timeTo);
        await CommonFunctions.checkCheckboxByLabel(page, 'Passende prijsklasse');
        await this.setPriceRange(page, minValue, maxValue);
    }
}
