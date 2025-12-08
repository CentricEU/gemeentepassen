import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, SupplierViewDto } from '@frontend/common';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class SupplierService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public getSupplierById(supplierId: string): Observable<SupplierViewDto> {
		return this.httpClient.get<SupplierViewDto>(`${this.environment.apiPath}/suppliers/${supplierId}`);
	}

	public resetSupplierHasStatusUpdate(supplierId: string, value: boolean): Observable<void> {
		const httpParams = new HttpParams().set('hasStatusUpdate', value.toString());
		return this.httpClient.put<void>(
			`${this.environment.apiPath}/suppliers/change-has-status-update/${supplierId}`,
			null,
			{ params: httpParams },
		);
	}

	public getQRCodeImage(): Observable<Blob> {
		return this.httpClient.get(`${this.environment.apiPath}/suppliers/qr-code/`, {
			responseType: 'blob',
		});
	}
}
