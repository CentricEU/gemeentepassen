import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { DASHBOARD_TRANSLATION_KEYS } from '../../_constants/constants';
import { SupplierStatus } from '../../_enums/supplier-status.enum';
import { TimeIntervalPeriod } from '../../_enums/time-interval-period.enum';
import { Environment } from '../../_models/environment.model';
import { MunicipalityStatistics } from '../../_models/municipality-statistics.model';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
	let service: DashboardService;
	let httpMock: HttpTestingController;
	let httpClientSpy: { get: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	} as Environment;

	beforeEach(() => {
		httpClientSpy = { get: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [{ provide: 'env', useValue: environmentMock }, DashboardService],
		});

		service = TestBed.inject(DashboardService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	describe('getUsedOfferStatistics', () => {
		it('should send a GET request with intervalPeriod as a query param and return OfferStatisticsDto[]', () => {
			const intervalPeriod = TimeIntervalPeriod.MONTHLY;
			const mockResponse = [
				{ offerId: '1', usageCount: 10 },
				{ offerId: '2', usageCount: 5 },
			] as any;

			service.getUsedOfferStatistics(intervalPeriod, false).subscribe((response) => {
				expect(response).toEqual(mockResponse);
				expect(response.length).toBe(2);
			});

			const req = httpMock.expectOne(
				`${environmentMock.apiPath}/dashboard/used-offer/statistics?intervalPeriod=MONTHLY`,
			);
			expect(req.request.method).toBe('GET');
			req.flush(mockResponse);
		});
	});

	describe('getMuniciplaityStatistics', () => {
		it('should send a GET request with statuses query param and return MunicipalityStatistics', () => {
			const statuses = [SupplierStatus.APPROVED];
			const mockResponse: MunicipalityStatistics = new MunicipalityStatistics(5, 100, 50);
			httpClientSpy.get.mockReturnValue(of(mockResponse));

			service.getMuniciplaityStatistics(statuses).subscribe((response) => {
				expect(response).toEqual(mockResponse);
				expect(response.suppliersCount).toBe(5);
				expect(response.transactionsCount).toBe(100);
				expect(response.passholdersCount).toBe(50);
			});

			const req = httpMock.expectOne(`${environmentMock.apiPath}/dashboard/statistics?statuses=APPROVED`);
			expect(req.request.method).toBe('GET');
			req.flush(mockResponse);
		});
	});
	describe('translatedTimePeriodToEnum', () => {
		it.each([
			[DASHBOARD_TRANSLATION_KEYS.THIS_MONTH, TimeIntervalPeriod.MONTHLY],
			[DASHBOARD_TRANSLATION_KEYS.THIS_QUARTER, TimeIntervalPeriod.QUARTERLY],
			[DASHBOARD_TRANSLATION_KEYS.THIS_YEAR, TimeIntervalPeriod.YEARLY],
			['default', TimeIntervalPeriod.MONTHLY],
		])('should return the correct enum value for translation "%s"', (translationKey, expectedEnumValue) => {
			const result = service.translatedTimePeriodToEnum(translationKey);
			expect(result).toEqual(expectedEnumValue);
		});
	});

	describe('initDropdownData', () => {
		it('should populate dropdownData with translated titles', () => {
			service.initDropdownData();

			expect(service.dropdownData.length).toBe(3);
			expect(service.dropdownData[0].title).toBe(DASHBOARD_TRANSLATION_KEYS.THIS_MONTH);
			expect(service.dropdownData[1].title).toBe(DASHBOARD_TRANSLATION_KEYS.THIS_QUARTER);
			expect(service.dropdownData[2].title).toBe(DASHBOARD_TRANSLATION_KEYS.THIS_YEAR);
		});

		describe('getTransactionStatistics', () => {
			it('should send a GET request with intervalPeriod as a query param and return MonthlyTransactionDto[]', () => {
				const period = TimeIntervalPeriod.MONTHLY;
				const mockResponse = [
					{ transactionId: '1', amount: 100 },
					{ transactionId: '2', amount: 200 },
				] as any;

				service.getTransactionStatistics(period, false).subscribe((response) => {
					expect(response).toEqual(mockResponse);
					expect(response.length).toBe(2);
				});

				const req = httpMock.expectOne(
					`${environmentMock.apiPath}/dashboard/transaction/statistics?intervalPeriod=MONTHLY`,
				);
				expect(req.request.method).toBe('GET');
				req.flush(mockResponse);
			});
		});
	});
});
