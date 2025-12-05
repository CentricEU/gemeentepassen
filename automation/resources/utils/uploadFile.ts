import {expect, Page} from "@playwright/test";
import * as NL_translation from '../../resources/files/i18n/nl-NL';

export class UploadFile {

    static async uploadFile(page: Page, filePath: string): Promise<void> {
        try {
            // Locate the input element for file upload
            const input = page.locator('input[type="file"]');

            // Set the file path for the input field
            await input.setInputFiles(filePath);

            // Wait for the upload to complete (you may adjust the waiting time accordingly)
            await page.waitForTimeout(3000);

            const visibleSections = ['.file-section', 'centric-alert'];
            await Promise.all(visibleSections.map(locator => page.locator(locator).isVisible()));

        } catch (error) {
            console.error('Error during image upload:', error);
            throw error;
        }
    }

    static async uploadFileSuccessfully(page: Page, filePath: string, fileName: string, fileType: 'file' | 'image'): Promise<void> {
        try {
            await this.uploadFile(page, filePath);
            // Assert that the uploaded file name is visible and matches the expected file name
            let locator: string;
            if (fileType == 'file') {
                locator = '.message';
                console.log('File uploaded successfully.');
            } else if (fileType == 'image') {
                locator = '.upload-text';
                console.log('File uploaded successfully');
            } else {
                throw new Error('Invalid fileType provided');
            }

            const element = page.locator(locator);
            await expect(element).toBeVisible();
            const uploadedFileName = await element.textContent();
            expect(uploadedFileName).toContain(fileName);
            console.log('File uploaded successfully.');
        } catch (error) {
            console.error('Error during file upload:', error);
            throw error;
        }
    }

    static async uploadFileWarning(page: Page, filePath: string): Promise<void> {
        try {
            await this.uploadFile(page, filePath);

            const visibleSections = ['centric-alert', '.sub-message'];
            let messageWarning: string;
            for (const locator of visibleSections) {
                if (await page.waitForSelector(locator)) {
                    const element = page.locator(locator).first();
                    messageWarning = await element.textContent();
                    break;
                }
            }
            const expectedCSVWarningMessage = NL_translation.upload.warningFormat.replace('{{ acceptedFormats }}', ".csv");
            expect(messageWarning).toContain(expectedCSVWarningMessage);
            console.log('File uploaded successfully.');
        } catch (error) {
            console.error('Error during file upload:', error);
            throw error;
        }
    }
}