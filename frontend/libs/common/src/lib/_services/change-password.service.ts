import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ChangePassword } from '../_models/change-password.model';
import { Environment } from '../_models/environment.model';

@Injectable({
	providedIn: 'root',
})
export class ChangePasswordService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public changePassword(changePassword: ChangePassword): Observable<ChangePassword> {
		return this.httpClient.put<ChangePassword>(
			`${this.environment.apiPath}/users/recover/reset-password`,
			changePassword,
		);
	}
}
