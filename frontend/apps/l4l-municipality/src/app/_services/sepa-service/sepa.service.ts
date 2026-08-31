import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment } from '@frontend/common';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class SepaService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public generateSepaFile(startDate: string, endDate: string, supplierId?: string): Observable<Blob> {
		let params = new HttpParams();
		const headers = new HttpHeaders({
			Accept: 'application/xml',
		});

		params = params.set('startDate', startDate);
		params = params.set('endDate', endDate);
		if (supplierId) {
			params = params.set('supplierId', supplierId);
		}

		return this.httpClient.post(`${this.environment.apiPath}/sepa`, null, {
			headers,
			params,
			responseType: 'blob',
		});
	}
}
