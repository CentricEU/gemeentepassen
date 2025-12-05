import {BasePage} from "../pages/basePage";
import {expect, Page} from "@playwright/test";
import * as faker from 'faker';

export class InvitationModal extends BasePage {
    private static locators = {
        invitationMessageLocator: 'textarea',
        emailLocator: 'windmill-input[formcontrolname="email"] input.input-element',
        sendInviteButton: '[ng-reflect-ng-class="button-default"] .button-content',
        emailListLocator: '.centric-chips-list'
    }

    static async sendInvitation(page: Page, email: string): Promise<void> {
        await this.fillInvitationForm(page, [email]);
        await this.submitInvitation(page);
    }

    static async sendInvitations(page: Page, emails: string[]): Promise<void> {
        await this.fillInvitationForm(page, emails);
        await this.submitInvitation(page);
    }

    static async resendInvitation(page: Page, email: string): Promise<void> {
        const inviteMessage = faker.lorem.paragraph();
        await page.locator(this.locators.invitationMessageLocator).fill(inviteMessage);

        expect(page.locator(`.centric-chip-container .chip-content span[title="${email}"]`)).toBeTruthy();
        await this.submitInvitation(page);
    }

    static async clickSendAgainButtonForEmail(page: Page, email: string, buttonName: string): Promise<void> {
        await page.waitForSelector('tbody tr');
        const rows = await page.$$('tbody tr');

        for (const row of rows) {
            const emailCell = await row.$('td.cdk-column-email');
            const emailText = await emailCell.innerText();

            if (emailText.trim() === email) {
                const sendAgainButton = await row.$(`.button-content:has-text("${buttonName}")`);
                if (sendAgainButton) {
                    await sendAgainButton.click();
                    break;
                }
            }
        }
        await page.locator(this.locators.emailListLocator).waitFor({state: 'visible'});
    }

    private static async fillInvitationForm(page: Page, emails: string[]): Promise<void> {
        const inviteMessage = faker.lorem.paragraph();
        await page.locator(this.locators.invitationMessageLocator).fill(inviteMessage);

        const emailInputLocator = page.locator(this.locators.emailLocator);

        await emailInputLocator.waitFor({state: 'visible'});
        for (const email of emails) {
            await emailInputLocator.fill(email);
            await emailInputLocator.press('Enter', {timeout: 2000});
            await page.locator(this.locators.emailListLocator).waitFor({state: 'visible'});
            const emailChipLocator = page.locator(`.centric-chip-container .chip-content span[title="${email}"]`);
            await expect(emailChipLocator).toHaveCount(1);
        }
    }

    private static async submitInvitation(page: Page): Promise<void> {
        const sendInviteButton = page.locator(this.locators.sendInviteButton).filter({hasText: 'Uitnodiging versturen'});
        await sendInviteButton.waitFor({state: 'visible'});
        await sendInviteButton.click();
    }
}
