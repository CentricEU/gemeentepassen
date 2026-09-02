import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SepaService } from './sepa.service';

describe('SepaService', () => {
	let service: SepaService;
	let httpClientMock: jest.Mocked<HttpClient>;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientMock = {
			post: jest.fn(),
		} as unknown as jest.Mocked<HttpClient>;

		TestBed.configureTestingModule({
			providers: [
				SepaService,
				{ provide: 'env', useValue: environmentMock },
				{ provide: HttpClient, useValue: httpClientMock },
			],
		});

		service = TestBed.inject(SepaService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('generateSepaFile', () => {
		it('should call httpClient.post with correct URL, headers, params, and responseType (with supplierId)', () => {
			const startDate = '2024-06-01';
			const endDate = '2024-06-30';
			const supplierId = 'supplier-123';
			const expectedUrl = '/api/sepa';
			const mockBlob = new Blob(['test'], { type: 'application/xml' });

			httpClientMock.post.mockReturnValue(of(mockBlob));

			service.generateSepaFile(startDate, endDate, supplierId).subscribe((response) => {
				expect(response).toEqual(mockBlob);
			});

			expect(httpClientMock.post).toHaveBeenCalledTimes(1);

			const [url, body, options] = httpClientMock.post.mock.calls[0] as unknown as [
				string,
				unknown,
				{ headers: HttpHeaders; params: HttpParams; responseType: 'blob' },
			];

			expect(url).toBe(expectedUrl);
			expect(body).toBeNull();
			expect(options.responseType).toBe('blob');
			expect(options.headers.get('Accept')).toBe('application/xml');
			expect(options.params.get('startDate')).toBe(startDate);
			expect(options.params.get('endDate')).toBe(endDate);
			expect(options.params.get('supplierId')).toBe(supplierId);
		});

		it('should omit supplierId when not provided', () => {
			const startDate = '2024-06-01';
			const endDate = '2024-06-30';
			const expectedUrl = '/api/sepa';
			const mockBlob = new Blob(['test'], { type: 'application/xml' });

			httpClientMock.post.mockReturnValue(of(mockBlob));

			service.generateSepaFile(startDate, endDate).subscribe((response) => {
				expect(response).toEqual(mockBlob);
			});

			const [url, , options] = httpClientMock.post.mock.calls[0] as unknown as [
				string,
				unknown,
				{ headers: HttpHeaders; params: HttpParams; responseType: 'blob' },
			];

			expect(url).toBe(expectedUrl);
			expect(options.params.get('startDate')).toBe(startDate);
			expect(options.params.get('endDate')).toBe(endDate);
			expect(options.params.get('supplierId')).toBeNull();
		});
	});
});
