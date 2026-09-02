import { Locator, Page } from "@playwright/test";

export class Errors {
    readonly page: Page;
    readonly errorText: Locator
    private alert: Locator;

    constructor(page: Page) {
        this.page = page;
        this.errorText = page.locator('div.states-messages span.centric-error-message');
        this.alert = page.locator('centric-alert');

    }

    async getErrorText(): Promise<string> {
        return this.errorText.innerText();
    }

    async getErrorByIndex(index: number): Promise<string> {
        return await this.errorText.nth(index).innerText();
    }

    async getAlertType(): Promise<string | null> {
        await this.alert.waitFor({ state: 'visible' });
        return await this.alert.locator('div.centric-alert').getAttribute('class');
  }

}