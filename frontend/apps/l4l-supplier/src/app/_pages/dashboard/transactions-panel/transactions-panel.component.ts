import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
	DASHBOARD_TRANSLATION_KEYS,
	DashboardService,
	MonthlyTransactionDto,
	TimeIntervalPeriod,
} from '@frontend/common';
import { TransactionChartComponent } from '@frontend/common-ui';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill/combo-button';

@Component({
	selector: 'frontend-transactions-panel',
	templateUrl: './transactions-panel.component.html',
	styleUrls: ['./transactions-panel.component.scss'],
	standalone: false,
})
export class TransactionsPanelComponent implements OnInit {
	@Input() public isSupplierActive: boolean;
	@Input() public skipErrorToaster = false;

	@ViewChild('transactionChart')
	transactionChart: TransactionChartComponent;

	public activeTimePeriod = DASHBOARD_TRANSLATION_KEYS.THIS_MONTH;
	public timePeriod: TimeIntervalPeriod = TimeIntervalPeriod.MONTHLY;

	constructor(public dashboardService: DashboardService) {}

	public ngOnInit(): void {
		this.initChart(TimeIntervalPeriod.MONTHLY);
	}

	public onTimePeriodChange(event: WindmillComboButtonMenuItem): void {
		this.activeTimePeriod = event.title;

		this.initChart(this.dashboardService.translatedTimePeriodToEnum(event.title));
	}

	private initChart(timePeriod: TimeIntervalPeriod): void {
		this.dashboardService.initDropdownData();
		this.dashboardService.getTransactionStatistics(timePeriod, this.skipErrorToaster).subscribe({
			next: (data: MonthlyTransactionDto[]) => {
				this.transactionChart.loadChartData(data, timePeriod);
			},
			error: () => {
				this.transactionChart.loadChartData([], timePeriod);
			},
		});
	}
}
