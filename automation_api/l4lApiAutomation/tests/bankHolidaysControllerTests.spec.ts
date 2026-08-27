import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { BankHolidaysController } from '../controllers/bankHolidaysController';
import { AssertHelper } from '../utils/assertHelper';

let bankHolidaysController: BankHolidaysController;

test.beforeAll(async () => {
	bankHolidaysController = await ApiFactory.getBankHolidaysApi();
});

test.describe('Bank Holidays Controller Tests', () => {
	test('Get bank holidays',  async () => {
		const testYear = 2023;
		const response = await bankHolidaysController.getBankHolidaysForYear(testYear);
		expect(response.status()).toBe(StatusCodes.OK);

		const body = await response.json();
		expect(Array.isArray(body)).toBe(true);
		AssertHelper.hasInvalidValues(body);

		body.forEach((holiday: any) => {
			expect(holiday.year).toBe(testYear);
		});
	});
});
