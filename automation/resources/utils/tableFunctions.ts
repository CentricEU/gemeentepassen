import {expect, Page} from "@playwright/test";

export class TableFunctions {
    static async countRows(page: Page): Promise<number> {
        await page.waitForSelector('tbody tr');
        const tableBody = await page.$$('tbody tr');
        return tableBody.length;
    }

    static async validateValueInTable(page: Page, value: string, columnIndex: number): Promise<boolean> {
        await page.waitForSelector('tbody tr');
        const rows = await page.$$('tbody tr');
        for (const row of rows) {
            const cell = await row.$(`td:nth-child(${columnIndex})`)
            const cellValue = await cell.innerText();
            if (cellValue.trim() === value) {
                return true;
            }
        }
        return false;
    }

    static async validateButtonExistence(page: Page, buttonAriaLabel: string): Promise<void> {
        const buttonLocator = page.locator(`button[aria-label="${buttonAriaLabel}"]`).first();
        await expect(buttonLocator).toBeVisible({timeout: 5000});
    }

    static async clickButtonForSpecificValue(page: Page, value: string, buttonAriaLabel: string): Promise<void> {
        await page.waitForSelector('tbody tr');
        const rows = await page.$$('tbody tr');
        for (const row of rows) {
            const nameCell = await row.$('td:nth-child(2)')
            const nameCellValue = await nameCell.innerText();
            if (nameCellValue.trim() === value) {
                const button = await row.$(`button[aria-label="${buttonAriaLabel}"]`);
                if (button) {
                    await button.click();
                    break;
                }
            }
        }
    }

}