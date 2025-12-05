import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GrantHolder } from '../_enums/grant-holder.enum';
import { GrantDto } from '../_models/grant-dto.model';
import { GrantService } from './grant.service';

describe('GrantService', () => {
	let service: GrantService;
	let httpMock: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [GrantService, { provide: 'env', useValue: environmentMock }],
		});
		service = TestBed.inject(GrantService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should send a POST request to create a grant', () => {
		const grantData = {
			title: 'Test Grant',
			description: 'Test Description',
			amount: 1000,
			createFor: GrantHolder.PASS_OWNER,
			startDate: new Date('2021-01-01'),
			expirationDate: new Date('2021-12-31'),
			selected: false,
			isCheckboxDisabled: false,
		};

		service.createGrant(grantData).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/grants`);
		expect(req.request.method).toBe('POST');

		req.flush({});
	});

	it('should send a GET request to fetch paginated grants', () => {
		const page = 1;
		const size = 10;

		service.getGrantsPaginated(page, size).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/grants/paginated?page=${page}&size=${size}`);
		expect(req.request.method).toBe('GET');

		req.flush([]);
	});

	it('should send a GET request to fetch grant count', () => {
		service.countGrants().subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/grants/count`);
		expect(req.request.method).toBe('GET');

		req.flush(10);
	});

	it('should send a GET request to fetch all grants', () => {
		service.getAllGrants(false).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/grants?isActiveGrantNeeded=false`);
		expect(req.request.method).toBe('GET');

		req.flush([]);
	});

	it('should edit a grant', () => {
		const dummyGrant: GrantDto = new GrantDto(
			'1',
			'title',
			'desc',
			10,
			GrantHolder.PASS_OWNER,
			new Date(),
			new Date(),
		);

		service.editGrant(dummyGrant).subscribe((grant) => {
			expect(grant).toEqual(dummyGrant);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/grants`);
		expect(req.request.method).toBe('PATCH');
		expect(req.request.body).toEqual(dummyGrant);

		req.flush(dummyGrant);
	});
});
