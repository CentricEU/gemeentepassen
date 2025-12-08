import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthlyTransactionDto, TimeIntervalPeriod } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { Chart } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

import { TransactionChartComponent } from './transaction-chart.component';

window.ResizeObserver =
	window.ResizeObserver ||
	jest.fn().mockImplementation(() => ({
		disconnect: jest.fn(),
		observe: jest.fn(),
		unobserve: jest.fn()
	}));

jest.mock('chart.js', () => {
	const actual = jest.requireActual('chart.js');
	return {
		...actual,
		Chart: class {
			static register = jest.fn();
			constructor() {
				return {
					update: jest.fn(),
					destroy: jest.fn()
				};
			}
		}
	};
});
describe('TransactionChartComponent', () => {
	let component: TransactionChartComponent;
	let fixture: ComponentFixture<TransactionChartComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TransactionChartComponent],
			imports: [TranslateModule.forRoot(), NgChartsModule]
		}).compileComponents();

		fixture = TestBed.createComponent(TransactionChartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set chart data with correct labels and values for YEARLY', () => {
		const data: MonthlyTransactionDto[] = [
			{ month: 1, totalAmount: 10000 },
			{ month: 2, totalAmount: 20000 }
		];

		component.loadChartData(data, TimeIntervalPeriod.YEARLY);

		expect(component.chartData.labels).toEqual(['general.monthPrefix.january', 'general.monthPrefix.february']);
		expect(component.tooltipValues).toEqual([10000, 20000]);
		expect(component.chartData.datasets[0].data).toEqual([10000, 20000]);
	});

	// it('should return null values for future months in YEARLY', () => {
	// 	const futureMonth = new Date().getMonth() + 2;
	// 	const data = [{ month: futureMonth, totalAmount: 30000 }];
	// 	component.loadChartData(data, TimeIntervalPeriod.YEARLY);

	// 	expect(component.chartData.datasets[0].data).toEqual([null]);
	// });

	it('should return a single value for MONTHLY period', () => {
		const data = [{ month: 5, totalAmount: 25000 }];
		component.loadChartData(data, TimeIntervalPeriod.MONTHLY);

		expect(component.chartData.datasets[0].data).toEqual([25000]);
		expect(component.tooltipValues).toEqual([25000]);
	});

	it('should return null for zero totalAmount in MONTHLY', () => {
		const data = [{ month: 5, totalAmount: 0 }];
		component.loadChartData(data, TimeIntervalPeriod.MONTHLY);

		expect(component.chartData.datasets[0].data).toEqual([null]);
	});

	it('should clamp values to MAX_VISUAL_VALUE (100000)', () => {
		const data = [{ month: 4, totalAmount: 100000 }];
		component.loadChartData(data, TimeIntervalPeriod.YEARLY);

		expect(component.chartData.datasets[0].data).toEqual([100000]);
	});

	it('should format tooltip label correctly using callback', () => {
		component.tooltipValues = [12345.67];

		const tooltipCallback = component.lineChartOptions?.plugins?.tooltip?.callbacks?.label;
		const context = { dataIndex: 0 } as any;

		const result = (tooltipCallback as (this: any, ctx: any) => string).call(component, context);

		expect(result).toBe('€12.345,67');
	});

	it('should return empty string for tooltip title callback', () => {
		const titleCallback = component.lineChartOptions?.plugins?.tooltip?.callbacks?.title;
		const result = (titleCallback as (this: any, items: any[]) => string).call({}, []);
		expect(result).toBe('');
	});

	it('should format y-axis ticks correctly using callback', () => {
		const yTickCallback = component.lineChartOptions?.scales?.['y']?.ticks?.callback;
		const result = (yTickCallback as (this: any, value: number, index: number, ticks: any[]) => string).call(
			{},
			12345,
			0,
			[]
		);
		expect(result).toBe('€12.345');
	});

	it('should trigger beforeDraw plugin and draw message if chart is empty', () => {
		const ctxMock = {
			save: jest.fn(),
			restore: jest.fn(),
			fillText: jest.fn(),
			font: '',
			fillStyle: '',
			textAlign: ''
		};

		const chartMock = {
			data: { datasets: [{ data: [0, 0, null] }] },
			ctx: ctxMock,
			chartArea: { left: 0, right: 100, top: 0, bottom: 100 }
		} as unknown as Chart;

		component.noDataPlugin.beforeDraw(chartMock);

		expect(ctxMock.save).toHaveBeenCalled();
		expect(ctxMock.fillText).toHaveBeenCalledWith('dashboard.transactions.noData', 50, 50);
		expect(ctxMock.restore).toHaveBeenCalled();
	});

	it('should clamp values to MAX_VISUAL_VALUE when period is not YEARLY or MONTHLY', () => {
		const rawData = [
			{ month: 1, totalAmount: 15000 },
			{ month: 2, totalAmount: 99999 },
			{ month: 3, totalAmount: 500 }
		];

		const result = (component as any).mapValuesWithGaps(rawData, 'QUARTERLY');

		expect(result).toEqual([15000, 99999, 500]);
	});

	it('should not draw message if chart has valid data', () => {
		const ctxMock = {
			save: jest.fn(),
			restore: jest.fn(),
			fillText: jest.fn()
		};

		const chartMock = {
			data: { datasets: [{ data: [100, 0, null] }] },
			ctx: ctxMock,
			chartArea: { left: 0, right: 100, top: 0, bottom: 100 }
		} as unknown as Chart;

		component.noDataPlugin.beforeDraw(chartMock);

		expect(ctxMock.save).not.toHaveBeenCalled();
		expect(ctxMock.fillText).not.toHaveBeenCalled();
		expect(ctxMock.restore).not.toHaveBeenCalled();
	});

	it('should return [null] if data is empty for MONTHLY period', () => {
		const data: MonthlyTransactionDto[] = [];

		const result = (component as any).mapValuesWithGaps(data, TimeIntervalPeriod.MONTHLY);

		expect(result).toEqual([null]);
	});

	describe('TransactionChartComponent private methods', () => {
		describe('computeNiceAxis', () => {
			it('should compute nice axis for maxValue 12345', () => {
				const result = (component as any).computeNiceAxis(12345);
				expect(result.stepSize).toBeGreaterThan(0);
				expect(result.suggestedMax).toBeGreaterThanOrEqual(12345);
				expect(result.suggestedMax % result.stepSize).toBe(0);
			});

			it('should compute nice axis for maxValue 0', () => {
				const result = (component as any).computeNiceAxis(0);
				expect(result.stepSize).toBe(0.2);
				expect(result.suggestedMax).toBe(0);
			});
		});

		describe('niceNumber', () => {
			it('should return a nice rounded number when round=true', () => {
				const result = (component as any).niceNumber(123, true);
				expect([100, 200, 500, 1000]).toContain(result);
			});

			it('should return a nice ceiling number when round=false', () => {
				const result = (component as any).niceNumber(123, false);
				expect(result).toBeGreaterThanOrEqual(123);
				expect([100, 200, 500, 1000]).toContain(result);
			});

			it('should return 1 when range is 0', () => {
				const result = (component as any).niceNumber(0, true);
				expect(result).toBe(1);
			});
		});
		describe('loadChartData', () => {
			let translateServiceMock: any;

			beforeEach(() => {
				translateServiceMock = {
					currentLang: 'de-DE',
					instant: jest.fn((key) => key)
				};
				component = new TransactionChartComponent(translateServiceMock);
				component.lineChartOptions = {
					responsive: true,
					scales: {
						y: {
							ticks: {
								callback: jest.fn()
							}
						}
					},
					plugins: {
						tooltip: {
							callbacks: {
								label: jest.fn()
							}
						}
					}
				} as any;
			});

			// it('should update lineChartOptions.y with correct suggestedMax and stepSize', () => {
			// 	const data = [
			// 		{ month: 1, totalAmount: 100 },
			// 		{ month: 2, totalAmount: 200 }
			// 	];
			// 	component.loadChartData(data, TimeIntervalPeriod.YEARLY);

			// 	const yOptions = (component.lineChartOptions?.scales as any)?.y;
			// 	expect(yOptions.suggestedMax).toBeGreaterThanOrEqual(200);
			// 	expect(yOptions.stepSize).toBeGreaterThan(0);
			// 	expect(typeof yOptions.ticks.callback).toBe('function');
			// });

			// it('should use default maxValue if all values are null', () => {
			// 	const data = [
			// 		{ month: 1, totalAmount: null as any },
			// 		{ month: 2, totalAmount: null as any }
			// 	];
			// 	component.loadChartData(data, TimeIntervalPeriod.YEARLY);

			// 	const yOptions = (component.lineChartOptions?.scales as any)?.y;
			// 	expect(yOptions.suggestedMax).toBeGreaterThanOrEqual(10);
			// 	expect(yOptions.stepSize).toBeGreaterThan(0);
			// });

			it('should not update lineChartOptions if it is undefined', () => {
				component.lineChartOptions = undefined;
				const data = [{ month: 1, totalAmount: 100 }];
				component.loadChartData(data, TimeIntervalPeriod.YEARLY);
				expect(component.chartData.labels).toEqual([]);
				expect(component.chartData.datasets).toEqual([]);
			});

			it('should set chartData with correct labels and values', () => {
				const data = [{ month: 1, totalAmount: 100 }];
				component.loadChartData(data, TimeIntervalPeriod.YEARLY);

				expect(component.chartData.labels?.length).toBe(1);
				expect(component.chartData.datasets[0].data).toEqual([100]);
			});

			it('should use currentLang from translateService for formatting', () => {
				const data = [{ month: 1, totalAmount: 1234 }];
				component.loadChartData(data, TimeIntervalPeriod.YEARLY);

				const yOptions = (component.lineChartOptions?.scales as any)?.y;
				const formatted = yOptions.ticks.callback(1234);
				expect(formatted).toContain('€');
				expect(formatted).toContain('1.234');
			});
		});
	});
});
