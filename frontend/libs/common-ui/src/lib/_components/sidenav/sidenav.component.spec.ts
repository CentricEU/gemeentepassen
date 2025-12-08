import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService, commonRoutingConstants, MockRouter, TenantService } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { CommonUiModule } from '../../common-ui.module';
import { WindmillModule } from '../../windmil.module';
import { SidenavComponent } from './sidenav.component';

describe('SidenavComponent', () => {
	let component: SidenavComponent;
	let fixture: ComponentFixture<SidenavComponent>;
	let tenantService: TenantService;
	let authService: AuthService;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const authServiceMock = {
		login: jest.fn().mockReturnValue(of({})),
		logout: jest.fn(),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SidenavComponent],
			imports: [
				CommonUiModule,
				BrowserAnimationsModule,
				RouterTestingModule,
				WindmillModule,
				HttpClientTestingModule,
				TranslateModule.forRoot(),
			],
			providers: [
				TenantService,
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: Router, useClass: MockRouter },
				{ provide: 'env', useValue: environmentMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SidenavComponent);
		component = fixture.componentInstance;
		tenantService = TestBed.get(TenantService);
		authService = TestBed.get(AuthService);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with opened as true', () => {
		expect(component.opened).toBe(true);
	});

	it('should return tenantLogo with Base64 when logo exists', () => {
		const base64Logo = 'iVBORw0KGgoAAAANSUhEUgAA...';
		Object.defineProperty(tenantService, 'tenant', { get: () => ({ logo: base64Logo }) });
		expect(component.tenantLogo).toBe('data:image/png;base64,' + base64Logo);
	});

	it('should return default logo path when logo does not exist', () => {
		Object.defineProperty(tenantService, 'tenant', { get: () => ({}) });
		expect(component.tenantLogo).toBe('/assets/images/citypasses-logo.png');
	});

	it('should check if all data is loaded', () => {
		const tenant = { name: 'Sample Tenant' };
		Object.defineProperty(tenantService, 'tenant', { get: () => tenant });
		expect(component.isAllDataLoaded()).toBe(true);
	});

	it('should call authService.logout() on logout', fakeAsync(() => {
		const authServiceLogoutSpy = jest.spyOn(authService, 'logout');
		component.logout();
		tick();
		expect(authServiceLogoutSpy).toHaveBeenCalled();
	}));

	it('should navigate to the dashboard route', () => {
		const router = TestBed.inject(Router);
		const navigateSpy = jest.spyOn(router, 'navigate');
		component.navigateToDashboard();
		expect(navigateSpy).toHaveBeenCalledWith([commonRoutingConstants.dashboard]);
	});
});
