import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BenefitDto } from '@frontend/common';

import { BenefitService } from './benefit.service';

describe('BenefitService', () => {
	let service: BenefitService;
	let httpMock: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [BenefitService, { provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(BenefitService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should call HttpClient.post with the correct URL and payload when createBenefit is called', () => {
		const benefitCreateDto: BenefitDto = {
			name: 'Test Benefit',
			description: 'Test Description',
			startDate: new Date(),
			expirationDate: new Date(),
			citizenGroupIds: ['id1', 'id2'],
			amount: 100,
		};
		service.createBenefit(benefitCreateDto).subscribe();

		const req = httpMock.expectOne(`${environmentMock.apiPath}/benefits`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual(benefitCreateDto);

		req.flush(null);
	});

	it('should handle errors when createBenefit fails', () => {
		const benefitCreateDto: BenefitDto = {
			name: 'Test Benefit',
			description: 'Test Description',
			startDate: new Date(),
			expirationDate: new Date(),
			citizenGroupIds: ['id1', 'id2'],
			amount: 100,
		};
		let errorResponse: any;

		service.createBenefit(benefitCreateDto).subscribe({
			error: (error) => (errorResponse = error),
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/benefits`);
		req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(500);
		expect(errorResponse.statusText).toBe('Internal Server Error');
	});

	it('should call GET /benefits and return BenefitsResponse', () => {
		const mockResponse = {
			free_access_to_facilities: [
				{
					name: 'Free Museum',
					description: 'Access to museum',
					grants: ['MUSEUMS'],
				},
			],
			credit: [
				{
					name: 'Student Loan',
					description: 'Low-interest loan',
				},
			],
		};

		service.getAllBenefitsForCitizenGroup().subscribe((res) => {
			expect(res).toEqual(mockResponse);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/benefits`);
		expect(req.request.method).toBe('GET');

		req.flush(mockResponse);
	});

	it('should call GET /benefits/count and return the count', () => {
		const mockCount = 42;

		service.countBenefits().subscribe((count) => {
			expect(count).toBe(mockCount);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/benefits/count`);
		expect(req.request.method).toBe('GET');

		req.flush(mockCount);
	});

	it('should handle errors when countBenefits fails', () => {
		let errorResponse: any;

		service.countBenefits().subscribe({
			error: (err) => (errorResponse = err),
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/benefits/count`);
		req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(500);
		expect(errorResponse.statusText).toBe('Internal Server Error');
	});

	it('should call GET /benefits/paginated with correct params and return BenefitTableDto[]', () => {
		const page = 1;
		const size = 10;
		const mockResponse = [
			{
				id: '1',
				name: 'Benefit 1',
				description: 'Description 1',
				startDate: new Date().toISOString(),
				expirationDate: new Date().toISOString(),
				citizenGroupNames: ['Group 1'],
			},
		];

		service.getAllBenefitsPaged(page, size).subscribe((res) => {
			expect(res).toEqual(mockResponse);
		});

		const req = httpMock.expectOne(
			(r) =>
				r.url === `${environmentMock.apiPath}/benefits/paginated` &&
				r.params.get('page') === page.toString() &&
				r.params.get('size') === size.toString(),
		);
		expect(req.request.method).toBe('GET');

		req.flush(mockResponse);
	});

	it('should handle errors when getAllBenefitsPaged fails', () => {
		let errorResponse: any;
		const page = 2;
		const size = 5;

		service.getAllBenefitsPaged(page, size).subscribe({
			error: (err) => (errorResponse = err),
		});

		const req = httpMock.expectOne(
			(r) =>
				r.url === `${environmentMock.apiPath}/benefits/paginated` &&
				r.params.get('page') === page.toString() &&
				r.params.get('size') === size.toString(),
		);
		req.flush('Error', { status: 404, statusText: 'Not Found' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(404);
		expect(errorResponse.statusText).toBe('Not Found');
	});

	it('should call GET /benefits/all and return BenefitDto[]', () => {
		const mockResponse = [
			{
				id: '1',
				name: 'Benefit 1',
				description: 'Description 1',
				startDate: new Date(),
				expirationDate: new Date(),
				citizenGroupIds: ['id1', 'id2'],
				amount: 100,
			},
			{
				id: '2',
				name: 'Benefit 2',
				description: 'Description 2',
				startDate: new Date(),
				expirationDate: new Date(),
				citizenGroupIds: ['id3'],
				amount: 200,
			},
		];

		service.getAllBenefits().subscribe((res) => {
			expect(res).toEqual(mockResponse);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/benefits/all`);
		expect(req.request.method).toBe('GET');

		req.flush(mockResponse);
	});

	it('should handle errors when getAllBenefits fails', () => {
		let errorResponse: any;

		service.getAllBenefits().subscribe({
			error: (err) => (errorResponse = err),
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/benefits/all`);
		req.flush('Error', { status: 403, statusText: 'Forbidden' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(403);
		expect(errorResponse.statusText).toBe('Forbidden');
	});

	it('should handle errors when getAllBenefitsForCitizenGroup fails', () => {
		let errorResponse: any;

		service.getAllBenefitsForCitizenGroup().subscribe({
			error: (err) => (errorResponse = err),
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/benefits`);
		req.flush('Error', { status: 401, statusText: 'Unauthorized' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(401);
		expect(errorResponse.statusText).toBe('Unauthorized');
	});

	afterEach(() => {
		httpMock.verify();
	});
});
