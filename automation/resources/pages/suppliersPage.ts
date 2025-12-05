import {BasePage} from "./basePage";
import {Page} from "@playwright/test";

export class SuppliersPage extends BasePage {
    static async clickOnTab(page: Page, tabName: string): Promise<void> {
        const tabElement = page.locator(`.mdc-tab__text-label:has-text("${tabName}")`);
        await tabElement.click();
    }

}