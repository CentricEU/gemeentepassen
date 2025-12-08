import BaseApi from '../serviceApi/baseApi';
import * as offerModels from '../apiModels/offerModels';
import { APIResponse } from 'playwright';
import { TimeInterval } from '../utils/timeInterval.enum';

export class OfferController extends BaseApi {
	async reactivateOffer(data: offerModels.OfferReactivate): Promise<APIResponse> {
		return this.put('offers/reactivate', data);
	}

	async approveOffer(offerId: string): Promise<APIResponse> {
		return this.put(`offers/approve/${offerId}`);
	}

	async getOffers(page: number = 0, size: number = 25): Promise<APIResponse> {
		return await this.get(`offers?page=${page}&size=${size}`);
	}

	async createOffer(data: offerModels.OfferRequest): Promise<APIResponse> {
		return this.post('offers', data);
	}

	async useOffer(data: offerModels.OfferUse): Promise<APIResponse> {
		return this.post('offers/use', data);
	}

	async rejectOffer(data: offerModels.OfferReject): Promise<APIResponse> {
		return this.post('offers/reject', data);
	}

	async getOfferTypes(): Promise<APIResponse> {
		return this.get('offers/types');
	}

	async getOffersTenant(page: number = 0, size: number = 25): Promise<APIResponse> {
		return this.get(`offers/tenant?page=${page}&size=${size}`);
	}

	async getCountOffersTenant(): Promise<APIResponse> {
		return this.get('offers/tenant/count');
	}

	async getOffersSupplierById(id: string): Promise<APIResponse> {
		return this.get(`offers/supplier/${id}`);
	}

	async getCountOffersSupplierById(id: string): Promise<APIResponse> {
		return this.get(`offers/supplier/${id}/count`);
	}

	async getOffersStatusCountsTimePeriod(timeIntervalPeriod: TimeInterval): Promise<APIResponse> {
		return this.get(`offers/status/counts/${timeIntervalPeriod}`);
	}

	async getOffersSearch(searchKeyword: string): Promise<APIResponse> {
		return this.get(`offers/search?searchKeyword=${searchKeyword}`);
	}

	async getRejectedOffers(id: string): Promise<APIResponse> {
		return this.get(`offers/rejection/${id}`);
	}

	async getOffersFullById(id: string): Promise<APIResponse> {
		return this.get(`offers/full/${id}`);
	}

	async getOffersFilter(status: string, offerTypeId: number, id: string): Promise<APIResponse>  {
		return this.get(`offers/filter?status=${status}&offerTypeId=${offerTypeId}&id=${id}`);
	}

	async getOffersFilterCount(status: string, offerTypeId: number, id: string): Promise<APIResponse>  {
		return this.get(`offers/filter/count?status=${status}&offerTypeId=${offerTypeId}&id=${id}`);
	}

	async getOffersDetailsById(
		id: string,
		latitude: number,
		longitude: number,
		currentDay: string
	): Promise<APIResponse> {
		return this.get(`offers/details/${id}?latitude=${latitude}&longitude=${longitude}&currentDay=${currentDay}`);
	}

	async getOffersCount(): Promise<APIResponse> {
		return this.get('offers/count');
	}

	async deleteOffers(data : object): Promise<APIResponse> {
		return this.delete('offers/delete', data);
	}

	async getOffersMapViewport(data: offerModels.OffersMapViewport): Promise<APIResponse> {

		const record : Record<string, any> = {
			minLatitude: data.minLat,
			maxLatitude: data.maxLat,
			minLongitude: data.minLong,
			maxLongitude: data.maxLong,
			currentDay: data.currentDay,
			offerType: data.offerTypeId,
			searchKeyword: data.searchKeyword
		};
		return this.get('offers/map-with-viewport', record);
	}

	async getOffersList(data: offerModels.OffersListViewport): Promise<APIResponse> {

		const record : Record<string, any> = {
			page: data.page,
			latitude: data.latitude,
			longitude: data.longitude,
			currentDay: data.currentDay,
			offerType: data.offerTypeId,
			searchKeyword: data.searchKeyword
		};
		return this.get('offers/list', record);
	}
}
