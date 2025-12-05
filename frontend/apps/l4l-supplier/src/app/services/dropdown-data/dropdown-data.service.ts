import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DropdownDataFilterDto, Environment } from '@frontend/common';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class DropdownDataService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public getAllDropdownsData(): Observable<DropdownDataFilterDto> {
		return this.httpClient.get<DropdownDataFilterDto>(`${this.environment.apiPath}/dropdowns/offer-filter`);
	}
}
