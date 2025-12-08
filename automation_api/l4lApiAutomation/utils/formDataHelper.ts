import * as fs from 'fs';

export default class formDataHelper {

	private static createFileBlob(filePath: string): Blob {
		if (!fs.existsSync(filePath)) {
			throw new Error(`File not found at path: ${filePath}`);
		}
		const fileBuffer = fs.readFileSync(filePath);
		return new Blob([fileBuffer]);
	}

	static createFormDataWithPassholdersFile(path: string): FormData {
		const formData = new FormData();
		formData.append('file', this.createFileBlob(path));
		return formData;
	}
}
