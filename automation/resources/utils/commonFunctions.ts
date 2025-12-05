import {Page, expect} from '@playwright/test';

export class CommonFunctions {
    static async generateRandomPassword(page: Page, length = 10): Promise<string> {
        const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const allCharacters = uppercaseLetters + lowercaseLetters + digits + symbols;

        let password = '';

        // Ensure at least one character from each category
        password += await this.getRandomCharacter(page, uppercaseLetters);
        password += await this.getRandomCharacter(page, digits);
        password += await this.getRandomCharacter(page, symbols);

        // Generate the remaining characters
        for (let i = password.length; i < length; i++) {
            password += await this.getRandomCharacter(page, allCharacters);
        }

        // Ensure password is not empty before performing split
        if (password) {
            // Shuffle the password characters
            password = password.split('').sort(() => Math.random() - 0.5).join('');
        } else {
            console.log('Password is empty or undefined.');
        }

        return password;
    }

    static async clickAndType(page: Page, locator: string, value: any): Promise<void> {
        const element = page.locator(locator);
        if (element) {
            const inputElement = element.locator('input');
            await inputElement.clear();
            await inputElement.type(value);
        } else {
            console.error(`Could not find the input element for ${locator}`);
        }
    }

    static async selectValueFromDropdownList(page: Page, dropdownLocator: string, valueSelected: string): Promise<void> {
        // Click the dropdown-like input to open the options
        await page.click(dropdownLocator);

        // Optionally, click the specific option once it appears in the dropdown
        const optionLocator = `.item-list-container >> text="${valueSelected}"`;
        await page.click(optionLocator);
    }

    static async getTextElement(page: Page, locator: string): Promise<string> {
        const element = page.locator(locator);
        if (element) {
            const text = await element.innerText();
            return text.trim();
        } else {
            console.error(`Could not find the text element for ${locator}`);
        }
    }

    static async validateMessageToaster(page: Page, message: string): Promise<void> {
        try {
            await page.waitForSelector('.centric-toast-container', {timeout: 5000});

            const element = page.locator('.centric-toast-container');
            const text = await element.innerText();
            expect(text).toContain(message);
        } catch (error) {
            console.error('Error:', error);
            console.error(`Could not find the message for element .centric-toast-container within the timeout.`);
        }
    }

    static async validateErrorMessage(page: Page, expectedMessages: string | string[]): Promise<void> {
        // Locate all elements with the specified selector
        const elements = await page.locator('.centric-error-message').all();

        if (elements.length > 0) {
            // Loop through each element and validate the error message
            for (let i = 0; i < elements.length; i++) {
                const text = await elements[i].innerText();
                const expectedMessage = expectedMessages[i];
                expect(text).toContain(expectedMessage);
            }
        } else {
            console.error(`Cannot find the message for element ${elements}`);
        }
    }

    static async generateRandomNumber(length: number): Promise<number> {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Function to format date in 'DD/MM/YYYY' format
    static async formatDate(date: Date): Promise<string> {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Function to format date to YYYY-MM-DDTHH:mm:ss.sssZ
    static async formatISODate(date: Date): Promise<string> {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
    }

    static async getTodayAndFutureDate(daysLater: number): Promise<{ today: string, futureDate: string }> {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + daysLater);
        return {
            today: await this.formatDate(today),
            futureDate: await this.formatDate(futureDate)
        };
    }

    static async navigateToPage(page: Page, pageButton: string): Promise<void> {
        const nextPageButton = page.locator('.next-page-button');
        const lastPageButton = page.locator('.last-page-button');
        const firstPageButton = page.locator('.first-page-button');
        const previousPageButton = page.locator('.previous-page-button');

        const currentPage = await this.getCurrentPageNumber(page);

        switch (pageButton) {
            case 'first':
                if (currentPage !== 1) {
                    await firstPageButton.click();
                }
                break;
            case 'last':
                await lastPageButton.click();
                break;
            case 'next':
                await nextPageButton.click();
                break;
            case 'previous':
                await previousPageButton.click();
                break;
            default:
                throw new Error('Invalid page number');
        }
    }

    static async getCurrentPageNumber(page: Page): Promise<number> {
        const paginationStatus = await page.locator('.paginator-status').innerText();
        const [start] = paginationStatus.split('-').map((str) => parseInt(str.trim(), 10));
        return start;
    }

    static async checkCheckboxByLabel(page: Page, label: string) {
        const checkboxLabel = page.locator(`label:has-text("${label}")`);

        if (!await checkboxLabel.isVisible()) {
            throw new Error(`Checkbox label with text "${label}" not found`);
        }

        const checkboxId = await checkboxLabel.getAttribute('for');
        const checkboxInput = page.locator(`#${checkboxId}`);

        const isChecked = await checkboxInput.isChecked();

        // Click the checkbox if it is not checked
        if (!isChecked) {
            await checkboxInput.click();
            console.log(`Checkbox with label "${label}" has been checked`);
        } else {
            console.log(`Checkbox with label "${label}" is already checked`);
        }
    }

    static async selectRadioOptionByLabel(page: Page, label: string) {
        const radioInput = page.locator(`label:has-text("${label}")`);
        await radioInput.waitFor({state: 'visible', timeout: 10000});

        // await radioInput.scrollIntoViewIfNeeded();
        await radioInput.click({force: true});
        console.log(`Radio button with label "${label}" has been selected`);
    }

    private static async getRandomCharacter(page: Page, characters: string): Promise<string> {
        return (await page.evaluate(chars => chars.charAt(Math.floor(Math.random() * chars.length)), characters));
    }

}

