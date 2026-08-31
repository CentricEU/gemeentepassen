import { Page } from "@playwright/test";


export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async refresh(): Promise<void> {
    await this.page.reload();
  }
}