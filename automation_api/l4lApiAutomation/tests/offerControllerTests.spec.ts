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
	test('Get offers', async () => {
		const response = await offerController.getOffers();
		expect(response.status()).toBe(StatusCodes.OK);
		expect((await response.json()).length).toBeGreaterThan(0);
	});

	test('Get offers types', async () => {
		const response = await offerController.getOfferTypes();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferType[] = await response.json();
		const getOfferTypesQuery = await db.getOfferTypes();
		const sortedResponseBody = [...responseBody].sort((a, b) => a.offerTypeId - b.offerTypeId);
		const sortedQueryResult = [...getOfferTypesQuery].sort((a, b) => a.offerTypeId - b.offerTypeId);
		AssertHelper.compareDataList(sortedResponseBody, sortedQueryResult);
	});

	test('Get offers by tenant', async () => {
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const response = await offerController.getOffersTenant();
		expect(response.status()).toBe(StatusCodes.OK);
		expect((await response.json()).length).toBeGreaterThan(0);
	});

	test('Get count of offers by tenant', async () => {
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const response = await offerController.getCountOffersTenant();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: number = safeJsonParse(await response.text());
		expect(responseBody).toBeGreaterThan(0);
	});

	test('Get offers by supplier ID', async () => {
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const supplierId = process.env.SUPPLIER_ID;
		const response = await offerController.getOffersSupplierById(supplierId);
		expect(response.status()).toBe(StatusCodes.OK);
		expect((await response.json()).length).toBeGreaterThan(0);
	});

	test('Get count of offers by supplier ID', async () => {
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const supplierId = process.env.SUPPLIER_ID;
		const response = await offerController.getCountOffersSupplierById(supplierId);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: number = safeJsonParse(await response.text());
		expect(responseBody).toBeGreaterThan(0);
	});

	for (const timeInterval of Object.values(TimeInterval)) {
		test(`Get offer status count by ${timeInterval} per supplier `, async () => {
			const response = await offerController.getOffersStatusCountsTimePeriod(timeInterval);
			expect(response.status()).toBe(StatusCodes.OK);
			AssertHelper.hasInvalidValues(await response.json());
		});
	}

	test('Get offers search', async () => {
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
		const offerId = '49986cc0-4b5e-48d4-bed5-065075070ec6';
		const response = await offerController.getRejectedOffers(offerId);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferReject = await response.json();
		expect(responseBody.offerId).toBe(offerId);
	});

	test('Get full offer details', async () => {
		const offerId = '7454b911-db90-43e2-8f75-77bb5f331399';
		const response = await offerController.getOffersFullById(offerId);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferFull = await response.json();
		expect(responseBody.id).toBe(offerId);
	});

	test('Get offers with filter', async () => {
		const status = 'ACTIVE';
		const offerTypeId = 2;
		const id = '7454b911-db90-43e2-8f75-77bb5f331399';

		const response = await offerController.getOffersFilter(status, offerTypeId, id);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferResponse[] = await response.json();
		expect(responseBody.length).toBeGreaterThan(0);
		expect(responseBody.some((offer) => offer.id === id)).toBeTruthy();
	});

	test('Get count filtered offers', async () => {
		const status = 'ACTIVE';
		const offerTypeId = 2;
		const id = '7454b911-db90-43e2-8f75-77bb5f331399';

		const response = await offerController.getOffersFilterCount(status, offerTypeId, id);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: number = safeJsonParse(await response.text());

		expect(responseBody).toBeGreaterThan(0);
	});

	test('Get offers details by ID and coordinates', async () => {
		const offerId = '7454b911-db90-43e2-8f75-77bb5f331399';
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
		expect(responseBody.id).toBe(offerId);
		expect(responseBody.distance).toBeCloseTo(expectedDistance, 2);
	});

	test('Get count of offers', async () => {
		const response = await offerController.getOffersCount();
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody = Number(await response.text());
		expect(responseBody).toBeGreaterThan(0);
	});

	test('Create an offer', { tag: '@smoke' },async () => {
		const offerData = await loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);
		const getOfferDetails = await offerController.getOffersFullById(responseBody[0].id);
		expect(getOfferDetails.status()).toBe(StatusCodes.OK);
		const getOfferDetailsBody: offer.OfferFull = await getOfferDetails.json();
		expect(getOfferDetailsBody.title).toBe(offerData.title);
		expect(getOfferDetailsBody.description).toBe(offerData.description);
		expect(getOfferDetailsBody.citizenOfferType).toBe(offerData.citizenOfferType);
		expect(getOfferDetailsBody.benefit.id).toBe(offerData.benefitIds[0]);
	});

	test('Approve offer', { tag: '@smoke' }, async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);

		const offerControllerMunicipality = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);

		const offerApproveData: offer.OfferApprove = {
			offerId: responseBody[0].id,
			version: 0
		};

		const responseApprove = await offerControllerMunicipality.approveOffer(offerApproveData);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		const getSupplierOffers = await offerControllerMunicipality.getOffersSupplierById(process.env.SUPPLIER_ID);
		const getSupplierOffersBody: offer.OfferResponse[] = await getSupplierOffers.json();

		const offerCreated = getSupplierOffersBody.find((offer) => offer.id === responseBody[0].id);

		expect(offerCreated.status).toBe('ACTIVE');
	});

	test('Use offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);
		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);

		const offerControllerMunicipality = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const offerApproveData: offer.OfferApprove = {
			offerId: responseBody[0].id,
			version: 0
		};

		const responseApprove = await offerControllerMunicipality.approveOffer(offerApproveData);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		const data: offer.OfferUse = {
			offerId: responseBody[0].id,
			currentTime: '01:00:00',
			amount: 10
		};

		const offerControllerCitizen = await ApiFactory.getOfferApi(Roles.CITIZEN);
		const useOfferResponse = await offerControllerCitizen.useOffer(data);
		expect(useOfferResponse.status()).toBe(StatusCodes.NO_CONTENT);

		hasUsedOffer = true;
	});

	test('Reject offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);
		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);

		const data: offer.OfferReject = {
			offerId: responseBody[0].id,
			reason: 'Test rejection reason',
			version: '0'
		};

		const offerControllerMunicipality = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const rejectOffer = await offerControllerMunicipality.rejectOffer(data);
		expect(rejectOffer.status()).toBe(StatusCodes.NO_CONTENT);

		hasRejectedOffer = true;

		data.version = '1';

		const getRejectedOfferQuery = await db.getRejectedOfferById(responseBody[0].id);
		AssertHelper.compareData(data, getRejectedOfferQuery);
	});

	test('Reactivate an offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);

		await db.updateOfferToExpired(responseBody[0].id);

		const data: offer.OfferReactivate = {
			offerId: responseBody[0].id,
			startDate: '2025-07-24',
			expirationDate: '2030-07-31'
		};

		const reactivateOfferResponse = await offerController.reactivateOffer(data);
		expect(reactivateOfferResponse.status()).toBe(StatusCodes.NO_CONTENT);

		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const getSupllierOffers = await offerController.getOffersSupplierById(process.env.SUPPLIER_ID);
		expect(getSupllierOffers.status()).toBe(StatusCodes.OK);

		const getSupllierOffersBody: offer.OfferResponse[] = await getSupllierOffers.json();
		const offerCreated = getSupllierOffersBody.find((offer) => offer.id === responseBody[0].id);
		expect(offerCreated.startDate).toBe(data.startDate);
		expect(offerCreated.expirationDate).toBe(data.expirationDate);
		expect(offerCreated.status).toBe('PENDING');
	});

	test('Delete an offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);

		const offerControllerMunicipality = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const offerApproveData: offer.OfferApprove = {
			offerId: responseBody[0].id,
			version: 0
		};

		const responseApprove = await offerControllerMunicipality.approveOffer(offerApproveData);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		const data = {
			offersIds: [responseBody[0].id]
		};

		offerController = await ApiFactory.getOfferApi(Roles.SUPPLIER);
		const responseDelete = await offerController.deleteOffers(data);

		expect(responseDelete.status()).toBe(StatusCodes.OK);

		offerController = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const getSupplierOffers = await offerController.getOffersSupplierById(process.env.SUPPLIER_ID);
		const getSupplierOffersBody: offer.OfferResponse[] = await getSupplierOffers.json();

		const offerDeleted = getSupplierOffersBody.find((offer) => offer.id === responseBody[0].id);
		expect(offerDeleted).toBeUndefined();
	});

	test('Get offers list viewport', async () => {
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

	test('Get offers map viewport', async () => {
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

	test('Download offer code', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);

		const offerControllerMunicipality = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const offerApproveData: offer.OfferApprove = {
			offerId: responseBody[0].id,
			version: 0
		};

		const responseApprove = await offerControllerMunicipality.approveOffer(offerApproveData);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		const offerControllerCitizen = await ApiFactory.getOfferApi(Roles.CITIZEN);
		const downloadData: offer.OfferDownloadRequest = {
			offerId: responseBody[0].id,
			passholderId: process.env.PASSHOLDER_ID,
			currentTime: '01:00:00',
			amount: 10
		};

		const downloadResponse = await offerControllerMunicipality.downloadCode(downloadData);
		expect(downloadResponse.status()).toBe(StatusCodes.OK);

		hasUsedOffer = true;
	});

	test('Suspend offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);

		const offerControllerMunicipality = await ApiFactory.getOfferApi(Roles.MUNICIPALITY);
		const offerApproveData: offer.OfferApprove = {
			offerId: responseBody[0].id,
			version: 0
		};

		const responseApprove = await offerControllerMunicipality.approveOffer(offerApproveData);
		expect(responseApprove.status()).toBe(StatusCodes.NO_CONTENT);

		const suspendResponse = await offerController.suspendOffer(responseBody[0].id);
		expect(suspendResponse.status()).toBe(StatusCodes.NO_CONTENT);

		const getOfferStatus = await db.getOfferStatusById(responseBody[0].id);
		expect(getOfferStatus.status).toBe('EXPIRED');
	});

	test('Edit offer', async () => {
		const offerData = loadJsonFile<offer.OfferRequest>('./testData/offerData.json');
		const response = await offerController.createOffer(offerData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: offer.OfferResponse[] = await response.json();
		idOfferList.push(responseBody[0].id);

		const editData: offer.OfferRequest = {
			...offerData,
			title: 'Automation Edited Offer',
			description: 'Edited description',
			version: 0
		};

		const editResponse = await offerController.editOffer(responseBody[0].id, editData);
		expect(editResponse.status()).toBe(StatusCodes.OK);

		const getOfferDetails = await offerController.getOffersFullById(responseBody[0].id);
		expect(getOfferDetails.status()).toBe(StatusCodes.OK);
		const getOfferDetailsBody: offer.OfferFull = await getOfferDetails.json();
		expect(getOfferDetailsBody.title).toBe('Automation Edited Offer');
		expect(getOfferDetailsBody.description).toBe('Edited description');

		const getOfferStatus = await db.getOfferStatusById(responseBody[0].id);
		expect(getOfferStatus.status).toBe('PENDING');
	});
});
