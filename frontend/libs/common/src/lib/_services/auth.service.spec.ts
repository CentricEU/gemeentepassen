import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import * as jwt from 'jsonwebtoken';
import { of, throwError } from 'rxjs';

import { Role } from '../_enums/roles.enum';
import { UserInfo } from '../_enums/user-information.enum';
import { DecodedToken } from '../_models/decoded-token.model';
import { RefreshToken } from '../_models/refresh-token.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let service: AuthService;
	let httpClientSpy: { post: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const decodedToken: DecodedToken = {
		exp: 12,
		iat: 12,
		role: 'SUPPLIER',
		sub: 'sub',
		userId: 'id',
		username: 'username',
		tenantId: 'tenant',
		supplierId: 'supplier',
	};

	const testCasesForExtractSupplierInformation = [{ input: 'invalidCase', expected: undefined }];

	// Create  mock JWT tokens
	const secretKey = 'test-secret';
	const mockValidTokenAdmin = jwt.sign(
		{ exp: new Date().getTime() / 1000 + 10000000, role: Role.MUNICIPALITY_ADMIN, tenantId: 'tenantId' },
		secretKey,
	);

	beforeEach(() => {
		httpClientSpy = { post: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				AuthService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
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

		expect(result).toEqual(Role.MUNICIPALITY_ADMIN);
	});

	it('should return JWT token', () => {
		localStorage.setItem('JWT_TOKEN', mockValidTokenAdmin);
		const result = service.jwtToken;
		expect(result).toEqual(mockValidTokenAdmin);
	});

	it('should return tenantId', () => {
		localStorage.setItem('JWT_TOKEN', mockValidTokenAdmin);
		const result = service.extractSupplierInformation(UserInfo.TenantId);
		expect(result).toEqual('tenantId');
	});

	it('should return undefined', () => {
		localStorage.setItem('JWT_TOKEN', 'notGood');
		const result = service.extractSupplierInformation(UserInfo.TenantId);
		expect(result).toEqual(undefined);
	});

	it('should return userRole', () => {
		localStorage.setItem('JWT_TOKEN', mockValidTokenAdmin);
		const result = service.userRole;
		expect(result).toEqual(Role.MUNICIPALITY_ADMIN);
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
		expect(isTokenPresent).toBeTruthy();
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
				`${environmentMock.apiPath}/authenticate/refreshToken`,
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
});
