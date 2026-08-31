import { Locator, Page } from "@playwright/test";

export default class LogoutPage {
    readonly page: Page;
    readonly logoutButton: Locator;
    constructor(page: Page) {
        this.page = page;
        this.logoutButton = page.locator('span.button-content', { hasText: 'Uitloggen' });
    }
    async logout(): Promise<void> {
        await this.logoutButton.click();
    }
}