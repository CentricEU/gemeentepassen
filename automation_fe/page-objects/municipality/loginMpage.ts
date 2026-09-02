import { Locator, Page } from "@playwright/test";
import { BasePage } from "../common/basePage";
import { Toaster } from "../common/toaster";

export default class LoginMPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('windmill-input[formcontrolname="email"] input');
    this.passwordInput = page.locator('windmill-input[formcontrolname="password"] input');
    this.loginButton = page.locator('button.centric-inner-button');
  }
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getToasterMessage() : Promise<string>{
          const toaster = new Toaster(this.page);
          return toaster.getToasterMessage();
  }

  
}