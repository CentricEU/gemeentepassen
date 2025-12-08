import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { commonRoutingConstants } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { OauthSpecService } from '../../services/oauth-service/oauth.service';

export function runOAuthComponentTests<T>(componentClass: new (...args: any[]) => T, defaultRoute: string | string[]) {
	describe(componentClass.name, () => {
		let component: any;
		let fixture: ComponentFixture<T>;

		beforeEach(async () => {
			const environmentMock = {
				production: false,
				envName: 'dev',
				apiPath: '/api',
			};

			await TestBed.configureTestingModule({
				imports: [componentClass, TranslateModule.forRoot()],
				providers: [
					{ provide: 'env', useValue: environmentMock },
					{
						provide: OauthSpecService,
						useValue: {
							authenticateWithDigid: jest.fn(),
							configure: jest.fn(),
						},
					},
					{
						provide: ActivatedRoute,
						useValue: {
							snapshot: {
								queryParamMap: {
									get: jest.fn().mockReturnValue(null),
									has: jest.fn().mockReturnValue(false),
								},
								queryParams: {},
							},
						},
					},
				],
			}).compileComponents();

			fixture = TestBed.createComponent(componentClass);
			component = fixture.componentInstance;
			fixture.detectChanges();
		});

		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should call authenticateWithDigid when loginWithDigiD is called', () => {
			const oauthService = TestBed.inject(OauthSpecService);
			component.loginWithDigiD();
			expect(oauthService.authenticateWithDigid).toHaveBeenCalled();
		});

		describe('handleOAuthLogin', () => {
			let oauthServiceMock: any;
			let authServiceMock: any;
			let routerMock: any;
			let routeMock: any;

			beforeEach(() => {
				oauthServiceMock = {
					oauthServiceInstance: {
						loadDiscoveryDocumentAndTryLogin: jest.fn().mockResolvedValue(undefined),
						hasValidAccessToken: jest.fn(),
					},
					setupSilentRefresh: jest.fn(),
					tokenResponse: { accessToken: 'token', tokenId: 'id' },
				};
				authServiceMock = {
					authenticateWithSignicat: jest.fn().mockReturnValue({
						// eslint-disable-next-line @typescript-eslint/ban-types
						subscribe: (cb: Function) => cb(),
					}),
				};
				routerMock = { navigate: jest.fn() };
				routeMock = {
					snapshot: {
						queryParamMap: {
							get: jest.fn().mockReturnValue(null),
							has: jest.fn().mockReturnValue(false),
						},
						queryParams: {},
					},
				};

				component.oauthService = oauthServiceMock;
				component.authService = authServiceMock;
				component.router = routerMock;
				component.route = routeMock;
			});

			it('should extract code and state from returnUrl if not directly in query params', async () => {
				const handleOAuthLoginSpy = jest.spyOn(component as any, 'handleOAuthLogin');

				component.route.snapshot.queryParamMap.get = jest.fn((param: string) => {
					if (param === 'returnUrl') {
						return '/callback?code=testCode&state=testState';
					}
					return null;
				});

				component.ngOnInit();

				expect(handleOAuthLoginSpy).toHaveBeenCalled();
			});

			it('should call authenticateWithSignicat and navigate to returnUrl if accessToken is valid', async () => {
				oauthServiceMock.oauthServiceInstance.hasValidAccessToken.mockReturnValue(true);
				routeMock.snapshot.queryParams = { returnUrl: defaultRoute };

				await component.handleOAuthLogin();

				expect(oauthServiceMock.oauthServiceInstance.loadDiscoveryDocumentAndTryLogin).toHaveBeenCalled();
				expect(oauthServiceMock.setupSilentRefresh).toHaveBeenCalled();
				expect(authServiceMock.authenticateWithSignicat).toHaveBeenCalledWith(oauthServiceMock.tokenResponse);

				expect(routerMock.navigate).toHaveBeenCalledWith([defaultRoute], { replaceUrl: true });
			});

			it('should navigate to default route if returnUrl is not provided', async () => {
				oauthServiceMock.oauthServiceInstance.hasValidAccessToken.mockReturnValue(true);

				routeMock.snapshot.queryParams = {};

				await component.handleOAuthLogin();

				expect(routerMock.navigate).toHaveBeenCalledWith([defaultRoute], { replaceUrl: true });
			});

			it('should not call authenticateWithSignicat or navigate if accessToken is invalid', async () => {
				oauthServiceMock.oauthServiceInstance.hasValidAccessToken.mockReturnValue(false);

				await component.handleOAuthLogin();

				expect(authServiceMock.authenticateWithSignicat).not.toHaveBeenCalled();
				expect(routerMock.navigate).not.toHaveBeenCalled();
			});

			it('should call setupSilentRefresh if accessToken is valid', async () => {
				oauthServiceMock.oauthServiceInstance.hasValidAccessToken.mockReturnValue(true);

				await component.handleOAuthLogin();

				expect(oauthServiceMock.setupSilentRefresh).toHaveBeenCalled();
			});
		});
	});
}
