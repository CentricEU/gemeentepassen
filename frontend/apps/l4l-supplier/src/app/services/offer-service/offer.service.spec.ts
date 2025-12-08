import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GenericStatusEnum, OfferTableDto, TimeIntervalPeriod } from '@frontend/common';

import { DeleteOffersDto } from '../../models/delete-offers-dto.model';
import { FilterOfferRequestDto } from '../../models/filter-offer-request-dto.model';
import { OfferRejectionReasonDto } from '../../models/offer-rejection-reason-dto.model';
import { ReactivateOfferDto } from '../../models/reactivate-offer-dto.model';
import { OfferService } from './offer.service';

describe('OfferService', () => {
	let service: OfferService;
	let httpMock: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [OfferService, { provide: 'env', useValue: environmentMock }],
		});
		service = TestBed.inject(OfferService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should send a POST request to create an offer', () => {
		const offerData = {
			title: 'Test Grant',
			description: 'Test Description',
			citizenOfferType: 'CITIZEN',
			offerTypeId: 3,
			amount: 50,
			startDate: new Date('2021-01-01'),
			expirationDate: new Date('2021-12-31'),
			benefitId: 'benefit-123',
		};

		service.createOffer(offerData).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers`);
		expect(req.request.method).toBe('POST');

		req.flush({});
	});

	it('should send a GET request to fetch offer types', () => {
		service.getOfferTypes().subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/types`);
		expect(req.request.method).toBe('GET');

		req.flush([]);
	});

	it('should send a GET request to fetch paginated offers', () => {
		const page = 1;
		const size = 10;

		service.getOffers(page, size).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers?page=${page}&size=${size}`);
		expect(req.request.method).toBe('GET');

		req.flush([]);
	});

	it('should send a GET request to fetch offer count', () => {
		service.countOffers().subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/count`);
		expect(req.request.method).toBe('GET');

		req.flush(10);
	});

	it('should send a DELETE request to delete offers', () => {
		const testDeleteOffersDto = new DeleteOffersDto(['1', '2', '3']);
		service.deleteOffers(testDeleteOffersDto).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/delete`);
		expect(req.request.method).toBe('DELETE');
		expect(req.request.body).toEqual(testDeleteOffersDto);
	});

	it('should send a GET request to fetch a full offer', () => {
		service.getFullOffer('02').subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/full/02`);
		expect(req.request.method).toBe('GET');

		req.flush(10);
	});

	it('should send a PUT request to reactivate an offer', () => {
		const reactivateOfferDto: ReactivateOfferDto = {
			offerId: '19',
			startDate: new Date(),
			expirationDate: new Date(),
		};

		service.reactivateOffer(reactivateOfferDto).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/reactivate`);
		expect(req.request.method).toBe('PUT');
		expect(req.request.body).toEqual(reactivateOfferDto);
	});

	it('should send a GET request to fetch filtered offers', () => {
		const filterOfferRequestDto: FilterOfferRequestDto = {
			status: GenericStatusEnum.ACTIVE,
			offerTypeId: 1,
			benefitId: '100',
		};
		const page = 1;
		const size = 10;

		const mockOffers: OfferTableDto[] = [];

		service.getFilteredOffers(filterOfferRequestDto, page, size).subscribe((response) => {
			expect(response).toEqual(mockOffers);
		});

		const req = httpMock.expectOne((request) => {
			const offerTypeId = request.params.get('offerTypeId');
			return (
				request.url === `${environmentMock.apiPath}/offers/filter` &&
				request.params.get('status') === filterOfferRequestDto.status &&
				offerTypeId === filterOfferRequestDto.offerTypeId.toString() &&
				request.params.get('benefitId') === filterOfferRequestDto.benefitId &&
				request.params.get('pageIndex') === page.toString() &&
				request.params.get('pageSize') === size.toString()
			);
		});
		expect(req.request.method).toBe('GET');

		req.flush(mockOffers);
	});

	it('should send a GET request to count filtered offers', () => {
		const filterOfferRequestDto: FilterOfferRequestDto = {
			status: GenericStatusEnum.ACTIVE,
			offerTypeId: 1,
			benefitId: '100',
		};

		const mockCount = 5;

		service.countFilteredOffers(filterOfferRequestDto).subscribe((response) => {
			expect(response).toBe(mockCount);
		});

		const req = httpMock.expectOne((request) => {
			const offerTypeId = request.params.get('offerTypeId');
			return (
				request.url === `${environmentMock.apiPath}/offers/filter/count` &&
				request.params.get('status') === filterOfferRequestDto.status &&
				offerTypeId === filterOfferRequestDto.offerTypeId.toString() &&
				request.params.get('benefitId') === filterOfferRequestDto.benefitId
			);
		});
		expect(req.request.method).toBe('GET');

		req.flush(mockCount);
	});

	it('should send a GET request to fetch filtered offers with empty benefitId', () => {
		const filterOfferRequestDto: FilterOfferRequestDto = {
			status: GenericStatusEnum.ACTIVE,
			offerTypeId: 1,
			benefitId: '',
		};
		const page = 1;
		const size = 10;

		const mockOffers: OfferTableDto[] = [];

		service.getFilteredOffers(filterOfferRequestDto, page, size).subscribe((response) => {
			expect(response).toEqual(mockOffers);
		});

		const req = httpMock.expectOne((request) => {
			const offerTypeId = request.params.get('offerTypeId');
			return (
				request.url === `${environmentMock.apiPath}/offers/filter` &&
				request.params.get('status') === filterOfferRequestDto.status &&
				offerTypeId === filterOfferRequestDto.offerTypeId.toString() &&
				request.params.get('benefitId') === filterOfferRequestDto.benefitId &&
				request.params.get('pageIndex') === page.toString() &&
				request.params.get('pageSize') === size.toString()
			);
		});
		expect(req.request.method).toBe('GET');

		req.flush(mockOffers);
	});

	it('should send a GET request to count filtered offers with empty status and targetType', () => {
		const filterOfferRequestDto: FilterOfferRequestDto = {
			status: '' as GenericStatusEnum,
			offerTypeId: 1,
			benefitId: '100',
		};

		const mockCount = 5;

		service.countFilteredOffers(filterOfferRequestDto).subscribe((response) => {
			expect(response).toBe(mockCount);
		});

		const req = httpMock.expectOne((request) => {
			const offerTypeId = request.params.get('offerTypeId');
			return (
				request.url === `${environmentMock.apiPath}/offers/filter/count` &&
				request.params.get('status') === filterOfferRequestDto.status &&
				offerTypeId === filterOfferRequestDto.offerTypeId.toString() &&
				request.params.get('benefitId') === filterOfferRequestDto.benefitId
			);
		});
		expect(req.request.method).toBe('GET');

		req.flush(mockCount);
	});

	it('should send a GET request to count filtered offers with undefined offerTypeId and benefitId', () => {
		const filterOfferRequestDto: FilterOfferRequestDto = {
			status: GenericStatusEnum.ACTIVE,
			offerTypeId: undefined as any,
			benefitId: undefined as any,
		};

		const mockCount = 10;

		service.countFilteredOffers(filterOfferRequestDto).subscribe((response) => {
			expect(response).toBe(mockCount);
		});

		const req = httpMock.expectOne((request) => {
			const offerTypeId = request.params.get('offerTypeId');
			const benefitId = request.params.get('benefitId');

			const offerTypeIdShouldNotBePresent = offerTypeId === undefined || offerTypeId === null;
			const benefitIdShouldNotBePresent = benefitId === undefined;

			return (
				request.url === `${environmentMock.apiPath}/offers/filter/count` &&
				request.params.get('status') === filterOfferRequestDto.status &&
				(!offerTypeIdShouldNotBePresent ? offerTypeId === '' : true) &&
				(!benefitIdShouldNotBePresent ? benefitId === '' : true)
			);
		});
		expect(req.request.method).toBe('GET');

		req.flush(mockCount);
	});

	it('should send a GET request to fetch filtered offers with undefined offerTypeId and benefitId', () => {
		const filterOfferRequestDto: FilterOfferRequestDto = {
			status: GenericStatusEnum.ACTIVE,
			offerTypeId: undefined as any,
			benefitId: undefined as any,
		};

		const page = 1;
		const size = 10;
		const mockOffers: OfferTableDto[] = [];

		service.getFilteredOffers(filterOfferRequestDto, page, size).subscribe((response) => {
			expect(response).toEqual(mockOffers);
		});

		const req = httpMock.expectOne((request) => {
			const offerTypeId = request.params.get('offerTypeId');
			const benefitId = request.params.get('benefitId');

			const offerTypeIdShouldNotBePresent = offerTypeId === undefined || offerTypeId === null;
			const benefitIdShouldNotBePresent = benefitId === undefined;

			return (
				request.url === `${environmentMock.apiPath}/offers/filter` &&
				request.params.get('status') === filterOfferRequestDto.status &&
				(!offerTypeIdShouldNotBePresent ? offerTypeId === '' : true) &&
				(!benefitIdShouldNotBePresent ? benefitId === '' : true) &&
				request.params.get('pageIndex') === page.toString() &&
				request.params.get('pageSize') === size.toString()
			);
		});
		expect(req.request.method).toBe('GET');

		req.flush(mockOffers);
	});

	it('should send a GET request to fetch the offer rejection reason', () => {
		const mockResponse = new OfferRejectionReasonDto('12', 'title', 'reason');

		service.getOfferRejectionReason('12').subscribe((response) => {
			expect(response).toEqual(mockResponse);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/rejection/12`);
		expect(req.request.method).toBe('GET');

		req.flush(mockResponse);
	});

	it('should send a GET request to fetch filtered offers with undefined status and targetType', () => {
		const filterOfferRequestDto: FilterOfferRequestDto = {
			status: undefined as any,
			offerTypeId: 1,
			benefitId: '100',
		};
		const page = 1;
		const size = 10;

		const mockOffers: OfferTableDto[] = [];

		service.getFilteredOffers(filterOfferRequestDto, page, size).subscribe((response) => {
			expect(response).toEqual(mockOffers);
		});

		const req = httpMock.expectOne((request) => {
			const status = request.params.get('status');
			const offerTypeId = request.params.get('offerTypeId');
			return (
				request.url === `${environmentMock.apiPath}/offers/filter` &&
				status === '' &&
				offerTypeId === filterOfferRequestDto.offerTypeId.toString() &&
				request.params.get('benefitId') === filterOfferRequestDto.benefitId &&
				request.params.get('pageIndex') === page.toString() &&
				request.params.get('pageSize') === size.toString()
			);
		});
		expect(req.request.method).toBe('GET');

		req.flush(mockOffers);
	});

	it('should send a GET request to fetch filtered offers with null status and targetType', () => {
		const filterOfferRequestDto: FilterOfferRequestDto = {
			status: null as any,
			offerTypeId: 1,
			benefitId: '100',
		};
		const page = 1;
		const size = 10;

		const mockOffers: OfferTableDto[] = [];

		service.getFilteredOffers(filterOfferRequestDto, page, size).subscribe((response) => {
			expect(response).toEqual(mockOffers);
		});

		const req = httpMock.expectOne((request) => {
			const status = request.params.get('status');
			const offerTypeId = request.params.get('offerTypeId');
			return (
				request.url === `${environmentMock.apiPath}/offers/filter` &&
				status === '' &&
				offerTypeId === filterOfferRequestDto.offerTypeId.toString() &&
				request.params.get('benefitId') === filterOfferRequestDto.benefitId &&
				request.params.get('pageIndex') === page.toString() &&
				request.params.get('pageSize') === size.toString()
			);
		});
		expect(req.request.method).toBe('GET');

		req.flush(mockOffers);
	});

	it('should send a GET request to fetch the offer counts by status', () => {
		const mockOfferCounts = {
			activeCount: 5,
			expiredCount: 5,
			pendingCount: 5,
		};

		service.getOfferCountsByStatus(TimeIntervalPeriod.MONTHLY, true).subscribe((response) => {
			expect(response).toEqual(mockOfferCounts);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/status/counts/${TimeIntervalPeriod.MONTHLY}`);
		expect(req.request.method).toBe('GET');

		req.flush(mockOfferCounts);
	});
});
