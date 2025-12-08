import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse } from '../utils/jsonHelper';
import * as dbPassholder from '../db/queries/passholderQueries';
import * as dbGrant from '../db/queries/grantQueries';
import { PassholderController } from '../controllers/passholderController';
import { AssertHelper } from '../utils/assertHelper';
import { Passholder } from '../apiModels/passholderModels';

let passholderController: PassholderController;
let idPassholderList: string[] = [];

async function createTestPassholders(): Promise<Passholder[]> {
	const response = await passholderController.createPassholders();
	expect(response.status()).toBe(StatusCodes.OK);
	const responseBody: Passholder[] = await response.json();

	for (const passholder of responseBody) {
		idPassholderList.push(passholder.id);
	}

	return responseBody;
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
		const responseBody: Passholder[] = await response.json();
		responseBody.forEach(passholder => {
			passholder.grants?.sort((a, b) => a.title.localeCompare(b.title));
		});
		const getAllPassholdersQuery = await dbPassholder.getPassholders();
		AssertHelper.compareDataList(responseBody, getAllPassholdersQuery);
	});

	test('Get passholders count', { tag: '@smoke' }, async () => {
		const response = await passholderController.getPassholdersCount();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: number = safeJsonParse(await response.text());
		const getAllPassholdersQuery = await dbPassholder.getPassholders();
		expect(responseBody).toBe(getAllPassholdersQuery.length);
	});

	test('Create passholders', async () => {
		const responseBody = await createTestPassholders();
		const queryResponse = await dbPassholder.getPassholdersById(idPassholderList);

		AssertHelper.compareDataList(responseBody, queryResponse);
	});

	test('Delete passholder', async () => {
		await createTestPassholders();

		const passholdersBeforeDelete = await dbPassholder.getPassholders();

		const responseDelete = await passholderController.deletePassholderById(idPassholderList[0]);
		expect(responseDelete.status()).toBe(StatusCodes.OK);

		const passholdersAfterDelete = await dbPassholder.getPassholders();

		expect(passholdersAfterDelete.length).toBe(passholdersBeforeDelete.length - 1);
	});

	test('Update passholder', async () => {
		await createTestPassholders();

		const responseGetPassholders = await passholderController.getPassholders();
		expect(responseGetPassholders.status()).toBe(StatusCodes.OK);

		const responseGetBody: Passholder[] = await responseGetPassholders.json();

		const passholderToUpdate = responseGetBody.find((passholder) => passholder.id === idPassholderList[0]);

		passholderToUpdate.name = 'Updated Name';
		passholderToUpdate.address = 'Updated Address';

		const responseUpdate = await passholderController.updatePassholders(passholderToUpdate);
		expect(responseUpdate.status()).toBe(StatusCodes.OK);

		const passholderUpdated = await dbPassholder.getPassholders(idPassholderList[0]);
		AssertHelper.compareData(passholderToUpdate, passholderUpdated[0]);
	});

	test('Update assigned grants to passholder', async () => {
		await createTestPassholders();

		const responseGetPassholders = await passholderController.getPassholders();
		expect(responseGetPassholders.status()).toBe(StatusCodes.OK);

		const responseGetBody: Passholder[] = await responseGetPassholders.json();
		const passholderToUpdate = responseGetBody.find((passholder) => passholder.id === idPassholderList[0]);

		const activeGrants = await dbGrant.getActiveGrants();
		expect(activeGrants.length).toBeGreaterThan(0);

		passholderToUpdate.grants = activeGrants;

		const responseUpdate = await passholderController.updatePassholders(passholderToUpdate);
		expect(responseUpdate.status()).toBe(StatusCodes.OK);

		passholderToUpdate.grants.sort((a, b) => a.title.localeCompare(b.title));

		const passholderUpdated = await dbPassholder.getPassholders(idPassholderList[0]);
		AssertHelper.compareData(passholderToUpdate, passholderUpdated[0]);
	});

	test('Update assigned grants to multiple passholders', async () => {
		const passholderdsBody=await createTestPassholders();

		const passholdersIds: string[] = passholderdsBody.map((passholder) => passholder.id);
		expect(passholdersIds.length).toBeGreaterThan(0);

		const activeGrants = await dbGrant.getActiveGrants();
		expect(activeGrants.length).toBeGreaterThan(0);

		const activeGrantsIds = activeGrants.map((grant) => grant.id);

		const data = {
			passholderIds: passholdersIds,
			grantsIds: activeGrantsIds
		};

		const responseUpdate = await passholderController.updateAssignedGrantsToPassholder(data);
		expect(responseUpdate.status()).toBe(StatusCodes.OK);

		const updatedPassholders = (await dbPassholder.getPassholders()).filter(p => passholdersIds.includes(p.id));
		for (const passholder of updatedPassholders) {
			for (const grant of passholder.grants) {
				expect(activeGrantsIds).toContain(grant.id);
			}
			expect(passholder.grants.length).toBe(activeGrantsIds.length);
		}
	});
});
