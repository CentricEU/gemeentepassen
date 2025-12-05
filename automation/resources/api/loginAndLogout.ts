import {expect} from '@playwright/test';
import defineConfig from '../../playwright.config';
import {commonHeaders, authHeaders} from '../api/requestHeaders';

const {apiSupplierUrl} = defineConfig.use;

export async function getTokenAndSupplierIdFromAuthentication(page: any, role: string, email: string, password: string): Promise<{
    token: string,
    supplierId: number
}> {
    try {
        const response = await page.request.post(apiSupplierUrl + '/authenticate', {
            headers: {
                ...commonHeaders
            },
            data: {
                "username": email,
                "password": password,
                "role": role,
                "reCaptchaResponse": "",
                "rememberMe": true
            }
        });

        // Check if the response status is 200 OK
        if (response.status() !== 200) {
            throw new Error(`Failed to authenticate. Status: ${response.status()}`);
        }

        // Parse the JSON response body
        const responseBody = await response.json();

        // Extract the token from the response body
        const token = responseBody.token;

        // Decode the token to extract supplierId
        const decodedToken = decodeToken(token);
        const supplierId = decodedToken.supplierId;

        // Return the token and supplierId
        return {token, supplierId};
    } catch (error) {
        console.error('Error creating supplier user:', error);
        throw error;
    }
}

// Function to decode the JWT token
function decodeToken(token: string): any {
    const [, payloadBase64] = token.split('.');
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString();
    return JSON.parse(payloadJson);
}

export async function logoutUser(page: any, token: string): Promise<void> {
    try {
        const response = await page.request.post(apiSupplierUrl + '/logout', {
            headers: {
                ...authHeaders(token)
            }
        });

        expect(response.status()).toBe(200);
    } catch (error) {
        console.error('Error creating supplier user:', error);
        throw error;
    }
}