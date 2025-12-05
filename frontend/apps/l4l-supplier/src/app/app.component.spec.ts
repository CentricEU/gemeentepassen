import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthMock, AuthService, MultilanguageService, SidenavService, Tenant, TenantService } from '@frontend/common';
import { CommonUiModule, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppComponent } from './app.component';

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
	let authService: AuthMock;
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
		authService = TestBed.get(AuthService) as AuthMock;
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
});
