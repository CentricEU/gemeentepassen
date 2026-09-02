import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse, loadJsonFile } from '../utils/jsonHelper';
import { CitizenGroupController } from '../controllers/citizenGroupController';
import * as dbCitizenGroup from '../db/queries/citizenGroupQueries';
import { CitizenGroupDto, CitizenGroupViewDto, CitizenMessageDto } from '../apiModels/citizenGroupModels';
import { Roles } from '../utils/roles.enum';

let citizenGroupController: CitizenGroupController;
let createdCitizenGroupId: string;

test.beforeAll(async () => {
	citizenGroupController = await ApiFactory.getCitizenGroupApi();
});

test.afterEach(async () => {
	if (createdCitizenGroupId) {
		await dbCitizenGroup.deleteCitizenGroupById(createdCitizenGroupId);
		createdCitizenGroupId = null;
	}
});

test.describe('Citizen Group Controller Tests', () => {
	test('Get all citizen groups', async () => {
		const response = await citizenGroupController.getAllCitizenGroups();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: CitizenGroupViewDto[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);
		expect(responseBody.length).toBeGreaterThan(0);
	});

	test('Create a new citizen group', { tag: '@smoke' }, async () => {
		const createData = loadJsonFile<CitizenGroupDto>('./testData/citizen-group-create.json');
		createData.groupName += ` ${Date.now()}`;

		const response = await citizenGroupController.createCitizenGroup(createData);
		expect(response.status()).toBe(StatusCodes.CREATED);

		const responseBody: CitizenGroupDto = await response.json();
		createdCitizenGroupId = responseBody.id;

		expect(responseBody.groupName).toBe(createData.groupName);
		expect(responseBody.thresholdAmount).toBe(createData.thresholdAmount);
		expect(responseBody.maxIncome).toBe(createData.maxIncome);

		const dbData = await dbCitizenGroup.getCitizenGroupByName(createData.groupName);
		expect(dbData.group_name).toBe(createData.groupName);
		expect(dbData.max_income).toBe(createData.maxIncome.toString());
	});

	test('Send citizen message', async () => {
		const citizenGroupController = await ApiFactory.getCitizenGroupApi(Roles.CITIZEN);
		const messageData = loadJsonFile<CitizenMessageDto>('./testData/citizen-message.json');

		const response = await citizenGroupController.sendCitizenMessage(messageData);
		expect(response.status()).toBe(StatusCodes.NO_CONTENT);
	});

	test('Get all citizen groups paginated', async () => {
		const response = await citizenGroupController.getAllCitizenGroupsPaginated();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: CitizenGroupViewDto[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);
		expect(responseBody.length).toBeGreaterThan(0);
	});

	test('Get required documents', async () => {
		const citizenGroupController = await ApiFactory.getCitizenGroupApi(Roles.CITIZEN);
		const response = await citizenGroupController.getRequiredDocuments();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: string[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);
		expect(responseBody.length).toBeGreaterThan(0);
	});

	test('Count all citizen groups', async () => {
		const response = await citizenGroupController.countAllCitizenGroups();
		expect(response.status()).toBe(StatusCodes.OK);

		const count: number = safeJsonParse(await response.text());
		expect(count).toBeGreaterThanOrEqual(0);
	});
});
