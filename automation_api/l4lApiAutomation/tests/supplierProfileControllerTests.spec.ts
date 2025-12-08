import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse, loadJsonFile } from '../utils/jsonHelper';
import * as db from '../db/queries/supplierProfileQueries';
import { SupplierProfileController } from '../controllers/supplierProfileController';
import { AssertHelper } from '../utils/assertHelper';
import * as dd from '../testData/dropdownData';
import { SupplierProfile } from '../apiModels/supplierProfileModels';

let supplierProfileController: SupplierProfileController;

test.beforeAll(async () => {
	supplierProfileController = await ApiFactory.getSupplierApi();
});

test.describe('Supplier Profile Controller Tests', () => {
	test('Get Supplier Profile by ID', { tag: '@smoke' }, async () => {
		const supplier_id = process.env.SUPPLIER_ID;
		const response = await supplierProfileController.getSupplierProfileById(supplier_id);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody = safeJsonParse(await response.text());
		const getSupplierProfileQuery = await db.getSupplierProfileById(supplier_id);

		AssertHelper.compareData(responseBody, getSupplierProfileQuery[0]);
	});

	test('Get Supplier Profile Dropdown Data', { tag: '@smoke' }, async () => {
		const response = await supplierProfileController.getDropdownData();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody = safeJsonParse(await response.text());

		dd.expectedCategories.forEach((category, index) => {
			expect(responseBody.categories[index].categoryLabel).toBe(category.label);
			expect(responseBody.categories[index].subcategoryLabels.map((s) => s.label)).toEqual(
				category.subcategories
			);
		});

		expect(responseBody.legalFormLabels.map((l) => l.label)).toEqual(dd.expectedLegalForms);

		expect(responseBody.groupLabels.map((g) => g.label)).toEqual(dd.expectedGroups);
	});

	//TODO: Create a test for Create Supplier Profile, when the db will be ready for clean up.

	test('Update Supplier Profile', async () => {
		const supplierId = process.env.SUPPLIER_ID;

		const data = loadJsonFile<SupplierProfile>('./testData/supplierProfileData.json');
		data.supplierId = supplierId;
		data.branchLocation = `Automation Test Location ${Math.random() * 100}`;
		data.accountManager = `Automation Test Account Manager ${Math.random() * 100}`;

		const response = await supplierProfileController.updateSupplierProfile(data);

		expect(response.status()).toBe(StatusCodes.NO_CONTENT);

		const getSupplierProfileQuery = await db.getSupplierProfileById(supplierId);

		AssertHelper.compareData(data, getSupplierProfileQuery[0]);
	});
});
