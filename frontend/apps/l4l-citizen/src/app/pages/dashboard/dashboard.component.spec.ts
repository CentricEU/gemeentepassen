import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
	let component: DashboardComponent;
	let fixture: ComponentFixture<DashboardComponent>;
	let httpClientSpy: { post: jest.Mock };

	beforeEach(async () => {
		const oauthServiceMock = {
			configure: jest.fn(),
			loadDiscoveryDocument: jest.fn().mockResolvedValue(undefined),
			initLoginFlow: jest.fn(),
			logOut: jest.fn(),
			getIdToken: jest.fn().mockReturnValue('mock-id-token'),
			getAccessToken: jest.fn().mockReturnValue('mock-access-token'),
			setupAutomaticSilentRefresh: jest.fn(),
			loadDiscoveryDocumentAndTryLogin: jest.fn().mockResolvedValue(undefined),
			hasValidAccessToken: jest.fn().mockReturnValue(true),
		};

		const environmentMock = {
			production: false,
			envName: 'dev',
			apiPath: '/api',
		};

		httpClientSpy = { post: jest.fn() };

		await TestBed.configureTestingModule({
			imports: [DashboardComponent, TranslateModule.forRoot()],
			providers: [
				TranslateService,
				{ provide: 'env', useValue: environmentMock },
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: OAuthService, useValue: oauthServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call authService.logout, oauthService.logout, and navigationService.reloadCurrentRoute when logout is called', () => {
		const authServiceMock = {
			logout: jest.fn(),
		};
		const oauthServiceMock = {
			logout: jest.fn(),
		};
		const navigationServiceMock = {
			reloadCurrentRoute: jest.fn(),
		};

		(component as any).authService = authServiceMock;
		(component as any).oauthService = oauthServiceMock;
		(component as any).navigationService = navigationServiceMock;

		component.logout();

		expect(authServiceMock.logout).toHaveBeenCalled();
		expect(oauthServiceMock.logout).toHaveBeenCalled();
		expect(navigationServiceMock.reloadCurrentRoute).toHaveBeenCalled();
	});
});
