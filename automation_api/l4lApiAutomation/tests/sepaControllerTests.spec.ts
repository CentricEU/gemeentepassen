import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { SepaController } from '../controllers/sepaController';
import { loadJsonFile } from '../utils/jsonHelper';
import { SepaRequestDto } from '../apiModels/sepaModels';

let sepaController: SepaController;

test.beforeAll(async () => {
	sepaController = await ApiFactory.getSepaApi();
});

test.describe('SEPA Controller Tests', () => {
	test('Generate SEPA file filitered with supplier id @smoke', { tag: '@smoke' }, async () => {
		const testData = loadJsonFile<SepaRequestDto>('./testData/sepa-test-data.json');
		testData.supplierId = process.env.SUPPLIER_ID;

		const response = await sepaController.generateSepaFile(
			testData.startDate,
			testData.endDate,
			testData.supplierId
		);

		expect(response.status()).toBe(StatusCodes.OK);
		const body: string = await response.text();
		expect(body).toContain('<?xml');
	});

	test('Generate SEPA file without supplier ID', async () => {
		const testData = loadJsonFile<SepaRequestDto>('./testData/sepa-test-data.json');
		const response = await sepaController.generateSepaFile(testData.startDate, testData.endDate);

		expect(response.status()).toBe(StatusCodes.OK);

		const body: string = await response.text();
		expect(body).toContain('<?xml');
	});
});
