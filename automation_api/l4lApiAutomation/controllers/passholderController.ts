import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { Passholder } from '../apiModels/passholderModels';
import formDataHelper from '../utils/formDataHelper';

export class PassholderController extends BaseApi {
	async getPassholders(page: number = 0, size: number = 25): Promise<APIResponse> {
		return this.get(`passholders?page=${page}&size=${size}`);
	}

	async updatePassholders(data: Passholder): Promise<APIResponse> {
		return this.put('passholders', data);
	}

	async updateAssignedGrantsToPassholder(data: object): Promise<APIResponse> {
		return this.put('passholders/assign', data);
	}

	async getPassholdersCount(): Promise<APIResponse> {
		return this.get('passholders/count');
	}

	async deletePassholderById(id: string): Promise<APIResponse> {
		return this.delete(`passholders/${id}`);
	}

	async createPassholders(): Promise<APIResponse> {
		const formData = formDataHelper.createFormDataWithPassholdersFile('testData/import_passholders.csv');
		return this.postFormData('passholders/upload', formData);
	}
}
