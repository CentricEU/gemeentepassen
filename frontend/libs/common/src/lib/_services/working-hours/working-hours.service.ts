import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Environment } from '../../_models/environment.model';
import { WorkingHoursDto } from '../../_models/working-hours.model';

@Injectable({
	providedIn: 'root',
})
export class WorkingHoursService {
	public workingHours: WorkingHoursDto[];
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public saveWorkingHours(workingHoursDto: WorkingHoursDto[], supplierId: string): Observable<WorkingHoursDto[]> {
		return this.httpClient.post<WorkingHoursDto[]>(
			`${this.environment.apiPath}/working-hours/${supplierId}`,
			workingHoursDto,
		);
	}

	public updateWorkingHours(workingHoursDto: WorkingHoursDto[], supplierId: string): Observable<WorkingHoursDto[]> {
		return this.httpClient.patch<WorkingHoursDto[]>(
			`${this.environment.apiPath}/working-hours/${supplierId}`,
			workingHoursDto,
		);
	}

	public getWorkingHours(supplierId: string): Observable<WorkingHoursDto[]> {
		return this.httpClient.get<WorkingHoursDto[]>(`${this.environment.apiPath}/working-hours/${supplierId}`);
	}
}
