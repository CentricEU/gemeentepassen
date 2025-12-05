import {expect, Page} from '@playwright/test';
import defineConfig from '../../playwright.config';
import {authHeaders} from './requestHeaders';
import {CommonFunctions} from '../utils/commonFunctions';
import * as faker from 'faker';

const {apiSupplierUrl} = defineConfig.use;

export async function createGrant(page: Page, token: string): Promise<string> {
    try {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 5);

        const randomNr = await CommonFunctions.generateRandomNumber(4);
        const productName = faker.commerce.product();
        const productDescription = faker.commerce.productDescription();

        const response = await page.request.post(apiSupplierUrl + '/grant', {
            headers: {
                ...authHeaders(token)
            },
            data: {
                "title": productName,
                "description": productDescription,
                "amount": randomNr,
                "createFor": "PASS_OWNER",
                "startDate": today,
                "expirationDate": futureDate
            }
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        return responseBody.id;
    } catch (error) {
        console.error('Error creating supplier user:', error);
        throw error;
    }
}