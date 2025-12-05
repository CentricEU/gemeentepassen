import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment } from '@frontend/common';
import { Observable } from 'rxjs/internal/Observable';

import { RegisterSupplier } from '../models/register-supplier.model';

@Injectable({
	providedIn: 'root',
})
export class RegisterService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public registerSupplier(registerSupplier: RegisterSupplier): Observable<RegisterSupplier> {
		return this.httpClient.post<RegisterSupplier>(
			`${this.environment.apiPath}/suppliers/register`,
			registerSupplier,
		);
	}
}
