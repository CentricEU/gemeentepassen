import {expect} from '@playwright/test';
import * as userData from '../files/userData.json'
import * as auth from '../api/loginAndLogout';
import defineConfig from '../../playwright.config';
import {cookieHeaders, authHeaders} from '../api/requestHeaders';
import {DataBase} from '../../resources/db/dbConnection';

const db = new DataBase();
const {apiSupplierUrl} = defineConfig.use;

export async function createSupplierUser(page: any, profileData: any, password: string): Promise<void> {
    try {
        const response = await page.request.post(apiSupplierUrl + '/supplier/register', {
            headers: {
                ...cookieHeaders
            },
            data: {
                "firstName": profileData.firstName,
                "lastName": profileData.lastName,
                "companyName": profileData.companyName,
                "kvk": profileData.kvkNumber,
                "tenantId": "bbde06d8-588e-11ee-a286-0a2cd8ba5536",
                "email": profileData.email,
                "password": password,
                "retypedPassword": password,
                "agreedTerms": true
            }
        });

        expect(response.status()).toBe(200);
    } catch (error) {
        console.error('Error creating supplier user:', error);
        throw error;
    }
}

export async function setupSupplierProfile(page: any, profileData: any, token, supplierId): Promise<void> {
    try {
        const response = await page.request.post(apiSupplierUrl + '/supplier-profile', {
            headers: {
                ...authHeaders(token)
            },
            data: {
                "companyName": profileData.companyName,
                "logo": null,
                "kvkNumber": profileData.kvkNumber,
                "ownerName": profileData.ownerName,
                "legalForm": 2,
                "group": 1,
                "category": 2,
                "subcategory": null,
                "adminEmail": profileData.email,
                "companyBranchAddress": profileData.companyBranchAddress,
                "branchProvince": profileData.branchProvince,
                "branchZip": profileData.branchZipCode,
                "branchLocation": profileData.branchLocation,
                "branchTelephone": "",
                "email": "",
                "website": "",
                "accountManager": profileData.accountManager,
                "supplierId": supplierId,
                "latlon": {
                    "latitude": profileData.latitude,
                    "longitude": profileData.longitude
                },
                "workingHours": [{
                    "day": 1,
                    "openTime": "09:00:00",
                    "closeTime": "18:00:00",
                    "isChecked": true
                }]
            }
        });

        expect(response.status()).toBe(200);
    } catch (error) {
        console.error('Error creating supplier user:', error);
        throw error;
    }
}

export async function approveSupplierProfile(page: any, token, supplierId): Promise<void> {
    try {
        const response = await page.request.put(apiSupplierUrl + '/supplier/approve/' + supplierId, {
            headers: {
                ...authHeaders(token)
            }
        });

        expect(response.status()).toBe(204);
    } catch (error) {
        console.error('Error creating supplier user:', error);
        throw error;
    }
}

export async function createSupplierAndSetupProfileWithoutApprove(page: any, setupProfileUser: any, setupProfilePass: string): Promise<void> {
    // Create a supplier user
    await createSupplierUser(page, setupProfileUser, setupProfilePass);

    // Confirm supplier account
    await db.executeQueryFromFile('../../resources/db/updateCreatedUser.sql', [setupProfileUser.email]);

    // Get token and supplier ID from the authentication API
    const {token, supplierId} = await auth.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', setupProfileUser.email,
        setupProfilePass);

    // Setup the supplier profile
    await setupSupplierProfile(page, setupProfileUser, token, supplierId);
}

export async function createApprovedSupplier(page: any, setupProfileUser: any, setupProfilePass: string): Promise<void> {
    // Create a supplier user
    await createSupplierUser(page, setupProfileUser, setupProfilePass);

    // Confirm supplier account
    await db.executeQueryFromFile('../../resources/db/updateCreatedUser.sql', [setupProfileUser.email]);

    // Get token and supplier ID from the authentication API
    const {token: supplierToken, supplierId} = await auth.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', setupProfileUser
            .email,
        setupProfilePass);

    // Setup the supplier profile
    await setupSupplierProfile(page, setupProfileUser, supplierToken, supplierId);

    // Get token of municipality user from the authentication API
    const {token: tokenMunicipality} = await auth.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_MUNICIPALITY_ADMIN', userData
            .municipality
            .username,
        userData.municipality.password);

    // Approve supplier user
    await approveSupplierProfile(page, tokenMunicipality, supplierId);
}
