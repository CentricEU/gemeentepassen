import { type Locator, type Page } from "@playwright/test";

export class GroupCategories {
  readonly page: Page;
  readonly categoryCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryCard = page.locator(".category-card");
  }

  async getCategoryCount(): Promise<number> {
    await this.categoryCard.first().waitFor({ state: "visible" });
    return this.categoryCard.count();
  }

  async getCategoryDetails(index: number): Promise<{
    title: string;
    ageGroup: string;
    dependentChildren: string;
    maxIncome: string;
  }> {
    const categoryCard = this.categoryCard.nth(index);
    const title = await categoryCard.locator(".title").innerText();
    const ageGroup = await categoryCard
      .locator("p.detail-item", { hasText: /Leeftijdsgroep/ })
      .innerText();
    const dependentChildren = await categoryCard
      .locator("p.detail-item", { hasText: /Ten laste kinderen/ })
      .innerText();
    const maxIncome = await categoryCard
      .locator("p.detail-item", { hasText: /Max. inkomen/ })
      .innerText();
    return { title, ageGroup, dependentChildren, maxIncome };
  }

  async selectCategory(index: number): Promise<void> {
    const categoryCard = this.categoryCard.nth(index);
    await categoryCard.click();
  }

  async isCategorySelected(index: number): Promise<boolean> {
    const categoryCard = this.categoryCard.nth(index);
    const classAttribute = await categoryCard.getAttribute("class");
    return classAttribute?.includes("selected") ?? false;
  }
}
