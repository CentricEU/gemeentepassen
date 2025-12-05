import {expect, Page} from '@playwright/test';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import {DownloadFile} from "../utils/downloadFile";

export class DashboardSupplier {
    private static qrCodeTitle = '.panel-content div';
    private static qrCodeMessage = '.panel-content > p';
    private static qrCodeImage = 'section > img[alt="QR Code"]';
    private static closeRequestApprovedPopup = '.close-button';
    private static downloadQRCode = '.panel-content centric-button';

    static async validateApprovalInfo(page: Page): Promise<void> {
        const approvalInfo = NL_translation.setupProfile.successfulInfoMessage
        await expect(page.locator('.message-content div')).toHaveText(approvalInfo);
    }

    static async validateQrCodeBeforeApproval(page: Page): Promise<void> {
        const qrCodeMessageInfoBeforeApproval = NL_translation.dashboard.offer.textPending

        await page.waitForSelector(this.qrCodeTitle, {state: 'visible'});
        await expect(page.locator(this.qrCodeTitle)).toHaveText('QR-code');
        await expect(page.locator(this.qrCodeMessage)).toHaveText(qrCodeMessageInfoBeforeApproval);

        await expect(page.locator(this.qrCodeImage)).toHaveAttribute('src', '/assets/images/QR_empty.svg');
        await expect(page.locator(this.downloadQRCode)).toBeHidden();
    }

    static async validateQrCodeAfterApproval(page: Page): Promise<void> {
        const qrCodeMessageInfoAfterApproval = NL_translation.dashboard.offer.textApproved;
        const expectedPartialLink = 'blob:https://supplier.localforlocal.io';

        await page.waitForSelector(this.closeRequestApprovedPopup, {state: 'visible'});
        await page.click(this.closeRequestApprovedPopup);

        await expect(page.locator(this.qrCodeMessage)).toHaveText(qrCodeMessageInfoAfterApproval);
        const qrCodeImage = page.locator(this.qrCodeImage);
        const qrCodeImageSrc = await qrCodeImage.getAttribute('src');
        expect(qrCodeImageSrc).toContain(expectedPartialLink);

        await expect(page.locator(this.downloadQRCode)).toBeEnabled();
    }

    static async downloadQRCodeAndValidate(page: Page): Promise<void> {
        const expectedContent = 'https://www.google.com/';

        await DownloadFile.downloadFile(page, this.downloadQRCode, 'qrCode.png');
        await DownloadFile.readQRCodeAndValidate('qrCode.png', expectedContent);

        // Delete the download folder
        await DownloadFile.deleteDownloadFolder();
    }
}