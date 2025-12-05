import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, SupplierForMapViewDto, SupplierStatus, SupplierViewDto } from '@frontend/common';
import { Observable } from 'rxjs/internal/Observable';

import { GetSuppliersDto } from '../_models/get-suppliers-dto.model';
import { InvitationDto } from '../_models/invitation-dto.model';
import { InviteSuppliersDto } from '../_models/invite-suppliers-dto.model';
import { RejectSupplierDto } from '../_models/reject-supplier-dto.model';

@Injectable({
	providedIn: 'root',
})
export class MunicipalitySupplierService {
	public currentSelectedSupplierId: string | undefined;

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public approveSupplier(supplierId: string): Observable<void> {
		return this.httpClient.put<void>(`${this.environment.apiPath}/suppliers/approve/${supplierId}`, null);
	}

	public rejectSupplier(rejectSupplierDto: RejectSupplierDto): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/suppliers/reject`, rejectSupplierDto);
	}

	public getSuppliers(getSuppliersDto: GetSuppliersDto): Observable<SupplierViewDto[]> {
		const httpParams = new HttpParams()
			.set('page', getSuppliersDto.pageIndex)
			.set('size', getSuppliersDto.perPage)
			.set('tenantId', getSuppliersDto.tenantId)
			.set('status', getSuppliersDto.status);

		return this.httpClient.get<SupplierViewDto[]>(`${this.environment.apiPath}/suppliers/all`, {
			params: httpParams,
		});
	}

	public getSuppliersForMap(tenantId: string): Observable<SupplierForMapViewDto[]> {
		return this.httpClient.get<SupplierForMapViewDto[]>(
			`${this.environment.apiPath}/suppliers/${tenantId}/all-for-map`,
		);
	}

	public getPendingSuppliers(getSuppliersDto: GetSuppliersDto): Observable<SupplierViewDto[]> {
		const httpParams = new HttpParams()
			.set('page', getSuppliersDto.pageIndex)
			.set('size', getSuppliersDto.perPage)
			.set('tenantId', getSuppliersDto.tenantId)
			.set('status', getSuppliersDto.status);

		return this.httpClient.get<SupplierViewDto[]>(`${this.environment.apiPath}/suppliers/pending`, {
			params: httpParams,
		});
	}

	public countSuppliers(tenantId: string, statuses: Array<SupplierStatus>): Observable<number> {
		const statusesString = statuses.join(',');
		const httpParams = new HttpParams().set('tenantId', tenantId).set('statuses', statusesString);

		return this.httpClient.get<number>(`${this.environment.apiPath}/suppliers/all/count`, { params: httpParams });
	}

	public inviteSuppliers(inviteSuppliersDto: InviteSuppliersDto): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/invitations/send`, inviteSuppliersDto);
	}

	public getInvitationsCount(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/invitations/count`);
	}

	public getInvitations(page: number, size: number): Observable<InvitationDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<InvitationDto[]>(`${this.environment.apiPath}/invitations`, { params: httpParams });
	}
}
