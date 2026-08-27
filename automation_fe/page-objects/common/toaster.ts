import { type Locator, type Page } from '@playwright/test';

export class Toaster{
    readonly page : Page;
    readonly toaster : Locator;
    readonly toasterMessage : Locator

    constructor(page : Page){
        this.page=page;
        this.toaster = page.locator('centric-toastr');
        this.toasterMessage = this.toaster.locator('xpath=//div[contains(@class, "toast-message")]');
    }

    async getToasterMessage() : Promise<string>{
        const text = await this.toasterMessage.textContent();
        return text ?? "";
    }
}