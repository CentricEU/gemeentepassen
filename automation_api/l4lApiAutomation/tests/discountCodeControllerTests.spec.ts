import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import * as offer from '../apiModels/offerModels';
import {
	DiscountCode,
	ResponseDiscountCode,
	DiscountCodeValidation
} from '../apiModels/discountCodeModels';
import { OfferUse, OfferRequest, OfferResponse } from '../apiModels/offerModels';
import * as db from '../db/queries/discountCodeQueries';
import * as dbOffer from '../db/queries/offerQueries';
import * as dbTransaction from '../db/queries/transactionsQueries';
import { DiscountCodeController } from '../controllers/discountCodeController';
import { Roles } from '../utils/roles.enum';
import { loadJsonFile } from '../utils/jsonHelper';

let discountCodeController: DiscountCodeController;
let idOfferList: string[] = [];
let discountCodeList: string[] = [];
let hasUsedOffer = false;

test.beforeEach(async () => {
	discountCodeController = await ApiFactory.getDiscountCodeApi();
});

test.afterEach(async () => {
	if (idOfferList.length > 0) {
		for (const id of idOfferList) {
			if (discountCodeList.length > 0) {
				for (const discountCode of discountCodeList) {
					await dbTransaction.deleteTransactionsByDiscountCode(discountCode);
				}
				discountCodeList = [];
			}
			if (hasUsedOffer) {
				await db.deleteDiscountCodeByOfferId(id);
				hasUsedOffer = false;
			}
			await dbOffer.deleteOfferById(id);
		}
		idOfferList = [];
	}
});

test.describe('Discount Code Controller Tests', () => {
	test('Get discount codes', { tag: '@smoke' }, async () => {
		const response = await discountCodeController.getDiscountCodes();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: ResponseDiscountCode = await response.json();
		expect(responseBody.active.length).toBeGreaterThanOrEqual(0);
		expect(responseBody.inactive.length).toBeGreaterThanOrEqual(0);
	});

	test('Get discount code by offer id', async () => {
		const offerId = '99d0b365-5e60-4da2-8041-344af5118811';
		const response = await discountCodeController.getDiscountCodeById(offerId);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: DiscountCode = await response.json();
		expect(responseBody.offerTitle).toBe('10% off at Local Bookstore');
	});

	test('Get claimed status of an offer', async () => {
		const offerIdClaimed = '99d0b365-5e60-4da2-8041-344af5118811';
		const offerIdNotCLaim='22c6561f-98bf-4ed2-80fc-2d36b9c8dc8f';

		const discountCodeController= await ApiFactory.getDiscountCodeApi(Roles.SUPPLIER);
		const response = await discountCodeController.checkClaimedDiscountCode(offerIdClaimed);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody = await response.text();
		expect(responseBody).toBe("true");

		const responseNotClaimed = await discountCodeController.checkClaimedDiscountCode(offerIdNotCLaim);
		expect(responseNotClaimed.status()).toBe(StatusCodes.OK);
		const responseBodyNotClaimed = await responseNotClaimed.text();
		expect(responseBodyNotClaimed).toBe("false");
	});

	test('Validate discount code', async () => {
		const offerController = await ApiFactory.getOfferApi();
		const offerData = loadJsonFile<OfferRequest>('./testData/offerData.json');

		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);

		const offerControllerMunicipality = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);

		const offerApproveData: offer.OfferApprove = {
			offerId: responseBody[0].id,
			version: 0
		};

		const responseApprove = await offerControllerMunicipality.approveOffer(offerApproveData);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		const offerControllerCitizen = await ApiFactory.getOfferApi(Roles.CITIZEN);

		const data: OfferUse = {
			offerId: responseBody[0].id,
			currentTime: '01:00:00',
			amount: 1
		};

		const useOfferResponse = await offerControllerCitizen.useOffer(data);
		expect(useOfferResponse.status()).toBe(StatusCodes.NO_CONTENT);

		hasUsedOffer = true;

		const discountCode = await discountCodeController.getDiscountCodeById(responseBody[0].id);
		const discountData: DiscountCode = await discountCode.json();

		const validateData: DiscountCodeValidation = {
			code: discountData.code,
			currentTime: '03/09/2026, 23:20:42',
			amount: 1
		};

		const discountCodeControllerSupplier = await ApiFactory.getDiscountCodeApi(Roles.SUPPLIER);

		const validateResponse = await discountCodeControllerSupplier.validateDiscountCode(validateData);
		expect(validateResponse.status()).toBe(StatusCodes.OK);

		var discountCodes = await discountCodeController.getDiscountCodeById(responseBody[0].id);
		expect(discountCodes.status()).toBe(StatusCodes.OK);
		const discountCodeBody: DiscountCode = await discountCodes.json();
		discountCodeList.push(discountCodeBody.code);
	});
});
