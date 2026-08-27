import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';

export class DropdownDataController extends BaseApi {
	async getAllDropdownsData(): Promise<APIResponse> {
		return await this.get('dropdowns/offer-filter');
	}
}
