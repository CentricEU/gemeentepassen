import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { Passholder, FilterPassholdersRequest } from '../apiModels/passholderModels';
import formDataHelper from '../utils/formDataHelper';

export class PassholderController extends BaseApi {
	async getPassholders(page: number = 0, size: number = 25): Promise<APIResponse> {
		return this.get(`passholders?page=${page}&size=${size}`);
	}

	async updatePassholders(data: Passholder): Promise<APIResponse> {
		return this.put('passholders', data);
	}

	async getPassholderDetails(passholderId: string): Promise<APIResponse> {
		return this.get(`passholders/${passholderId}`);
	}

	async filterPassholders(
		filterParams: FilterPassholdersRequest,
		pageIndex: number = 0,
		pageSize: number = 25
	): Promise<APIResponse> {
		const params: Record<string, string> = {
			pageIndex: pageIndex.toString(),
			pageSize: pageSize.toString()
		};
		if (filterParams.bsn) params.bsn = filterParams.bsn;
		if (filterParams.passNumber) params.passNumber = filterParams.passNumber;
		return this.get('passholders/filter', params);
	}

	async countFilteredPassholders(filterParams: FilterPassholdersRequest): Promise<APIResponse> {
		const params: Record<string, string> = {};
		if (filterParams.bsn) params.bsn = filterParams.bsn;
		if (filterParams.passNumber) params.passNumber = filterParams.passNumber;
		return this.get('passholders/filter/count', params);
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

	async createPassholders(citizenGroupId: string, batchId?: number): Promise<APIResponse> {
		const randomNum = batchId ?? Math.floor(Math.random() * 1000000000);
		const formData = formDataHelper.createFormDataFromCsvContent('testData/import_passholders.csv', {
			ChangeName: `${randomNum}`,
			ChangeBsn: `${randomNum}`,
			ChangePass: `${randomNum + 1}`,
			ChangeName2: `${randomNum + 1}`,
			ChangeBsn2: `${randomNum + 1}`,
			ChangePass2: `${randomNum + 2}`
		});
		return this.postFormData(`passholders/upload?citizenGroupId=${citizenGroupId}`, formData);
	}
}
