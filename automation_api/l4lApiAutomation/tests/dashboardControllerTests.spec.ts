import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { DashboardController } from '../controllers/dashboardController';
import * as dbDashboard from '../db/queries/dashboardQueries';
import {
	OfferStatisticsDto,
	MonthlyTransactionDto,
	DashboardCountDto,
	SupplierStatus
} from '../apiModels/dashboardModels';
import { Roles } from '../utils/roles.enum';

let dashboardController: DashboardController;

test.beforeAll(async () => {
	dashboardController = await ApiFactory.getDashboardApi();
});

test.describe('Dashboard Controller Tests', () => {
	test('Get used offer statistics - MONTHLY', async () => {
		const response = await dashboardController.getUsedOfferStatistics('MONTHLY');
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: OfferStatisticsDto[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);

		const offerTypesCount = await dbDashboard.getOfferTypesCount();
		expect(offerTypesCount).toBeGreaterThanOrEqual(0);
	});

	test('Get used offer statistics - QUARTERLY', async () => {
		const response = await dashboardController.getUsedOfferStatistics('QUARTERLY');
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: OfferStatisticsDto[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);
	});

	test('Get used offer statistics - YEARLY', async () => {
		const response = await dashboardController.getUsedOfferStatistics('YEARLY');
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: OfferStatisticsDto[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);
	});

	test('Get transaction statistics - MONTHLY', async () => {
		const response = await dashboardController.getTransactionStatistics('MONTHLY');
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: MonthlyTransactionDto[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);

		const transactionsCount = await dbDashboard.getOfferTransactionsCount();
		expect(transactionsCount).toBeGreaterThanOrEqual(0);
	});

	test('Get transaction statistics - QUARTERLY', async () => {
		const response = await dashboardController.getTransactionStatistics('QUARTERLY');
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: MonthlyTransactionDto[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);
	});

	test('Get transaction statistics - YEARLY', async () => {
		const response = await dashboardController.getTransactionStatistics('YEARLY');
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: MonthlyTransactionDto[] = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);
	});

	test('Get municipality statistics', { tag: '@smoke' }, async () => {
		const dashboardController = await ApiFactory.getDashboardApi(Roles.MUNICIPALITY);
		const statuses: SupplierStatus[] = ['CREATED', 'PENDING', 'APPROVED', 'REJECTED'];
		const response = await dashboardController.getMunicipalityStatistics(statuses);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: DashboardCountDto = await response.json();
		expect(responseBody.passholdersCount).toBeDefined();
		expect(responseBody.suppliersCount).toBeDefined();
		expect(responseBody.transactionsCount).toBeDefined();

		expect(responseBody.passholdersCount).toBeGreaterThanOrEqual(0);
		expect(responseBody.suppliersCount).toBeGreaterThanOrEqual(0);
		expect(responseBody.transactionsCount).toBeGreaterThanOrEqual(0);
	});
});
