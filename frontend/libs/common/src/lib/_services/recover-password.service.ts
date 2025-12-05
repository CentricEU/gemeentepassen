import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Environment } from '../_models/environment.model';
import { RecoverPassword } from '../_models/recover-password.model';

@Injectable({
	providedIn: 'root',
})
export class RecoverPasswordService {
	private static httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public recoverPassword(recoverPassword: RecoverPassword): Observable<RecoverPassword> {
		return this.httpClient.post<RecoverPassword>(`${this.environment.apiPath}/users/recover`, recoverPassword, {
			headers: RecoverPasswordService.httpHeaders,
		});
	}

	public getRecoverByToken(token: string): Observable<RecoverPassword> {
		const params = new HttpParams().set('token', token);
		return this.httpClient
			.get(`${this.environment.apiPath}/users/recover`, { params: params })
			.pipe(map((result) => result as RecoverPassword));
	}
}
