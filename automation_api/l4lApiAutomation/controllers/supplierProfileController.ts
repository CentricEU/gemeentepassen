import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { SupplierProfile } from '../apiModels/supplierProfileModels';

export class SupplierProfileController extends BaseApi {
	async getDropdownData(): Promise<APIResponse> {
		return this.get('supplier-profiles/dropdown-data');
	}

	async getSupplierProfileById(id: string): Promise<APIResponse> {
		return this.get(`supplier-profiles/${id}`);
	}

	async createSupplierProfile(data: SupplierProfile): Promise<APIResponse> {
		return this.post('supplier-profiles', data);
	}

	async updateSupplierProfile(data: SupplierProfile): Promise<APIResponse> {
		return this.patch('supplier-profiles', data);
	}
}
