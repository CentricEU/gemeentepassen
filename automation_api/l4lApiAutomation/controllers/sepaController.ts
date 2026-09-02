import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';

export class SepaController extends BaseApi {
	async generateSepaFile(startDate: string, endDate: string, supplierId?: string): Promise<APIResponse> {
		let endpoint = `sepa?startDate=${startDate}&endDate=${endDate}`;
		if (supplierId) {
			endpoint += `&supplierId=${supplierId}`;
		}
		return await this.post(endpoint, {});
	}
}
