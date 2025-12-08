import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
	let interceptor: JwtInterceptor;
	let httpMock: HttpTestingController;
	let client: HttpClient;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				JwtInterceptor,
				{
					provide: HTTP_INTERCEPTORS,
					useClass: JwtInterceptor,
					multi: true,
				},
			],
		});

		interceptor = TestBed.inject(JwtInterceptor);
		httpMock = TestBed.inject(HttpTestingController);
		client = TestBed.inject(HttpClient);

		localStorage.clear();
	});

	it('should be created', () => {
		expect(interceptor).toBeTruthy();
	});

	it('should not attach header if token doesnt exist', () => {
		client.get('/test').subscribe();

		const req = httpMock.expectOne('/test');
		req.flush('');
		httpMock.verify();

		expect(req.request.headers.get('Authorization')).toBeNull();
	});

	it('should add Content-Type and withCredentials if token doesn’t exist', () => {
		client.get('/test').subscribe();

		const req = httpMock.expectOne('/test');
		req.flush('');
		httpMock.verify();

		expect(req.request.headers.get('Content-Type')).toBe('application/json');
		expect(req.request.withCredentials).toBe(true);
	});

	it('should skip adding Authorization header for signicat.com requests', () => {
		localStorage.setItem('JWT_TOKEN', 'dummy-token');

		client.get('https://example.signicat.com/api').subscribe();

		const req = httpMock.expectOne('https://example.signicat.com/api');
		req.flush('');
		httpMock.verify();

		expect(req.request.headers.has('Authorization')).toBe(false);
	});

	describe('Has token in storage', () => {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
		beforeEach(() => {
			localStorage.setItem('JWT_TOKEN', token);
		});

		it('should set the Authorization header', () => {
			client.get('/test').subscribe();

			const req = httpMock.expectOne('/test');
			req.flush('');
			httpMock.verify();

			const authHeader = `Bearer ${token}`;
			expect(req.request.headers.get('Authorization')).toEqual(authHeader);
		});
	});
});
