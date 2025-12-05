import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, TransactionTableDto } from '@frontend/common';
import { Observable } from 'rxjs';

import { MonthYearEntry } from '../../models/month-year-entry.model';
import { ValidatedCode } from '../../models/validated-code.models';

@Injectable({
	providedIn: 'root'
})
export class TransactionService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient
	) {}

	public getDistinctYearsForTransactions(): Observable<number[]> {
		return this.httpClient.get<number[]>(`${this.environment.apiPath}/transactions/years`);
	}

	public getTransactions(
		page: number,
		size: number,
		month?: number,
		year?: number
	): Observable<TransactionTableDto[]> {
		let httpParams = new HttpParams().set('page', page).set('size', size);

		if (month || year) {
			const selectedDate = new MonthYearEntry('', month, year);
			httpParams = this.addMonthAndYearToParams(httpParams, selectedDate);
		}

		return this.httpClient.get<TransactionTableDto[]>(
			`${this.environment.apiPath}/transactions/filter-by-month-and-year`,
			{ params: httpParams }
		);
	}

	public countAllTransactions(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/count-all`);
	}

	public countCurrentMonthTransactions(selectedDate?: MonthYearEntry): Observable<number> {
		let httpParams = new HttpParams();

		if (selectedDate) {
			httpParams = this.addMonthAndYearToParams(httpParams, selectedDate);
		}

		return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/count-by-month-and-year`, {
			params: httpParams,
			responseType: 'json'
		});
	}

	public getAllValidatedCodes(): Observable<ValidatedCode[]> {
		return this.httpClient.get<ValidatedCode[]>(`${this.environment.apiPath}/transactions/all`);
	}

	private addMonthAndYearToParams(httpParams: HttpParams, selectedDate: MonthYearEntry): HttpParams {
		const { monthValue, year } = selectedDate;

		if (monthValue) httpParams = httpParams.set('month', monthValue);
		if (year) httpParams = httpParams.set('year', year);

		return httpParams;
	}
}
