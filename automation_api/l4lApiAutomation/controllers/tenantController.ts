import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { TenantBankInformation } from '../apiModels/tenantModels';

export class TenantController extends BaseApi {
	async getTenantById(id: string): Promise<APIResponse> {
		return await this.get(`tenants/${id}`);
	}

	async getAllTenants(): Promise<APIResponse> {
		return await this.get('tenants/all');
	}

	async createTenant(data: any): Promise<APIResponse> {
		return await this.post('tenants', data);
	}

	async updateBankInformation(data : TenantBankInformation): Promise<APIResponse> {
		return await this.patch('tenants/bank-information', data);
	}
}
