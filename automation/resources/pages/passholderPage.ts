import {expect, Page} from '@playwright/test';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import {BasePage} from "./basePage";
import {TableFunctions} from "../utils/tableFunctions";

export class PassholderPage {
    private static deletePassholderPopupTitleLocator = 'h3';
    private static deletePassholderMessageLocator = 'p';
    private static deleteButtonLocator = `[id="general.button.delete"]`;

    static async validatePassholderDashboard(page: Page): Promise<void> {
        try {
            await BasePage.validateDashboardPage(page, NL_translation.general.pages.passholders, NL_translation.passholders.noData.title, NL_translation.passholders.noData.description)
            await BasePage.validateButtonEnabled(page)
        } catch (error) {
            console.error('An error occurred during landing on the page:', error);
            throw error;
        }
    }

    static async deletePassholder(page: Page): Promise<void> {
        await TableFunctions.validateValueInTable(page, 'Automation Test 02', 2);
        await TableFunctions.clickButtonForSpecificValue(page, 'Automation Test 02', 'Verwijderen');

        const deletePassholderTitle = page.locator(this.deletePassholderPopupTitleLocator);
        expect(deletePassholderTitle).toContainText(NL_translation.passholders.delete.title);

        const deletePassholderMessage = page.locator(this.deletePassholderMessageLocator);
        expect(deletePassholderMessage).toContainText(NL_translation.passholders.delete.content);

        await page.click(this.deleteButtonLocator);
    }
}