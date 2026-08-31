import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse } from '../utils/jsonHelper';
import * as dbPassholder from '../db/queries/passholderQueries';
import { PassholderController } from '../controllers/passholderController';
import { AssertHelper } from '../utils/assertHelper';
import { Passholder, FilterPassholdersRequest } from '../apiModels/passholderModels';
import * as passholderHelper from '../utils/passholderHelper';

let passholderController: PassholderController;
let idPassholderList: string[] = [];

async function createTestPassholders(): Promise<string[]> {
	var ids = await passholderHelper.CreatePassholders();
	idPassholderList.push(...ids);
	return ids;
}

test.beforeAll(async () => {
	passholderController = await ApiFactory.getPassholderApi();
});

test.afterEach(async () => {
	if (idPassholderList.length > 0) {
		for (const id of idPassholderList) {
			await dbPassholder.deletePassholderById(id);
		}
		idPassholderList = [];
	}
});

test.describe('Passholder Controller Tests', () => {
	test('Get passholders', { tag: '@smoke' }, async () => {
		const response = await passholderController.getPassholders();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get passholders count', async () => {
		const response = await passholderController.getPassholdersCount();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: number = safeJsonParse(await response.text());
		expect(responseBody).toBeGreaterThan(0);
	});

	test('Create passholders', { tag: '@smoke' }, async () => {
		await createTestPassholders();
		const responseGet = await passholderController.getPassholders();
		expect(responseGet.status()).toBe(StatusCodes.OK);
		const responseGetBody: Passholder[] = await responseGet.json();

		for (const id of idPassholderList) {
			const createdPassholder = responseGetBody.find((passholder) => passholder.id === id);
			expect(createdPassholder.citizenGroupName).toBe('Automation Student');
			expect(AssertHelper.hasInvalidValues(createdPassholder)).toBe(false);
		}
		expect(idPassholderList.length).toBeGreaterThan(0);
	});

	test('Delete passholder', async () => {
		await createTestPassholders();

		const deleteId = idPassholderList[0];

		const responseDelete = await passholderController.deletePassholderById(deleteId);
		expect(responseDelete.status()).toBe(StatusCodes.OK);
		idPassholderList = idPassholderList.filter((id) => id !== deleteId);

		const passholdersAfterDelete = await passholderController.getPassholders();
		const passholdersAfterDeleteBody: Passholder[] = await passholdersAfterDelete.json();

		const deletedPassholder = passholdersAfterDeleteBody.find((passholder) => passholder.id === deleteId);
		expect(deletedPassholder).toBeUndefined();
	});

	test('Get passholder details', async () => {
		const ids = await createTestPassholders();

		const response = await passholderController.getPassholderDetails(ids[0]);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: Passholder = await response.json();
		expect(responseBody.id).toBe(ids[0]);
		expect(responseBody.citizenGroupName).toBe('Automation Student');
		expect(AssertHelper.hasInvalidValues(responseBody)).toBe(false);
	});

	test('Filter passholders', async () => {
		const ids = await createTestPassholders();

		const detailsResponse = await passholderController.getPassholderDetails(ids[0]);
		const passholder: Passholder = await detailsResponse.json();

		const filterParams: FilterPassholdersRequest = { bsn: passholder.bsn };
		const response = await passholderController.filterPassholders(filterParams);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: Passholder[] = await response.json();
		expect(responseBody.length).toBeGreaterThan(0);
		expect(responseBody.some((p) => p.id === ids[0])).toBeTruthy();
	});

	test('Count filtered passholders', async () => {
		const ids = await createTestPassholders();

		const detailsResponse = await passholderController.getPassholderDetails(ids[0]);
		const passholder: Passholder = await detailsResponse.json();

		const filterParams: FilterPassholdersRequest = { bsn: passholder.bsn };
		const response = await passholderController.countFilteredPassholders(filterParams);
		expect(response.status()).toBe(StatusCodes.OK);

		const count: number = safeJsonParse(await response.text());
		expect(count).toBeGreaterThan(0);
	});
});
