import {BasePage} from "./basePage";
import {Page} from "@playwright/test";
import * as NL_translation from '../../resources/files/i18n/nl-NL';

export class InvitationsPage extends BasePage {
    static async validateInvitationsDashboard(page: Page): Promise<void> {
        const expectedBreadcrumbs = [NL_translation.general.pages.dashboard, NL_translation.general.pages.suppliers];
        await this.validateBreadcrumbs(page, expectedBreadcrumbs)

        await this.validateButtonEnabled(page)
    }
}