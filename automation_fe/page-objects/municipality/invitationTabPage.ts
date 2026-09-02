import { Locator, Page } from "@playwright/test";
import { BasePage } from "../common/basePage";
import { sendInvitationTestData } from "../../utils/test-data";

export default class InvitationTabPage extends BasePage {   
    readonly page : Page;
    readonly inviteSuppliersBtn : Locator;
    readonly invitationMessage : Locator;
    readonly emailInput : Locator;
    readonly cancelBtn : Locator;
    readonly sendInvitationBtn : Locator;
    
    
    constructor(page : Page){
        super(page);
        this.page=page;     
        this.inviteSuppliersBtn = page.locator('button:has-text(" Nodig aanbieders uit ")');
        this.invitationMessage = page.locator('centric-textarea2[formcontrolname="invitationMessage"] textarea');
        this.emailInput = page.locator('windmill-input[formcontrolname="email"] input');
        this.cancelBtn = page.locator('button:has-text(" Annuleren ")');
        this.sendInvitationBtn = page.locator('button:has-text(" Uitnodiging versturen ")');
    }

    async clickInviteSuppliersBtn() : Promise<void>{
        await this.inviteSuppliersBtn.click();
    }

     async isSendInvitationButtonEnabled(): Promise<boolean> {
        return await this.sendInvitationBtn.isEnabled();
    }

    async isSendInvitationButtonDisabled(): Promise<boolean> {
        return await this.sendInvitationBtn.isDisabled();
    }

    async fillInvitationForm(): Promise<void> {
        await this.invitationMessage.fill(sendInvitationTestData.message);
        await this.emailInput.fill(sendInvitationTestData.email);
        await this.emailInput.press('Enter');
    }

    async clickCancelButton(): Promise<void> {
        await this.cancelBtn.click();
    }
}