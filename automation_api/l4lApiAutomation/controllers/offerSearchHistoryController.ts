import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';

export class OfferSearchHistoryController extends BaseApi {
	async getSearchHistoryForCitizen(): Promise<APIResponse> {
		return await this.get('search-history');
	}
}