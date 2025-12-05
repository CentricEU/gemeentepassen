import {Page} from '@playwright/test';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import {TableFunctions} from "../utils/tableFunctions";
import {BasePage} from "./basePage";

export class GrantsPage extends BasePage {
    // Grants Dashboard Locator
    private static numberOfRows = '.paginator-status .results-text-and-pages-length span:nth-child(2)';
    private static resultsPerPage = '.paginator-results windmill-select';


    static async validateGrantsDashboard(page: Page): Promise<void> {
        try {
            await this.validateDashboardPage(page, NL_translation.general.pages.grants, NL_translation.grants.noData.title, NL_translation.grants.noData.description)
            await this.validateButtonEnabled(page)
        } catch (error) {
            console.error('An error occurred during landing on the page:', error);
            throw error;
        }
    }

    static async validateActionButtonsVisibility(page: Page): Promise<void> {
        const actionButtons = ['Subsidie bewerken', 'Subsidie bekijken', 'Verwijderen'];
        for (const actionButton of actionButtons) {
            await TableFunctions.validateButtonExistence(page, actionButton);
        }
    }

    static async getNrOfRowsFromPagination(page: Page): Promise<number> {
        await page.waitForSelector(this.numberOfRows);
        const nrOfRowsText = await page.locator(this.numberOfRows).innerText();
        return parseInt(nrOfRowsText, 10);
    }

    static async changeResultsPerPage(page: Page, newSize: number): Promise<void> {
        await page.waitForSelector(this.resultsPerPage);
        await page.click(this.resultsPerPage);

        await page.waitForSelector('.select-list');

        const options = await page.$$('.select-list-wrapper windmill-list-item');
        for (const option of options) {
            const textContext = await option.innerText();
            const value = parseInt(textContext.trim(), 10);
            if (value === newSize) {
                await option.click();
                break;
            }
        }
    }

}