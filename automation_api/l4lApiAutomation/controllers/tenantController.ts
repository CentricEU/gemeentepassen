import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';

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
}
