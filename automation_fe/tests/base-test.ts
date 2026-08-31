import {defineConfig, type Page } from '@playwright/test';
import { Applications } from '../utils/enums/applications.enum';
import { getBaseUrl } from '../utils/test-utils';

export class BaseTest{

    static async navigateToHomePage(page: Page, application : Applications){
        const applicationUrl = getBaseUrl(application);
        defineConfig({
            use: {
                baseURL: applicationUrl
            }
        });
        await page.goto(applicationUrl);
    }

}