import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, MonthYearEntry, TransactionTableDto, ValidatedCode } from '@frontend/common';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class TransactionService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public getDistinctYearsForTransactions(): Observable<number[]> {
		return this.httpClient.get<number[]>(`${this.environment.apiPath}/transactions/supplier/years`);
	}

	public getTransactions(
		page: number,
		size: number,
		month?: number,
		year?: number,
	): Observable<TransactionTableDto[]> {
		let httpParams = new HttpParams().set('page', page).set('size', size);

		if (month || year) {
			const selectedDate = new MonthYearEntry('', month, year);
			httpParams = this.addMonthAndYearToParams(httpParams, selectedDate);
		}

		return this.httpClient.get<TransactionTableDto[]>(
			`${this.environment.apiPath}/transactions/supplier/filter-by-month-and-year`,
			{ params: httpParams },
		);
	}

	public countAllTransactions(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/supplier/count-all`);
	}

	public countCurrentMonthTransactions(selectedDate?: MonthYearEntry): Observable<number> {
		let httpParams = new HttpParams();

		if (selectedDate) {
			httpParams = this.addMonthAndYearToParams(httpParams, selectedDate);
		}

		return this.httpClient.get<number>(
			`${this.environment.apiPath}/transactions/supplier/count-by-month-and-year`,
			{
				params: httpParams,
				responseType: 'json',
			},
		);
	}

	public getAllValidatedCodes(): Observable<ValidatedCode[]> {
		return this.httpClient.get<ValidatedCode[]>(`${this.environment.apiPath}/transactions/supplier/all`);
	}

	private addMonthAndYearToParams(httpParams: HttpParams, selectedDate: MonthYearEntry): HttpParams {
		const { monthValue, year } = selectedDate;

		if (monthValue) httpParams = httpParams.set('month', monthValue);
		if (year) httpParams = httpParams.set('year', year);

		return httpParams;
	}
}
