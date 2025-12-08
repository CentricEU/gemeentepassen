/* eslint-disable @typescript-eslint/no-empty-function */
import { Component } from '@angular/core';
import { AppColors, MonthlyTransactionDto, TimeIntervalPeriod } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';

@Component({
	selector: 'frontend-transaction-chart',
	templateUrl: './transaction-chart.component.html',
	styleUrls: ['./transaction-chart.component.scss'],
	standalone: false,
})
export class TransactionChartComponent {
	public chartData: ChartData<'line'> = { labels: [], datasets: [] };
	public chartOptions: ChartConfiguration<'line'>['options'];
	public tooltipValues: number[] = [];

	public lineChartOptions: ChartConfiguration<'line'>['options'] = {
		responsive: true,
		maintainAspectRatio: false,
		layout: {
			padding: {
				top: 40,
				bottom: 16,
				left: 32,
				right: 32
			}
		},
		plugins: {
			legend: {
				display: true,
				position: 'bottom',
				align: 'start',
				labels: {
					boxWidth: 16,
					boxHeight: 16,
					usePointStyle: true,
					pointStyle: 'rectRounded',
					font: {
						family: 'Open Sans',
						size: 14
					},
					color: AppColors.DarkBlue
				},
				onClick: () => {}
			},
			tooltip: {
				padding: {
					top: 8,
					bottom: 4,
					left: 8,
					right: 8
				},
				titleFont: { size: 0 },
				bodyFont: { size: 14 },
				backgroundColor: AppColors.White,
				titleColor: AppColors.DarkBlue,
				bodyColor: AppColors.DarkBlue,
				borderColor: AppColors.LightGrey,
				borderWidth: 1,
				cornerRadius: 10,
				displayColors: false,
				position: 'nearest',
				yAlign: 'bottom',
				callbacks: {
					title: () => '',
					label: (context) => {
						const index = context.dataIndex;
						const realValue = this.tooltipValues[index];
						// Use the current language for number formatting
						const lang = this.translateService.currentLang || 'de-DE';
						return `€${Number(realValue).toLocaleString(lang)}`;
					}
				}
			}
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: { color: AppColors.DarkBlue }
			},
			y: {
				grid: { display: false },
				ticks: {
					color: AppColors.DarkBlue,
					callback: (value) => {
						const lang = this.translateService.currentLang || 'de-DE';
						return `€${Number(value).toLocaleString(lang)}`;
					}
				},
				suggestedMin: 0
			}
		}
	};

	public noDataPlugin = {
		id: 'noDataMessage',
		beforeDraw: (chart: Chart) => {
			const datasets = chart.data.datasets;
			const allZeroOrNull = datasets.every(
				(ds) => Array.isArray(ds.data) && ds.data.every((val) => val === null || val === 0)
			);

			if (!allZeroOrNull) return;

			const { ctx, chartArea } = chart;
			const message = this.translateService.instant('dashboard.transactions.noData');

			ctx.save();
			ctx.font = '16px Open Sans';
			ctx.fillStyle = AppColors.Midnight;
			ctx.textAlign = 'center';
			ctx.fillText(message, (chartArea.left + chartArea.right) / 2, (chartArea.top + chartArea.bottom) / 2);
			ctx.restore();
		}
	};

	constructor(public translateService: TranslateService) {}

	public loadChartData(data: MonthlyTransactionDto[], timePeriod: TimeIntervalPeriod): void {
		this.tooltipValues = data.map((entry) => entry.totalAmount);
		const labels = this.generateLabels(data);
		const values = this.mapValuesWithGaps(data, timePeriod);

		const maxValue = Math.max(...values.filter((v): v is number => v !== null));
		const { stepSize, suggestedMax } = this.computeNiceAxis(maxValue > 0 ? maxValue : 10);

		if (!this.lineChartOptions) {
			return;
		}

		const lang = this.translateService.currentLang || 'de-DE';
		this.lineChartOptions = {
			...this.lineChartOptions,
			scales: {
				...((this.lineChartOptions.scales ?? {}) as Record<string, unknown>),
				y: {
					...((this.lineChartOptions.scales && this.lineChartOptions.scales['y']
						? this.lineChartOptions.scales['y']
						: {}) as Record<string, unknown>),
					suggestedMin: 0,
					suggestedMax,
					ticks: {
						...((this.lineChartOptions.scales &&
						this.lineChartOptions.scales['y'] &&
						(this.lineChartOptions.scales['y'] as any).ticks
							? (this.lineChartOptions.scales['y'] as any).ticks
							: {}) as Record<string, unknown>),
						stepSize,
						callback: (value) => `€${Number(value).toLocaleString(lang)}`
					}
				}
			}
		};

		this.setLineChartData(labels, values);
	}

	/**
	 * Computes a "nice" step size and suggested maximum value for a chart Y-axis,
	 * based on the maximum data value and desired tick count.
	 *
	 * The goal is to make the axis ticks fall on clean, human-friendly numbers
	 * (like 10, 20, 50, 100, 200...) rather than arbitrary ones (like 37, 83, etc.).
	 *
	 * @param maxValue - The highest data value to display on the Y-axis.
	 * @param tickCount - Desired number of ticks (defaults to 5).
	 * @returns An object containing a rounded step size and suggested max Y value.
	 */
	private computeNiceAxis(maxValue: number, tickCount = 5): { stepSize: number; suggestedMax: number } {
		const range = this.niceNumber(maxValue, false);
		const stepSize = this.niceNumber(range / (tickCount - 1), true);
		const suggestedMax = Math.ceil(maxValue / stepSize) * stepSize;
		return { stepSize, suggestedMax };
	}

	/**
	 * Returns a "nice" number approximately equal to the input range.
	 *
	 * The returned number is rounded to 1, 2, 5, or 10 * 10^exponent,
	 * which are considered more readable for chart axes.
	 *
	 * This method supports two modes:
	 * - rounding mode (round = true): chooses a nice value close to the input
	 * - ceiling mode (round = false): ensures the result is >= input
	 *
	 * @param range - The raw range to approximate nicely.
	 * @param round - Whether to round (true) or ceil (false) the result.
	 * @returns A "nice" rounded number.
	 */
	private niceNumber(range: number, round: boolean): number {
		if (range === 0) return 1;
		const exponent = Math.floor(Math.log10(range));
		const fraction = range / Math.pow(10, exponent);

		const niceFractions = [1, 2, 5, 10];
		let niceFraction =
			niceFractions.find((_nf, i) =>
				round ? fraction < [1.5, 3, 7, Infinity][i] : fraction <= [1, 2, 5, Infinity][i]
			) ?? 10;

		return niceFraction * Math.pow(10, exponent);
	}

	private mapValuesWithGaps(data: MonthlyTransactionDto[], period: TimeIntervalPeriod): (number | null)[] {
		const currentMonthIndex = new Date().getMonth();
		if (period === TimeIntervalPeriod.YEARLY) {
			return data.map((entry) => {
				const monthIndex = entry.month - 1;
				const isCurrentOrPast = monthIndex <= currentMonthIndex;
				return isCurrentOrPast ? entry.totalAmount : null;
			});
		}

		if (period === TimeIntervalPeriod.MONTHLY) {
			const onlyValue = data[0]?.totalAmount ?? 0;
			return [onlyValue > 0 ? onlyValue : null];
		}

		return data.map((entry) => entry.totalAmount);
	}

	private generateLabels(data: MonthlyTransactionDto[]): string[] {
		const monthKeys = [
			'general.monthPrefix.january',
			'general.monthPrefix.february',
			'general.monthPrefix.march',
			'general.monthPrefix.april',
			'general.monthPrefix.may',
			'general.monthPrefix.june',
			'general.monthPrefix.july',
			'general.monthPrefix.august',
			'general.monthPrefix.september',
			'general.monthPrefix.october',
			'general.monthPrefix.november',
			'general.monthPrefix.december'
		];

		return data.map((entry) => {
			const key = monthKeys[entry.month - 1];
			return this.translateService.instant(key);
		});
	}

	private setLineChartData(labels: string[], values: (number | null)[]): void {
		const allZeroOrNull = values.every((val) => val === null || val === 0);

		this.chartData = {
			labels,
			datasets: [
				{
					data: values,
					label: this.translateService.instant('dashboard.transactions.valueOfTransactions'),
					fill: false,
					borderColor: AppColors.Green,
					backgroundColor: AppColors.Green,
					pointBackgroundColor: AppColors.Green,
					pointBorderColor: AppColors.Green,
					tension: 0,
					showLine: !allZeroOrNull,
					pointRadius: allZeroOrNull ? 0 : 3,
					pointHoverRadius: allZeroOrNull ? 0 : 4
				}
			]
		};
	}
}
