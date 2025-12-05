import {expect, Page} from '@playwright/test';
import {TableFunctions} from "../utils/tableFunctions";

export class BasePage {
    protected static titlePage = '.panel-header';
    protected static welcomeTitle = 'h4';
    protected static welcomeMessage = 'p';
    protected static actionButton = '.no-data-description > .button-default';
    protected static modalTitle = 'h3';
    private static fromDatePickerLocator = 'windmill-date-picker[formcontrolname="startDate"] input.mat-datepicker-input';
    private static toDatePickerLocator = 'windmill-date-picker[formcontrolname="expirationDate"] input.mat-datepicker-input';
    private static breadcrumbs = '.breadcrumbs-container li a';

    static async validateDashboardPage(page: Page, titleTranslation: string | null, welcomeTitleTranslation: string, welcomeMessageTranslation: string): Promise<void> {
        if (titleTranslation) {
            return;
        }
        const titlePageCount = await page.locator(this.titlePage).count();
        if (titlePageCount > 0) {
            await expect(page.locator(this.titlePage)).toContainText(titleTranslation);
        }
        await expect(page.locator(this.welcomeTitle)).toContainText(welcomeTitleTranslation);
        await expect(page.locator(this.welcomeMessage)).toContainText(welcomeMessageTranslation);
    }

    static async validateBreadcrumbs(page: Page, expectedBreadcrumbs: string[]): Promise<void> {
        const breadcrumbItems = page.locator(this.breadcrumbs);

        const breadcrumbCount = await breadcrumbItems.count();
        expect(breadcrumbCount).toBe(expectedBreadcrumbs.length);

        for (let i = 0; i < breadcrumbCount; i++) {
            const breadcrumbText = await breadcrumbItems.nth(i).innerText();
            expect(breadcrumbText.trim()).toBe(expectedBreadcrumbs[i]);
        }
    }

    static async validateButtonEnabled(page: Page): Promise<void> {
        await expect(page.locator(this.actionButton)).toBeEnabled();
    }

    static async validateActionButtonsVisibility(page: Page, actionButtons: string[]): Promise<void> {
        for (const actionButton of actionButtons) {
            await TableFunctions.validateButtonExistence(page, actionButton);
        }
    }

    static async clickButtonFromWelcomePage(page: Page, modalTitle: string): Promise<void> {
        const actionButton = page.locator(this.actionButton);
        await actionButton.click();
        await expect(page.locator(this.modalTitle)).toContainText(modalTitle);
    }

    static async selectRadioButton(page: Page, groupName: string, value: string): Promise<void> {
        const radioGroupLocator = page.locator(`centric-radio-group[formcontrolname="${groupName}"]`);
        const radioButtonLocator = radioGroupLocator.locator(`input[type="radio"][value="${value}"]`);

        await radioButtonLocator.click();
    }

    static async selectDateRange(page: Page, fromDate: string, toDate: string): Promise<void> {
        await this.selectDate(page, this.fromDatePickerLocator, fromDate);
        await this.selectDate(page, this.toDatePickerLocator, toDate);
    }

    private static async selectDate(page: Page, locator: string, date: string): Promise<void> {
        try {
            await page.click(locator);

            const datePickerInput = page.locator(locator);
            if (!datePickerInput) {
                throw new Error(`Date picker input element not found for locator: ${locator}`)
            }

            await datePickerInput.fill('');
            await datePickerInput.fill(date);
        } catch (error) {
            console.error('Error selecting date:', error);
            throw error;
        }
    }


}