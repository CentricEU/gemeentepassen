import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse, loadJsonFile } from '../utils/jsonHelper';
import { OfferTransactionController } from '../controllers/offerTransactionController';
import { Roles } from '../utils/roles.enum';

let offerTransactionController: OfferTransactionController;

test.beforeAll(async () => {
	offerTransactionController = await ApiFactory.getOfferTransactionApi();
});

test.describe('Offer Transaction Controller Tests', () => {
	test('Get distinct years for transactions by supplier', { tag: '@smoke' }, async () => {
		const response = await offerTransactionController.getDistinctYearsForTransactionsBySupplierId();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get transactions by interval for supplier', async () => {
		const filterData = loadJsonFile<any>('./testData/offer-transaction-filter.json');
		const response = await offerTransactionController.getTransactionsByInterval(
			filterData.startDate,
			filterData.endDate,
			filterData.page,
			filterData.size
		);
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Count transactions by interval for supplier', async () => {
		const filterData = loadJsonFile<any>('./testData/offer-transaction-filter.json');
		const response = await offerTransactionController.countMonthYearTransactionsBySupplierId(
			filterData.startDate,
			filterData.endDate
		);
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Count all transactions by supplier', async () => {
		const response = await offerTransactionController.countAllTransactionsBySupplierId();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get all valid transactions for supplier', async () => {
		const response = await offerTransactionController.getAllValidTransactions();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get transactions grouped by months for citizen', async () => {
		const offerTransactionController = await ApiFactory.getOfferTransactionApi(Roles.CITIZEN);
		const response = await offerTransactionController.getTransactionsGroupedByMonths();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get distinct years for transactions by tenant (municipality)', async () => {
		const offerTransactionController = await ApiFactory.getOfferTransactionApi(Roles.MUNICIPALITY);
		const response = await offerTransactionController.getDistinctYearsForTransactionsByTenantId();
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get transactions by interval for tenant (municipality)', async () => {
		const offerTransactionController = await ApiFactory.getOfferTransactionApi(Roles.MUNICIPALITY);
		const filterData = loadJsonFile<any>('./testData/offer-transaction-filter.json');
		const response = await offerTransactionController.getTransactionsByMonthYearAndTenant(
			filterData.startDate,
			filterData.endDate,
			filterData.page,
			filterData.size
		);
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Count transactions by interval for tenant (municipality)', async () => {
		const offerTransactionController = await ApiFactory.getOfferTransactionApi(Roles.MUNICIPALITY);
		const filterData = loadJsonFile<any>('./testData/offer-transaction-filter.json');
		const response = await offerTransactionController.countIntervalTransactionsByTenantId(
			filterData.startDate,
			filterData.endDate
		);
		expect(response.status()).toBe(StatusCodes.OK);

		const count: number = safeJsonParse(await response.text());
		expect(count).toBeGreaterThanOrEqual(0);
	});

	test('Count all transactions by tenant (municipality)', async () => {
		offerTransactionController = await ApiFactory.getOfferTransactionApi(Roles.MUNICIPALITY);
		const response = await offerTransactionController.countAllTransactionsByTenantId();
		expect(response.status()).toBe(StatusCodes.OK);

		const count: number = safeJsonParse(await response.text());
		expect(count).toBeGreaterThanOrEqual(0);
	});
});
