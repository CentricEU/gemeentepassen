import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Environment } from '../_models/environment.model';

@Injectable({
	providedIn: 'root',
})
export class EmailConfirmationService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public resendConfirmationEmail(email: string): Observable<void> {
		const options = {
			params: { email: email },
		};

		return this.httpClient.get<void>(`${this.environment.apiPath}/users/resend-confirmation`, options);
	}
}
