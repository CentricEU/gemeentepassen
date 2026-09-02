import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';

export class BankHolidaysController extends BaseApi {
	async getBankHolidaysForYear(year: number): Promise<APIResponse> {
		return await this.get('bank-holidays', { year: year.toString() });
	}
}
