import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PdokService } from './pdok.service';

describe('PdokService', () => {
	let service: PdokService;
	let httpMock: HttpTestingController;
	let httpClientSpy: { get: jest.Mock };

	const baseURL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';
	const city = 'Gouda';
	const zipCode = '1234AA;';
	const dummyData = {
		response: {
			docs: [
				{
					centroide_ll: 'POINT(10.12345 20.67890)',
				},
			],
		},
	};

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { get: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [PdokService, { provide: 'env', useValue: environmentMock }],
		});
		service = TestBed.inject(PdokService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return the result', () => {
		httpClientSpy.get.mockReturnValue(of(dummyData));

		service.getCoordinateFromAddress(city, zipCode).subscribe((data) => {
			expect(data).toEqual(dummyData);
		});
	});

	it('should send a GET request to fetch grants', () => {
		service.getCoordinateFromAddress(city, zipCode).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const req = httpMock.expectOne(`${baseURL}/free?q=${city} ${zipCode}&fl=centroide_ll&start=0&rows=1`);
		expect(req.request.method).toBe('GET');
		req.flush([]);
	});
});
