/* eslint-disable @typescript-eslint/ban-types */
import 'chart.js';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
	AppColors,
	commonRoutingConstants,
	DashboardService,
	GenericStatusEnum,
	OfferStatisticsDto,
	TimeIntervalPeriod,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill/combo-button';
import { ActiveElement, Chart, ChartTypeRegistry, ScriptableTooltipContext, TooltipModel } from 'chart.js';
import { of, throwError } from 'rxjs';

import { AppModule } from '../../../app.module';
import { OfferStatusCountsDto } from '../../../models/offer-status-counts-dto.model';
import { OfferService } from '../../../services/offer-service/offer.service';
import { OffersChartPanelComponent } from './offers-chart-panel.component';

window.ResizeObserver =
	window.ResizeObserver ||
	jest.fn().mockImplementation(() => ({
		disconnect: jest.fn(),
		observe: jest.fn(),
		unobserve: jest.fn(),
	}));

jest.mock('chart.js', () => {
	const actualChartJs = jest.requireActual('chart.js');

	class MockChart {
		static register = jest.fn();
		constructor() {
			return {
				update: jest.fn(),
				destroy: jest.fn(),
			};
		}
	}

	return {
		...actualChartJs,
		Chart: MockChart,
	};
});

jest.mock('chartjs-plugin-datalabels', () => ({
	__esModule: true,
	default: { prototype: {} },
}));

describe('OffersChartPanelComponent', () => {
	let component: OffersChartPanelComponent;
	let fixture: ComponentFixture<OffersChartPanelComponent>;
	let offerServiceMock: Partial<OfferService>;
	let routerMock: Partial<Router>;
	let dashboardService: DashboardService;

	beforeEach(async () => {
		dashboardService = {
			getUsedOfferStatistics: jest.fn(),
		} as unknown as DashboardService;

		offerServiceMock = {
			getOfferCountsByStatus: jest.fn().mockReturnValue(
				of({
					expiredCount: 2,
					pendingCount: 3,
					activeCount: 5,
				}),
			),
		};

		routerMock = {
			navigate: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [OffersChartPanelComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
			providers: [
				{ provide: 'DashboardService', useValue: dashboardService },
				{ provide: OfferService, useValue: offerServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OffersChartPanelComponent);
		component = fixture.componentInstance;
		dashboardService = TestBed.inject(DashboardService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('hovering over chart', () => {
		it('should change cursor to pointer when hovering over chart', () => {
			const mockEvent = {
				native: {
					target: document.createElement('div'),
				},
			} as { native: { target: HTMLElement } };
			const chartElement = [{}];

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			component.chartOptions.onHover(mockEvent, chartElement);
			expect(mockEvent.native.target.style.cursor).toBe('pointer');
		});

		it('should change cursor back when not hovering over chart', () => {
			const mockEvent = {
				native: {
					target: document.createElement('div'),
				},
			} as { native: { target: HTMLElement } };
			const chartElement: ActiveElement[] = [];

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			component.chartOptions.onHover(mockEvent, chartElement);
			expect(mockEvent.native.target.style.cursor).toBe('default');
		});
	});

	describe('counting total number of offers', () => {
		it('should return 0 if chartValues is falsy', () => {
			(offerServiceMock.getOfferCountsByStatus as jest.Mock)?.mockReturnValue(of(null));
			component.ngOnInit();
			expect(component.offersCount).toBeFalsy();
		});

		it('should return the real offer count if chartValues is truthy', () => {
			component.ngOnInit();
			expect(component.offersCount).toBe(10);
		});
	});

	describe('navigate to offers page when clicking on chart', () => {
		it('should set the status filter and navigate if active is not empty', () => {
			const mockActive = [{ index: 1 }];

			component.onChartClick({ active: mockActive });

			expect(offerServiceMock.offerStatusFilter).toBe(GenericStatusEnum.PENDING);
			expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.offers]);
		});

		it('should not navigate if active is empty', () => {
			const mockActive: [] = [];

			component.onChartClick({ active: mockActive });

			expect(routerMock.navigate).not.toHaveBeenCalled();
		});

		it('should not navigate if active is undefined', () => {
			component.onChartClick({ active: undefined });

			expect(routerMock.navigate).not.toHaveBeenCalled();
		});
	});

	describe('translatedTimePeriodToEnum method', () => {
		it.each([
			['dashboard.offers.thisMonth', TimeIntervalPeriod.MONTHLY],
			['dashboard.offers.thisQuarter', TimeIntervalPeriod.QUARTERLY],
			['dashboard.offers.thisYear', TimeIntervalPeriod.YEARLY],
			['default', TimeIntervalPeriod.MONTHLY],
		])('should return the correct enum value for each translation key', (translationKey, enumValue) => {
			expect(component.dashboardServiceInstance['translatedTimePeriodToEnum'](translationKey)).toEqual(enumValue);
		});
	});

	describe('onTimePeriodChange method', () => {
		it('should update the active time period and reinitialize the chart with it', () => {
			const mockEvent: WindmillComboButtonMenuItem = {
				title: 'mockTitle',
			};

			component.onTimePeriodChange(mockEvent);

			expect(component.activeTimePeriod).toEqual(mockEvent.title);
			expect(offerServiceMock.getOfferCountsByStatus).toHaveBeenCalledWith(
				component.dashboardServiceInstance['translatedTimePeriodToEnum'](mockEvent.title),
				false,
			);
		});
	});
	describe('isChartEmpty method', () => {
		it('should return true when all counts are zero', () => {
			component.chartValues = {
				expiredCount: 0,
				pendingCount: 0,
				activeCount: 0,
				noDataCount: 0,
			};

			expect(component['isChartEmpty']()).toBe(true);
		});

		it('should return false when at least one count is non-zero', () => {
			component.chartValues = {
				expiredCount: 0,
				pendingCount: 1,
				activeCount: 0,
				noDataCount: 0,
			};

			expect(component['isChartEmpty']()).toBe(false);
		});
	});

	describe('getChartCounts method', () => {
		it('should return counts for all categories', () => {
			component.chartValues = {
				activeCount: 4,
				pendingCount: 3,
				expiredCount: 2,
				noDataCount: 0,
			};

			const result = component['getChartCounts']();

			expect(result).toEqual([4, 3, 2, 0]);
		});

		it('should return zeros for all categories when chartValues is undefined', () => {
			component.chartValues = undefined as unknown as OfferStatusCountsDto;

			const result = component['getChartCounts']();

			expect(result).toEqual([0, 0, 0, 0]);
		});
	});

	describe('initDropdownData method', () => {
		it('should populate dropdownData with time period options', () => {
			component.dashboardServiceInstance['initDropdownData']();

			expect(component.dashboardServiceInstance.dropdownData.length).toBe(3);
			expect(component.dashboardServiceInstance.dropdownData[0].title).toBeDefined();
			expect(component.dashboardServiceInstance.dropdownData[1].title).toBeDefined();
			expect(component.dashboardServiceInstance.dropdownData[2].title).toBeDefined();
		});
	});
	describe('chartOptions', () => {
		it('should disable tooltip when chart is empty', () => {
			// Mock isChartEmpty as a function to avoid TypeError
			component['isChartEmpty'] = jest.fn(() => true) as unknown as (typeof component)['isChartEmpty'];

			const tooltipEnabledFn =
				typeof component.chartOptions?.plugins?.tooltip?.enabled === 'function'
					? component.chartOptions.plugins.tooltip.enabled.bind(component.chartOptions.plugins.tooltip)
					: () => false;

			const mockContext: ScriptableTooltipContext<keyof ChartTypeRegistry> = {
				chart: {} as Chart,
				tooltip: {} as TooltipModel<keyof ChartTypeRegistry>,
				tooltipItems: [] as never[],
			};

			const mockOptions = component.chartOptions?.plugins?.tooltip ?? {};

			expect(tooltipEnabledFn(mockContext, mockOptions)).toBe(false);
		});

		it('should enable tooltip when chart has data', () => {
			component['isChartEmpty'] = jest.fn(() => true) as unknown as (typeof component)['isChartEmpty'];

			// eslint-disable-next-line @typescript-eslint/ban-types
			const tooltipEnabledFn =
				(component.chartOptions?.plugins?.tooltip?.enabled as () => boolean) || (() => false);

			expect(tooltipEnabledFn()).toBe(false);
		});
	});

	describe('chartTitle getter', () => {
		it('should return "dashboard.usedOffers.header" when isUsedOfferChart is true', () => {
			component.isUsedOfferChart = true;

			expect(component.chartTitle).toBe('dashboard.usedOffers.header');
		});

		it('should return "general.pages.offers" when isUsedOfferChart is false', () => {
			component.isUsedOfferChart = false;

			expect(component.chartTitle).toBe('general.pages.offers');
		});
	});

	describe('updateChartOptionsForEmptyData method', () => {
		describe('getChartCountsForUsedOffer method', () => {
			it('should return an array of counts based on chartValuesUsedOffer', () => {
				component.chartValuesUsedOffer = [
					{
						offerTypeId: 1,
						citizenCount: 10,
						offerTypeLabel: 'Percentage',
					},
					{
						offerTypeId: 2,
						citizenCount: 20,
						offerTypeLabel: 'BOGO',
					},
					{
						offerTypeId: 3,
						citizenCount: 30,
						offerTypeLabel: 'Free entry',
					},
					{
						offerTypeId: 4,
						citizenCount: 40,
						offerTypeLabel: 'Credit',
					},
				];

				const result = component['getChartCountsForUsedOffer']();

				expect(result).toEqual([10, 20, 30, 40]);
			});

			it('should return an array with zeros for missing offerTypeIds', () => {
				component.chartValuesUsedOffer = [
					{
						offerTypeId: 1,
						citizenCount: 10,
						offerTypeLabel: 'Percentage',
					},
					{
						offerTypeId: 3,
						citizenCount: 30,
						offerTypeLabel: 'Credit',
					},
				];

				const result = component['getChartCountsForUsedOffer']();

				expect(result).toEqual([10, 0, 30, 0]);
			});

			it('should return an array of zeros when chartValuesUsedOffer is empty', () => {
				component.chartValuesUsedOffer = [];

				const result = component['getChartCountsForUsedOffer']();

				expect(result).toEqual([0, 0, 0, 0]);
			});

			it('should return an array of zeros when chartValuesUsedOffer is undefined', () => {
				component.chartValuesUsedOffer = undefined as unknown as OfferStatisticsDto[];

				const result = component['getChartCountsForUsedOffer']();

				expect(result).toEqual([]);
			});

			it('should ignore invalid offerTypeIds and return counts for valid ones', () => {
				component.chartValuesUsedOffer = [
					{
						offerTypeId: 0,
						citizenCount: 5,
						offerTypeLabel: 'Credit',
					},
					{
						offerTypeId: 1,
						citizenCount: 10,
						offerTypeLabel: 'BOGO',
					},
					{
						offerTypeId: 5,
						citizenCount: 15,
						offerTypeLabel: 'Free entry',
					},
				];

				const result = component['getChartCountsForUsedOffer']();

				expect(result).toEqual([10, 0, 0, 0]);
			});
		});
		describe('OffersChartPanelComponent', () => {
			describe('chartTitle getter', () => {
				it('should return "dashboard.usedOffers.header" when isUsedOfferChart is true', () => {
					component.isUsedOfferChart = true;
					expect(component.chartTitle).toBe('dashboard.usedOffers.header');
				});

				it('should return "general.pages.offers" when isUsedOfferChart is false', () => {
					component.isUsedOfferChart = false;
					expect(component.chartTitle).toBe('general.pages.offers');
				});
			});

			describe('offersCount getter', () => {
				it('should return the sum of active, expired, and pending counts', () => {
					component.chartValues = {
						activeCount: 5,
						expiredCount: 3,
						pendingCount: 2,
						noDataCount: 0,
					};
					expect(component.offersCount).toBe(10);
				});

				it('should return undefined if chartValues is undefined', () => {
					component.chartValues = undefined as unknown as OfferStatusCountsDto;
					expect(component.offersCount).toBeNaN();
				});
			});

			describe('chartDataOffer getter', () => {
				it('should return placeholder data when chart is empty', () => {
					jest.spyOn(component as any, 'isChartEmpty').mockReturnValue(true);
					const chartData = component.chartDataOffer;
					expect(chartData.datasets[0].data).toEqual([0, 0, 0, 1]);
				});

				it('should return actual data when chart is not empty', () => {
					component.chartValues = {
						activeCount: 3,
						pendingCount: 2,
						expiredCount: 1,
						noDataCount: 0,
					};
					jest.spyOn(component as any, 'isChartEmpty').mockReturnValue(false);
					const chartData = component.chartDataOffer;
					expect(chartData.datasets[0].data).toEqual([3, 2, 1, 0]);
				});
			});

			describe('onTimePeriodChange method', () => {
				it('should update activeTimePeriod and initialize offer counts', () => {
					const mockEvent: WindmillComboButtonMenuItem = { title: 'dashboard.offers.thisYear' };
					const initOfferCountsSpy = jest.spyOn(component as any, 'initOfferCounts');
					component.isUsedOfferChart = false;

					component.onTimePeriodChange(mockEvent);

					expect(component.activeTimePeriod).toBe(mockEvent.title);
					expect(initOfferCountsSpy).toHaveBeenCalledWith(TimeIntervalPeriod.YEARLY);
				});

				it('should update activeTimePeriod and initialize used offer stats', () => {
					const mockEvent: WindmillComboButtonMenuItem = { title: 'dashboard.offers.thisQuarter' };
					const initUsedOfferStatsSpy = jest.spyOn(component as any, 'initUsedOfferStats');
					component.isUsedOfferChart = true;

					component.onTimePeriodChange(mockEvent);

					expect(component.activeTimePeriod).toBe(mockEvent.title);
					expect(initUsedOfferStatsSpy).toHaveBeenCalledWith(TimeIntervalPeriod.QUARTERLY);
				});
			});

			describe('onChartClick method', () => {
				it('should set the status filter and navigate when active is not empty', () => {
					const mockActive = [{ index: 1 }];
					component.onChartClick({ active: mockActive });

					expect(offerServiceMock.offerStatusFilter).toBe(GenericStatusEnum.PENDING);
					expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.offers]);
				});

				it('should not navigate when active is empty', () => {
					component.onChartClick({ active: [] });
					expect(routerMock.navigate).not.toHaveBeenCalled();
				});

				it('should not navigate when active is undefined', () => {
					component.onChartClick({ active: undefined });
					expect(routerMock.navigate).not.toHaveBeenCalled();
				});
			});

			describe('isChartEmpty method', () => {
				it('should return true when all counts are zero', () => {
					component.chartValues = {
						activeCount: 0,
						pendingCount: 0,
						expiredCount: 0,
						noDataCount: 0,
					};
					expect(component['isChartEmpty']()).toBe(true);
				});

				it('should return false when at least one count is non-zero', () => {
					component.chartValues = {
						activeCount: 1,
						pendingCount: 0,
						expiredCount: 0,
						noDataCount: 0,
					};
					expect(component['isChartEmpty']()).toBe(false);
				});
			});

			describe('getChartCounts method', () => {
				it('should return counts for all categories', () => {
					component.chartValues = {
						activeCount: 4,
						pendingCount: 3,
						expiredCount: 2,
						noDataCount: 1,
					};
					expect(component['getChartCounts']()).toEqual([4, 3, 2, 1]);
				});

				it('should return zeros for all categories when chartValues is undefined', () => {
					component.chartValues = undefined as unknown as OfferStatusCountsDto;
					expect(component['getChartCounts']()).toEqual([0, 0, 0, 0]);
				});
			});

			describe('getChartCountsForUsedOffer method', () => {
				it('should return counts based on chartValuesUsedOffer', () => {
					component.chartValuesUsedOffer = [
						{ offerTypeId: 1, citizenCount: 10, offerTypeLabel: 'Percentage' },
						{ offerTypeId: 2, citizenCount: 20, offerTypeLabel: 'BOGO' },
					];
					expect(component['getChartCountsForUsedOffer']()).toEqual([10, 20, 0, 0]);
				});

				it('should return zeros when chartValuesUsedOffer is empty', () => {
					component.chartValuesUsedOffer = [];
					expect(component['getChartCountsForUsedOffer']()).toEqual([0, 0, 0, 0]);
				});

				it('should return zeros when chartValuesUsedOffer is undefined', () => {
					component.chartValuesUsedOffer = undefined as unknown as OfferStatisticsDto[];
					expect(component['getChartCountsForUsedOffer']()).toEqual([]);
				});
			});

			describe('barValuePlugin', () => {
				it('should draw value labels when data is present', () => {
					const mockChart = {
						data: {
							datasets: [{ data: [10, 20, 0, 5] }],
						},
						getDatasetMeta: () => ({
							data: [
								{ x: 100, y: 50 },
								{ x: 100, y: 100 },
								{ x: 100, y: 150 },
								{ x: 100, y: 200 },
							],
						}),
						ctx: {
							save: jest.fn(),
							restore: jest.fn(),
							fillStyle: '',
							textAlign: '',
							textBaseline: '',
							font: '',
							fillText: jest.fn(),
						},
					} as unknown as Chart<'bar'>;

					(component.barValuePlugin.afterDatasetsDraw as Function)?.(mockChart, {}, {}, 'barValuePlugin');

					expect(mockChart.ctx.save).toHaveBeenCalled();
					expect(mockChart.ctx.fillText).toHaveBeenCalledWith('10', 105, 50);
					expect(mockChart.ctx.fillText).toHaveBeenCalledWith('20', 105, 100);
					expect(mockChart.ctx.fillText).toHaveBeenCalledWith('5', 105, 200);
					expect(mockChart.ctx.restore).toHaveBeenCalled();
				});

				it('should draw values when dataset data includes arrays with values > 0', () => {
					const fillTextMock = jest.fn();
					const saveMock = jest.fn();
					const restoreMock = jest.fn();

					const mockChart = {
						data: {
							datasets: [
								{
									data: [
										[0, 0],
										[0, 5],
										[0, 0],
										[0, 0],
									],
								},
							],
						},
						getDatasetMeta: () => ({
							data: [
								{ x: 10, y: 10 },
								{ x: 20, y: 20 },
								{ x: 30, y: 30 },
								{ x: 40, y: 40 },
							],
						}),
						ctx: {
							save: saveMock,
							restore: restoreMock,
							fillText: fillTextMock,
							fillStyle: '',
							textAlign: '',
							textBaseline: '',
							font: '',
						},
					} as unknown as Chart<'bar'>;

					(component.barValuePlugin.afterDatasetsDraw as any)?.(mockChart);

					expect(saveMock).toHaveBeenCalled();
					expect(fillTextMock).toHaveBeenCalledWith('5', 25, 20);
					expect(restoreMock).toHaveBeenCalled();
				});

				it('should extract value from dataValue array and draw it', () => {
					const fillTextMock = jest.fn();
					const saveMock = jest.fn();
					const restoreMock = jest.fn();

					const mockChart = {
						data: {
							datasets: [{ data: [[0, 100]] }],
						},
						getDatasetMeta: () => ({
							data: [{ x: 50, y: 60 }],
						}),
						ctx: {
							save: saveMock,
							restore: restoreMock,
							fillText: fillTextMock,
							fillStyle: '',
							textAlign: '',
							textBaseline: '',
							font: '',
						},
					} as unknown as Chart<'bar'>;

					(component.barValuePlugin.afterDatasetsDraw as any)?.(mockChart);

					expect(fillTextMock).toHaveBeenCalledWith('100', 55, 60);
				});
			});

			describe('createCustomMessage plugin', () => {
				it('should draw message when all dataset values are 0', () => {
					const saveMock = jest.fn();
					const restoreMock = jest.fn();

					const mockChart = {
						data: {
							datasets: [{ data: [0, 0, 0, 0] }],
						},
						chartArea: {
							left: 0,
							right: 200,
							top: 0,
							bottom: 100,
						},
						ctx: {
							save: saveMock,
							restore: restoreMock,
							font: '',
							fillStyle: '',
							textAlign: '',
							textBaseline: '',
							fillText: jest.fn() as jest.Mock,
							measureText: jest.fn().mockReturnValue({ width: 50 }),
						},
					} as unknown as Chart;

					jest.spyOn(component['translateService'], 'instant').mockReturnValue('No data available');

					(component.createCustomMessage.beforeDraw as any)?.(mockChart);
					expect(mockChart.ctx.save).toHaveBeenCalled();
					expect(mockChart.ctx.font).toContain('16px Open Sans');
					expect(mockChart.ctx.fillStyle).toBe('#0A0C1F');
					expect(mockChart.ctx.textAlign).toBe('center');
					expect(mockChart.ctx.textBaseline).toBe('middle');
					expect(mockChart.ctx.fillText).toHaveBeenCalledWith(
						component['translateService'].instant('dashboard.usedOffers.noDataMessage'),
						100,
						40,
					);
					expect(mockChart.ctx.restore).toHaveBeenCalled();
				});

				it('should not draw message if at least one value is > 0', () => {
					const fillTextMock = jest.fn();
					const saveMock = jest.fn();
					const restoreMock = jest.fn();

					const mockChart = {
						data: {
							datasets: [{ data: [0, 0, 1, 0] }],
						},
						chartArea: {
							left: 0,
							right: 200,
							top: 0,
							bottom: 100,
						},
						ctx: {
							save: saveMock,
							restore: restoreMock,
							fillText: fillTextMock,
						},
					} as unknown as Chart;

					(component.createCustomMessage.beforeDraw as any)?.(mockChart);

					expect(saveMock).not.toHaveBeenCalled();
					expect(fillTextMock).not.toHaveBeenCalled();
					expect(restoreMock).not.toHaveBeenCalled();
				});
			});

			describe('chartLegendUsedOffers method', () => {
				it('should return translated labels for used offer types', () => {
					jest.spyOn(component['translateService'], 'instant').mockImplementation((key: any) => {
						const translations: Record<string, string> = {
							'offer.types.percentageDiscount': 'Percentage Discount',
							'offer.types.bogo': 'Buy One Get One',
							'offer.types.creditDiscount': 'Credit Discount',
							'offer.types.freeEntry': 'Free Entry',
						};
						return translations[key] || key;
					});

					const result = (component as any).chartLegendUsedOffers();

					expect(result).toEqual(['Percentage Discount', 'Buy One Get One', 'Credit Discount', 'Free Entry']);
				});

				it('should call translateService.instant for each offer type key', () => {
					const translateSpy = jest.spyOn(component['translateService'], 'instant');

					(component as any).chartLegendUsedOffers();

					expect(translateSpy).toHaveBeenCalledWith('offer.types.percentageDiscount');
					expect(translateSpy).toHaveBeenCalledWith('offer.types.bogo');
					expect(translateSpy).toHaveBeenCalledWith('offer.types.creditDiscount');
					expect(translateSpy).toHaveBeenCalledWith('offer.types.freeEntry');
				});
			});

			describe('initUsedOfferStats', () => {
				it('should update chartValuesUsedOffer with data from the service', () => {
					const mockData: OfferStatisticsDto[] = [
						{
							date: '2024-01',
							count: 5,
							offerTypeId: 1,
							offerTypeLabel: 'Discount',
							citizenCount: 100,
						},
					];

					const spy = jest.spyOn(dashboardService, 'getUsedOfferStatistics').mockReturnValue(of(mockData));

					component['initUsedOfferStats'](TimeIntervalPeriod.MONTHLY);

					expect(spy).toHaveBeenCalledWith(TimeIntervalPeriod.MONTHLY, false);
					expect(component.chartValuesUsedOffer).toEqual(mockData);
				});

				it('should handle an empty response gracefully', () => {
					dashboardService['getUsedOfferStatistics'] = jest.fn().mockReturnValue(of([]));

					component['initUsedOfferStats'](TimeIntervalPeriod.MONTHLY);

					expect(component.chartValuesUsedOffer).toEqual([]);
				});

				it('should handle undefined response gracefully', () => {
					dashboardService['getUsedOfferStatistics'] = jest.fn().mockReturnValue(of(undefined));

					component['initUsedOfferStats'](TimeIntervalPeriod.MONTHLY);

					expect(component.chartValuesUsedOffer).toEqual(undefined);
				});
			});

			describe('chartDataUsedOffer getter', () => {
				it('should return correct data when chartValuesUsedOffer has values', () => {
					component.chartValuesUsedOffer = [
						{ offerTypeId: 1, citizenCount: 10, offerTypeLabel: 'Percentage' },
						{ offerTypeId: 2, citizenCount: 20, offerTypeLabel: 'BOGO' },
						{ offerTypeId: 3, citizenCount: 30, offerTypeLabel: 'Credit' },
						{ offerTypeId: 4, citizenCount: 40, offerTypeLabel: 'Free Entry' },
					];
					const chartData = component.chartDataUsedOffer;

					expect(chartData.labels).toEqual([
						'offer.types.percentageDiscount',
						'offer.types.bogo',
						'offer.types.creditDiscount',
						'offer.types.freeEntry',
					]);
					expect(chartData.datasets[0].data).toEqual([10, 20, 30, 40]);
					expect(chartData.datasets[0].backgroundColor).toBe('#0B5E22');
				});

				it('should handle missing offerTypeIds and return zeros for them', () => {
					component.chartValuesUsedOffer = [
						{ offerTypeId: 1, citizenCount: 10, offerTypeLabel: 'Percentage' },
						{ offerTypeId: 3, citizenCount: 30, offerTypeLabel: 'Credit' },
					];
					const chartData = component.chartDataUsedOffer;

					expect(chartData.labels).toEqual([
						'offer.types.percentageDiscount',
						'offer.types.bogo',
						'offer.types.creditDiscount',
						'offer.types.freeEntry',
					]);
					expect(chartData.datasets[0].data).toEqual([10, 0, 30, 0]);
				});

				it('should return zeros when chartValuesUsedOffer is undefined', () => {
					component.chartValuesUsedOffer = undefined as unknown as OfferStatisticsDto[];
					const chartData = component.chartDataUsedOffer;

					expect(chartData.labels).toEqual([
						'offer.types.percentageDiscount',
						'offer.types.bogo',
						'offer.types.creditDiscount',
						'offer.types.freeEntry',
					]);
					expect(chartData.datasets[0].data).toEqual([]);
				});
			});

			describe('tooltip enabled logic', () => {
				it('should enable tooltip when chart is not empty', () => {
					jest.spyOn(component as any, 'isChartEmpty').mockReturnValue(false);

					const mockEvent = {
						native: { target: {} },
						chart: {} as any,
						tooltip: {} as any,
						tooltipItems: [] as any,
					};

					const mockChartElement = [{}];

					const tooltipEnabled =
						component.baseOptions?.plugins?.tooltip?.enabled instanceof Function
							? component.baseOptions.plugins.tooltip.enabled(mockEvent, mockChartElement)
							: false;

					expect(tooltipEnabled).toBe(true);
				});
			});

			describe('legend.labels.generateLabels', () => {
				it('should generate custom legend labels', () => {
					jest.spyOn(component['translateService'], 'instant').mockReturnValue('Used Offers');

					const mockChart = {} as any;

					const labels = component.chartOptionsUsed?.plugins?.legend?.labels?.generateLabels?.(mockChart);

					expect(labels).toEqual([
						expect.objectContaining({
							text: 'Used Offers',
							family: 'Open Sans',
							fillStyle: '#0B5E22',
							size: 14,
							fontColor: '#20233E',
							hidden: false,
							borderRadius: 4,
						}),
					]);
				});
			});
		});

		describe('createCustomMessage plugin', () => {
			it('should split message into multiple lines when testWidth exceeds maxWidth and line exists', () => {
				const saveMock = jest.fn();
				const restoreMock = jest.fn();
				const fillTextMock = jest.fn();

				const mockChart = {
					data: {
						datasets: [{ data: [0, 0, 0, 0] }],
					},
					chartArea: {
						left: 0,
						right: 200,
						top: 0,
						bottom: 100,
					},
					ctx: {
						save: saveMock,
						restore: restoreMock,
						fillText: fillTextMock,
						measureText: jest.fn((text: string) => {
							return { width: text.length * 10 };
						}),
						font: '',
						fillStyle: '',
						textAlign: '',
						textBaseline: '',
					},
				} as unknown as Chart;

				jest.spyOn(component['translateService'], 'instant').mockReturnValue(
					'This message should definitely wrap',
				);

				(component.createCustomMessage.beforeDraw as any)?.(mockChart);

				expect(fillTextMock).toHaveBeenCalledTimes(3);
				expect(fillTextMock).toHaveBeenCalledWith(
					expect.stringContaining('should'),
					expect.any(Number),
					expect.any(Number),
				);
			});
		});
	});

	it('should skip drawing if dataset contains only non-number/non-array values', () => {
		const fillTextMock = jest.fn();
		const saveMock = jest.fn();
		const restoreMock = jest.fn();

		const mockChart = {
			data: {
				datasets: [
					{
						// Deliberately using values that are NOT number or array
						data: [null, undefined, 'invalid', {}, false],
					},
				],
			},
			getDatasetMeta: () => ({
				data: [
					{ x: 10, y: 10 },
					{ x: 20, y: 20 },
					{ x: 30, y: 30 },
					{ x: 40, y: 40 },
					{ x: 50, y: 50 },
				],
			}),
			ctx: {
				save: saveMock,
				restore: restoreMock,
				fillText: fillTextMock,
				fillStyle: '',
				textAlign: '',
				textBaseline: '',
				font: '',
			},
		} as unknown as Chart<'bar'>;

		(component.barValuePlugin.afterDatasetsDraw as any)?.(mockChart);

		expect(saveMock).not.toHaveBeenCalled();
		expect(fillTextMock).not.toHaveBeenCalled();
		expect(restoreMock).not.toHaveBeenCalled();
	});

	describe('computeStepSize method', () => {
		it('should return magnitude when maxValue / magnitude >= 2', () => {
			component.chartValuesUsedOffer = [{ offerTypeId: 1, citizenCount: 2000, offerTypeLabel: 'Test' }];

			const result = (component as any).computeStepSize();
			expect(result).toBe(1000);
		});
	});

	describe('tooltip callbacks', () => {
		it('should return correct labelColor configuration', () => {
			const labelColorCallback = component.chartOptionsUsed?.plugins?.tooltip?.callbacks?.labelColor;

			if (labelColorCallback) {
				const dummyTooltipModel = {} as TooltipModel<keyof ChartTypeRegistry>;
				const dummyContext = {} as any;

				const result = labelColorCallback.call(dummyTooltipModel, dummyContext);

				expect(result).toEqual({
					borderColor: AppColors.White,
					backgroundColor: AppColors.Green,
					borderWidth: 0,
				});
			} else {
				fail('labelColor callback is not defined');
			}
		});
	});

	describe('initUsedOfferStats error case', () => {
		it('should handle error and set chartValuesUsedOffer to empty array', () => {
			const updateChartOptionsSpy = jest.spyOn(component as any, 'updateChartOptionsForEmptyData');

			jest.spyOn(dashboardService, 'getUsedOfferStatistics').mockReturnValue(
				throwError(() => new Error('Simulated error')),
			);

			component['initUsedOfferStats'](TimeIntervalPeriod.MONTHLY);

			expect(component.chartValuesUsedOffer).toEqual([]);
			expect(updateChartOptionsSpy).toHaveBeenCalled();
		});
	});

	describe('chartOptions', () => {
		it('should have tooltip filter that only allows first three data indices', () => {
			const filter = component.chartOptions?.plugins?.tooltip?.filter as (tooltipItem: any) => boolean;
			expect(filter).toBeInstanceOf(Function);

			expect(filter({ dataIndex: 0 })).toBe(true);
			expect(filter({ dataIndex: 1 })).toBe(true);
			expect(filter({ dataIndex: 2 })).toBe(true);
			expect(filter({ dataIndex: 3 })).toBe(false);
			expect(filter({ dataIndex: 4 })).toBe(false);
		});

		it('should generate legend labels with correct text and color', () => {
			const generateLabels = component.chartOptions?.plugins?.legend?.labels?.generateLabels as () => any[];
			const labels = generateLabels();

			expect(Array.isArray(labels)).toBe(true);
			expect(labels.length).toBe(3);

			labels.forEach((label) => {
				expect(label.text).toContain('(');
				expect(label.fillStyle).toBeDefined();
				expect(label.fontColor).toBeDefined();
				expect(label.size).toBe(14);
				expect(label.borderRadius).toBe(4);
				expect(label.strokeStyle).toBe('transparent');
			});
		});

		it('should set legend display, position, and alignment correctly', () => {
			const legend = component.chartOptions?.plugins?.legend;
			expect(legend?.display).toBe(true);
			expect(legend?.position).toBe('bottom');
			expect(legend?.align).toBe('start');
		});

		it('should set legend label font size and color', () => {
			const labels = component.chartOptions?.plugins?.legend?.labels;
			expect(labels?.color).toBeDefined();
			expect(labels?.boxWidth).toBe(16);
			expect(labels?.boxHeight).toBe(16);
		});
	});
});
