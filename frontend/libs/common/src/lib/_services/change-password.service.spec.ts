import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ChangePassword } from '../_models/change-password.model';
import { ChangePasswordService } from './change-password.service';

describe('ChangePasswordService', () => {
	let service: ChangePasswordService;
	let httpClientSpy: { put: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const recoverPasswordMock: ChangePassword = new ChangePassword('testToken', 'password');

	const dummyResponse = { status: 204, statusText: 'No Content' };

	beforeEach(() => {
		httpClientSpy = { put: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				ChangePasswordService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		service = TestBed.inject(ChangePasswordService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return 204 status', () => {
		httpClientSpy.put.mockReturnValue(of(dummyResponse));

		service.changePassword(recoverPasswordMock).subscribe((data) => {
			expect(data).toEqual(dummyResponse);
		});
	});

	it('should call the http client when valid body', () => {
		httpClientSpy.put.mockReturnValue(of(dummyResponse));

		service.changePassword(recoverPasswordMock).subscribe();

		expect(httpClientSpy.put).toHaveBeenCalledTimes(1);
	});

	it('should call setupPassword and return expected response', () => {
		const setupPasswordMock = { token: 'setupToken', password: 'newPassword' };
		const setupResponse = { status: 204, statusText: 'No Content' };
		httpClientSpy.put.mockReturnValue(of(setupResponse));

		service.setupPassword(setupPasswordMock as any).subscribe((data) => {
			expect(data).toEqual(setupResponse);
		});

		expect(httpClientSpy.put).toHaveBeenCalledWith(
			`${environmentMock.apiPath}/users/setup-password`,
			setupPasswordMock,
		);
	});

	it('should call httpClient.put with correct URL and body for changePassword', () => {
		httpClientSpy.put.mockReturnValue(of(dummyResponse));

		service.changePassword(recoverPasswordMock).subscribe();

		expect(httpClientSpy.put).toHaveBeenCalledWith(
			`${environmentMock.apiPath}/users/recover/reset-password`,
			recoverPasswordMock,
		);
	});

	it('should call validateSetupPasswordToken and return expected response', () => {
		const validateMock = { token: 'validateToken' };
		const validateResponse = true;
		const httpPostSpy = jest.fn().mockReturnValue(of(validateResponse));

		// Add post method to httpClientSpy
		(httpClientSpy as any).post = httpPostSpy;

		service.validateSetupPasswordToken(validateMock as any).subscribe((data) => {
			expect(data).toEqual(validateResponse);
		});

		expect(httpPostSpy).toHaveBeenCalledWith(
			`${environmentMock.apiPath}/users/setup-password/validate`,
			validateMock,
		);
		expect(httpPostSpy).toHaveBeenCalledTimes(1);
	});
});
