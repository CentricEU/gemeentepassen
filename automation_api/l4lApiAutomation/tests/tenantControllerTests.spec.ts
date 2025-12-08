import { TenantController } from '../controllers/tenantController';
import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { safeJsonParse, loadJsonFile } from '../utils/jsonHelper';
import { AssertHelper } from '../utils/assertHelper';
import * as db from '../db/queries/tenantQueries';
import { Tenant } from '../apiModels/tenantModels';
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
	test('Get Tenant By ID', { tag: '@smoke' }, async () => {
		const id = process.env.TENANT_ID;
		const response = await tenantController.getTenantById(id);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: Tenant = await response.json();
		const responseQuery = await db.getTenantById(id);
		AssertHelper.compareData(responseBody, responseQuery);
	});

	test('Get All Tenants', { tag: '@smoke' }, async () => {
		tenantController = await ApiFactory.getTenantApi(Roles.SUPPLIER);
		const response = await tenantController.getAllTenants();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: Tenant[] = safeJsonParse(await response.text());
		const responseQuery = await db.getAllTenants();

		AssertHelper.compareDataList(responseBody, responseQuery);
	});

	test('Create Tenant', async () => {
		const data = loadJsonFile<Tenant>('./testData/tenantData.json');
		const response = await tenantController.createTenant(data);
		expect(response.status()).toBe(StatusCodes.CREATED);

		const responseBody: Tenant = await response.json();
		const id = responseBody.id;
		idTenantList.push(id);

		const responseQuery = await db.getTenantById(id);
		AssertHelper.compareData(data, responseQuery[0]);
		AssertHelper.compareData(responseBody, responseQuery[0]);
	});
});
