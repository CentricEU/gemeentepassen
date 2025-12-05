import {BasePage} from "../pages/basePage";
import {expect, Page} from "@playwright/test";
import * as NL_translation from '../files/i18n/nl-NL';

export class ReviewOfferModal extends BasePage {
    private static locators = {
        reviewOfferModalTitle: 'h3',
        offerCreatedFor: 'windmill-input[formcontrolname="citizenOfferType"] .input-element',
        offerType: 'windmill-input[formcontrolname="offerTypeId"] .input-element',
        approveOffer: '.button-success > .button-success.centric-inner-button',
        closeButton: '.mat-mdc-dialog-actions > .button-link-dark:nth-of-type(1)'
    }

    static async validateValuesOffer(page: any): Promise<void> {
        const citizenOfferType = await page.$eval(this.locators.offerCreatedFor, element => element.value);
        const offerType = await page.$eval(this.locators.offerType, element => element.value);

        expect(citizenOfferType.trim()).toEqual('Burger met pas');
        expect(offerType.trim()).toEqual('Subsidie');

        const isApproveOfferEnabled = await page.isEnabled(this.locators.approveOffer);
        expect(isApproveOfferEnabled).toBeTruthy();
    }

    public static async validatePopupDisplayed(page: Page): Promise<void> {
        const modalTitleLocator = page.locator(this.locators.reviewOfferModalTitle);
        await expect(modalTitleLocator).toContainText(NL_translation.offer.approve.review);
    }

    public static async clickApproveButton(page: Page): Promise<void> {
        await page.click(this.locators.approveOffer)
    }

    public static async clickCancelButton(page: Page): Promise<void> {
        await page.click((this.locators.closeButton))
    }

}