import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse, loadJsonFile } from '../utils/jsonHelper';
import * as db from '../db/queries/grantQueries';
import { GrantController } from '../controllers/grantController';
import { AssertHelper } from '../utils/assertHelper';
import { Grant } from '../apiModels/grantModels';

let grantController: GrantController;
let idGrantList: string[] = [];

test.beforeAll(async () => {
	grantController = await ApiFactory.getGrantApi();
});

test.afterEach(async () => {
	if (idGrantList.length > 0) {
		for (const id of idGrantList) {
			await db.deleteGrantById(id);
		}

		idGrantList = [];
	}
});

test.describe('Grant Controller Tests', () => {
	test('Get active grants', { tag: '@smoke' }, async () => {
		const response = await grantController.getGrant(true);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: Grant[] = await response.json();
		const getActiveGrantsQuery = await db.getActiveGrants();

		AssertHelper.compareDataList(responseBody, getActiveGrantsQuery);
	});

	test('Get all grants', async () => {
		const response = await grantController.getGrant(false);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: Grant[] = await response.json();
		const getAllGrantsQuery = await db.getAllGrants();

		AssertHelper.compareDataList(responseBody, getAllGrantsQuery);
	});

	test('Get grant count', { tag: '@smoke' }, async () => {
		const response = await grantController.getGrantCount();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: number = safeJsonParse(await response.text());
		const getAllGrantsQuery = await db.getAllGrants();
		expect(responseBody).toBe(getAllGrantsQuery.length);
	});

	test('Get paginated grants', { tag: '@smoke' }, async () => {
		const page = 0;
		const size = 5;
		const response = await grantController.getGrantPaginated(page, size);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: Grant[] = await response.json();
		const getPaginatedGrantsQuery = (await db.getAllGrantsSortedByName()).slice(0, 5);

		expect(responseBody.length).toBeLessThanOrEqual(size);
		AssertHelper.compareDataList(responseBody, getPaginatedGrantsQuery);
	});

	test('Create a new grant', async () => {
		const grantData = loadJsonFile<Grant>('./testData/grantData.json');
		const response = await grantController.createGrant(grantData);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: Grant = await response.json();
		const id = responseBody.id;
		idGrantList.push(id);
		const responseQuery = await db.getGrantById(id);
		AssertHelper.compareData(grantData, responseQuery);
		AssertHelper.compareData(responseBody, responseQuery);
	});

	test('Update an existing grant', async () => {
		const grantData = loadJsonFile<Grant>('./testData/grantData.json');
		const response = await grantController.createGrant(grantData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: Grant = await response.json();
		const id = responseBody.id;
		idGrantList.push(id);

		responseBody.title = `Automation Test title ${Math.random() * 100}`;
		responseBody.description = `Automation Test description ${Math.random() * 100}`;

		const updateResponse = await grantController.updateGrant(responseBody);
		expect(updateResponse.status()).toBe(StatusCodes.OK);

		const updatedResponseQuery = await db.getGrantById(id);
		AssertHelper.compareData(responseBody, updatedResponseQuery);
	});
});
