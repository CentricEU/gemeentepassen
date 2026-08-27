import { Page, expect } from '@playwright/test';

/**
 * Custom assertion helpers
 */
export class AssertionHelper {
  /**
   * Assert page title contains expected text
   */
  static async assertPageTitle(page: Page, expectedTitle: string): Promise<void> {
    await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }

  /**
   * Assert URL matches pattern
   */
  static async assertUrlMatches(page: Page, pattern: string): Promise<void> {
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*');
    await expect(page).toHaveURL(new RegExp(regexPattern));
  }

  /**
   * Assert element is visible
   */
  static async assertElementVisible(page: Page, selector: string): Promise<void> {
    await expect(page.locator(selector)).toBeVisible();
  }

  /**
   * Assert element contains text
   */
  static async assertElementText(page: Page, selector: string, text: string): Promise<void> {
    await expect(page.locator(selector)).toContainText(text);
  }
}
