import {Page} from '@playwright/test';
import {BasePage} from "./basePage";
import * as NL_translation from '../../resources/files/i18n/nl-NL';

export class OffersPage extends BasePage {
    // Offers Dashboard Locator

    static async validateOffersDashboard(page: Page): Promise<void> {
        try {
            await this.validateDashboardPage(page, NL_translation.general.pages.offers, NL_translation.offer.noData.title, NL_translation.offer.noData.description)
            await this.validateButtonEnabled(page)
        } catch (error) {
            console.error('An error occurred during landing on the page:', error);
            throw error;
        }
    }

}