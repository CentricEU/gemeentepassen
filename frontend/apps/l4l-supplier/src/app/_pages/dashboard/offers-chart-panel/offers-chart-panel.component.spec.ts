import 'chart.js';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { commonRoutingConstants, GenericStatusEnum } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill';
import { ActiveElement } from 'chart.js';
import { of } from 'rxjs';

import { AppModule } from '../../../app.module';
import { TimeIntervalPeriod } from '../../../enums/time-interval-period.enum';
import { OfferService } from '../../../services/offer-service/offer.service';
import { OffersChartPanelComponent } from './offers-chart-panel.component';

window.ResizeObserver =
	window.ResizeObserver ||
	jest.fn().mockImplementation(() => ({
		disconnect: jest.fn(),
		observe: jest.fn(),
		unobserve: jest.fn(),
	}));

describe('OffersChartPanelComponent', () => {
	let component: OffersChartPanelComponent;
	let fixture: ComponentFixture<OffersChartPanelComponent>;
	let offerServiceMock: any;
	let routerMock: any;

	beforeEach(async () => {
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
				{ provide: OfferService, useValue: offerServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OffersChartPanelComponent);
		component = fixture.componentInstance;
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
			} as any;
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
			} as any;
			const chartElement: ActiveElement[] = [];

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			component.chartOptions.onHover(mockEvent, chartElement);
			expect(mockEvent.native.target.style.cursor).toBe('default');
		});
	});

	describe('counting total number of offers', () => {
		it('should return 0 if chartValues is falsy', () => {
			offerServiceMock.getOfferCountsByStatus.mockReturnValue(of(null));
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
			expect(component['translatedTimePeriodToEnum'](translationKey)).toEqual(enumValue);
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
				component['translatedTimePeriodToEnum'](mockEvent.title),
			);
		});
	});
});
