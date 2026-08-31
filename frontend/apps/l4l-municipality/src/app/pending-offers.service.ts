import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, OfferTableDto, OfferUseDto } from '@frontend/common';
import { Observable } from 'rxjs';

import { ApproveOfferDto } from './_models/approve-offer-dto.model';
import { RejectOfferDto } from './_models/reject-offer-dto.model';

@Injectable({
	providedIn: 'root',
})
export class PendingOffersService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public downloadOffer(offerUseDto: OfferUseDto): Observable<Blob> {
		const headers = new HttpHeaders({
			Accept: 'application/pdf',
		});

		return this.httpClient.post(`${this.environment.apiPath}/offers/download`, offerUseDto, {
			headers,
			responseType: 'blob',
		});
	}

	public countPendingOffers(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/offers/tenant/count`);
	}

	public countPendingOffersBySupplier(supplierId: string): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/offers/supplier/${supplierId}/count`);
	}

	public getOffersForPassholder(passholderId: string): Observable<OfferTableDto[]> {
		return this.httpClient.get<OfferTableDto[]>(`${this.environment.apiPath}/offers/passholder/${passholderId}`);
	}

	public getPendingOffers(page: number, size: number): Observable<OfferTableDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<OfferTableDto[]>(`${this.environment.apiPath}/offers/tenant`, {
			params: httpParams,
		});
	}

	public getPendingOffersBySupplier(page: number, size: number, supplierId: string): Observable<OfferTableDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<OfferTableDto[]>(`${this.environment.apiPath}/offers/supplier/${supplierId}`, {
			params: httpParams,
		});
	}

	public approveOffer(approveOfferDto: ApproveOfferDto): Observable<void> {
		return this.httpClient.put<void>(`${this.environment.apiPath}/offers/approve`, approveOfferDto);
	}

	public rejectOffer(rejectOfferDto: RejectOfferDto): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/offers/reject`, rejectOfferDto);
	}
}
