import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
	AppColors,
	commonRoutingConstants,
	DASHBOARD_TRANSLATION_KEYS,
	DashboardService,
	GenericStatusEnum,
	OfferStatisticsDto,
	TimeIntervalPeriod,
} from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill/combo-button';
import { Chart, Plugin } from 'chart.js';
import { ActiveElement, ChartConfiguration, ChartData } from 'chart.js';

import { OfferStatusCountsDto } from '../../../models/offer-status-counts-dto.model';
import { OfferService } from '../../../services/offer-service/offer.service';

@Component({
	selector: 'frontend-offers-chart-panel',
	templateUrl: './offers-chart-panel.component.html',
	styleUrls: ['./offers-chart-panel.component.scss'],
	standalone: false,
})
export class OffersChartPanelComponent implements OnInit {
	@Input() public isUsedOfferChart = false;
	@Input() public isSupplierActive: boolean;
	@Input() public skipErrorToaster = false;

	public chartValues: OfferStatusCountsDto;
	public chartValuesUsedOffer: OfferStatisticsDto[] = [];
	public activeTimePeriod = DASHBOARD_TRANSLATION_KEYS.THIS_MONTH;

	private offerStatusKeys = ['active', 'pending', 'expired', 'noData'];
	private offerStatusKeysToEnumMap: Record<string, GenericStatusEnum> = {
		active: GenericStatusEnum.ACTIVE,
		pending: GenericStatusEnum.PENDING,
		expired: GenericStatusEnum.EXPIRED,
	};

	public baseOptions: ChartConfiguration['options'] = {
		plugins: {
			tooltip: {
				enabled: () => !this.isChartEmpty(),
			},
			legend: {
				display: true,
				position: 'bottom',
				labels: {
					color: AppColors.DarkBlue,
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
			if (!targetElement) return;
			targetElement.style.cursor = chartElement[0] ? 'pointer' : 'default';
		},
		maintainAspectRatio: false,
	};

	public chartOptions: ChartConfiguration['options'] = {
		...this.baseOptions,
		plugins: {
			tooltip: {
				...this.baseOptions?.plugins?.tooltip,
				filter: function (tooltipItem) {
					return tooltipItem.dataIndex < 3;
				},
			},
			legend: {
				display: true,
				position: 'bottom',
				align: 'start',
				labels: {
					generateLabels: () => {
						const legendLabels = this.chartLegend;
						const allColors = [AppColors.Green, AppColors.Yellow, AppColors.DarkGrey, AppColors.LightGrey];
						return legendLabels
							.map((label, idx) => ({
								text: label,
								family: 'Open Sans',
								fillStyle: allColors[idx],
								size: 14,
								fontColor: AppColors.DarkBlue,
								hidden: false,
								borderRadius: 4,
								strokeStyle: 'transparent',
							}))
							.slice(0, 3);
					},
					font: {
						size: 14,
					},
					color: AppColors.DarkBlue,
					boxWidth: 16,
					boxHeight: 16,
				},
			},
		},
	};

	public chartOptionsUsed: ChartConfiguration['options'] = {
		...this.baseOptions,
		indexAxis: 'y',
		plugins: {
			...this.baseOptions?.plugins,
			tooltip: {
				callbacks: {
					labelColor: function () {
						return {
							borderColor: AppColors.White,
							backgroundColor: AppColors.Green,
							borderWidth: 0,
						};
					},
				},
			},
			legend: {
				display: true,
				position: 'bottom',
				align: 'start',
				labels: {
					generateLabels: () => [
						{
							text: this.translateService.instant('dashboard.usedOffers.legend'),
							family: 'Open Sans',
							fillStyle: AppColors.Green,
							size: 14,
							fontColor: AppColors.DarkBlue,
							hidden: false,
							borderRadius: 4,
						},
					],
					font: {
						size: 14,
					},
					padding: 10,
					color: AppColors.DarkBlue,
					boxWidth: 16,
					boxHeight: 16,
				},
				onClick: () => {
					/**
					 * Intentionally left empty to disable the default click behavior on legend items.
					 * Normally, clicking a legend label toggles the visibility of the corresponding dataset.
					 * Overriding with this no-op function prevents that toggle, keeping the chart display static.
					 */
				},
			},
		},
		datasets: {
			bar: {
				borderRadius: 8,
			},
		},
		scales: {
			x: {
				type: 'linear',
				grid: {
					display: false,
				},
				ticks: {
					color: AppColors.DarkBlue,
					font: {
						size: 14,
						family: 'Open Sans',
					},
				},
			},
			y: {
				grid: {
					display: true,
				},
				ticks: {
					font: {
						weight: 600,
						size: 12,
						family: 'Open Sans',
					},
					color: AppColors.DarkBlue,
					padding: 16,
				},
				border: {
					display: false,
				},
			},
		},
	};

	public get dashboardServiceInstance(): DashboardService {
		return this.dashboardService;
	}

	public get chartTitle(): string {
		return this.isUsedOfferChart ? 'dashboard.usedOffers.header' : 'general.pages.offers';
	}

	public get offersCount(): number {
		return this.chartValues?.activeCount + this.chartValues?.expiredCount + this.chartValues?.pendingCount;
	}

	public get chartDataOffer(): ChartData<'pie', number[], string | string[]> {
		const counts = this.getChartCounts();

		const allColors = [AppColors.Green, AppColors.Yellow, AppColors.DarkGrey, AppColors.LightGrey];
		return {
			labels: this.chartLegend,
			datasets: [
				{
					data: this.isChartEmpty() ? [0, 0, 0, 1] : counts,
					backgroundColor: allColors,
					borderColor: 'transparent',
					hoverBackgroundColor: this.isChartEmpty() ? AppColors.LightGrey : allColors,
				},
			],
		};
	}

	public get chartDataUsedOffer(): ChartData<'bar', number[], string | string[]> {
		return {
			labels: this.chartLegendUsedOffers(),
			datasets: [
				{
					data: this.getChartCountsForUsedOffer(),
					backgroundColor: AppColors.Green,
					borderWidth: 0,
				},
			],
		};
	}

	private get chartLegend(): string[] {
		return this.offerStatusKeys
			.filter((entry) => entry !== 'noData')
			.map((entry) => {
				const translatedStatus = this.translateService.instant(`status.${entry}`);
				const count = this.chartValues?.[`${entry}Count`] ?? 0;
				return `${translatedStatus} (${count})`;
			});
	}

	constructor(
		private offerService: OfferService,
		private translateService: TranslateService,
		private dashboardService: DashboardService,
		private router: Router,
	) {}

	public createCustomMessage: Plugin<'bar'> = {
		id: 'customMessage',
		beforeDraw: (chart: Chart) => {
			if (chart.data.datasets[0].data.every((val) => val === 0)) {
				const ctx = chart.ctx;
				const { left, right, top, bottom } = chart.chartArea;
				const message = this.translateService.instant('dashboard.usedOffers.noDataMessage');
				const fontSize = 16;
				const color = AppColors.Midnight;
				const family = 'Open Sans';
				const weight = 400;
				const maxWidth = right - left - 16;

				ctx.save();
				ctx.font = `${weight} ${fontSize}px ${family}`;
				ctx.fillStyle = color;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				const words = message.split(' ');
				let line = '';
				const lines = [];
				for (const word of words) {
					const testLine = line + word + ' ';
					const testWidth = ctx.measureText(testLine).width;
					if (testWidth > maxWidth && line) {
						lines.push(line);
						line = word + ' ';
					} else {
						line = testLine;
					}
				}
				lines.push(line);
				const lineHeight = fontSize + 4;
				const textHeight = lines.length * lineHeight;
				let y = (top + bottom) / 2 - textHeight / 2;
				for (const line of lines) {
					ctx.fillText(line.trim(), (left + right) / 2, y);
					y += lineHeight;
				}
				ctx.restore();
			}
		},
	};

	public barValuePlugin: Plugin<'bar'> = {
		id: 'barValuePlugin',
		afterDatasetsDraw(chart: Chart<'bar'>) {
			const datasetData = chart.data.datasets[0].data;

			const hasData = datasetData.some((val) => {
				if (typeof val === 'number') return val > 0;
				if (Array.isArray(val)) return val.some((v) => v > 0);
				return false;
			});

			if (!hasData) return;

			const { ctx } = chart;
			ctx.save();

			chart.getDatasetMeta(0).data.forEach((bar, index) => {
				const dataValue = datasetData[index];

				let numericValue: number | null = null;
				if (typeof dataValue === 'number') numericValue = dataValue;
				else if (Array.isArray(dataValue)) numericValue = dataValue[1];

				if (numericValue !== null) {
					ctx.fillStyle = AppColors.DarkBlue;
					ctx.textAlign = 'left';
					ctx.textBaseline = 'middle';
					ctx.font = 'bold 14px Open Sans';
					ctx.fillText(String(numericValue), bar.x + 5, bar.y);
				}
			});

			ctx.restore();
		},
	};

	public ngOnInit(): void {
		this.initChartValues();
	}

	public onTimePeriodChange({ title }: WindmillComboButtonMenuItem): void {
		this.activeTimePeriod = title;
		const interval = this.dashboardService.translatedTimePeriodToEnum(title);
		this.isUsedOfferChart ? this.initUsedOfferStats(interval) : this.initOfferCounts(interval);
	}

	public onChartClick({ active }: { active?: object[] }): void {
		if (active && active.length > 0) {
			const chartElement = active[0] as ActiveElement;
			const value = this.offerStatusKeys[chartElement.index];

			this.offerService.offerStatusFilter = this.offerStatusKeysToEnumMap[value];
			this.router.navigate([commonRoutingConstants.offers]);
		}
	}

	private chartLegendUsedOffers(): string[] {
		return [
			this.translateService.instant('offer.types.percentageDiscount'),
			this.translateService.instant('offer.types.bogo'),
			this.translateService.instant('offer.types.creditDiscount'),
			this.translateService.instant('offer.types.freeEntry'),
		];
	}

	//TODO to make an improvement for this method -> transfer calls to dashboard component
	private initChartValues(): void {
		this.isUsedOfferChart
			? this.initUsedOfferStats(TimeIntervalPeriod.MONTHLY)
			: this.initOfferCounts(TimeIntervalPeriod.MONTHLY);
	}

	private initOfferCounts(interval: TimeIntervalPeriod): void {
		this.offerService.getOfferCountsByStatus(interval, this.skipErrorToaster).subscribe((offerCounts) => {
			this.chartValues = offerCounts;
			this.dashboardService.initDropdownData();
		});
	}

	private initUsedOfferStats(interval: TimeIntervalPeriod): void {
		this.dashboardService.getUsedOfferStatistics(interval, this.skipErrorToaster).subscribe({
			next: (usedOfferStats) => {
				this.chartValuesUsedOffer = usedOfferStats;
				this.updateChartOptionsForEmptyData();
			},
			error: () => {
				this.chartValuesUsedOffer = [];
				this.updateChartOptionsForEmptyData();
			},
		});
	}

	private updateChartOptionsForEmptyData(): void {
		const data = this.getChartCountsForUsedOffer();
		const hasData = data.some((count) => count > 0);

		const stepSize = this.computeStepSize();
		const maxScale = hasData ? stepSize * 10 : 100;

		this.chartOptionsUsed = {
			...this.chartOptionsUsed,
			scales: {
				...this.chartOptionsUsed?.scales,
				x: {
					min: 0,
					max: maxScale,
					ticks: { stepSize },
					grid: { display: false },
				},
				y: {
					...(this.chartOptionsUsed?.scales?.['y'] ?? {}),
					grid: { display: hasData },
				},
			},
		};
	}

	private isChartEmpty(): boolean {
		const totalCount = this.getChartCounts().reduce((sum, count) => sum + count, 0);
		return totalCount === 0;
	}

	private getChartCounts(): number[] {
		return ['activeCount', 'pendingCount', 'expiredCount', 'noDataCount'].map(
			(key) => this.chartValues?.[key] || 0,
		);
	}

	private getChartCountsForUsedOffer(): number[] {
		if (!this.chartValuesUsedOffer) {
			return [];
		}

		const defaultCounts = this.chartValuesUsedOffer.reduce((counts, entry) => {
			const index = entry.offerTypeId - 1;
			if (index >= 0 && index < counts.length) {
				counts[index] = entry.citizenCount || 0;
			}
			return counts;
		}, Array(4).fill(0));

		return defaultCounts;
	}

	/**
	 * Computes a step size based on the max value using powers of 10.
	 * - If the max is below 100, return 10 for finer granularity.
	 * - Otherwise, return the nearest lower power of 10.
	 *   e.g., for max = 180 → log10(180) ≈ 2.25 → floor = 2 → 10^2 = 100
	 *   This ensures consistent tick intervals like 100, 1000, 10000, etc.
	 */ private computeStepSize(): number {
		const maxValue = Math.max(...this.getChartCountsForUsedOffer(), 0);

		if (maxValue < 100) {
			return 10;
		}

		const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
		return magnitude;
	}
}
