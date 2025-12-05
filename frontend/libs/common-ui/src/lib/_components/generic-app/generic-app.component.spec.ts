import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
	AuthMock,
	AuthService,
	Breadcrumb,
	BreadcrumbService,
	MultilanguageService,
	SidenavService,
	Tenant,
	TenantService,
} from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subscription } from 'rxjs';

import { CommonUiModule } from '../../common-ui.module';
import { WindmillModule } from '../../windmil.module';
import { GenericAppComponent } from './generic-app.component';

describe('GenericAppComponent', () => {
	let component: GenericAppComponent;
	let fixture: ComponentFixture<GenericAppComponent>;
	let breadCrumbsService: BreadcrumbService;
	let authService: AuthMock;
	let authServiceSpy: any;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const tenantServiceMock = {
		getTenant: jest.fn(() => of(new Tenant())),
		tenant: new Tenant(),
	};

	const sidenavServiceMock = {
		shouldHideNavigation: jest.fn(() => false),
	};

	const breadcrumbServiceSpy = {
		setBreadcrumbs: jest.fn(),
		removeBreadcrumbs: jest.fn(),
	};

	beforeEach(async () => {
		authServiceSpy = {
			extractSupplierInformation: jest.fn(),
			emitEvent: jest.fn(),
		};

		await TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				HttpClientModule,
				BrowserAnimationsModule,
				CommonUiModule,
				WindmillModule,
				TranslateModule.forRoot(),
			],
			declarations: [GenericAppComponent],
			providers: [
				TranslateService,
				MultilanguageService,
				{ provide: AuthService, useClass: AuthMock, useValue: authServiceSpy },
				{ provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
				{ provide: TenantService, useValue: tenantServiceMock },
				{ provide: SidenavService, useValue: sidenavServiceMock },
				{ provide: 'env', useValue: environmentMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(GenericAppComponent);
		component = fixture.componentInstance;
		breadCrumbsService = TestBed.inject(BreadcrumbService);
		fixture.detectChanges();
		authService = TestBed.get(AuthService) as AuthMock;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should unsubscribe from authSubscription on ngOnDestroy', () => {
		const mockSubscription: Subscription = new Subscription();
		component['authSubscription'] = mockSubscription;
		const unsubscribeSpy = jest.spyOn(mockSubscription, 'unsubscribe');
		component.ngOnDestroy();

		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should not throw an error if authSubscription is null on ngOnDestroy', () => {
		component['authSubscription'] = null as unknown as Subscription;
		expect(() => component.ngOnDestroy()).not.toThrow();
	});

	it('should not throw an error if authSubscription is undefined on ngOnDestroy', () => {
		component['authSubscription'] = undefined as unknown as Subscription;
		expect(() => component.ngOnDestroy()).not.toThrow();
	});

	it('should render routing-container', () => {
		const fixture = TestBed.createComponent(GenericAppComponent);
		fixture.detectChanges();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.getElementsByClassName('routing-container')).toBeTruthy();
	});

	it('isRouteWithoutNav should return true  when service returns true', () => {
		fixture.detectChanges();
		sidenavServiceMock.shouldHideNavigation.mockReturnValue(true);
		fixture.detectChanges();
		const restult = component.isRouteWithoutNav();
		expect(restult).toBeTruthy();
	});

	it('getMenuItemsForNavigation should return array of routes', () => {
		fixture.detectChanges();
		const restult = component.getMenuItemsForNavigation();
		expect(restult).toBeDefined();
		expect(restult.length).toBeGreaterThan(0);
	});

	it('should call tenantService.getTenant and tenant should be present after authService emits true', async () => {
		tenantServiceMock.tenant = null as unknown as Tenant;
		authService.id = '';
		component.ngOnInit();
		authService.id = '6';
		authService.emitEvent(true);
		const tenantId = '1';
		authServiceSpy.extractSupplierInformation.mockReturnValue(tenantId);
		component['getTenant']();
		fixture.detectChanges();
		expect(tenantServiceMock.getTenant).toHaveBeenCalledWith('1');
		expect(tenantServiceMock.tenant).toBeDefined();
	});

	it('should not call tenantService when no tenandId', () => {
		tenantServiceMock.tenant = null as unknown as Tenant;
		authService.id = '';
		component['getTenant']();
		fixture.detectChanges();

		expect(tenantServiceMock.getTenant).not.toHaveBeenCalled;
		expect(tenantServiceMock.tenant).toBeNull();
		authService.id = '1';
	});

	it('should call tenantService.getTenant and tenant should be present', () => {
		tenantServiceMock.tenant = null as unknown as Tenant;
		component.ngOnInit();
		fixture.detectChanges();
		expect(tenantServiceMock.getTenant).toHaveBeenCalledWith('1');
		expect(tenantServiceMock.tenant).toBeDefined();
	});

	it(' isTenantLoaded should return true when tenant is present', () => {
		tenantServiceMock.tenant = new Tenant();
		const result = component.isTenantLoaded();
		expect(result).toBe(true);
	});

	it(' isTenantLoaded should return false when no tenant', () => {
		tenantServiceMock.tenant = null as unknown as Tenant;
		const result = component.isTenantLoaded();
		expect(result).toBe(false);
	});

	it('when tenantService.getTenant returns null, there should be no tenant', () => {
		tenantServiceMock.tenant = null as unknown as Tenant;
		tenantServiceMock.getTenant.mockReturnValue(of());
		component.ngOnInit();
		const result = component.isTenantLoaded();
		fixture.detectChanges();
		expect(tenantServiceMock.getTenant).toHaveBeenCalledWith('1');
		expect(tenantServiceMock.tenant).toBeNull();
		expect(result).toBeFalsy();
	});

	it('should return true when shouldHideNavigation returns false and isTenantLoaded returns true', () => {
		sidenavServiceMock.shouldHideNavigation.mockReturnValue(false);
		jest.spyOn(component, 'isTenantLoaded').mockReturnValue(true);

		expect(component.shouldDisplayNavigation).toBe(true);
	});

	it('should return false when shouldHideNavigation returns true', () => {
		sidenavServiceMock.shouldHideNavigation.mockReturnValue(true);
		jest.spyOn(component, 'isTenantLoaded').mockReturnValue(true);

		expect(component.shouldDisplayNavigation).toBe(false);
	});

	it('should return false when isTenantLoaded returns false', () => {
		sidenavServiceMock.shouldHideNavigation.mockReturnValue(false);
		jest.spyOn(component, 'isTenantLoaded').mockReturnValue(false);

		expect(component.shouldDisplayNavigation).toBe(false);
	});

	it('should return false when shouldHideNavigation returns true and isTenantLoaded returns false', () => {
		sidenavServiceMock.shouldHideNavigation.mockReturnValue(true);
		jest.spyOn(component, 'isTenantLoaded').mockReturnValue(false);

		expect(component.shouldDisplayNavigation).toBe(false);
	});

	it('should display breadcrumbs when there are any', () => {
		component['breadcrumbService'].breadcrumbs = [new Breadcrumb(''), new Breadcrumb('')];
		expect(component.shouldDisplayBreadcrumbs).toEqual(true);
	});
});
