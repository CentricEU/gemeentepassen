import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	AuthService,
	NavigationService,
	SupplierViewDto,
	Tenant,
	TenantService,
} from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@windmill/ng-windmill/toastr';
import { of } from 'rxjs';

import { SupplierService } from '../../services/supplier-service/supplier.service';
import { HeaderComponent } from './header.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderComponent', () => {
	let component: HeaderComponent;
	let fixture: ComponentFixture<HeaderComponent>;
	let tenantService: TenantService;
	let authService: AuthService;
	let navigationService: NavigationService;
	let supplierService: SupplierService;
	let mockSupplierServiceSpy: Partial<SupplierService>;
	const mockTenantLogo = 'Tenant Logo';
	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const toastrServiceMock = {
       error: jest.fn(),
       success: jest.fn(),
       info: jest.fn(),
       warning: jest.fn(),
    };


	const authServiceMock = {
		logout: jest.fn(),
		supplierService: jest.fn(),
		extractSupplierInformation: jest.fn(),
	};

	const supplierServiceMock = {
		getSupplierById: jest.fn(),
	};

	const navigationServiceMock = {
		reloadCurrentRoute: jest.fn(),
	};

	const mockTenantService = {
		tenant: {} as Tenant,
		tenantLogo: mockTenantLogo,
	};

	beforeEach(async () => {
		// Mock IntersectionObserver
		global.IntersectionObserver = class {
			observe = jest.fn();
			unobserve = jest.fn();
			disconnect = jest.fn();
		} as any;

		// Mock ResizeObserver
		global.ResizeObserver = require('resize-observer-polyfill');

		mockSupplierServiceSpy = {
			getSupplierById: jest.fn(),
			clearStatusUpdate: jest.fn(),
			getQRCodeImage: jest.fn(),
		};
		await TestBed.configureTestingModule({
			imports: [HeaderComponent, BrowserAnimationsModule, TranslateModule.forRoot()],
			providers: [
				{ provide: TenantService, useValue: mockTenantService },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: SupplierService, useValue: mockSupplierServiceSpy },
				{ provide: NavigationService, useValue: navigationServiceMock },
				{ provide: ToastrService, useValue: toastrServiceMock },
				provideHttpClientTesting(),
				{ provide: 'env', useValue: environmentMock },
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(HeaderComponent);
		component = fixture.componentInstance;
		tenantService = TestBed.inject(TenantService);
		authService = TestBed.inject(AuthService);
		supplierService = TestBed.inject(SupplierService);
		navigationService = TestBed.inject(NavigationService);
		const toastrService = TestBed.inject(ToastrService);
		const mockSupplier: SupplierViewDto = {
			companyName: 'Test Company',
			id: 'suppId',
		} as SupplierViewDto;
		jest.spyOn(mockSupplierServiceSpy, 'getSupplierById').mockReturnValue(of(mockSupplier));
	});

	it('should create', () => {
		const mockSupplier: SupplierViewDto = {
			companyName: 'Test Company',
			id: 'suppId',
		} as SupplierViewDto;
		jest.spyOn(mockSupplierServiceSpy, 'getSupplierById').mockReturnValue(of(mockSupplier));

		expect(component).toBeTruthy();
	});

	it('should return tenantLogo ', () => {
		expect(component.tenantLogo).toBe(mockTenantLogo);
	});

	it('should call authService.logout() on logout', fakeAsync(() => {
		const authServiceLogoutSpy = jest.spyOn(authService, 'logout');
		component.logout();
		tick();
		expect(authServiceLogoutSpy).toHaveBeenCalled();
	}));

	it('should reload current route after logout', fakeAsync(() => {
		const reloadSpy = jest.spyOn(navigationService, 'reloadCurrentRoute');
		component.logout();
		tick();
		expect(reloadSpy).toHaveBeenCalled();
	}));

	it('should return empty string when supplier name does not exist', () => {
		component['supplier'] = {} as SupplierViewDto;
		expect(component.supplierName).toBe('');
	});

	it('should return supplier name when it exists', () => {
		const mockName = 'Test Tenant';
		component['supplier'] = { companyName: mockName } as SupplierViewDto;

		expect(component.supplierName).toBe(mockName);
	});

	it('should load supplier information on init', fakeAsync(() => {
		const mockSupplier: SupplierViewDto = {
			companyName: 'Test Company',
			id: 'suppId',
		} as SupplierViewDto;
		const supplierId = 'suppId';
		jest.spyOn(authService, 'extractSupplierInformation').mockReturnValue(supplierId);
		jest.spyOn(mockSupplierServiceSpy, 'getSupplierById').mockReturnValue(of(mockSupplier));

		component.ngOnInit();
		tick();

		expect(component['supplier']).toEqual(mockSupplier);
		expect(mockSupplierServiceSpy.getSupplierById).toHaveBeenCalledWith(supplierId);
	}));

	it('should logout, show translated toast and reload when supplier status is not approved', fakeAsync(() => {
		const supplierId = 'suppId';
		const mockSupplier: SupplierViewDto = {
			companyName: 'Test Company',
			id: supplierId,
			// use a status value that is different from APPROVED
			status: 'REJECTED' as any,
		} as SupplierViewDto;

		jest.spyOn(authService, 'extractSupplierInformation').mockReturnValue(supplierId);
		jest.spyOn(mockSupplierServiceSpy, 'getSupplierById').mockReturnValue(of(mockSupplier));

		const logoutSpy = jest.spyOn(authService, 'logout');
		const reloadSpy = jest.spyOn(navigationService, 'reloadCurrentRoute');
		const translateService = TestBed.inject(TranslateService);
		const toastrService = TestBed.inject(ToastrService);

		jest.spyOn(translateService as any, 'instant').mockReturnValue('Supplier not approved');
		const toastrSpy = jest.spyOn(toastrService as any, 'error').mockImplementation(jest.fn());

		component.ngOnInit();
		tick();

		expect(mockSupplierServiceSpy.getSupplierById).toHaveBeenCalledWith(supplierId);
		expect(component['supplier']).toEqual(mockSupplier);
		expect(logoutSpy).toHaveBeenCalled();
		expect(reloadSpy).toHaveBeenCalled();
		expect(toastrSpy).toHaveBeenCalledWith('<p>Supplier not approved</p>', '', expect.any(Object));
	}));

	it('displayErrorToaster should use translate.instant and toastr.error with translated message', () => {
		const translateService = TestBed.inject(TranslateService);
		const toastrService = TestBed.inject(ToastrService);

		jest.spyOn(translateService as any, 'instant').mockReturnValue('Translated message');
		const toastrSpy = jest.spyOn(toastrService as any, 'error').mockImplementation(jest.fn());

		(component as any).displayErrorToaster();

		expect((translateService as any).instant).toHaveBeenCalledWith('errors.supplierNotApproved');
		expect(toastrSpy).toHaveBeenCalledWith('<p>Translated message</p>', '', expect.any(Object));
	});
});
