import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, OfferTableDto } from '@frontend/common';
import { Observable } from 'rxjs';

import { RejectOfferDto } from './_models/reject-offer-dto.model';

@Injectable({
	providedIn: 'root',
})
export class PendingOffersService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public countPendingOffers(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/offers/tenant/count`);
	}

	public countPendingOffersBySupplier(supplierId: string): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/offers/supplier/${supplierId}/count`);
	}

	public getPendingOffers(page: number, size: number): Observable<OfferTableDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<OfferTableDto[]>(`${this.environment.apiPath}/offers/tenant`, { params: httpParams });
	}

	public getPendingOffersBySupplier(page: number, size: number, supplierId: string): Observable<OfferTableDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<OfferTableDto[]>(`${this.environment.apiPath}/offers/supplier/${supplierId}`, {
			params: httpParams,
		});
	}

	public approveOffer(offerId: string): Observable<void> {
		return this.httpClient.put<void>(`${this.environment.apiPath}/offers/approve/${offerId}`, null);
	}

	public rejectOffer(rejectOfferDto: RejectOfferDto): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/offers/reject`, rejectOfferDto);
	}
}
