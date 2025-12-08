import { HttpContext, HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ActiveToast, ToastrService } from '@windmill/ng-windmill/toastr';
import { of, throwError } from 'rxjs';

import { CaptchaStatus } from '../_enums/captcha.enum';
import { PersistentErrorCode } from '../_enums/persistence-error-codes.enum';
import { SilentErrorCode } from '../_enums/silent-error-codes.enum';
import { MockRouter } from '../_mocks/router.mock';
import { AuthService } from '../_services/auth.service';
import { SKIP_ERROR_TOASTER } from '../_util/http-context-token';
import { ErrorCatchingInterceptor } from './error-catching.interceptor';

describe('ErrorCatchingInterceptor', () => {
	let interceptor: ErrorCatchingInterceptor;
	let router: Router;
	let toastrService: ToastrService;
	const mockToastrService = { error: jest.fn(), info: jest.fn(), clear: jest.fn() };

	const authServiceMock = {
		isLoggedIn: false,
		logout: jest.fn(),
		refreshToken: jest.fn().mockReturnValue(of({})),
		logoutObservable: of(null),
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [
				ErrorCatchingInterceptor,
				{
					provide: ToastrService,
					useValue: {
						error: () => {
							return;
						},
						clear: () => {
							return;
						},
					},
				},
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: Router, useClass: MockRouter },
			],
		});

		interceptor = TestBed.inject(ErrorCatchingInterceptor);
		toastrService = TestBed.inject(ToastrService);
		router = TestBed.inject(Router);
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('should be created', () => {
		expect(interceptor).toBeTruthy();
	});

	it('should handle client-side or network error', () => {
		const errorInitEvent: ErrorEventInit = {
			error: new Error('AAAHHHH'),
			message: 'A monkey is throwing bananas at me!',
			lineno: 402,
			colno: 123,
			filename: 'closet.html',
		};
		const errorEvent = new ErrorEvent('MyErrEventType', errorInitEvent);

		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => errorEvent);
			},
		};

		interceptor.intercept(request, next).subscribe(
			() => {
				return;
			},
			(error) => {
				expect(error).toBe(errorEvent);
				expect(toastrService.error).toHaveBeenCalledWith('', 'generic', {
					toastBackground: 'toast-light',
				});
			},
		);
	});

	describe('Backend error with custom codes', () => {
		it('should handle custom error: 40004', () => {
			const customErrorCode = 40004;

			const request = new HttpRequest('GET', 'test');
			const next = {
				handle: () => {
					return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
				},
			};

			interceptor.intercept(request, next).subscribe(
				() => {
					return;
				},
				(error) => {
					expectForCustomError(error, customErrorCode);
					expect(interceptor['handleCaptcha']).toBeCalledWith(CaptchaStatus.INVALID_CREDENTIALS);
				},
			);
		});

		it('should handle custom error: 40009', () => {
			const customErrorCode = 40009;

			const request = new HttpRequest('GET', 'test');
			const next = {
				handle: () => {
					return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
				},
			};

			interceptor.intercept(request, next).subscribe(
				() => {
					return;
				},
				(error) => {
					expectForCustomError(error, customErrorCode);
					expect(interceptor['handleCaptcha']).toBeCalledWith(CaptchaStatus.CREATED);
				},
			);
		});

		it('should handle custom error: 40017', () => {
			const customErrorCode = 40017;
			const navigateSpy = jest.spyOn(router, 'navigate');
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
			localStorage.setItem('JWT_TOKEN', token);
			const request = new HttpRequest('GET', 'test');
			const next = {
				handle: () => {
					return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
				},
			};

			interceptor.intercept(request, next).subscribe(
				() => {
					return;
				},
				(error) => {
					expectForCustomError(error, customErrorCode);

					const token = localStorage.getItem('JWT_TOKEN');
					expect(token).toBeNull();
					expect(navigateSpy).toHaveBeenCalledWith(['/login']);
				},
			);
		});

		it('should handle custom error: default', () => {
			const customErrorCode = 40050;

			const request = new HttpRequest('GET', 'test');
			const next = {
				handle: () => {
					return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
				},
			};

			interceptor.intercept(request, next).subscribe(
				() => {
					return;
				},
				(error) => {
					expectForCustomError(error, customErrorCode);
				},
			);
		});
	});

	it('should handle custom error: 40019', () => {
		const customErrorCode = 40019;
		const navigateSpy = jest.spyOn(router, 'navigate');
		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
			},
		};

		interceptor.intercept(request, next).subscribe(
			() => {
				return;
			},
			() => {
				expect(navigateSpy).toHaveBeenCalledWith(['']);
			},
		);
	});

	it('should NOT navigate for custom error 40019 if router.url is /?reapply=true', () => {
		const customErrorCode = 40019;
		const navigateSpy = jest.spyOn(router, 'navigate');
		Object.defineProperty(router, 'url', { get: () => '/?reapply=true' });
		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
			},
		};

		interceptor.intercept(request, next).subscribe({
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			next: () => {},
			error: () => {
				expect(navigateSpy).not.toHaveBeenCalled();
			},
		});
	});

	describe('Backend error with status', () => {
		it('should handle status: 401', () => {
			const request = new HttpRequest('GET', 'test');
			const status = 401;
			const next = {
				handle: () => {
					return throwError(() => new HttpErrorResponse({ status: status }));
				},
			};
			const navigateSpy = jest.spyOn(router, 'navigate');
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
			localStorage.setItem('JWT_TOKEN', token);

			interceptor.intercept(request, next).subscribe(
				() => {
					return;
				},
				(error) => {
					expect(error).toBeTruthy();
					expect(interceptor['handleBackendError']).toHaveBeenCalledWith(status);
					expect(toastrService.error).toHaveBeenCalledWith('', `errors.${status}`, {
						toastBackground: 'toast-light',
					});
					const token = localStorage.getItem('JWT_TOKEN');
					expect(token).toBeNull();
					expect(navigateSpy).toHaveBeenCalledWith(['/login']);
				},
			);
		});

		it('should handle other backend errors', () => {
			const status = 500; // Example of another backend error code
			const request = new HttpRequest('GET', 'test');
			const next = {
				handle: () => {
					return throwError(() => new HttpErrorResponse({ status: status }));
				},
			};
			interceptor.intercept(request, next).subscribe(
				() => {
					return;
				},
				(error) => {
					expect(interceptor['showToast']).toHaveBeenCalledWith(status.toString());
				},
			);
		});
		it('should handle status: 401 when user is logged in', () => {
			authServiceMock.isLoggedIn = true;
			const request = new HttpRequest('GET', 'test');
			const status = 401;
			const next = {
				handle: () => {
					return throwError(() => new HttpErrorResponse({ status: status }));
				},
			};

			interceptor.intercept(request, next).subscribe(
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				() => {},
				(error) => {
					expect(error).toBeTruthy();
					expect(interceptor['handleBackendError']).toHaveBeenCalledWith(status);
					expect(toastrService.error).toHaveBeenCalledWith('', `errors.${status}`, {
						toastBackground: 'toast-light',
					});
				},
			);
		});

		it('should handle status: 401 when user is not logged in', () => {
			authServiceMock.isLoggedIn = false;
			const request = new HttpRequest('GET', 'test');
			const status = 401;
			const next = {
				handle: () => {
					return throwError(() => new HttpErrorResponse({ status: status }));
				},
			};
			const navigateSpy = jest.spyOn(router, 'navigate');

			interceptor.intercept(request, next).subscribe(
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				() => {},
				(error) => {
					expect(error).toBeTruthy();
					expect(interceptor['handleBackendError']).toHaveBeenCalledWith(status);
					expect(toastrService.error).toHaveBeenCalledWith('', `errors.${status}`, {
						toastBackground: 'toast-light',
					});
					expect(navigateSpy).toHaveBeenCalledWith(['/login']);
				},
			);
		});
	});

	it('should handle custom error: 40027', () => {
		const customErrorCode = 40027;
		const showToastSpy = jest.spyOn(interceptor as any, 'showToast');
		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
			},
		};

		let errorCalled = false;

		interceptor.intercept(request, next).subscribe({
			error: (error) => {
				errorCalled = true;
				expect(showToastSpy).toHaveBeenCalledWith(customErrorCode.toString(), false);
				expect(error.error).toBe(customErrorCode);
			},
		});

		expect(errorCalled).toBe(true);
	});

	it('should handle custom error: 40036', () => {
		const customErrorCode = PersistentErrorCode.passholderUniqueError;
		const showToastSpy = jest.spyOn(interceptor as any, 'showToast');
		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
			},
		};

		let errorCalled = false;

		interceptor.intercept(request, next).subscribe({
			error: (error) => {
				errorCalled = true;
				expect(showToastSpy).toHaveBeenCalledWith(customErrorCode.toString(), false);
				expect(error.error).toBe(customErrorCode);
			},
		});

		expect(errorCalled).toBe(true);
	});

	it('should handle custom error: 40036', () => {
		const customErrorCode = PersistentErrorCode.passholderUniqueError;
		const showToastSpy = jest.spyOn(interceptor as any, 'showToast');
		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
			},
		};

		let errorCalled = false;

		interceptor.intercept(request, next).subscribe({
			error: (error) => {
				errorCalled = true;
				expect(showToastSpy).toHaveBeenCalledWith(customErrorCode.toString(), false);
				expect(error.error).toBe(customErrorCode);
			},
		});

		expect(errorCalled).toBe(true);
	});

	it('should handle custom error: 40036 and already existing toaster', () => {
		const customErrorCode = PersistentErrorCode.passholderUniqueError;
		const showToastSpy = jest.spyOn(interceptor as any, 'showToast');
		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
			},
		};

		let errorCalled = false;
		interceptor['activeToast'] = {} as ActiveToast<unknown>;

		interceptor.intercept(request, next).subscribe({
			error: (error) => {
				errorCalled = true;
				expect(showToastSpy).toHaveBeenCalledWith(customErrorCode.toString(), false);
				expect(error.error).toBe(customErrorCode);
			},
		});

		expect(errorCalled).toBe(true);
	});

	it('should handle silent error codes', () => {
		const silentErrorCode = SilentErrorCode.offerAlreadyUsed;
		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => new HttpErrorResponse({ error: silentErrorCode }));
			},
		};

		interceptor.intercept(request, next).subscribe(
			() => {
				return;
			},
			(error) => {
				expect(error.error).toBe(silentErrorCode);
				expect(toastrService.error).not.toHaveBeenCalled();
			},
		);
	});

	it('should throw error without showing toast for custom error: 40040', () => {
		const customErrorCode = 40040;
		const showToastSpy = jest.spyOn(interceptor as any, 'showToast');
		const request = new HttpRequest('GET', 'test');
		const next = {
			handle: () => {
				return throwError(() => new HttpErrorResponse({ error: customErrorCode }));
			},
		};

		let errorCalled = false;

		interceptor.intercept(request, next).subscribe({
			error: (error) => {
				errorCalled = true;
				expect(error).toBeTruthy();
				expect(error.error).toBe(customErrorCode);

				expect(showToastSpy).not.toHaveBeenCalled();
			},
		});

		expect(errorCalled).toBe(true);
	});

	it('should skip showing toast if SKIP_ERROR_TOASTER is set', (done) => {
		const context = new HttpContext().set(SKIP_ERROR_TOASTER, true);
		const request = new HttpRequest('GET', '/test', {
			context,
		});

		const handler: HttpHandler = {
			handle: () =>
				throwError(
					() =>
						new HttpErrorResponse({
							status: 400,
							error: 12345,
						}),
				),
		};

		interceptor.intercept(request, handler).subscribe({
			error: (err) => {
				expect(err).toBeInstanceOf(HttpErrorResponse);
				expect(mockToastrService.error).not.toHaveBeenCalled();
				done();
			},
		});
	});

	it('should skip showing toast if error.error is a Blob', (done) => {
		const blob = new Blob(['Some binary content'], { type: 'application/octet-stream' });

		const request = new HttpRequest('GET', '/test');

		const handler: HttpHandler = {
			handle: () =>
				throwError(
					() =>
						new HttpErrorResponse({
							status: 500,
							error: blob,
						}),
				),
		};

		const showToastSpy = jest.spyOn(interceptor as any, 'showToast');

		interceptor.intercept(request, handler).subscribe({
			error: (err) => {
				expect(err).toBeInstanceOf(HttpErrorResponse);
				expect(err.error).toBeInstanceOf(Blob);
				expect(showToastSpy).not.toHaveBeenCalled();
				done();
			},
		});
	});

	describe('subscribeToLogout', () => {
		it('should remove error code 40019 from shownErrorCodes on logout', () => {
			interceptor['shownErrorCodes'].add(40019);
			(authServiceMock.logoutObservable as any).subscribe((cb: any) => cb());
			interceptor['subscribeToLogout']();
			expect(interceptor['shownErrorCodes'].has(40019)).toBe(false);
		});
	});

	function expectForCustomError(customErrorCode: unknown, error: unknown) {
		expect(error).toBeTruthy();
		expect(interceptor['handleCustomError']).toHaveBeenCalledWith(customErrorCode);
		expect(toastrService.error).toHaveBeenCalledWith('', `errors.${customErrorCode}`, {
			toastBackground: 'toast-light',
		});
	}
});
