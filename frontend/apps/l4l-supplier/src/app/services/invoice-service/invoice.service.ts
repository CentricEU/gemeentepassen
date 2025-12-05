import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment } from '@frontend/common';
import { Observable } from 'rxjs';

import { GenerateInvoiceDto } from '../../models/generate-invoice-dto.model';

@Injectable({
	providedIn: 'root',
})
export class InvoiceService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public generateInvoice(generateInvoice: GenerateInvoiceDto): Observable<Blob> {
		const headers = new HttpHeaders({
			Accept: 'application/pdf',
		});

		return this.httpClient.post(`${this.environment.apiPath}/invoices`, generateInvoice, {
			headers,
			responseType: 'blob',
		});
	}
}
