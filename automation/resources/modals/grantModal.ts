import {Page, expect} from '@playwright/test';
import {CommonFunctions} from '../utils/commonFunctions';
import * as faker from 'faker';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import {BasePage} from "../pages/basePage";

export class GrantModal extends BasePage {
    // Grant Modal Locators
    private static grantTitleLocator = 'centric-form-item:nth-of-type(1) .centric-input-container';
    private static grantDescriptionLocator = 'centric-textarea2[formcontrolname="description"] textarea';
    private static grantAmountLocator = 'centric-form-item:nth-of-type(3) .windmill-input';
    private static saveBtn = '.mat-mdc-dialog-actions [ng-reflect-ng-class="button-default"]';
    private static grantTable = '.table-pannel';

    static async createGrant(page: Page, productName, fromDate: string, toDate: string, role: string): Promise<void> {
        const randomNr = await CommonFunctions.generateRandomNumber(4);
        const productDescription = faker.commerce.productDescription(productName);

        try {
            await this.clickButtonFromWelcomePage(page, NL_translation.grants.addGrant);
            await CommonFunctions.clickAndType(page, this.grantTitleLocator, productName);
            await page.locator(this.grantDescriptionLocator).type(productDescription);
            await CommonFunctions.clickAndType(page, this.grantAmountLocator, randomNr.toString());

            if (role === 'owner') {
                await this.selectRadioButton(page, 'createFor', 'grants.cardHolder');
            } else if (role === 'child') {
                await this.selectRadioButton(page, 'createFor', 'grants.childrenHolder');
            }
            await this.selectDateRange(page, fromDate, toDate);

            await page.click(this.saveBtn, {force: true});
            await expect(page.locator(this.grantTable)).toBeVisible();
        } catch (error) {
            console.error('Error creating grant:', error);
            throw error; // rethrow the error for test failure
        }
    }

}