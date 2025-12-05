import {expect, Page} from '@playwright/test';

export class LoginPage {
    // Locators
    private static loginBtbLocator = 'button .button-content';
    private static userNameLocator = '[formcontrolname="email"]';
    private static passwordLocator = '[formcontrolname="password"]';
    private static rememberMeLocator = '[formcontrolname="rememberMe"] input[type="checkbox"]';
    private static forgotPasswordLocator = 'a.centric-inner-button.link.small';

    // Login into Application
    static async loginIntoApp(page: Page, userName: string, password: string): Promise<void> {
        try {
            // Check if the Login button is disabled
            const loginButton = page.locator(this.loginBtbLocator);
            await expect(loginButton).toBeDisabled();

            // Enter the email and password
            await page.click(this.userNameLocator);
            await page.type(this.userNameLocator, userName);

            await page.click(this.passwordLocator);
            await page.type(this.passwordLocator, password, {parseSpecialCharSequences: false});

            // Toggle the rememberMe checkbox
            const rememberMeCheckbox = page.locator(this.rememberMeLocator);
            await expect(rememberMeCheckbox).not.toBeChecked();
            await rememberMeCheckbox.click();

            // Check the Forgot Password visibility and href attribute
            const forgotPasswordLink = page.locator(this.forgotPasswordLocator);
            await expect(forgotPasswordLink).toBeVisible();
            await expect(forgotPasswordLink).toHaveAttribute('href', '/recover');

            // Click the login button
            await page.click(this.loginBtbLocator);
        } catch (error) {
            console.error('An error occurred during login:', error);
            throw error; // Rethrow the error to indicate test failure
        }
    }

    static async loginIntoAppWithValidation(page: Page, userName: string, password: string): Promise<void> {
        await this.loginIntoApp(page, userName, password);
        await expect(page.locator('frontend-dashboard .welcome')).toBeVisible();
    }
}
