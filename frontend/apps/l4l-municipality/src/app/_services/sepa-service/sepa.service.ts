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

	public generateSepaFile(month: string): Observable<Blob> {
		const headers = new HttpHeaders({
			Accept: 'application/xml',
		});

		const params = new HttpParams().set('month', month);

		return this.httpClient.post(`${this.environment.apiPath}/sepa`, null, {
			headers,
			params,
			responseType: 'blob',
		});
	}
}
