import { Locator, Page } from "@playwright/test";

export class Dropdown {
    readonly page: Page;
    readonly searchInput: Locator;
    private dropdownLocator: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchInput = page.locator('windmill-dropdown-search-list input.input-element');
        this.dropdownLocator = page.locator('windmill-dropdown-search');
        
    }

    async selectAndCloseDropdown(): Promise<void> {
        await this.dropdownLocator.click();
        await this.page.keyboard.press('Escape');
    }

    async selectDropdown(optionText: string): Promise<void> {
        await this.dropdownLocator.click();
        await this.page.locator(`windmill-item-list span.list-item-name:has-text("${optionText}")`).click();
    }

    async selectSearchOption(searchText: string): Promise<void> {
        await this.dropdownLocator.click();
        await this.searchInput.waitFor({ state: 'visible' });
        await this.searchInput.fill(searchText);
        const option = this.page.locator('ul.dropdown-content-list span.list-item-name', { hasText: searchText });
        await option.waitFor({ state: 'visible' });
        await option.click();
}


}