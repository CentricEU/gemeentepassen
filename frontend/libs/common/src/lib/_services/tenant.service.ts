import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BankInformationDto } from '../_models/bank-information-dto.model';
import { Environment } from '../_models/environment.model';
import { Tenant } from '../_models/tenant.model';

@Injectable({
	providedIn: 'root',
})
export class TenantService {
	public tenant: Tenant;

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public get tenantLogo(): string {
		if (this.tenant && this.tenant.logo) {
			return 'data:image/png;base64,' + this.tenant.logo;
		}
		return '/assets/images/citypasses-logo.png';
	}

	public getTenants(): Observable<Tenant[]> {
		return this.httpClient.get<Tenant[]>(`${this.environment.apiPath}/tenants/all`);
	}

	public getTenant(id: string): Observable<Tenant> {
		return this.httpClient.get<Tenant>(`${this.environment.apiPath}/tenants/${id}`);
	}

	public saveBankInformation(bankInformationDto: BankInformationDto): Observable<void> {
		return this.httpClient.patch<void>(`${this.environment.apiPath}/tenants/bank-information`, bankInformationDto);
	}
}
