import { TenantController } from '../controllers/tenantController';
import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { safeJsonParse, loadJsonFile } from '../utils/jsonHelper';
import { AssertHelper } from '../utils/assertHelper';
import * as db from '../db/queries/tenantQueries';
import * as dbUser from '../db/queries/userQueries';
import { Tenant, TenantBankInformation } from '../apiModels/tenantModels';
import { Roles } from '../utils/roles.enum';
import { StatusCodes } from '../utils/status-codes.enum';

let tenantController: TenantController;
let idTenantList: string[] = [];

test.beforeEach(async () => {
	tenantController = await ApiFactory.getTenantApi();
});

test.afterAll(async () => {
	if (idTenantList.length > 0) {
		for (const id of idTenantList) {
			await db.deleteTenantById(id);
		}
	}
});

test.describe('Tenant Controller Tests', () => {
	test('Get Tenant By ID', async () => {
		const id = process.env.TENANT_ID;
		const response = await tenantController.getTenantById(id);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: Tenant = safeJsonParse(await response.text());
		const expectedBody = loadJsonFile<Tenant>('./testData/tenantData.json');
		AssertHelper.compareData(responseBody, expectedBody);
	});

	test('Get All Tenants', async () => {
		tenantController = await ApiFactory.getTenantApi(Roles.SUPPLIER);
		const response = await tenantController.getAllTenants();
		expect(response.status()).toBe(StatusCodes.OK);
		expect((await response.json()).length).toBeGreaterThan(0);
	});

	test('Update Tenant Bank Information', async () => {
		const id = process.env.TENANT_ID;
		const bankInormation: TenantBankInformation = {
			iban: 'NL20INGB0001234567',
			bic: 'INGBNL2A'
		};

		await db.removeTenantBankInformation(id);

		try {
			await dbUser.setIsApprovedUser(process.env.USER_MUNICIPALITY_ID, false);
			const response = await tenantController.updateBankInformation(bankInormation);
			expect(response.status()).toBe(StatusCodes.NO_CONTENT);
		} finally {
			await dbUser.setIsApprovedUser(process.env.USER_MUNICIPALITY_ID, true);
		}

		const responseQuery: TenantBankInformation = await db.getTenantBankInformation(id);
		AssertHelper.compareData(responseQuery, bankInormation);
		await expect(dbUser.getIsApprovedUser(process.env.USER_MUNICIPALITY_ID)).resolves.toBe(true);
	});

	test('Create Tenant', async () => {
		const data = loadJsonFile<Tenant>('./testData/tenantData.json');
		const responseCreate = await tenantController.createTenant(data);
		expect(responseCreate.status()).toBe(StatusCodes.CREATED);

		const responseCreateBody: Tenant = safeJsonParse(await responseCreate.text());
		const id = responseCreateBody.id;
		idTenantList.push(id);

		const responseGet = await tenantController.getTenantById(id);
		const responseGetBody: Tenant = safeJsonParse(await responseGet.text());
		AssertHelper.compareData(responseCreateBody, responseGetBody);
	});
});
