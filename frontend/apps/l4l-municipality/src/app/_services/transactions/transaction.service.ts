import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, MonthYearEntry, TransactionTableTenantDto } from '@frontend/common';
import { Observable, of } from 'rxjs';

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

	public countDateIntervalTransactionsByTenant(
		startDate: string | undefined,
		endDate: string | undefined,
		transactionsSupplierFilter?: string,
	): Observable<number> {
		if (!startDate || !endDate) {
			return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/admin/count-all`);
		}

		let httpParams = new HttpParams();

		httpParams = httpParams.set('startDate', startDate);
		httpParams = httpParams.set('endDate', endDate);
		if (transactionsSupplierFilter) {
			httpParams = httpParams.set('supplierId', transactionsSupplierFilter);
		}

		return this.httpClient.get<number>(`${this.environment.apiPath}/transactions/admin/count`, {
			params: httpParams,
			responseType: 'json',
		});
	}

	public getDateIntervalTransactionsByTenant(
		page: number,
		size: number,
		startDate: string | undefined,
		endDate: string | undefined,
		transactionsSupplierFilter?: string,
	): Observable<TransactionTableTenantDto[]> {
		if (!startDate || !endDate) {
			return of([]);
		}

		let httpParams = new HttpParams().set('page', page).set('size', size);

		httpParams = httpParams.set('startDate', startDate);
		httpParams = httpParams.set('endDate', endDate);

		if (transactionsSupplierFilter) {
			httpParams = httpParams.set('supplierId', transactionsSupplierFilter);
		}
		return this.httpClient.get<TransactionTableTenantDto[]>(
			`${this.environment.apiPath}/transactions/admin/filter`,
			{ params: httpParams },
		);
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
