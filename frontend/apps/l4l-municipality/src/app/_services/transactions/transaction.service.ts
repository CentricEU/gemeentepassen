import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, MonthYearEntry, TransactionTableTenantDto, ValidatedCode } from '@frontend/common';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class TransactionService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public countAllTransactionsByTenant(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/admin/count-all`);
	}

	public getDistinctYearsForTransactionsByTenant(): Observable<number[]> {
		return this.httpClient.get<number[]>(`${this.environment.apiPath}/transactions/admin/years`);
	}

	public countCurrentMonthTransactionsByTenant(selectedDate?: MonthYearEntry): Observable<number> {
		let httpParams = new HttpParams();

		if (selectedDate) {
			httpParams = this.addMonthAndYearToParams(httpParams, selectedDate);
		}

		return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/admin/count-by-month-and-year`, {
			params: httpParams,
			responseType: 'json',
		});
	}

	public getTransactionsByTenant(
		page: number,
		size: number,
		month?: number,
		year?: number,
	): Observable<TransactionTableTenantDto[]> {
		let httpParams = new HttpParams().set('page', page).set('size', size);

		if (month || year) {
			const selectedDate = new MonthYearEntry('', month, year);
			httpParams = this.addMonthAndYearToParams(httpParams, selectedDate);
		}

		return this.httpClient.get<TransactionTableTenantDto[]>(
			`${this.environment.apiPath}/transactions/admin/filter-by-month-and-year`,
			{ params: httpParams },
		);
	}

	private addMonthAndYearToParams(httpParams: HttpParams, selectedDate: MonthYearEntry): HttpParams {
		const { monthValue, year } = selectedDate;

		if (monthValue) httpParams = httpParams.set('month', monthValue);
		if (year) httpParams = httpParams.set('year', year);

		return httpParams;
	}
}
