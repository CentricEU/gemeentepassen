import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { OfferSearchHistoryController } from '../controllers/offerSearchHistoryController';

let searchHistoryController: OfferSearchHistoryController;

test.beforeAll(async () => {
	searchHistoryController = await ApiFactory.getOfferSearchHistoryApi();
});

test.describe('Offer Search History Controller Tests', () => {
	test('Get search history for citizen', async () => {
		const response = await searchHistoryController.getSearchHistoryForCitizen();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody = await response.json();
		expect(responseBody.length).toBeGreaterThan(0);
		expect(responseBody.length).toBeLessThanOrEqual(5);
	});
});
