import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { loadJsonFile } from '../utils/jsonHelper';
import * as supplierHelper from '../utils/supplierHelper';
import { SupplierController } from '../controllers/supplierController';
import * as dbSupplier from '../db/queries/supplierQueries';
import { RegisterSupplierRequestDto, RegisterSupplierResponseDto, RejectSupplier } from '../apiModels/supplierModels';
import { Roles } from '../utils/roles.enum';
import { AssertHelper } from '../utils/assertHelper';

let supplierController: SupplierController;
let createdSupplierIds: string[] = [];

async function CreateSupplierProfile() {
	const supplierProfileController = await ApiFactory.getSupplierProfileApi();
	const supplier = await supplierHelper.createSupplierProfile(supplierProfileController);

	createdSupplierIds.push(supplier.supplierProfilePatchDto.supplierId);
	return supplier;
}

test.beforeAll(async () => {
	supplierController = await ApiFactory.getSupplierApi();
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

test.describe('Supplier Controller Tests - POST Operations', () => {
	test('Register a new supplier', { tag: '@smoke' }, async () => {
		const createSupplier = await supplierHelper.createSupplier();
		createdSupplierIds.push(createSupplier.supplierId);

		const registerData = loadJsonFile<RegisterSupplierRequestDto>('./testData/supplier-create.json');

		const supplier = await dbSupplier.getSupplierById(createSupplier.supplierId);

		expect(supplier.company_name).toBe(registerData.companyName);
		expect(supplier.status).toBe('CREATED');
		AssertHelper.hasInvalidValues(supplier);
	});

	test('Reject a supplier', async () => {
		await CreateSupplierProfile();

		const rejectData = loadJsonFile<RejectSupplier>('./testData/supplier-reject.json');
		rejectData.supplierId = createdSupplierIds[0];

		const response = await supplierController.rejectSupplier(rejectData);
		expect(response.status()).toBe(StatusCodes.OK);

		const supllierDetails = await dbSupplier.getSupplierById(createdSupplierIds[0]);
		expect(supllierDetails.status).toBe('REJECTED');

		const getRejectionResponse = await dbSupplier.getSupplierRejectionBySupplierId(createdSupplierIds[0]);
		expect(getRejectionResponse.supplier_id).toBe(rejectData.supplierId);
		expect(getRejectionResponse.reason).toBe(rejectData.reason);
		expect(getRejectionResponse.comments).toBe(rejectData.comments);
	});
});

test.describe('Supplier Controller Tests - GET Operations', () => {
	test('Get supplier by ID', async () => {
		const supplier = await CreateSupplierProfile();
		const getSupplier = await supplierController.getSupplier(createdSupplierIds[0]);
		const getSupplierBody: RegisterSupplierResponseDto = await getSupplier.json();

		expect(getSupplierBody.companyName).toBe(supplier.companyName);
		AssertHelper.hasInvalidValues(getSupplierBody);
	});

	test('Get all suppliers for map view', async () => {
		const response = await supplierController.getAllByTenantIdForMap(process.env.TENANT_ID);
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get cashiers for supplier', async () => {
		await CreateSupplierProfile();

		const response = await supplierController.getCashiersForSupplier(createdSupplierIds[0]);
		expect(response.status()).toBe(StatusCodes.OK);

		const dbCashiers = await dbSupplier.getCashierBySupplierId(createdSupplierIds[0]);
		const responseBody = await response.json();

		expect(responseBody.length).toBe(dbCashiers.length);
		AssertHelper.compareData(responseBody, dbCashiers);
	});

	test('Get rejected supplier', async () => {
		const supplierId = process.env.SUPPLIER_REJECTED_ID ?? '';
		const rejectData = loadJsonFile<RejectSupplier>('./testData/supplier-reject.json');
		rejectData.supplierId = supplierId;

		await supplierController.rejectSupplier(rejectData);

		const supplierManagementController = await ApiFactory.getSupplierApi(Roles.SUPPLIER_REJECTED);
		const response = await supplierManagementController.getRejectedSupplier(supplierId);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: RejectSupplier = await response.json();
		expect(responseBody.supplierId).toBe(supplierId);
	});

	test('Get QR code', async () => {
		const supplierController = await ApiFactory.getSupplierApi(Roles.SUPPLIER);
		const response = await supplierController.getQRCode();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get all suppliers by tenant ID and status', async () => {
		const response = await supplierController.getAllByTenantIdAndStatus(process.env.TENANT_ID, 0, 10, 'PENDING');
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get all suppliers by tenant ID', async () => {
		const response = await supplierController.getAllByTenantId(process.env.TENANT_ID, 0, 10, 'APPROVED');
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Count all suppliers by tenant ID', async () => {
		const response = await supplierController.countAllByTenantId(process.env.TENANT_ID, 'APPROVED');
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody = await response.json();
		expect(typeof responseBody).toBe('number');
		expect(responseBody).toBeGreaterThan(0);
	});
});

test.describe('Supplier Controller Tests - PUT Operations', () => {
	test('Change has status update flag', async () => {
		await CreateSupplierProfile();

		const supplierController = await ApiFactory.getSupplierApi(Roles.SUPPLIER);
		const response = await supplierController.changeHasStatusUpdate(createdSupplierIds[0], true);
		expect(response.status()).toBe(StatusCodes.NO_CONTENT);

		const supplier = await dbSupplier.getSupplierById(createdSupplierIds[0]);
		expect(supplier.has_status_update).toBe(true);
	});

	test('Approve a supplier', async () => {
		const supplier = await CreateSupplierProfile();
		const supplierId = supplier.supplierProfilePatchDto.supplierId;

		const response = await supplierController.approveSupplier(supplierId);
		expect(response.status()).toBe(StatusCodes.NO_CONTENT);

		const supplierDetails = await dbSupplier.getSupplierById(supplierId);
		expect(supplierDetails.status).toBe('APPROVED');
	});
});
