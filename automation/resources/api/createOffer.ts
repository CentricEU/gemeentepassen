import {expect, Page} from '@playwright/test';
import defineConfig from '../../playwright.config';
import {authHeaders} from './requestHeaders';
import * as faker from 'faker';
import {createGrant} from "./createGrant";
import * as api from "./loginAndLogout";
import * as userData from '../files/userData';

const {apiSupplierUrl} = defineConfig.use;

export async function createOfferWithGrants(page: Page, token: string, grantsIds: string[]): Promise<void> {
    try {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 10);

        const productName = faker.commerce.product();
        const productDescription = faker.commerce.productDescription();

        const response = await page.request.post(apiSupplierUrl + '/offer', {
            headers: {
                ...authHeaders(token)
            },
            data: {
                "title": productName,
                "description": productDescription,
                "citizenOfferType": "CITIZEN_WITH_PASS",
                "offerTypeId": 0,
                "startDate": today,
                "expirationDate": futureDate,
                "grantsIds": grantsIds
            }
        });

        expect(response.status()).toBe(200);
    } catch (error) {
        console.error('Error creating supplier user:', error);
        throw error;
    }
}

export async function createGrantsAndOffer(page: Page, nrOfGrants: number): Promise<void> {
    try {
        // Authenticate as Municipality Admin to create grants
        const {token: municipalityToken} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_MUNICIPALITY_ADMIN', userData.municipality.username, userData.municipality.password);

        // Create grants and collect their IDs
        const grantIds: string[] = [];
        for (let i = 0; i < nrOfGrants; i++) {
            const grantId = await createGrant(page, municipalityToken);
            grantIds.push(grantId);
        }

        // Authenticate as Supplier to create offers
        const {token: supplierToken} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', userData.supplier.username, userData.supplier.password);

        // Use the grant IDs to create an offer
        await createOfferWithGrants(page, supplierToken, grantIds);
    } catch (error) {
        console.error('Error in createGrantsAndOffer:', error);
        throw error;
    }
}