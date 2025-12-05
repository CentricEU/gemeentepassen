import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Role } from '../_enums/roles.enum';
import { RecoverPassword } from '../_models/recover-password.model';
import { RecoverPasswordService } from './recover-password.service';

describe('RecoverPasswordService', () => {
	let service: RecoverPasswordService;
	let httpClientSpy: {
		get: jest.Mock;
		post: jest.Mock;
	};

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const recoverPasswordMock: RecoverPassword = new RecoverPassword('test@mail.com', 'recaptcha', Role.SUPPLIER);
	const tokenMock = 'tokenMock';
	const dummyResponse = { status: 204, statusText: 'No Content' };

	beforeEach(() => {
		httpClientSpy = { get: jest.fn(), post: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				RecoverPasswordService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		service = TestBed.inject(RecoverPasswordService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return 204 status', () => {
		httpClientSpy.post.mockReturnValue(of(dummyResponse));

		service.recoverPassword(recoverPasswordMock).subscribe((data) => {
			expect(data).toEqual(dummyResponse);
		});
	});

	it('should call the http client when valid body', () => {
		httpClientSpy.post.mockReturnValue(of(dummyResponse));

		service.recoverPassword(recoverPasswordMock).subscribe();

		expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
	});

	it('should return recover password when valid', () => {
		httpClientSpy.get.mockReturnValue(of(recoverPasswordMock));

		service.getRecoverByToken(tokenMock).subscribe((data) => {
			expect(data).toEqual(recoverPasswordMock);
		});
	});
});
