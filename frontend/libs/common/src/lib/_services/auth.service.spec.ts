import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import * as jwt from 'jsonwebtoken';
import { of, throwError } from 'rxjs';

import { Role } from '../_enums/roles.enum';
import { UserInfo } from '../_enums/user-information.enum';
import { DecodedToken } from '../_models/decoded-token.model';
import { RefreshToken } from '../_models/refresh-token.model';
import { RoleDto } from '../_models/role.model';
import { JwtUtil } from '../_util/jwt.util';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let service: AuthService;
	let httpClientSpy: { post: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};
	const role = new RoleDto();
	role.name = 'SUPPLIER';
	const decodedToken: DecodedToken = {
		exp: 12,
		iat: 12,
		role: role,
		sub: 'sub',
		userId: 'id',
		username: 'username',
		tenantId: 'tenant',
		supplierId: 'supplier',
	};

	const testCasesForExtractSupplierInformation = [{ input: 'invalidCase', expected: undefined }];

	// Create  mock JWT tokens
	const secretKey = 'test-secret';
	role.name = Role.MUNICIPALITY_ADMIN;
	const mockValidTokenAdmin = jwt.sign(
		{ exp: new Date().getTime() / 1000 + 10000000, role: role, tenantId: 'tenantId' },
		secretKey,
	);

	beforeEach(() => {
		httpClientSpy = { post: jest.fn() };
		const role = new RoleDto();
		role.name = 'SUPPLIER';
		const validDecodedToken = {
			exp: Math.floor(Date.now() / 1000) + 1000,
			iat: Math.floor(Date.now() / 1000),
			role: role,
			sub: 'sub',
			userId: 'id',
			username: 'username',
			tenantId: 'tenant',
			supplierId: 'supplier',
		};

		const expiredDecodedToken = {
			...validDecodedToken,
			exp: Math.floor(Date.now() / 1000) - 1000,
		};

		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				AuthService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		jest.spyOn(JwtUtil, 'decodeToken').mockImplementation((token: string): DecodedToken | null => {
			if (token === 'valid-token' || token === mockValidTokenAdmin) return validDecodedToken;
			if (token === 'expired-token') return expiredDecodedToken;
			if (token === 'no-exp-token') return { ...validDecodedToken, exp: NaN };
			return null;
		});

		service = TestBed.inject(AuthService);
	});

	afterEach(() => {
		localStorage.clear();
	});

	describe('Tests when Token is not present', () => {
		beforeEach(() => {
			localStorage.clear();
		});

		afterEach(() => {
			localStorage.clear();
		});
		it('should not return role', () => {
			const result = service.userRole;
			expect(result).toBeUndefined();
		});

		it('should not return JWT token', () => {
			const result = service.jwtToken;
			expect(result).toBeNull();
		});

		it('should not return tenantId', () => {
			const result = service.extractSupplierInformation(UserInfo.TenantId);
			expect(result).toBe(undefined);
		});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return true when isLoggedIn is called with a valid token', () => {
		localStorage.setItem('JWT_TOKEN', mockValidTokenAdmin);
		expect(service.isLoggedIn).toBeTruthy();
	});

	it('should return false when isLoggedIn is called without a token', () => {
		expect(service.isLoggedIn).toBeFalsy();
	});

	it('should return role', () => {
		localStorage.setItem('JWT_TOKEN', mockValidTokenAdmin);
		const result = service.userRole;

		expect(result?.name).toEqual('SUPPLIER');
	});

	it('should return JWT token', () => {
		localStorage.setItem('JWT_TOKEN', mockValidTokenAdmin);
		const result = service.jwtToken;
		expect(result).toEqual(mockValidTokenAdmin);
	});

	it('should return tenantId', () => {
		localStorage.setItem('JWT_TOKEN', mockValidTokenAdmin);
		const result = service.extractSupplierInformation(UserInfo.TenantId);
		expect(result).toEqual('tenant');
	});

	it('should return undefined', () => {
		localStorage.setItem('JWT_TOKEN', 'notGood');
		const result = service.extractSupplierInformation(UserInfo.TenantId);
		expect(result).toEqual(undefined);
	});

	it('should return userRole', () => {
		localStorage.setItem('JWT_TOKEN', mockValidTokenAdmin);
		const result = service.userRole;
		expect(result?.name).toEqual('SUPPLIER');
	});

	it('should login', () => {
		httpClientSpy.post.mockReturnValue(of(mockValidTokenAdmin));
		const role = Role.MUNICIPALITY_ADMIN;
		service.login('testUsername', 'testPassword', 'validResponse', false, role).subscribe(() => {
			expect(service.jwtToken).toEqual(mockValidTokenAdmin);
		});

		expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
	});

	it('setSession should add JWT_TOKEN to localstorage if token is valid ', () => {
		localStorage.removeItem('JWT_TOKEN');
		service['setSession'](mockValidTokenAdmin);
		const resultToken = localStorage.getItem('JWT_TOKEN');
		expect(resultToken).toEqual(mockValidTokenAdmin);
	});

	it('setSession should add JWT_TOKEN to localstorage if token is valid ', () => {
		localStorage.removeItem('JWT_TOKEN');
		service['setSession']('random string');
		const resultToken = localStorage.getItem('JWT_TOKEN');
		expect(resultToken).toBeNull();
	});

	it('checkIfTokenExists should return false if token is not present', () => {
		localStorage.removeItem('JWT_TOKEN');
		const isTokenPresent = service['checkIfTokenExists']();
		expect(isTokenPresent).toBeFalsy();
	});

	it('checkIfTokenExists should return true if decodedToken is present', () => {
		localStorage.setItem('JWT_TOKEN', 'test-token');
		const isTokenPresent = service['checkIfTokenExists']();
		expect(isTokenPresent).toBeFalsy();
	});

	it('should remove token from local storage on logout', () => {
		httpClientSpy.post.mockReturnValue(of({}));
		localStorage.setItem('JWT_TOKEN', 'test-token');

		service['logout']();

		expect(localStorage.getItem('JWT_TOKEN')).toBeNull();
	});

	it('should call cookieCleaningLogout', () => {
		httpClientSpy.post.mockReturnValue(of({}));

		service.logout();

		expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
	});

	test.each(testCasesForExtractSupplierInformation)(
		'should return %p field from payload for type %p',
		({ expected, input }) => {
			service['decodedToken'] = decodedToken;

			const result = service['extractSupplierInformation'](input as UserInfo);
			expect(result).toBe(expected);
		},
	);

	it('should make a POST request to refresh the token', (done) => {
		const mockResponse: RefreshToken = {
			accessToken: '',
			refreshToken: '',
		};

		httpClientSpy.post.mockReturnValue(of(mockResponse));

		service.refreshToken().subscribe((response) => {
			expect(response).toEqual(mockResponse);

			expect(httpClientSpy.post).toHaveBeenCalledWith(
				`${environmentMock.apiPath}/authenticate/refresh-token`,
				{},
				{ withCredentials: true },
			);

			done();
		});
	});

	it('should handle HTTP errors correctly', (done) => {
		const errorResponse = new HttpErrorResponse({
			error: 'test 404 error',
			status: 404,
			statusText: 'Not Found',
		});

		httpClientSpy.post.mockReturnValue(throwError(errorResponse));

		service.refreshToken().subscribe(
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			() => {},
			(error) => {
				expect(error).toBe(errorResponse);
				done();
			},
		);
	});

	describe('authenticateWithSignicat', () => {
		it('should make a POST request to the correct URL and set session with returned token', (done) => {
			const mockToken = 'signicat-jwt-token';
			const mockJwtToken = { token: mockToken };
			const tokenRequest = { some: 'payload' } as any;
			const setSessionSpy = jest.spyOn(service as any, 'setSession');
			const emitSpy = jest.spyOn(service.loginEventEmitter, 'emit');

			httpClientSpy.post.mockReturnValue(of(mockJwtToken));

			service.authenticateWithSignicat(tokenRequest).subscribe((result) => {
				expect(httpClientSpy.post).toHaveBeenCalledWith(
					`${environmentMock.apiPath}/authenticate/signicat`,
					tokenRequest,
				);
				expect(setSessionSpy).toHaveBeenCalledWith(mockToken);
				expect(emitSpy).toHaveBeenCalledWith(true);
				expect(result).toBeUndefined();
				done();
			});
		});

		it('should propagate errors from the HTTP call', (done) => {
			const errorResponse = new Error('Signicat error');
			httpClientSpy.post.mockReturnValue(throwError(errorResponse));

			service.authenticateWithSignicat({} as any).subscribe({
				error: (err) => {
					expect(err).toBe(errorResponse);
					done();
				},
			});
		});
	});
	describe('AuthService checkIfTokenExists', () => {
		it('should return false if JWT_TOKEN is not present in localStorage', () => {
			localStorage.removeItem('JWT_TOKEN');
			expect(service['checkIfTokenExists']()).toBe(false);
		});

		it('should return false and remove token if decodeToken returns undefined', () => {
			localStorage.setItem('JWT_TOKEN', 'bad-token');
			expect(service['checkIfTokenExists']()).toBe(false);
			expect(localStorage.getItem('JWT_TOKEN')).toBeNull();
		});

		it('should return false and remove token if decodedToken has no exp', () => {
			localStorage.setItem('JWT_TOKEN', 'no-exp-token');
			expect(service['checkIfTokenExists']()).toBe(false);
			expect(localStorage.getItem('JWT_TOKEN')).toBeNull();
		});

		it('should return false and remove token if decodedToken is expired', () => {
			localStorage.setItem('JWT_TOKEN', 'expired-token');
			expect(service['checkIfTokenExists']()).toBe(false);
			expect(localStorage.getItem('JWT_TOKEN')).toBeNull();
		});

		it('should return true if decodedToken is valid and not expired', () => {
			localStorage.setItem('JWT_TOKEN', 'valid-token');
			expect(service['checkIfTokenExists']()).toBe(true);
			expect(localStorage.getItem('JWT_TOKEN')).toBe('valid-token');
		});

		it('should return undefined and not remove token if decodedToken has exp=0', () => {
			const tokenWithZeroExp = 'zero-exp-token';
			localStorage.setItem('JWT_TOKEN', tokenWithZeroExp);
			jest.spyOn(JwtUtil, 'decodeToken').mockReturnValueOnce({ ...decodedToken, exp: 0 } as any);
			expect(service['checkIfTokenExists']()).toBe(false);
			expect(localStorage.getItem('JWT_TOKEN')).toBeNull();
		});

		it('should call decodeToken and set decodedToken when token getter is called', () => {
			localStorage.setItem('JWT_TOKEN', 'valid-token');
			const decodeTokenSpy = jest.spyOn(service as any, 'decodeToken');
			// Clear cached decodedToken
			(service as any).decodedToken = null;
			const token = service.token;
			expect(decodeTokenSpy).toHaveBeenCalledWith('valid-token');
			expect(token).toEqual(expect.objectContaining({ username: 'username' }));
		});

		it('should not call decodeToken again if decodedToken is already set', () => {
			localStorage.setItem('JWT_TOKEN', 'valid-token');
			const decodeTokenSpy = jest.spyOn(service as any, 'decodeToken');
			(service as any).decodedToken = decodedToken;
			const token = service.token;
			expect(decodeTokenSpy).not.toHaveBeenCalled();
			expect(token).toEqual(decodedToken);
		});

		it('logout should emit on logoutSubject', (done) => {
			httpClientSpy.post.mockReturnValue(of({}));
			const sub = service.logoutObservable.subscribe(() => {
				expect(true).toBeTruthy();
				sub.unsubscribe();
				done();
			});
			service.logout();
		});

		it('cookieCleaningLogout should call http.post with correct URL and withCredentials', () => {
			httpClientSpy.post.mockReturnValue(of({}));
			service['cookieCleaningLogout']();
			expect(httpClientSpy.post).toHaveBeenCalledWith(
				`${environmentMock.apiPath}/logout`,
				{},
				{ withCredentials: true },
			);
		});

		it('decodeAndRemoveJwt should clear decodedToken and remove JWT_TOKEN', () => {
			(service as any).decodedToken = decodedToken;
			localStorage.setItem('JWT_TOKEN', 'valid-token');
			service['decodeAndRemoveJwt']();
			expect((service as any).decodedToken).toBeNull();
			expect(localStorage.getItem('JWT_TOKEN')).toBeNull();
		});

		it('decodeToken should set decodedToken', () => {
			const spy = jest.spyOn(JwtUtil, 'decodeToken');
			(service as any).decodeToken('valid-token');
			expect(spy).toHaveBeenCalledWith('valid-token');
			expect((service as any).decodedToken).toEqual(expect.objectContaining({ username: 'username' }));
		});

		it('login should make POST request and set session with returned token', (done) => {
			const mockJwtToken = { token: 'jwt-token-value' };
			httpClientSpy.post.mockReturnValue(of(mockJwtToken));
			const setSessionSpy = jest.spyOn(service as any, 'setSession');
			const emitSpy = jest.spyOn(service.loginEventEmitter, 'emit');

			service.login('user', 'pass', 'recaptcha', true, Role.SUPPLIER).subscribe(() => {
				expect(httpClientSpy.post).toHaveBeenCalledWith(
					`${environmentMock.apiPath}/authenticate`,
					JSON.stringify({
						username: 'user',
						password: 'pass',
						reCaptchaResponse: 'recaptcha',
						rememberMe: true,
						role: Role.SUPPLIER,
					}),
				);
				expect(setSessionSpy).toHaveBeenCalledWith('jwt-token-value');
				expect(emitSpy).toHaveBeenCalledWith(true);
				done();
			});
		});

		it('login should propagate errors from HTTP call', (done) => {
			const error = new Error('Login failed');
			httpClientSpy.post.mockReturnValue(throwError(error));

			service.login('user', 'pass', 'recaptcha', false, Role.SUPPLIER).subscribe({
				error: (err) => {
					expect(err).toBe(error);
					done();
				},
			});
		});
	});
});
