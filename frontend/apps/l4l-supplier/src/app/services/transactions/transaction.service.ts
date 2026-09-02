import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, TransactionTableDto, ValidatedCode } from '@frontend/common';
import { Observable, of } from 'rxjs';

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

	public countAllTransactions(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/supplier/count-all`);
	}

	public countDateIntervalTransactions(
		startDate: string | undefined,
		endDate: string | undefined,
	): Observable<number> {
		if (!startDate || !endDate) {
			return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/supplier/count-all`);
		}

		let httpParams = new HttpParams();

		httpParams = httpParams.set('startDate', startDate);
		httpParams = httpParams.set('endDate', endDate);

		return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/supplier/count`, {
			params: httpParams,
			responseType: 'json',
		});
	}

	public getDateIntervalTransactions(
		page: number,
		size: number,
		startDate: string | undefined,
		endDate: string | undefined,
	): Observable<TransactionTableDto[]> {
		if (!startDate || !endDate) {
			return of([]);
		}

		let httpParams = new HttpParams().set('page', page).set('size', size);

		httpParams = httpParams.set('startDate', startDate);
		httpParams = httpParams.set('endDate', endDate);

		return this.httpClient.get<TransactionTableDto[]>(`${this.environment.apiPath}/transactions/supplier/filter`, {
			params: httpParams,
		});
	}

	public getAllValidatedCodes(): Observable<ValidatedCode[]> {
		return this.httpClient.get<ValidatedCode[]>(`${this.environment.apiPath}/transactions/supplier/all`);
	}
}
