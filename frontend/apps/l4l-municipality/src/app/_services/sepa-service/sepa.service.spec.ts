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
		it('should call httpClient.post with correct URL, headers, params, and responseType', () => {
			const month = '2024-06';
			const expectedUrl = '/api/sepa';
			const mockBlob = new Blob(['test'], { type: 'application/xml' });

			httpClientMock.post.mockReturnValue(of(mockBlob));

			service.generateSepaFile(month).subscribe((response) => {
				expect(response).toEqual(mockBlob);
			});

			expect(httpClientMock.post).toHaveBeenCalledWith(
				expectedUrl,
				null,
				expect.objectContaining({
					headers: expect.any(HttpHeaders),
					params: expect.any(HttpParams),
					responseType: 'blob',
				}),
			);
		});
	});
});
