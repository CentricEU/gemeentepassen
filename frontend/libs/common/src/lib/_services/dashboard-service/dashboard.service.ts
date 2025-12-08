import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WindmillComboButtonMenuItem } from '@windmill/ng-windmill/combo-button';
import { Observable } from 'rxjs';

import { DASHBOARD_TRANSLATION_KEYS } from '../../_constants/constants';
import { SupplierStatus } from '../../_enums/supplier-status.enum';
import { TimeIntervalPeriod } from '../../_enums/time-interval-period.enum';
import { Environment } from '../../_models/environment.model';
import { MonthlyTransactionDto } from '../../_models/monthly-transaction-dto.model';
import { MunicipalityStatistics } from '../../_models/municipality-statistics.model';
import { OfferStatisticsDto } from '../../_models/offer-statistics.model';
import { SKIP_ERROR_TOASTER } from '../../_util/http-context-token';

@Injectable({
	providedIn: 'root',
})
export class DashboardService {
	public dropdownData: WindmillComboButtonMenuItem[];

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
		private translateService: TranslateService,
	) {}

	public getUsedOfferStatistics(
		intervalPeriod: TimeIntervalPeriod,
		skipErrorToaster: boolean,
	): Observable<OfferStatisticsDto[]> {
		const context = new HttpContext().set(SKIP_ERROR_TOASTER, skipErrorToaster);
		return this.httpClient.get<OfferStatisticsDto[]>(
			`${this.environment.apiPath}/dashboard/used-offer/statistics`,
			{ params: { intervalPeriod }, context },
		);
	}

	public getMuniciplaityStatistics(statuses: Array<SupplierStatus>): Observable<MunicipalityStatistics> {
		const statusesString = statuses.join(',');
		const httpParams = new HttpParams().set('statuses', statusesString);

		return this.httpClient.get<MunicipalityStatistics>(`${this.environment.apiPath}/dashboard/statistics`, {
			params: httpParams,
		});
	}

	public getTransactionStatistics(
		period: TimeIntervalPeriod,
		skipErrorToaster: boolean,
	): Observable<MonthlyTransactionDto[]> {
		const context = new HttpContext().set(SKIP_ERROR_TOASTER, skipErrorToaster);
		const params = new HttpParams().set('intervalPeriod', period);
		return this.httpClient.get<MonthlyTransactionDto[]>(
			`${this.environment.apiPath}/dashboard/transaction/statistics`,
			{ params, context },
		);
	}

	public translatedTimePeriodToEnum(translation: string): TimeIntervalPeriod {
		switch (translation) {
			case this.translateService.instant(DASHBOARD_TRANSLATION_KEYS.THIS_MONTH):
				return TimeIntervalPeriod.MONTHLY;
			case this.translateService.instant(DASHBOARD_TRANSLATION_KEYS.THIS_QUARTER):
				return TimeIntervalPeriod.QUARTERLY;
			case this.translateService.instant(DASHBOARD_TRANSLATION_KEYS.THIS_YEAR):
				return TimeIntervalPeriod.YEARLY;
			default:
				return TimeIntervalPeriod.MONTHLY;
		}
	}

	public initDropdownData(): void {
		this.translateService
			.get([
				DASHBOARD_TRANSLATION_KEYS.THIS_MONTH,
				DASHBOARD_TRANSLATION_KEYS.THIS_QUARTER,
				DASHBOARD_TRANSLATION_KEYS.THIS_YEAR,
			])
			.subscribe((translations) => {
				this.dropdownData = [
					{
						title: translations[DASHBOARD_TRANSLATION_KEYS.THIS_MONTH],
					},
					{
						title: translations[DASHBOARD_TRANSLATION_KEYS.THIS_QUARTER],
					},
					{
						title: translations[DASHBOARD_TRANSLATION_KEYS.THIS_YEAR],
					},
				];
			});
	}
}
