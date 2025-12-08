import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { loadJsonFile, safeJsonParse } from '../utils/jsonHelper';
import * as db from '../db/queries/offerQueries';
import * as dbDiscountCode from '../db/queries/discountCodeQueries';
import { OfferController } from '../controllers/offerController';
import { AssertHelper } from '../utils/assertHelper';
import * as offer from '../apiModels/offerModels';
import { Roles } from '../utils/roles.enum';
import { TimeInterval } from '../utils/timeInterval.enum';

let offerController: OfferController;
let idOfferList: string[] = [];
let hasRejectedOffer = false;
let hasUsedOffer = false;

function toTimeString(iso: string): string {
	const date = new Date(iso);
	return date.toISOString().substring(11, 19);
}

test.beforeEach(async () => {
	offerController = await ApiFactory.getOfferApi();
});

test.afterEach(async () => {
	if (idOfferList.length > 0) {
		for (const id of idOfferList) {
			if (hasRejectedOffer) {
				await db.deleteOfferRejectionByOfferId(id);
				hasRejectedOffer = false;
			}
			if (hasUsedOffer) {
				await dbDiscountCode.deleteDiscountCodeByOfferId(id);
				hasUsedOffer = false;
			}
			await db.deleteOfferById(id);
		}
		idOfferList = [];
	}
});

test.describe('Offer Controller Tests', () => {
	test('Get offers', { tag: '@smoke' }, async () => {
		const response = await offerController.getOffers();
		expect(response.status()).toBe(StatusCodes.OK);
		let responseBody: offer.OfferResponse[] = await response.json();
		const getAllOffersQuery = await db.getOffers(false, true);
		AssertHelper.compareDataList(responseBody, getAllOffersQuery);
	});

	test('Get offers types', { tag: '@smoke' }, async () => {
		const response = await offerController.getOfferTypes();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferType[] = await response.json();
		const getOfferTypesQuery = await db.getOfferTypes();
		AssertHelper.compareDataList(responseBody, getOfferTypesQuery);
	});

	test('Get offers by tenant', { tag: '@smoke' }, async () => {
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const response = await offerController.getOffersTenant();
		expect(response.status()).toBe(StatusCodes.OK);
		let responseBody: offer.OfferResponse[] = await response.json();
		const getOffersTenantQuery = await db.getOffers(true, true);

		AssertHelper.compareDataList(responseBody, getOffersTenantQuery);
	});

	test('Get count of offers by tenant', { tag: '@smoke' }, async () => {
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const response = await offerController.getCountOffersTenant();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: number = safeJsonParse(await response.text());
		const getOffersTenantQuery = await db.getOffers(true);
		expect(responseBody).toBe(getOffersTenantQuery.length);
	});

	test('Get offers by supplier ID', { tag: '@smoke' }, async () => {
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const supplierId = process.env.SUPPLIER_ID;
		const response = await offerController.getOffersSupplierById(supplierId);
		expect(response.status()).toBe(StatusCodes.OK);
		let responseBody: offer.OfferResponse[] = await response.json();
		const getOffersSupplierQuery = await db.getOffers(false, true);
		AssertHelper.compareDataList(responseBody, getOffersSupplierQuery);
	});

	test('Get count of offers by supplier ID', { tag: '@smoke' }, async () => {
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const supplierId = process.env.SUPPLIER_ID;
		const response = await offerController.getCountOffersSupplierById(supplierId);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: number = safeJsonParse(await response.text());
		const getOffersSupplierQuery = await db.getOffers();
		expect(responseBody).toBe(getOffersSupplierQuery.length);
	});

	for (const timeInterval of Object.values(TimeInterval)) {
		test(`Get offer status count by ${timeInterval} per supplier `, { tag: '@smoke' }, async () => {
			const response = await offerController.getOffersStatusCountsTimePeriod(timeInterval);
			expect(response.status()).toBe(StatusCodes.OK);
			const responseBody: offer.OfferCountsTimePeriod = await response.json();
			const getOffersStatusCountsTimePeriodQuery = await db.getOffersCountByTimePeriod(timeInterval);
			AssertHelper.compareData(responseBody, getOffersStatusCountsTimePeriodQuery);
		});
	}

	test('Get offers search', { tag: '@smoke' }, async () => {
		offerController = await ApiFactory.getOfferApi(Roles.CITIZEN);
		const searchKeyword = 'search';
		const response = await offerController.getOffersSearch(searchKeyword);
		expect(response.status()).toBe(StatusCodes.OK);

		let responseBody: offer.OfferResponse[] = await response.json();
		const expectedBody = ['Automation search Offer 1', 'Automation search Offer 2'];

		expect(responseBody.length).toBe(expectedBody.length);
		AssertHelper.compareDataList(responseBody, expectedBody);
	});

	test('Get rejected offer', { tag: '@smoke' }, async () => {
		const offerId = '4a3eeb41-b252-4aae-9650-1b65978f2988';
		const response = await offerController.getRejectedOffers(offerId);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferReject = await response.json();
		const getRejectedOfferQuery = await db.getRejectedOfferById(offerId);
		AssertHelper.compareData(responseBody, getRejectedOfferQuery);
	});

	test('Get full offer details', { tag: '@smoke' }, async () => {
		const offerId = '1f761192-d81c-4905-98d0-29eaf860d1dd';
		const response = await offerController.getOffersFullById(offerId);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferFull = await response.json();
		const getOfferFullDetailsQuery = await db.getOfferFullDetails(offerId);

		AssertHelper.compareData(responseBody, getOfferFullDetailsQuery);
	});

	test('Get offers with filter', { tag: '@smoke' }, async () => {
		const status = 'ACTIVE';
		const offerTypeId = 1;
		const id = 'd3d01c52-b21b-442f-9cd1-71f41b39d875';

		const response = await offerController.getOffersFilter(status, offerTypeId, id);
		expect(response.status()).toBe(StatusCodes.OK);

		let responseBody: offer.OfferResponse[] = await response.json();

		responseBody.sort((a, b) => a.title.localeCompare(b.title));

		const getOffersFilterQuery = await db.getOffers(false, true, true, offerTypeId);
		AssertHelper.compareDataList(responseBody, getOffersFilterQuery);
	});

	test('Get count filtered offers', { tag: '@smoke' }, async () => {
		const status = 'ACTIVE';
		const offerTypeId = 1;
		const id = 'd3d01c52-b21b-442f-9cd1-71f41b39d875';

		const response = await offerController.getOffersFilterCount(status, offerTypeId, id);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: number = safeJsonParse(await response.text());

		const getOffersFilterQuery = await db.getOffers(false, false, true, offerTypeId);

		expect(getOffersFilterQuery.length).toBe(responseBody);
	});

	test('Get offers details by ID and coordinates', { tag: '@smoke' }, async () => {
		const offerId = '1f761192-d81c-4905-98d0-29eaf860d1dd';
		const latitude = 52.920677;
		const longitude = 6.796378;
		const currentDay = new Date().toISOString().slice(0, 10);
		const expectedDistance = 159000.11011181;

		offerController = await ApiFactory.getOfferApi(Roles.CITIZEN);
		const response = await offerController.getOffersDetailsById(
			offerId,
			latitude,
			longitude,
			currentDay.toString()
		);

		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferDetails = await response.json();
		responseBody.coordinatesString = JSON.parse(responseBody.coordinatesString.toString());

		const getOfferDetailsByIdQuery = await db.getOfferDetails(offerId);

		getOfferDetailsByIdQuery.distance = expectedDistance;

		AssertHelper.compareData(responseBody, getOfferDetailsByIdQuery);
	});

	test('Get count of offers', { tag: '@smoke' }, async () => {
		const response = await offerController.getOffersCount();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody = Number(await response.text());

		const getOffersCountQuery = await db.getOffers();
		expect(responseBody).toBe(getOffersCountQuery.length);
	});

	test('Create an offer', async () => {
		const offerData = await loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferResponse = await response.json();
		idOfferList.push(responseBody.id);
		const getOffersQuery = await db.getOfferWithGrantIds(responseBody.id);

		offerData.restrictionRequestDto.timeFrom = toTimeString(offerData.restrictionRequestDto.timeFrom);
		offerData.restrictionRequestDto.timeTo = toTimeString(offerData.restrictionRequestDto.timeTo);
		AssertHelper.compareData(offerData, getOffersQuery);
	});

	test('Approve offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse = await response.json();
		idOfferList.push(responseBody.id);

		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const responseApprove = await offerController.approveOffer(responseBody.id);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		const getOfferDetailsQuery = await db.getOffers();
		const offerCreated = getOfferDetailsQuery.find((offer) => offer.id === responseBody.id);
		expect(offerCreated.status).toBe('ACTIVE');
	});

	test('Use offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferResponse = await response.json();
		idOfferList.push(responseBody.id);

		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const responseApprove = await offerController.approveOffer(responseBody.id);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		offerController = await ApiFactory.getOfferApi(Roles.CITIZEN);

		const data: offer.OfferUse = {
			offerId: responseBody.id,
			currentTime: '01:00:00',
			amount: 0
		};

		const useOfferResponse = await offerController.useOffer(data);
		expect(useOfferResponse.status()).toBe(StatusCodes.NO_CONTENT);

		hasUsedOffer = true;

		const getOfferDetailsQuery = await db.getOfferDetails(responseBody.id);
		expect(getOfferDetailsQuery.discountCode).toBeDefined();
	});

	test('Reject offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse = await response.json();
		idOfferList.push(responseBody.id);
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);

		const data: offer.OfferReject = {
			offerId: responseBody.id,
			reason: 'Test rejection reason'
		};

		const rejectOffer = await offerController.rejectOffer(data);
		expect(rejectOffer.status()).toBe(StatusCodes.NO_CONTENT);

		hasRejectedOffer = true;

		const getRejectedOfferQuery = await db.getRejectedOfferById(responseBody.id);
		AssertHelper.compareData(data, getRejectedOfferQuery);
	});

	test('Reactivate an offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse = await response.json();
		idOfferList.push(responseBody.id);

		await db.updateOfferToExpired(responseBody.id);

		const data: offer.OfferReactivate = {
			offerId: responseBody.id,
			startDate: '2025-07-24',
			expirationDate: '2030-07-31'
		};

		const reactivateOfferResponse = await offerController.reactivateOffer(data);
		expect(reactivateOfferResponse.status()).toBe(StatusCodes.NO_CONTENT);

		const getOfferDetailsQuery = await db.getOffers();
		const offerCreated = getOfferDetailsQuery.find((offer) => offer.id === responseBody.id);
		expect(offerCreated.startDate).toBe(data.startDate);
		expect(offerCreated.expirationDate).toBe(data.expirationDate);
		expect(offerCreated.status).toBe('ACTIVE');
	});

	test('Delete an offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse = await response.json();
		idOfferList.push(responseBody.id);

		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const responseApprove = await offerController.approveOffer(responseBody.id);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		const data = {
			offersIds: [responseBody.id]
		};

		offerController = await ApiFactory.getOfferApi(Roles.SUPPLIER);
		const responseDelete = await offerController.deleteOffers(data);

		expect(responseDelete.status()).toBe(StatusCodes.OK);

		const offersQuery = await db.getOfferIsActive(responseBody.id);

		expect(offersQuery).toBe(false);
	});

	test('Get offers list viewport', { tag: '@smoke' }, async () => {
		offerController = await ApiFactory.getOfferApi(Roles.CITIZEN);
		const data: offer.OffersListViewport = {
			page: 0,
			latitude: 52.920677,
			longitude: 6.796378,
			currentDay: new Date().toISOString().slice(0, 10),
			offerTypeId: 1
		};

		const response = await offerController.getOffersList(data);
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Get offers map viewport', { tag: '@smoke' }, async () => {
		offerController = await ApiFactory.getOfferApi(Roles.CITIZEN);
		const data: offer.OffersMapViewport = {
			minLat: 52.920677,
			maxLat: 52.930677,
			minLong: 6.796378,
			maxLong: 6.806378,
			currentDay: new Date().toISOString().slice(0, 10),
			offerTypeId: -1
		};

		const response = await offerController.getOffersMapViewport(data);
		expect(response.status()).toBe(StatusCodes.OK);
	});
});
