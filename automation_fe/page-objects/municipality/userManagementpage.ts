import { type Locator, type Page } from '@playwright/test';
import { userManagementTestData } from '../../utils/test-data';

export class UserManagementPage{
    readonly page : Page;
    readonly addUserButton : Locator;
    readonly emailInput : Locator;
    readonly firstNameInput : Locator;
    readonly lastNameInput : Locator;
    readonly createUserButton : Locator;
    readonly cancelButton : Locator;
    readonly superAdminRoleCheckbox : Locator;

    constructor(page : Page){
        this.page=page;     
        this.addUserButton = page.locator('button[aria-label="Nieuwe gebruiker"]');
        this.firstNameInput = page.locator('windmill-input[formcontrolname="firstName"] input');
        this.lastNameInput = page.locator('windmill-input[formcontrolname="lastName"] input');
        this.emailInput = page.locator('input[type="email"]');
        this.createUserButton = page.locator('button:has-text(" Maak gebruiker aan ")');
        this.cancelButton = page.locator('button:has-text(" Annuleren ")');
        this.superAdminRoleCheckbox = page.locator('input[type="checkbox"][id="isSuperAdmin"]');
    }

    async addUser(): Promise<void> {
        await this.addUserButton.click();
        await this.firstNameInput.fill(userManagementTestData.firstName);
        await this.lastNameInput.fill(userManagementTestData.lastName);
        await this.emailInput.fill(userManagementTestData.email);
        await this.createUserButton.click();
    }

    async clickAddUserButton(): Promise<void> {
        await this.addUserButton.click();
    }

    async clickCancelButton(): Promise<void> {
        await this.cancelButton.click();
    }

    async addSuperAdminUser(): Promise<void> {
        await this.addUserButton.click();
        await this.firstNameInput.fill(userManagementTestData.firstName);
        await this.lastNameInput.fill(userManagementTestData.lastName);
        await this.emailInput.fill(userManagementTestData.email);
        await this.superAdminRoleCheckbox.check();
        await this.createUserButton.click();
    }



}