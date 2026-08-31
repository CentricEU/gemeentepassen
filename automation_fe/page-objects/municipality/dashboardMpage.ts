import { type Locator, type Page } from '@playwright/test';

export class DashboardMpage{
    readonly page : Page;
    readonly logoutButton : Locator;

    constructor(page : Page){
        this.page=page;     
        this.logoutButton = page.locator('span.button-content');
    }
}
