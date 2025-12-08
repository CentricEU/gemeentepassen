import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, PassholderViewDto } from '@frontend/common';
import { Observable } from 'rxjs';

import { Passholder } from '../_models/passholder.model';

@Injectable({
	providedIn: 'root',
})
export class PassholdersService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public uploadCSV(file: File, citizenGroupId: string): Observable<Passholder[]> {
		const data: FormData = new FormData();
		data.append('file', file, file.name);
		data.append('citizenGroupId', citizenGroupId);

		return this.httpClient.post<Passholder[]>(`${this.environment.apiPath}/passholders/upload`, data);
	}

	public getPassholders(page: number, size: number): Observable<PassholderViewDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<PassholderViewDto[]>(`${this.environment.apiPath}/passholders`, {
			params: httpParams,
		});
	}

	public countPassholders(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/passholders/count`);
	}

	public updatePassholder(passholder: PassholderViewDto): Observable<void> {
		return this.httpClient.put<void>(`${this.environment.apiPath}/passholders`, passholder);
	}

	public deletePassholder(passholderId: string): Observable<void> {
		return this.httpClient.delete<void>(`${this.environment.apiPath}/passholders/${passholderId}`);
	}
}
