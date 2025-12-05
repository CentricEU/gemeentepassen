import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

	public getTenants(): Observable<Tenant[]> {
		return this.httpClient.get<Tenant[]>(`${this.environment.apiPath}/tenants/all`);
	}

	public getTenant(id: string): Observable<Tenant> {
		return this.httpClient.get<Tenant>(`${this.environment.apiPath}/tenants/${id}`);
	}
}
