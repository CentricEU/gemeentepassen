import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Environment } from '../_models/environment.model';
import { EmailConfirmationService } from './email-confirmation.service';

describe('EmailConfirmationService', () => {
	let service: EmailConfirmationService;
	let httpClient: HttpClient;
	let httpTestingController: HttpTestingController;

	const environmentMock: Environment = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [EmailConfirmationService, { provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(EmailConfirmationService);
		httpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should resend confirmation email', () => {
		const email = 'test@example.com';

		const mockResponse = {};

		service.resendConfirmationEmail(email).subscribe((response) => {
			expect(response).toEqual(mockResponse);
		});

		const req = httpTestingController.expectOne(
			`${environmentMock.apiPath}/users/resend-confirmation?email=${email}`,
		);
		expect(req.request.method).toEqual('GET');

		req.flush(mockResponse);
	});
});
