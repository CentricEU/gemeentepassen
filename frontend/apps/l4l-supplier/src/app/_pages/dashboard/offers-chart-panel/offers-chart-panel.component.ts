import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { commonRoutingConstants, GenericStatusEnum } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill';
import { ActiveElement, ChartConfiguration, ChartData } from 'chart.js';

import { TimeIntervalPeriod } from '../../../enums/time-interval-period.enum';
import { OfferStatusCountsDto } from '../../../models/offer-status-counts-dto.model';
import { OfferService } from '../../../services/offer-service/offer.service';

@Component({
	selector: 'frontend-offers-chart-panel',
	templateUrl: './offers-chart-panel.component.html',
	styleUrls: ['./offers-chart-panel.component.scss'],
})
export class OffersChartPanelComponent implements OnInit {
	public chartOptions: ChartConfiguration['options'] = {
		plugins: {
			legend: {
				display: true,
				position: 'bottom',
				labels: {
					color: '#20233E',
					boxWidth: 16,
					boxHeight: 16,
				},
				align: 'start',
				reverse: true,
			},
		},
		animation: {
			duration: 0,
		},
		onHover: (event, chartElement) => {
			const targetElement = event.native?.target as HTMLElement | null;

			if (!targetElement) {
				return;
			}

			targetElement.style.cursor = chartElement[0] ? 'pointer' : 'default';
		},
		maintainAspectRatio: false,
	};

	public dropdownData: WindmillComboButtonMenuItem[];
	public activeTimePeriod = 'dashboard.offers.thisMonth';
	public chartValues: OfferStatusCountsDto;

	private offerStatusKeys = ['expired', 'pending', 'active'];
	private offerStatusKeysToEnumMap: Record<string, GenericStatusEnum> = {
		active: GenericStatusEnum.ACTIVE,
		pending: GenericStatusEnum.PENDING,
		expired: GenericStatusEnum.EXPIRED,
	};

	public get offersCount(): number {
		return this.chartValues?.activeCount + this.chartValues?.expiredCount + this.chartValues?.pendingCount;
	}

	public get chartData(): ChartData<'pie', number[], string | string[]> {
		const { expiredCount = 0, pendingCount = 0, activeCount = 0 } = this.chartValues || {};

		return {
			labels: this.chartLegend,
			datasets: [
				{
					data: [expiredCount, pendingCount, activeCount],
					backgroundColor: ['#9092A6', '#FF9B0C', '#0B5E22'],
					borderWidth: 0,
				},
			],
		};
	}

	private get chartLegend(): string[] {
		return this.offerStatusKeys.map((entry) => {
			const translatedStatus = this.translateService.instant(`status.${entry}`);
			const count = this.chartValues?.[`${entry}Count`] ?? 0;

			return `${translatedStatus} (${count})`;
		});
	}

	constructor(
		private offerService: OfferService,
		private translateService: TranslateService,
		private router: Router,
	) {}

	public ngOnInit(): void {
		this.initChart(TimeIntervalPeriod.MONTHLY);
	}

	public onTimePeriodChange(event: WindmillComboButtonMenuItem): void {
		this.activeTimePeriod = event.title;

		this.initChart(this.translatedTimePeriodToEnum(event.title));
	}

	public onChartClick({ active }: { active?: object[] }): void {
		if (active && active.length > 0) {
			const chartElement = active[0] as ActiveElement;
			const value = this.offerStatusKeys[chartElement.index];

			this.offerService.offerStatusFilter = this.offerStatusKeysToEnumMap[value];
			this.router.navigate([commonRoutingConstants.offers]);
		}
	}

	private translatedTimePeriodToEnum(translation: string): TimeIntervalPeriod {
		switch (translation) {
			case this.translateService.instant('dashboard.offers.thisMonth'):
				return TimeIntervalPeriod.MONTHLY;
			case this.translateService.instant('dashboard.offers.thisQuarter'):
				return TimeIntervalPeriod.QUARTERLY;
			case this.translateService.instant('dashboard.offers.thisYear'):
				return TimeIntervalPeriod.YEARLY;
			default:
				return TimeIntervalPeriod.MONTHLY;
		}
	}

	private initDropdownData(): void {
		this.dropdownData = [
			{
				title: this.translateService.instant('dashboard.offers.thisMonth'),
			},
			{
				title: this.translateService.instant('dashboard.offers.thisQuarter'),
			},
			{
				title: this.translateService.instant('dashboard.offers.thisYear'),
			},
		];
	}

	private initChart(timePeriod: TimeIntervalPeriod): void {
		this.offerService.getOfferCountsByStatus(timePeriod).subscribe((data) => {
			this.chartValues = data;
			this.initDropdownData();
		});
	}
}
