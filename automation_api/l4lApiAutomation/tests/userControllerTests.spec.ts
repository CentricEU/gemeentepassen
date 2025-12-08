import test, { expect } from '@playwright/test';
import { UserController } from '../controllers/userController';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { safeJsonParse } from '../utils/jsonHelper';
import { getUserById } from '../db/queries/userQueries';
import { AssertHelper } from '../utils/assertHelper';

let userController: UserController;

test.beforeAll(async () => {
	userController = await ApiFactory.getUserApi();
});

test.describe('User Controller Tests', () => {
	test('Get User', async () => {
		const id = process.env.USER_SUPPLIER_ID;
		const response = await userController.getUser(id);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody = safeJsonParse(await response.text());
		const getUserQuery = await getUserById(id);

		AssertHelper.compareData(responseBody, getUserQuery[0]);
	});

	test('Get Confirmation Account', async () => {
		const response = await userController.getConfirmAccount(process.env.TOKEN);
		expect(response.status()).toBe(StatusCodes.OK);
	});
});
