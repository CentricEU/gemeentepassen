import {expect, Page} from "@playwright/test";
import * as fs from 'fs';
import * as path from 'path';
import jsQR from 'jsqr';
import {PNG} from 'pngjs'; // Import PNG module for parsing PNG image

const downloadFolderPath = path.join(__dirname, '../downloads');

export class DownloadFile {
    static async downloadFile(page: Page, locator: string, fileName: string): Promise<void> {
        const downloadPath = path.join(downloadFolderPath, fileName);

        // Ensure the download folder exists
        await this.createDownloadFolder();

        // Start download
        const [download] = await Promise.all([
            page.waitForEvent("download"),
            page.locator(locator).click(),
        ]);

        // Save the file
        await download.saveAs(downloadPath);

        // Wait for the file to be fully downloaded
        await this.waitForDownloadCompletion(downloadPath);
    }

    static async waitForDownloadCompletion(filePath: string): Promise<void> {
        const maxAttempts = 10;
        let attempt = 0;

        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
            if (fs.existsSync(filePath)) {
                // File exists, download is complete
                break;
            }
            attempt++;
            if (attempt >= maxAttempts) {
                throw new Error('Download timed out.');
            }
        }
    }

    static async createDownloadFolder(): Promise<void> {
        // Create the download folder if it doesn't exist
        if (!fs.existsSync(downloadFolderPath)) {
            fs.mkdirSync(downloadFolderPath, {recursive: true});
            console.log(`Download folder created at ${downloadFolderPath}`);
        } else {
            console.log(`Download folder already exists at ${downloadFolderPath}`);
        }
    }

    static async deleteDownloadFolder(): Promise<void> {
        // Check if the download folder exists
        if (fs.existsSync(downloadFolderPath)) {
            // Remove the download folder and its contents recursively
            fs.rmSync(downloadFolderPath, {recursive: true, force: true});
            console.log(`Download folder deleted from ${downloadFolderPath}`);
        } else {
            console.log(`Download folder does not exist at ${downloadFolderPath}`);
        }
    }

    static async readFileAndValidate(fileName: string): Promise<void> {
        const downloadPath = path.join(downloadFolderPath, fileName);

        // Read the file
        const csvData = fs.readFileSync(downloadPath, 'utf-8');

        // Parse the CSV data
        const parsedData: string[][] = csvData.trim().split('\n').map(row => row.split(','));

        // Define the expected column headers
        const expectedHeaders = ['name', 'address', 'bsn', 'passNumber', 'expiringDate', 'residenceCity'];

        // Perform validation
        for (const row of parsedData) {
            // Check if the row has the expected number of columns
            expect(row.length).toBe(expectedHeaders.length);

            // Additional validation for each column
            for (let i = 0; i < expectedHeaders.length; i++) {
                // Check if the column matches the expected header
                expect(row[i]).toBe(expectedHeaders[i]);
            }
        }
    }

    static async readQRCodeAndValidate(fileName: string, expectedContent): Promise<void> {
        const downloadPath = path.join(downloadFolderPath, fileName);
        // Read the image file
        const imageData = fs.readFileSync(downloadPath);

        // Parse PNG image data
        const pngImage = PNG.sync.read(imageData);

        // Decode the QR code from the image
        const qrCode = jsQR(pngImage.data, pngImage.width, pngImage.height);

        // Ensure that QR code is decoded successfully
        if (!qrCode) {
            throw new Error('Failed to decode QR code image.');
        }

        // Get the decoded content
        const decodedContent = qrCode.data;
        console.log(decodedContent);

        // Validate the decoded content against the expected content
        expect(decodedContent).toContain(expectedContent);
    }
}