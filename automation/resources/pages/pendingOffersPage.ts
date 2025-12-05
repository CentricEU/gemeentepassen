import {Page} from '@playwright/test';
import {BasePage} from "./basePage";

export class PendingOffersPage extends BasePage {
    // Offers Dashboard Locator
    

    static async clickBeoordelenButtonByValue(page: Page, searchValue: string): Promise<void> {
        // Locate the row by a specific value within the row
        const rowLocator = page.locator('tr.cdk-row.centric-row.ng-star-inserted', {
            hasText: searchValue
        });

        // Within the located row, find the "Beoordelen" button and click it
        const beoordelenButton = rowLocator.locator('button:has-text("Beoordelen")');
        await beoordelenButton.click();
    }

}