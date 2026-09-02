import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
	AuthMock,
	AuthService,
	MultilanguageService,
	Role,
	SidenavService,
	Tenant,
	TenantService,
} from '@frontend/common';
import { AppLoaderComponent, BreadcrumbsComponent, CommonUiModule, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppComponent } from './app.component';

interface AuthMockWithRole extends AuthMock {
	userRole?: { name: string };
}

describe('AppComponent', () => {
	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const tenantServiceMock = {
		getTenant: jest.fn(() => of(new Tenant())),
		tenant: new Tenant(),
	};

	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;
	let authService: AuthMockWithRole;
	let authServiceSpy: any;

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
				AppLoaderComponent,
				BreadcrumbsComponent,
			],
			declarations: [AppComponent],
			providers: [
				TranslateService,
				SidenavService,
				MultilanguageService,
				{ provide: AuthService, useClass: AuthMock, useValue: authServiceSpy },
				{ provide: TenantService, useValue: tenantServiceMock },
				{ provide: 'env', useValue: environmentMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		authService = TestBed.inject(AuthService) as unknown as AuthMock;
	});

	it('should create the app', () => {
		expect(component).toBeTruthy();
	});

	it('should render routing-container', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.getElementsByClassName('routing-container')).toBeTruthy();
	});

	it('should call tenantService.getTenant and tenant should be present after authService emits true', () => {
		tenantServiceMock.tenant = null as unknown as Tenant;
		authService.id = '';
		component.ngOnInit();
		authService.id = '6';
		authService.emitEvent(true);
		const tenantId = '1';
		authServiceSpy.extractSupplierInformation.mockReturnValue(tenantId);
		component['getTenant']();
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

	describe('AppComponent', () => {
		it('should return true for isCashierRole when userRole is CASHIER', () => {
			authService.userRole = { name: Role.CASHIER };
			expect(component.isCashierRole).toBe(true);
		});

		it('should return false for isCashierRole when userRole is not CASHIER', () => {
			authService.userRole = { name: Role.MUNICIPALITY_ADMIN };
			expect(component.isCashierRole).toBe(false);
		});

		it('should return false for isCashierRole when userRole is null', () => {
			authService.userRole = undefined;
			expect(component.isCashierRole).toBe(false);
		});

		it('should call ngOnInit and subscribe to authService emitEvent', () => {
			const emitSpy = jest.spyOn(authService, 'emitEvent');
			component.ngOnInit();
			expect(tenantServiceMock.getTenant).toHaveBeenCalled();
			expect(emitSpy).toBeDefined();
		});
	});
});
