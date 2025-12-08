import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { AppType, MobileBrowserUtil, MultilanguageService } from '@frontend/common';
import { CommonUiModule, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { OauthSpecService } from '../../services/oauth-service/oauth.service';
import { MobileOnlyComponent } from './mobile-only.component';

describe('MobileOnlyComponent', () => {
	let component: MobileOnlyComponent;
	let fixture: ComponentFixture<MobileOnlyComponent>;
	let queryParamMap$: BehaviorSubject<any>;
	let multiLanguageServiceMock: Partial<MultilanguageService>;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(async () => {
		queryParamMap$ = new BehaviorSubject<any>({
			get: (key: string) => null,
		});

		multiLanguageServiceMock = {
			setUsedLanguage: jest.fn(),
		};

		const oauthServiceMock = {
			oauthServiceInstance: {
				loadDiscoveryDocumentAndTryLogin: jest.fn().mockResolvedValue(undefined),
			},
			tokenResponse: {},
		};

		const authServiceMock = {
			authenticateWithSignicat: jest.fn(),
		};

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				TranslateModule.forRoot(),
				BrowserAnimationsModule,
				CommonUiModule,
				WindmillModule,
				MobileOnlyComponent,
			],
			providers: [
				{ provide: 'env', useValue: environmentMock },
				{
					provide: ActivatedRoute,
					useValue: { queryParamMap: queryParamMap$.asObservable() },
				},
				{ provide: MultilanguageService, useValue: multiLanguageServiceMock },
				{ provide: OauthSpecService, useValue: oauthServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MobileOnlyComponent);
		component = fixture.componentInstance;
		(component as any).oauthService = oauthServiceMock;
		(component as any).authService = authServiceMock;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it.each([
		{ lang: 'en-US', shouldCall: true },
		{ lang: 'fr', shouldCall: false },
		{ lang: null, shouldCall: false },
	])('should handle language param: $lang', ({ lang, shouldCall }) => {
		queryParamMap$.next({ get: () => lang });
		fixture.detectChanges();

		if (shouldCall) {
			expect(multiLanguageServiceMock.setUsedLanguage).toHaveBeenCalledWith(lang, AppType.citizen);
		} else {
			expect(multiLanguageServiceMock.setUsedLanguage).not.toHaveBeenCalled();
		}
	});

	describe('openMobileApp', () => {
		let routerMock: any;
		let environmentMock: any;

		beforeEach(() => {
			routerMock = { navigate: jest.fn() };
			(component as any).router = routerMock;
			environmentMock = { some: 'env' };
			component['environment'] = environmentMock;
		});

		it('should call MobileBrowserUtil.openMobileApp and not navigate if isMobile is true', () => {
			jest.spyOn(MobileBrowserUtil, 'isMobile').mockReturnValue(true);
			const openMobileAppSpy = jest.spyOn(MobileBrowserUtil, 'openMobileApp').mockImplementation();

			component.openMobileApp();

			expect(openMobileAppSpy).toHaveBeenCalledWith(environmentMock, 'Login');
			expect(routerMock.navigate).not.toHaveBeenCalled();
		});
	});

	describe('isMobile getter', () => {
		it('should return true when MobileBrowserUtil.isMobile returns true', () => {
			jest.spyOn(MobileBrowserUtil, 'isMobile').mockReturnValue(true);
			expect(component.isMobile).toBe(true);
		});

		it('should return false when MobileBrowserUtil.isMobile returns false', () => {
			jest.spyOn(MobileBrowserUtil, 'isMobile').mockReturnValue(false);
			expect(component.isMobile).toBe(false);
		});
	});
});
