import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { WorkingHoursController } from '../controllers/workingHoursController';
import { AssertHelper } from '../utils/assertHelper';
import { WorkingHour } from '../apiModels/supplierProfileModels';

let workingHoursController: WorkingHoursController;

test.beforeAll(async () => {
	workingHoursController = await ApiFactory.getWorkingHoursApi();
});

test.describe('Working Hours Controller Tests', () => {
	test('Get working hours for supplier', async () => {
		const response = await workingHoursController.getWorkingHoursForSupplier(process.env.SUPPLIER_ID ?? '');
		expect(response.status()).toBe(StatusCodes.OK);

		const body = await response.json();
		expect(Array.isArray(body)).toBe(true);
		AssertHelper.hasInvalidValues(body);
	});

	test('Edit working hours for supplier', async () => {
		var getResponse = await workingHoursController.getWorkingHoursForSupplier(process.env.SUPPLIER_ID ?? '');
		var existingWorkingHours = await getResponse.json();

		const randomMinutes = Math.floor(Math.random() * 50) + 10;
		const minutesStr = randomMinutes.toString();

		const updatedWorkingHours = existingWorkingHours.map((wh: WorkingHour) => ({
			...wh,
			openTime: `09:${minutesStr}:00`,
			closeTime: `17:${minutesStr}:00`,
			isChecked: true
		}));

		const patchResponse = await workingHoursController.editWorkingHours(process.env.SUPPLIER_ID ?? '', updatedWorkingHours);
		expect(patchResponse.status()).toBe(StatusCodes.OK);

		getResponse = await workingHoursController.getWorkingHoursForSupplier(process.env.SUPPLIER_ID ?? '');
		existingWorkingHours = await getResponse.json();

		existingWorkingHours.forEach((item: WorkingHour) => {
			expect(item.openTime).toBe(`09:${minutesStr}:00`);
			expect(item.closeTime).toBe(`17:${minutesStr}:00`);
			expect(item.isChecked).toBe(true);
		});
	});
});
