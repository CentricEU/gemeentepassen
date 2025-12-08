import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	AuthService,
	DashboardService,
	MunicipalityStatistics,
	TimeIntervalPeriod,
	UserService,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill/combo-button';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { CentricToastrModule } from '@windmill/ng-windmill/toastr';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
	let component: DashboardComponent;
	let fixture: ComponentFixture<DashboardComponent>;
	let dashboardServiceMock: Record<string, jest.Mock>;
	let dialogService: DialogService;
	let authServiceSpy: { extractSupplierInformation: jest.Mock };
	let userService: { getUserInformation: jest.Mock };

	const STATS: MunicipalityStatistics = {
		suppliersCount: 12,
		transactionsCount: 8,
		passholdersCount: 2,
	};

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(async () => {
		dialogService = {
			message: jest.fn(),
		} as unknown as DialogService;

		authServiceSpy = {
			extractSupplierInformation: jest.fn().mockReturnValue('123'),
		};

		userService = {
			getUserInformation: jest.fn().mockReturnValue(of({})),
		};

		dashboardServiceMock = {
			getMuniciplaityStatistics: jest.fn(),
			initDropdownData: jest.fn(),
			translatedTimePeriodToEnum: jest.fn(),
			getTransactionStatistics: jest.fn().mockReturnValue(of([])),
		};

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				WindmillModule,
				CommonModule,
				BrowserAnimationsModule,
				HttpClientModule,
				TranslateModule.forRoot(),
				CentricToastrModule.forRoot(),
			],
			declarations: [DashboardComponent],
			providers: [
				{ provide: DashboardService, useValue: dashboardServiceMock },
				{ provide: DialogService, useValue: dialogService },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: 'env', useValue: environmentMock },
				{ provide: UserService, useValue: userService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;
		(component as any).transactionChart = {
			loadChartData: jest.fn(),
		};
	});

	it('should create', () => {
		dashboardServiceMock['getMuniciplaityStatistics'].mockReturnValue(of(STATS));
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});

	describe('openProvideBankDetailsDialog', () => {
		it('should call dialogService.message with correct parameters', () => {
			const afterClosedMock = { afterClosed: jest.fn().mockReturnValue(of(false)) };
			dialogService.message = jest.fn().mockReturnValue(afterClosedMock);

			component.openProvideBankDetailsDialog();

			expect(dialogService.message).toHaveBeenCalledWith(expect.any(Function), {
				width: '520px',
				disableClose: true,
				ariaDescribedBy: 'dialog-description',
			});
		});

		it('should not call showToaster if dialog is closed without confirmation', () => {
			const afterClosedMock = { afterClosed: jest.fn().mockReturnValue(of(false)) };
			dialogService.message = jest.fn().mockReturnValue(afterClosedMock);
			const showToasterSpy = jest.spyOn(component as unknown as { showToaster: () => void }, 'showToaster');

			component.openProvideBankDetailsDialog();

			expect(showToasterSpy).not.toHaveBeenCalled();
		});

		it('should call showToaster if dialog is closed with confirmation', async () => {
			const afterClosedMock = { afterClosed: jest.fn().mockReturnValue(of(true)) };
			dialogService.message = jest.fn().mockReturnValue(afterClosedMock);

			const showToasterSpy = jest.spyOn(component as any, 'showToaster');

			dashboardServiceMock['getMuniciplaityStatistics'].mockReturnValue(
				of({
					suppliersCount: 0,
					passholdersCount: 0,
					transactionsCount: 0,
				}),
			);

			component.openProvideBankDetailsDialog();

			await fixture.whenStable();

			expect(showToasterSpy).toHaveBeenCalled();
		});
	});

	it('should call dashboardService.getMuniciplaityStatistics and populate counts on init', () => {
		dashboardServiceMock['getMuniciplaityStatistics'].mockReturnValue(of(STATS));
		fixture.detectChanges();

		expect(dashboardServiceMock['getMuniciplaityStatistics']).toHaveBeenCalled();
		expect(component.suppliersCount).toBe(STATS.suppliersCount);
		expect(component.passholdersCount).toBe(STATS.passholdersCount);
		expect(component.transactionsCount).toBe(STATS.transactionsCount);
	});

	it('should update dashboardService.activeTimePeriod and call initChart with translated period', () => {
		const mockEvent: WindmillComboButtonMenuItem = {
			title: 'dashboard.offers.thisMonth',
		};

		const translatedEnum = TimeIntervalPeriod.MONTHLY;
		dashboardServiceMock['translatedTimePeriodToEnum'].mockReturnValue(translatedEnum);
		const initChartSpy = jest.spyOn(
			component as unknown as { initChart: (period: TimeIntervalPeriod) => void },
			'initChart',
		);

		component.onTimePeriodChange(mockEvent);

		expect(component.activeTimePeriod).toBe(mockEvent.title);
		expect(dashboardServiceMock['translatedTimePeriodToEnum']).toHaveBeenCalledWith(mockEvent.title);
		expect(initChartSpy).toHaveBeenCalledWith(translatedEnum);
	});

	describe('shouldDisplayBankInfoDialog', () => {
		it('should not call openProvideBankDetailsDialog if userId is falsy', () => {
			authServiceSpy.extractSupplierInformation.mockReturnValue(null);
			const openDialogSpy = jest.spyOn(component, 'openProvideBankDetailsDialog');

			component.shouldDisplayBankInfoDialog();

			expect(openDialogSpy).not.toHaveBeenCalled();
		});

		it('should not call openProvideBankDetailsDialog if user is approved', () => {
			authServiceSpy.extractSupplierInformation.mockReturnValue('123');
			const openDialogSpy = jest.spyOn(component, 'openProvideBankDetailsDialog');

			(userService.getUserInformation as jest.Mock).mockReturnValue(of({ isApproved: true }));

			component.shouldDisplayBankInfoDialog();

			expect(openDialogSpy).not.toHaveBeenCalled();
		});

		it('should call openProvideBankDetailsDialog if user is not approved', async () => {
			const afterClosedMock = { afterClosed: jest.fn().mockReturnValue(of(true)) };
			const openDialogSpy = jest.spyOn(component, 'openProvideBankDetailsDialog');

			dialogService.message = jest.fn().mockReturnValue(afterClosedMock);
			dashboardServiceMock['getMuniciplaityStatistics'].mockReturnValue(
				of({
					suppliersCount: 0,
					passholdersCount: 0,
					transactionsCount: 0,
				}),
			);

			authServiceSpy.extractSupplierInformation.mockReturnValue('123');

			(userService.getUserInformation as jest.Mock).mockReturnValue(of({ isApproved: false }));

			component.shouldDisplayBankInfoDialog();

			await fixture.whenStable();

			expect(openDialogSpy).toHaveBeenCalled();
		});
	});
});
