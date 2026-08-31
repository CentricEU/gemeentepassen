import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { DropdownDataController } from '../controllers/dropdownDataController';
import { loadJsonFile } from '../utils/jsonHelper';
import { DropdownDataFilterDto, OfferType } from '../apiModels/dropdownDataModels';
import { AssertHelper } from '../utils/assertHelper';

let dropdownDataController: DropdownDataController;

test.beforeAll(async () => {
	dropdownDataController = await ApiFactory.getDropdownDataApi();
});

test.describe('Dropdown Data Controller Tests', () => {
	test('Get all dropdowns data', { tag: '@smoke' }, async () => {
		const response = await dropdownDataController.getAllDropdownsData();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: DropdownDataFilterDto = await response.json();

		const expectedData = loadJsonFile<DropdownDataFilterDto>('./testData/dropdown-data-expected.json');

		AssertHelper.compareData(responseBody, expectedData);
	});
});
