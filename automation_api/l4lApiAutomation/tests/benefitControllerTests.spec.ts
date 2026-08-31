import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse, loadJsonFile } from '../utils/jsonHelper';
import { BenefitController } from '../controllers/benefitController';
import * as dbBenefit from '../db/queries/benefitQueries';
import { BenefitResponseDto, BenefitRequestDto } from '../apiModels/benefitModels';
import { Roles } from '../utils/roles.enum';

let benefitController: BenefitController;
let createdBenefitId: string;

test.beforeAll(async () => {
	benefitController = await ApiFactory.getBenefitApi();
});

test.afterEach(async () => {
	if (createdBenefitId) {
		await dbBenefit.deleteBenefitById(createdBenefitId);
		createdBenefitId = null;
	}
});

test.describe('Benefit Controller Tests', () => {
	test('Get all benefits for citizen group', async () => {
		const benefitController = await ApiFactory.getBenefitApi(Roles.CITIZEN);
		const response = await benefitController.getAllBenefitsForCitizenGroup();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Create a new benefit', { tag: '@smoke' }, async () => {
		const benefitCreateData = loadJsonFile<BenefitRequestDto>('./testData/benefit-entity-create.json');
		benefitCreateData.name += ` ${Date.now()}`;
		const response = await benefitController.createBenefit(benefitCreateData);
		expect(response.status()).toBe(StatusCodes.CREATED);

		const responseBody: BenefitResponseDto = await response.json();
		createdBenefitId = responseBody.id;

		expect(responseBody.name).toBe(benefitCreateData.name);
		expect(responseBody.description).toBe(benefitCreateData.description);

		const dbBenefitData = await dbBenefit.getBenefitById(createdBenefitId);
		expect(dbBenefitData.name).toBe(benefitCreateData.name);
		expect(dbBenefitData.description).toBe(benefitCreateData.description);
	});

	test('Get all benefits for passholder', async () => {
		const response = await benefitController.getAllBenefitsForPassholder(process.env.PASSHOLDER_ID);
		const responseBody: BenefitResponseDto[] = await response.json();
		expect(response.status()).toBe(StatusCodes.OK);
		expect(responseBody.length).toBeGreaterThan(0);
	});

	test('Get all benefits for tenant (paginated)', { tag: '@smoke' }, async () => {
		const response = await benefitController.getAllBenefitsForTenantPaginated();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Count all benefits by tenant id', async () => {
		const response = await benefitController.countAllBenefitsByTenantId();
		expect(response.status()).toBe(StatusCodes.OK);

		const count: number = safeJsonParse(await response.text());
		expect(count).toBeGreaterThan(0);
	});

	test('Get all benefits for tenant', async () => {
		const response = await benefitController.getAllBenefitsForTenant();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get all benefits for citizen', async () => {
		const benefitController = await ApiFactory.getBenefitApi(Roles.CITIZEN);
		const response = await benefitController.getAllBenefitsForCitizen();
		expect(response.status()).toBe(StatusCodes.OK);
	});
});
