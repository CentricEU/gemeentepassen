import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, GenericStatusEnum, OfferDto, OfferTableDto } from '@frontend/common';
import { Observable } from 'rxjs';

import { TimeIntervalPeriod } from '../../enums/time-interval-period.enum';
import { DeleteOffersDto } from '../../models/delete-offers-dto.model';
import { FilterOfferRequestDto } from '../../models/filter-offer-request-dto.model';
import { OfferRejectionReasonDto } from '../../models/offer-rejection-reason-dto.model';
import { OfferStatusCountsDto } from '../../models/offer-status-counts-dto.model';
import { OfferType } from '../../models/offer-type.model';
import { ReactivateOfferDto } from '../../models/reactivate-offer-dto.model';

@Injectable({
	providedIn: 'root'
})
export class OfferService {
	private static httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

	public shouldOpenOfferPopup = false;
	public offerStatusFilter: GenericStatusEnum | null;

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient
	) {}

	public createOffer(offerDto: OfferDto): Observable<OfferDto> {
		return this.httpClient.post<OfferDto>(`${this.environment.apiPath}/offers`, offerDto, {
			headers: OfferService.httpHeaders
		});
	}

	public getFilteredOffers(
		filterOfferRequestDto: FilterOfferRequestDto,
		page: number,
		size: number
	): Observable<OfferTableDto[] | []> {
		let httpParams = new HttpParams()
			.set('status', filterOfferRequestDto.status || '')
			.set('grantId', filterOfferRequestDto.grantId || '')
			.set('pageIndex', page.toString())
			.set('pageSize', size.toString());

		const offerTypeId = filterOfferRequestDto.offerTypeId;

		if (typeof offerTypeId === 'number') {
			httpParams = httpParams.set('offerTypeId', offerTypeId.toString());
		}

		return this.httpClient.get<OfferTableDto[]>(`${this.environment.apiPath}/offers/filter`, {
			params: httpParams
		});
	}

	public getOfferTypes(): Observable<OfferType[] | null> {
		return this.httpClient.get<OfferType[]>(`${this.environment.apiPath}/offers/types`);
	}

	public countOffers(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/offers/count`);
	}

	public countFilteredOffers(filterOfferRequestDto: FilterOfferRequestDto): Observable<number> {
		let httpParams = new HttpParams()
			.set('status', filterOfferRequestDto.status || '')
			.set('grantId', filterOfferRequestDto.grantId || '');

		const offerTypeId = filterOfferRequestDto.offerTypeId;

		if (typeof offerTypeId === 'number') {
			httpParams = httpParams.set('offerTypeId', offerTypeId.toString());
		}

		return this.httpClient.get<number>(`${this.environment.apiPath}/offers/filter/count`, { params: httpParams });
	}

	public getOffers(page: number, size: number): Observable<OfferTableDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<OfferTableDto[]>(`${this.environment.apiPath}/offers`, { params: httpParams });
	}

	public deleteOffers(deleteOffersDto: DeleteOffersDto): Observable<void> {
		return this.httpClient.delete<void>(`${this.environment.apiPath}/offers/delete`, { body: deleteOffersDto });
	}

	public getFullOffer(offerId: string): Observable<OfferDto> {
		return this.httpClient.get<OfferDto>(`${this.environment.apiPath}/offers/full/${offerId}`);
	}

	public reactivateOffer(reactivateOfferDto: ReactivateOfferDto): Observable<void> {
		return this.httpClient.put<void>(`${this.environment.apiPath}/offers/reactivate`, reactivateOfferDto);
	}

	public getOfferRejectionReason(offerId: string): Observable<OfferRejectionReasonDto> {
		return this.httpClient.get<OfferRejectionReasonDto>(`${this.environment.apiPath}/offers/rejection/${offerId}`);
	}

	public getOfferCountsByStatus(timeIntervalPeriod: TimeIntervalPeriod): Observable<OfferStatusCountsDto> {
		return this.httpClient.get<OfferStatusCountsDto>(
			`${this.environment.apiPath}/offers/status/counts/${timeIntervalPeriod}`
		);
	}
}
