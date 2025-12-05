import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, SupplierProfile, SupplierProfileDto } from '@frontend/common';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class SetupProfileService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public saveSupplierProfile(supplierProfileDto: SupplierProfileDto): Observable<SupplierProfile> {
		return this.httpClient.post<SupplierProfile>(
			`${this.environment.apiPath}/supplier-profiles`,
			supplierProfileDto,
		);
	}
}
