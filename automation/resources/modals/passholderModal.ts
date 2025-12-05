import {Page, expect} from '@playwright/test';
import * as NL_translation from '../../resources/files/i18n/nl-NL';
import {UploadFile} from "../utils/uploadFile";
import {DownloadFile} from "../utils/downloadFile";
import {TableFunctions} from "../utils/tableFunctions";
import {BasePage} from "../pages/basePage";

export class PassholderModal extends BasePage {
    // Passholder Modal Locators
    private static downloadCSVTemplateLocator = 'centric-link';
    private static importBtnLocator = '.button-default:nth-of-type(2) .button-content';
    private static passholderTableLocator = ' .table-pannel';
    private static uploadReplaceFileBtnLocator = '.message-container centric-button';

    static async importWrongFormat(page: Page): Promise<void> {
        await this.clickButtonFromWelcomePage(page, NL_translation.passholders.title);
        await UploadFile.uploadFileWarning(page, 'resources/files/profileImages.jpg');
    }

    static async downloadCSVTemplateAndValidate(page: Page): Promise<void> {
        await this.clickButtonFromWelcomePage(page, NL_translation.passholders.title);
        await expect(page.locator(this.downloadCSVTemplateLocator)).toContainText(NL_translation.passholders.download);
        await DownloadFile.downloadFile(page, this.downloadCSVTemplateLocator, 'import_passholders.csv');
        await DownloadFile.readFileAndValidate('import_passholders.csv');
        await DownloadFile.deleteDownloadFolder();
    }

    static async importCorrectFormat(page: Page): Promise<void> {
        await this.clickButtonFromWelcomePage(page, NL_translation.passholders.title);
        const uploadReplaceFileBtn = page.locator(this.uploadReplaceFileBtnLocator);
        await expect(uploadReplaceFileBtn).toContainText(NL_translation.general.uploadFile);

        await UploadFile.uploadFileSuccessfully(page, 'resources/files/import_3passholders.csv', 'import_3passholders.csv', 'file');

        await expect(uploadReplaceFileBtn).toContainText(NL_translation.general.replaceFile);
        await page.click(this.importBtnLocator);

        await page.reload();
        expect(page.locator(this.passholderTableLocator)).toBeTruthy();
        const rowCount = await TableFunctions.countRows(page);
        expect(rowCount).toEqual(3);
    }

}