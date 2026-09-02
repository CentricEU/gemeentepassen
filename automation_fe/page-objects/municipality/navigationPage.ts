import { type Locator, type Page } from '@playwright/test';
import { Benefits } from './benefitsPage';
import { UserManagementPage } from './userManagementpage';
import InvitationTabPage from './invitationTabPage';


export class NavigationPage {
  readonly page: Page;
  readonly benefits: Locator;
  readonly userManagement: Locator;
  readonly supplier: Locator;
  readonly invitationTab: Locator;
  readonly supplierPage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.benefits = page.locator('span.menu-item-text', { hasText: 'Tegoeden' });
    this.userManagement = page.locator('span.menu-item-text', { hasText: 'Gebruikersbeheer' });
    this.supplier = page.locator('span.menu-item-text', { hasText: 'Aanbieders' });
    this.supplierPage = page.locator('a[href="/suppliers"]');
    this.invitationTab = page.locator('button span:has-text("Uitnodigingen")');
  }

  async goToBenefitsPage(): Promise<Benefits> {
    await this.benefits.click();
    return new Benefits(this.page);
  }

  async goToUserManagementPage(): Promise<UserManagementPage> {
    await this.userManagement.click();
    return new UserManagementPage(this.page);
  }

  async goToInvitationTab(): Promise<InvitationTabPage> {
    await this.supplier.click();
    await this.supplierPage.click();
    await this.invitationTab.click();
    return new InvitationTabPage(this.page);
  }
}