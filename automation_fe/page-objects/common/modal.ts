import { Locator, Page } from "@playwright/test";

export class Modal {
    readonly page: Page;
    private title: Locator;

    constructor(page: Page) {
        this.page = page;
        this.title = page.locator('h3');
    }

    async getTitle(): Promise<string> {
        return await this.title.textContent() ?? '';
    }
}