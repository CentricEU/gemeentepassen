import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export default class formDataHelper {
	private static createFileBlob(filePath: string): Blob {
		if (!fs.existsSync(filePath)) {
			throw new Error(`File not found at path: ${filePath}`);
		}

		const fileBuffer = fs.readFileSync(filePath);
		return new Blob([new Uint8Array(fileBuffer)], { type: 'text/csv' });
	}

	static createFormDataWithPassholdersFile(filePath: string): FormData {
		const formData = new FormData();
		formData.append('file', this.createFileBlob(filePath), 'passholders.csv');
		return formData;
	}

	static createFormDataFromCsvContent(csvFilePath: string, replacements: Record<string, string>): FormData {
		if (!fs.existsSync(csvFilePath)) {
			throw new Error(`CSV file not found at path: ${csvFilePath}`);
		}
		let csvContent = fs.readFileSync(csvFilePath, 'utf-8');
		const sortedEntries = Object.entries(replacements).sort((a, b) => b[0].length - a[0].length);
		for (const [search, replace] of sortedEntries) {
			csvContent = csvContent.split(search).join(replace);
		}
		const tempFilePath = path.join(os.tmpdir(), `passholders_${Date.now()}.csv`);

		fs.writeFileSync(tempFilePath, csvContent, 'utf-8');
		return this.createFormDataWithPassholdersFile(tempFilePath);
	}
}
