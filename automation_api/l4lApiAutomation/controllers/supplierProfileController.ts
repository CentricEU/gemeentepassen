import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { SupplierProfilePatchDto, SupplierProfileRequestDto } from '../apiModels/supplierProfileModels';

export class SupplierProfileController extends BaseApi {
	async getDropdownData(): Promise<APIResponse> {
		return this.get('supplier-profiles/dropdown-data');
	}

	async getSupplierProfileById(id: string): Promise<APIResponse> {
		return this.get(`supplier-profiles/${id}`);
	}

	async createSupplierProfile(data: SupplierProfileRequestDto): Promise<APIResponse> {
		return this.post('supplier-profiles', data);
	}

	async updateSupplierProfile(data: SupplierProfilePatchDto): Promise<APIResponse> {
		return this.patch('supplier-profiles', data);
	}

	async addCashier(cashierEmail: string[]): Promise<APIResponse> {
		return this.post(`supplier-profiles/cashiers`, cashierEmail);
	}

	async reapplySupplierProfile(data: SupplierProfilePatchDto): Promise<APIResponse> {
		return this.patch('supplier-profiles/reapplication', data);
	}
}
