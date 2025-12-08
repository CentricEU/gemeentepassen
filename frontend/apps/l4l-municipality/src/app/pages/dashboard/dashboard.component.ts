import { Component, OnInit, ViewChild } from '@angular/core';
import {
	AuthService,
	DASHBOARD_TRANSLATION_KEYS,
	DashboardService,
	InfoWidgetData,
	MunicipalityStatistics,
	SupplierStatus,
	TimeIntervalPeriod,
	UserInfo,
	UserService,
} from '@frontend/common';
import { TransactionChartComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill/combo-button';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { BankDetailsDialogComponent } from '../../components/bank-details-dialog/bank-details-dialog.component';

@Component({
	selector: 'frontend-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: false,
})
export class DashboardComponent implements OnInit {
	@ViewChild('transactionChart', { static: false })
	transactionChart: TransactionChartComponent;

	public passholdersCount = 0;
	public suppliersCount = 0;
	public transactionsCount = 0;
	public activeTimePeriod = DASHBOARD_TRANSLATION_KEYS.THIS_MONTH;
	public timePeriod: TimeIntervalPeriod = TimeIntervalPeriod.MONTHLY;
	public isApproved = false;

	public get widgetsData(): InfoWidgetData[] {
		return [
			{
				title: 'dashboard.metrics.passholders',
				value: this.passholdersCount,
				icon: 'id-card_b',
			},
			{
				title: 'dashboard.metrics.suppliers',
				value: this.suppliersCount,
				icon: 'shop_b',
			},
			{
				title: 'dashboard.metrics.transactions',
				value: this.transactionsCount,
				icon: 'hand-card_b',
			},
		];
	}

	public get dashboardServiceInstance(): DashboardService {
		return this.dashboardService;
	}

	constructor(
		private readonly toastrService: ToastrService,
		private readonly dialogService: DialogService,
		private readonly dashboardService: DashboardService,
		private readonly translateService: TranslateService,
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {}

	public ngOnInit(): void {
		this.shouldDisplayBankInfoDialog();
		this.initInfoWidgetsData();
		this.initChart(TimeIntervalPeriod.MONTHLY);
	}

	public shouldDisplayBankInfoDialog(): void {
		const userId = this.authService.extractSupplierInformation(UserInfo.UserId);

		if (!userId) {
			return;
		}

		this.userService.getUserInformation(userId).subscribe((data) => {
			this.isApproved = data.isApproved;
			if (data.isApproved) {
				return;
			}

			this.openProvideBankDetailsDialog();
		});
	}

	public openProvideBankDetailsDialog(): void {
		this.dialogService
			.message(BankDetailsDialogComponent, {
				width: '520px',
				disableClose: true,
				ariaDescribedBy: 'dialog-description',
			})
			?.afterClosed()
			.subscribe((confirmed) => {
				if (!confirmed) {
					return;
				}

				this.isApproved = true;
				this.initInfoWidgetsData();
				this.initChart(TimeIntervalPeriod.MONTHLY);
				this.showToaster();
			});
	}

	public onTimePeriodChange(event: WindmillComboButtonMenuItem): void {
		this.activeTimePeriod = event.title;

		this.initChart(this.dashboardService.translatedTimePeriodToEnum(event.title));
	}

	private showToaster(): void {
		const toastText = this.translateService.instant('dashboard.bankDetails.success');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
	}

	private initChart(timePeriod: TimeIntervalPeriod): void {
		this.dashboardService.initDropdownData();
		this.dashboardService.getTransactionStatistics(timePeriod, false).subscribe((data) => {
			this.transactionChart.loadChartData(data, timePeriod);
		});
	}

	private initInfoWidgetsData(): void {
		this.dashboardService
			.getMuniciplaityStatistics([SupplierStatus.APPROVED])
			.subscribe((result: MunicipalityStatistics) => {
				this.suppliersCount = result.suppliersCount;
				this.passholdersCount = result.passholdersCount;
				this.transactionsCount = result.transactionsCount;
			});
	}
}
