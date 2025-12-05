import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PassholdersService } from '../../_services/passholders.service';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
	let component: DashboardComponent;
	let fixture: ComponentFixture<DashboardComponent>;
	let municipalitySupplierServiceMock: any;
	let passholdersServiceMock: any;
	let authServiceMock: any;

	const SUPPLIER_COUNT = 12;
	const PASSHOLDERS_COUNT = 2;
	const TENANT_ID = 'tenantId';

	beforeEach(async () => {
		municipalitySupplierServiceMock = {
			countSuppliers: jest.fn(),
		};

		passholdersServiceMock = {
			countPassholders: jest.fn(),
		};

		authServiceMock = {
			extractSupplierInformation: jest.fn(),
		};

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				WindmillModule,
				CommonModule,
				BrowserAnimationsModule,
				HttpClientModule,
				TranslateModule.forRoot(),
			],
			declarations: [DashboardComponent],
			providers: [
				{ provide: MunicipalitySupplierService, useValue: municipalitySupplierServiceMock },
				{ provide: PassholdersService, useValue: passholdersServiceMock },
				{ provide: AuthService, useValue: authServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;

		municipalitySupplierServiceMock.countSuppliers.mockReturnValue(of(SUPPLIER_COUNT));
		passholdersServiceMock.countPassholders.mockReturnValue(of(PASSHOLDERS_COUNT));
	});

	it('should create', () => {
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});

	describe('tenant is present', () => {
		beforeEach(() => {
			authServiceMock.extractSupplierInformation.mockReturnValue(TENANT_ID);
			fixture.detectChanges();
		});

		it('should call the proper services to initialize the widgets', () => {
			expect(authServiceMock.extractSupplierInformation).toHaveBeenCalled();
			expect(passholdersServiceMock.countPassholders).toHaveBeenCalled();
			expect(municipalitySupplierServiceMock.countSuppliers).toHaveBeenCalled();
		});
	});

	describe('tenant is not present', () => {
		beforeEach(() => {
			authServiceMock.extractSupplierInformation.mockReturnValue(null);
			fixture.detectChanges();
		});

		it('should not call other services if the auth service does not return a tenant id', () => {
			expect(authServiceMock.extractSupplierInformation).toHaveBeenCalled();
			expect(passholdersServiceMock.countPassholders).not.toHaveBeenCalled();
			expect(municipalitySupplierServiceMock.countSuppliers).not.toHaveBeenCalled();
		});
	});
});
