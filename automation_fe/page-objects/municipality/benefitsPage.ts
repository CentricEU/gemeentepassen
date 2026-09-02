import { type Locator, type Page } from '@playwright/test';
import { expect } from "@playwright/test";

export class Benefits{
    readonly page : Page;
    readonly createBenefitbtn: Locator
    readonly name: Locator
    readonly description: Locator
    readonly amount: Locator
    readonly startDate: Locator
    readonly endDate: Locator
    readonly cancelBtn: Locator
    readonly saveBtn: Locator
   

    constructor(page : Page){
        this.page=page;
        this.createBenefitbtn=page.locator("button[aria-label='Tegoed aanmaken']");     
        this.name=page.locator('input#benefit-name-id ')
        this.description=page.locator('textarea#benefit-description-id');
        this.amount=page.locator('input#benefit-amount-id');
        this.startDate=page.locator('input#benefit-start-date-id');
        this.endDate=page.locator('input#benefit-expiration-date-id')
        this.cancelBtn=page.locator('button:has-text(" Annuleren ")');
        this.saveBtn=page.locator('button:has-text(" Opslaan ")');

    }

   
   async clickCreateBenefitsButton(): Promise<void> {
        await this.createBenefitbtn.click();
    }

    async clickCancelButton(): Promise<void> {
        await this.cancelBtn.click();
    } 

    async fillMandatoryFieldsWithData(BenefitInfo: { name: string; amount: string; startDate: string; endDate: string; citizenGroup: string; description: string }): Promise<void> {
        await this.name.fill(BenefitInfo.name);
        await this.amount.fill(BenefitInfo.amount);
        await this.startDate.fill(BenefitInfo.startDate);
        await this.endDate.fill(BenefitInfo.endDate);
        await this.clickCheckbox(this.page, BenefitInfo.citizenGroup);
        await this.description.fill(BenefitInfo.description);
    }

    async isSaveButtonEnabled(): Promise<boolean> {
        return await this.saveBtn.isEnabled();
    }

    async isSaveButtonDisabled(): Promise<boolean> {
        return await this.saveBtn.isDisabled();
    }

    async clickCheckbox(page: Page, labelText: string) {
       const checkbox = page.locator('windmill-checkbox', { hasText: labelText }).first();
       await expect(checkbox).toBeVisible();
       await checkbox.locator('input[type="checkbox"]').click({ force: true });
    }

    async addBenefit(BenefitInfo: { name: string; amount: string; startDate: string; endDate: string; citizenGroup: string; description: string }): Promise<void> {
        await this.clickCreateBenefitsButton();
        await this.fillMandatoryFieldsWithData(BenefitInfo);
        await this.saveBtn.click();
    }

  
}






