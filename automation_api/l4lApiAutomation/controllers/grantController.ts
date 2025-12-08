import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { Grant } from '../apiModels/grantModels';

export class GrantController extends BaseApi {
	async getGrant(isActiveGrantNeeded: boolean): Promise<APIResponse> {
		return this.get(`grants?isActiveGrantNeeded=${isActiveGrantNeeded}`);
	}

	async getGrantPaginated(page: number = 0, size: number = 25): Promise<APIResponse> {
		return this.get(`grants/paginated?page=${page}&size=${size}`);
	}

	async getGrantCount(): Promise<APIResponse> {
		return this.get('grants/count');
	}

	async createGrant(data: Grant): Promise<APIResponse> {
		return this.post('grants', data);
	}

	async updateGrant(data: Grant): Promise<APIResponse> {
		return this.patch('grants', data);
	}
}
