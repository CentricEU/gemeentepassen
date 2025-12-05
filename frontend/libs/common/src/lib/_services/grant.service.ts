import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Environment } from '../_models/environment.model';
import { GrantDto } from '../_models/grant-dto.model';

@Injectable({
	providedIn: 'root',
})
export class GrantService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public getAllGrants(isActiveGrantNeeded: boolean): Observable<GrantDto[]> {
		const httpParams = new HttpParams().set('isActiveGrantNeeded', isActiveGrantNeeded.toString());
		return this.httpClient.get<GrantDto[]>(`${this.environment.apiPath}/grants`, { params: httpParams });
	}

	public createGrant(grantDto: GrantDto): Observable<GrantDto> {
		return this.httpClient.post<GrantDto>(`${this.environment.apiPath}/grants`, grantDto);
	}

	public editGrant(grantDto: GrantDto): Observable<GrantDto> {
		return this.httpClient.patch<GrantDto>(`${this.environment.apiPath}/grants`, grantDto);
	}

	public getGrantsPaginated(page: number, size: number): Observable<GrantDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<GrantDto[]>(`${this.environment.apiPath}/grants/paginated`, { params: httpParams });
	}

	public countGrants(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/grants/count`);
	}
}
