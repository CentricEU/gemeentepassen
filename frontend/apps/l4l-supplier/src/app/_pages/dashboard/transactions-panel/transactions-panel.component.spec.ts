import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	DASHBOARD_TRANSLATION_KEYS,
	DashboardService,
	MonthlyTransactionDto,
	TimeIntervalPeriod,
} from '@frontend/common';
import { TransactionChartComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill/combo-button';
import { of, throwError } from 'rxjs';

import { TransactionsPanelComponent } from './transactions-panel.component';

describe('TransactionsPanelComponent', () => {
	let component: TransactionsPanelComponent;
	let fixture: ComponentFixture<TransactionsPanelComponent>;
	let mockDashboardService: any;
	let chartComponentMock: jest.Mocked<TransactionChartComponent>;

	beforeEach(async () => {
		mockDashboardService = {
			getMuniciplaityStatistics: jest.fn(),
			initDropdownData: jest.fn(),
			translatedTimePeriodToEnum: jest.fn(),
			getTransactionStatistics: jest.fn().mockReturnValue(of([])),
		};

		await TestBed.configureTestingModule({
			declarations: [TransactionsPanelComponent],
			providers: [{ provide: DashboardService, useValue: mockDashboardService }],
			imports: [WindmillModule, TranslateModule.forRoot()],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(TransactionsPanelComponent);
		component = fixture.componentInstance;

		chartComponentMock = {
			loadChartData: jest.fn(),
		} as unknown as jest.Mocked<TransactionChartComponent>;

		component.transactionChart = chartComponentMock;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize chart on ngOnInit with MONTHLY time period', () => {
		const mockData: MonthlyTransactionDto[] = [{ month: 1, totalAmount: 1000 }];

		mockDashboardService.getTransactionStatistics.mockReturnValue(of(mockData));

		component.ngOnInit();

		expect(mockDashboardService.initDropdownData).toHaveBeenCalled();
		expect(mockDashboardService.getTransactionStatistics).toHaveBeenCalledWith(TimeIntervalPeriod.MONTHLY, false);
		expect(chartComponentMock.loadChartData).toHaveBeenCalledWith(mockData, TimeIntervalPeriod.MONTHLY);
	});

	it('should handle time period change and reload chart', () => {
		const event: WindmillComboButtonMenuItem = { title: DASHBOARD_TRANSLATION_KEYS.THIS_YEAR };
		const enumValue = TimeIntervalPeriod.YEARLY;
		const mockData: MonthlyTransactionDto[] = [{ month: 1, totalAmount: 5000 }];

		mockDashboardService.translatedTimePeriodToEnum.mockReturnValue(enumValue);
		mockDashboardService.getTransactionStatistics.mockReturnValue(of(mockData));
		component.onTimePeriodChange(event);

		expect(component.activeTimePeriod).toBe(DASHBOARD_TRANSLATION_KEYS.THIS_YEAR);
		expect(mockDashboardService.translatedTimePeriodToEnum).toHaveBeenCalledWith(
			DASHBOARD_TRANSLATION_KEYS.THIS_YEAR,
		);
		expect(mockDashboardService.initDropdownData).toHaveBeenCalled();
		expect(mockDashboardService.getTransactionStatistics).toHaveBeenCalledWith(enumValue, false);
		expect(chartComponentMock.loadChartData).toHaveBeenCalledWith(mockData, enumValue);
	});

	it('should call loadChartData with empty array on error', () => {
		const timePeriod = TimeIntervalPeriod.MONTHLY;

		mockDashboardService.getTransactionStatistics.mockReturnValue(throwError(() => new Error('Test error')));

		component['initChart'](timePeriod);

		expect(mockDashboardService.initDropdownData).toHaveBeenCalled();
		expect(chartComponentMock.loadChartData).toHaveBeenCalledWith([], timePeriod);
	});
});
