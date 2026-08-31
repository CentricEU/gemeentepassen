import { Locator, Page } from "@playwright/test";

export default class WarningModal {
    readonly page: Page;
    readonly acceptWarningBtn: Locator;
    readonly cancelWarningBtn: Locator;
    readonly warningModal: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.acceptWarningBtn = page.locator('span.button-content', { hasText: 'Op pagina blijven' });
        this.cancelWarningBtn = page.locator('frontend-custom-dialog span.button-content', { hasText: 'Annuleren' });
        this.warningModal = page.locator('frontend-custom-dialog');

    }
    async acceptWarning(): Promise<void> {
        await this.acceptWarningBtn.click();
    }

    async cancelWarning(): Promise<void> {
        await this.cancelWarningBtn.click();
    }

    async isWarningModalVisible(): Promise<boolean> {
        return await this.warningModal.isVisible();
    }
}