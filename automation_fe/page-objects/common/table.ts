import { Locator, Page } from "@playwright/test";

export class Table {
    readonly tableBody: Locator;
    readonly tableRows: Locator;
    readonly tableColumns: Locator;

    constructor(page: Page) {
        this.tableBody = page.locator(`tbody`);
        this.tableRows = this.tableBody.locator('tr');
        this.tableColumns = this.tableBody.locator('td');
    }

    async getCellValue(rowIndex: number, columnIndex: number): Promise<string | null> {
        const cell = this.tableRows.nth(rowIndex).locator('td').nth(columnIndex);
        return await cell.textContent();
    }

    async getRowData(row: number, columns: string[]): Promise<Record<string, string>> {
       const rowData: Record<string, string> = {};
       for (let i = 0; i < columns.length; i++) {
       rowData[columns[i]] = (await this.getCellValue(row, i))?.trim() ?? "";
    }
       return rowData;
    }

}