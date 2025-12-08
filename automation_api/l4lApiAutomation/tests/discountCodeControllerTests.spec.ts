import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { AssertHelper } from '../utils/assertHelper';
import {
	DiscountCode,
	ResponseDiscountCode,
	DiscountCodeValidation,
	DiscountCodeValidationResponse
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
let idDiscountCodeList: string[] = [];
let hasUsedOffer = false;

test.beforeEach(async () => {
	discountCodeController = await ApiFactory.getDiscountCodeApi();
});

test.afterEach(async () => {
	if (idOfferList.length > 0) {
		for (const id of idOfferList) {
			if (idDiscountCodeList.length > 0) {
				for (const idDiscountCode of idDiscountCodeList) {
					await dbTransaction.deleteTransactionsByDiscountCodeId(idDiscountCode);
				}
				idDiscountCodeList = [];
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

test.describe('Discount Code Controller Tests', { tag: '@smoke' }, () => {
	test('Get discount codes', { tag: '@smoke' }, async () => {
		const response = await discountCodeController.getDiscountCodes();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: ResponseDiscountCode = await response.json();
		const getAllDiscountCodesQuery: ResponseDiscountCode = await db.getAllDiscountCodes();
		AssertHelper.compareData(responseBody, getAllDiscountCodesQuery);
	});

	test('Get discount code by offer id', { tag: '@smoke' }, async () => {
		const offerId = '0e10f90c-b499-47dd-965c-139f02f0d2e8';
		const response = await discountCodeController.getDiscountCodeById(offerId);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: DiscountCode = await response.json();
		const getDiscountCodeByOfferIdQuery: DiscountCode[] = await db.getDiscountCode(true, offerId);
		AssertHelper.compareData(responseBody, getDiscountCodeByOfferIdQuery[0]);
	});

	test('Validate discount code', async () => {
		let offerController = await ApiFactory.getOfferApi();
		const offerData = loadJsonFile<OfferRequest>('./testData/offerData.json');

		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: OfferResponse = await response.json();
		idOfferList.push(responseBody.id);

		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const responseApprove = await offerController.approveOffer(responseBody.id);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		offerController = await ApiFactory.getOfferApi(Roles.CITIZEN);

		const data: OfferUse = {
			offerId: responseBody.id,
			currentTime: '01:00:00',
			amount: 0
		};

		const useOfferResponse = await offerController.useOffer(data);
		expect(useOfferResponse.status()).toBe(StatusCodes.NO_CONTENT);

		hasUsedOffer = true;

		const discountCode = (await db.getDiscountCode(true, responseBody.id))[0].code;

		const validateData: DiscountCodeValidation = {
			code: discountCode,
			currentTime: '09/15/2025, 13:44:45',
			amount: 10
		};

		discountCodeController = await ApiFactory.getDiscountCodeApi(Roles.SUPPLIER);
		
		const validateResponse = await discountCodeController.validateDiscountCode(validateData);
		expect(validateResponse.status()).toBe(StatusCodes.OK);

		idDiscountCodeList = await db.getDiscountCodeId(discountCode);

		const validateResponseBody: DiscountCodeValidationResponse = await validateResponse.json();
		const validateDiscountCodeQuery: DiscountCodeValidationResponse = await db.getValidateDiscountCode(
			discountCode
		);
		validateDiscountCodeQuery.currentTime = validateData.currentTime.substring(12, 17);
		AssertHelper.compareData(validateResponseBody, validateDiscountCodeQuery);
	});
});
