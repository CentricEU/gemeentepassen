import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse, loadJsonFile } from '../utils/jsonHelper';
import * as supplierHelper from '../utils/supplierHelper';
import { SupplierProfileController } from '../controllers/supplierProfileController';
import * as dd from '../testData/dropdownData';
import { SupplierProfilePatchDto, SupplierProfileRequestDto } from '../apiModels/supplierProfileModels';
import * as dbSupplier from '../db/queries/supplierQueries';
import * as dbUser from '../db/queries/userQueries';
import { RejectSupplier } from '../apiModels/supplierModels';
import { AssertHelper } from '../utils/assertHelper';
import { Roles } from '../utils/roles.enum';

let supplierProfileController: SupplierProfileController;
let createdSupplierIds: string[] = [];

async function CreateSupplierProfile() {
	const supplier = await supplierHelper.createSupplierProfile(supplierProfileController);

	createdSupplierIds.push(supplier.supplierProfilePatchDto.supplierId);
	return supplier;
}

test.beforeAll(async () => {
	supplierProfileController = await ApiFactory.getSupplierProfileApi();
});

test.afterEach(async () => {
	for (const id of createdSupplierIds) {
		try {
			await dbSupplier.deleteSupplierById(id);
		} catch (error) {
			console.log(`Failed to delete supplier ${id}:`, error);
		}
	}
	createdSupplierIds = [];
});

test.describe('Supplier Profile Controller Tests', () => {
	test('Get Supplier Profile by ID', async () => {
		const supplier_id = process.env.SUPPLIER_ID;
		const response = await supplierProfileController.getSupplierProfileById(supplier_id);
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get Supplier Profile Dropdown Data',async () => {
		const response = await supplierProfileController.getDropdownData();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: any = safeJsonParse(await response.text());

		dd.expectedCategories.forEach((category, index) => {
			expect(responseBody.categories[index].categoryLabel).toBe(category.label);
			expect(responseBody.categories[index].subcategoryLabels.map((s) => s.label)).toEqual(
				category.subcategories
			);
		});

		expect(responseBody.legalFormLabels.map((l) => l.label)).toEqual(dd.expectedLegalForms);

		expect(responseBody.groupLabels.map((g) => g.label)).toEqual(dd.expectedGroups);
	});

	test('Create Supplier Profile', { tag: '@smoke' }, async () => {
		const supplier = await CreateSupplierProfile();

		const getSupplierProfieDetails = await dbSupplier.getSupplierProfileIdBySupplierId(
			supplier.supplierProfilePatchDto.supplierId
		);

		getSupplierProfieDetails.cashierEmails = await dbSupplier.getCashierBySupplierId(
			supplier.supplierProfilePatchDto.supplierId
		);

		getSupplierProfieDetails.supplierId = supplier.supplierProfilePatchDto.supplierId;

		AssertHelper.compareData(getSupplierProfieDetails, supplier.supplierProfilePatchDto);
	});

	test('Update Supplier Profile', async () => {
		const supplier = await CreateSupplierProfile();

		const data = loadJsonFile<SupplierProfileRequestDto>('./testData/supplierProfileData.json');
		data.supplierProfilePatchDto.supplierId = supplier.supplierProfilePatchDto.supplierId;
		data.supplierProfilePatchDto.branchLocation = `Automation Test Location ${Math.random() * 100}`;
		data.supplierProfilePatchDto.accountManager = `Automation Test Account Manager ${Math.random() * 100}`;

		const response = await supplierProfileController.updateSupplierProfile(data.supplierProfilePatchDto);

		expect(response.status()).toBe(StatusCodes.NO_CONTENT);

		const getSupplierProfieDetails = await supplierProfileController.getSupplierProfileById(
			supplier.supplierProfilePatchDto.supplierId
		);
		const getSupplierProfileDetailsBody: SupplierProfilePatchDto = await getSupplierProfieDetails.json();

		expect(getSupplierProfileDetailsBody.branchLocation).toBe(data.supplierProfilePatchDto.branchLocation);
		expect(getSupplierProfileDetailsBody.accountManager).toBe(data.supplierProfilePatchDto.accountManager);
	});

	test('Add a new cashier for supplier', async () => {
		const newCashierEmail = 'l4l.centric+automation9991@gmail.com';

		const supplierProfileController = await ApiFactory.getSupplierProfileApi(Roles.SUPPLIER);
		const response = await supplierProfileController.addCashier([newCashierEmail]);

		const cashierInDb = await dbSupplier.getCashierBySupplierId(process.env.SUPPLIER_ID);
		await dbUser.removeUserByEmail(newCashierEmail);

		expect(response.status()).toBe(StatusCodes.CREATED);
		expect(cashierInDb).toContain(newCashierEmail);
	});

	test('Reapply supplier profile', async () => {
		const supplier = await CreateSupplierProfile();

		const rejectData = loadJsonFile<RejectSupplier>('./testData/supplier-reject.json');
		rejectData.supplierId = supplier.supplierProfilePatchDto.supplierId;

		const supplierController = await ApiFactory.getSupplierApi();

		const response = await supplierController.rejectSupplier(rejectData);
		expect(response.status()).toBe(StatusCodes.OK);

		const reapplyData = supplier.supplierProfilePatchDto;
		reapplyData.supplierId = supplier.supplierProfilePatchDto.supplierId;
		reapplyData.branchLocation = `Automation Test Location ${Math.random() * 100}`;
		reapplyData.branchProvince = 'Noord-Holland';
		const reapplyResponse = await supplierProfileController.reapplySupplierProfile(reapplyData);

		const getSupplierDetails = await dbSupplier.getSupplierById(supplier.supplierProfilePatchDto.supplierId);
		const getSupplierProfileDetails = await dbSupplier.getSupplierProfileIdBySupplierId(
			supplier.supplierProfilePatchDto.supplierId
		);
		expect(getSupplierDetails.status).toBe('PENDING');
		expect(reapplyResponse.status()).toBe(StatusCodes.NO_CONTENT);
		expect(getSupplierProfileDetails.branchLocation).toBe(reapplyData.branchLocation);
		expect(getSupplierProfileDetails.branchProvince).toBe(reapplyData.branchProvince);
	});
});
