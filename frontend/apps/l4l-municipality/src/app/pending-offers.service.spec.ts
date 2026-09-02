import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OfferUseDto } from '@frontend/common';

import { ApproveOfferDto } from './_models/approve-offer-dto.model';
import { RejectOfferDto } from './_models/reject-offer-dto.model';
import { PendingOffersService } from './pending-offers.service';

describe('PendingOffersService', () => {
	let service: PendingOffersService;
	let httpMock: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [PendingOffersService, { provide: 'env', useValue: environmentMock }],
		});
		service = TestBed.inject(PendingOffersService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should send a GET request to fetch paginated offers', () => {
		const page = 1;
		const size = 10;

		service.getPendingOffers(page, size).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/tenant?page=${page}&size=${size}`);
		expect(req.request.method).toBe('GET');

		req.flush([]);
	});

	it('should send a GET request to fetch offer count', () => {
		service.countPendingOffers().subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/tenant/count`);
		expect(req.request.method).toBe('GET');

		req.flush(10);
	});

	it('should send a GET request to fetch paginated offers BySupplier', () => {
		const page = 1;
		const size = 10;
		const supplierId = 'supplierId';
		service.getPendingOffersBySupplier(page, size, supplierId).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(
			`${environmentMock.apiPath}/offers/supplier/${supplierId}?page=${page}&size=${size}`,
		);
		expect(req.request.method).toBe('GET');

		req.flush([]);
	});

	it('should send a GET request to fetch offer count BySupplier', () => {
		const supplierId = 'supplierId';

		service.countPendingOffersBySupplier(supplierId).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/supplier/${supplierId}/count`);
		expect(req.request.method).toBe('GET');

		req.flush(10);
	});

	it('should send a PUT request to approve an offer', () => {
		const dto = new ApproveOfferDto('testId', 1);

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		service.approveOffer(dto).subscribe(() => {});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/approve`);
		expect(req.request.method).toEqual('PUT');

		req.flush({});
	});

	it('should send a POST request to reject an offer', () => {
		const rejectOfferDto = new RejectOfferDto('testId', 'reason for rejection', 0);

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		service.rejectOffer(rejectOfferDto).subscribe(() => {});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/reject`);
		expect(req.request.method).toEqual('POST');
		expect(req.request.body).toEqual(rejectOfferDto);

		req.flush({});
	});

	it('should call the correct API endpoint and return an array of OfferTableDto', () => {
		const passholderId = '12345';
		const mockResponse = [
			{ id: 1, name: 'Offer 1' },
			{ id: 2, name: 'Offer 2' },
		];

		service.getOffersForPassholder(passholderId).subscribe((offers) => {
			expect(offers).toEqual(mockResponse);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/passholder/${passholderId}`);
		expect(req.request.method).toBe('GET');
		req.flush(mockResponse);
	});

	it('should send a POST request to download an offer', () => {
		const offerUseDto = new OfferUseDto('passholderIdValue', 'offerIdValue', new Date().toISOString(), undefined);
		const mockBlob = new Blob(['test'], { type: 'application/pdf' });

		service.downloadOffer(offerUseDto).subscribe((response) => {
			expect(response).toEqual(mockBlob);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/offers/download`);
		expect(req.request.method).toBe('POST');
		expect(req.request.headers.get('Accept')).toBe('application/pdf');
		expect(req.request.body).toEqual(offerUseDto);

		req.flush(mockBlob);
	});
});
