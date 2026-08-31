import { Locator, Page } from "@playwright/test";

export class Input {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;

    }

    async clearInput(locator: Locator): Promise<void> {
        await locator.clear();
        await locator.blur();
    }

    async fillAndClearInput(inputLocator: Locator, text: string): Promise<void> {
        await inputLocator.fill(text);
        await inputLocator.clear();
        await inputLocator.blur();
    }
}