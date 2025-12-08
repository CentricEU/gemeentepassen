import { TestBed } from '@angular/core/testing';
import { TokenRequest } from '@frontend/common';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

import { OauthSpecService } from './oauth.service';

jest.mock('angular-oauth2-oidc');

describe('OauthService', () => {
	let service: OauthSpecService;
	let oauthServiceMock: jest.Mocked<OAuthService>;

	beforeEach(() => {
		oauthServiceMock = {
			configure: jest.fn(),
			loadDiscoveryDocument: jest.fn().mockResolvedValue(true),
			getIdToken: jest.fn().mockReturnValue('id-token'),
			getAccessToken: jest.fn().mockReturnValue('access-token'),
			initLoginFlow: jest.fn(),
			logOut: jest.fn(),
		} as any;

		TestBed.configureTestingModule({
			providers: [OauthSpecService, { provide: OAuthService, useValue: oauthServiceMock }],
		});

		service = TestBed.inject(OauthSpecService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('tokenResponse should return TokenRequest with id and access tokens', () => {
		const tokenResponse = service.tokenResponse;
		expect(tokenResponse).toBeInstanceOf(TokenRequest);
		expect(tokenResponse.tokenId).toBe('id-token');
		expect(tokenResponse.accessToken).toBe('access-token');
	});

	it('authenticateWithDigid should call loadDiscoveryDocument and then initLoginFlow', async () => {
		await service.authenticateWithDigid();
		expect(oauthServiceMock.loadDiscoveryDocument).toHaveBeenCalled();
		expect(oauthServiceMock.initLoginFlow).toHaveBeenCalled();
	});

	it('logout should call logOut', () => {
		service.logout();
		expect(oauthServiceMock.logOut).toHaveBeenCalled();
	});

	it('oauthServiceInstance should return the injected OAuthService instance', () => {
		const instance = service.oauthServiceInstance;
		expect(instance).toBe(oauthServiceMock);
	});

	it('setupSilentRefresh should call setupAutomaticSilentRefresh on OAuthService', () => {
		oauthServiceMock.setupAutomaticSilentRefresh = jest.fn();
		service.setupSilentRefresh();
		expect(oauthServiceMock.setupAutomaticSilentRefresh).toHaveBeenCalled();
	});

	it('configure should call configure on OAuthService with provided config', () => {
		const config = { clientId: 'test-client', issuer: 'test-issuer' } as AuthConfig;
		service.configure(config);
		expect(oauthServiceMock.configure).toHaveBeenCalledWith(config);
	});
});
