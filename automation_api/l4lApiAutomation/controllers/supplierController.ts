import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { RegisterSupplierRequestDto, RejectSupplier } from '../apiModels/supplierModels';

export class SupplierController extends BaseApi {
	async registerSupplier(data: RegisterSupplierRequestDto): Promise<APIResponse> {
		return await this.post('suppliers/register', data);
	}

	async rejectSupplier(data: RejectSupplier): Promise<APIResponse> {
		return await this.post('suppliers/reject', data);
	}

	async changeHasStatusUpdate(supplierId: string, hasStatusUpdate: boolean = false): Promise<APIResponse> {
		return await this.put(`suppliers/change-has-status-update/${supplierId}?hasStatusUpdate=${hasStatusUpdate}`);
	}

	async approveSupplier(supplierId: string): Promise<APIResponse> {
		return await this.put(`suppliers/approve/${supplierId}`);
	}

	async getAllByTenantIdForMap(tenantId: string): Promise<APIResponse> {
		return await this.get(`suppliers/${tenantId}/all-for-map`);
	}

	async getSupplier(supplierId: string): Promise<APIResponse> {
		return await this.get(`suppliers/${supplierId}`);
	}

	async getCashiersForSupplier(supplierId: string): Promise<APIResponse> {
		return await this.get(`suppliers/${supplierId}/cashiers`);
	}

	async getRejectedSupplier(supplierId: string): Promise<APIResponse> {
		return await this.get(`suppliers/rejection/${supplierId}`);
	}

	async getQRCode(): Promise<APIResponse> {
		return await this.get('suppliers/qr-code');
	}

	async getAllByTenantIdAndStatus(
		tenantId: string,
		page: number = 0,
		size: number = 25,
		status: any
	): Promise<APIResponse> {
		return await this.get('suppliers/pending', { tenantId, page: page.toString(), size: size.toString(), status });
	}

	async getAllByTenantId(
		tenantId: string,
		page: number = 0,
		size: number = 25,
		status: string
	): Promise<APIResponse> {
		return await this.get('suppliers/all', { tenantId, page: page.toString(), size: size.toString(), status });
	}

	async countAllByTenantId(tenantId: string, statuses: string): Promise<APIResponse> {
		return await this.get('suppliers/all/count', { tenantId, statuses });
	}
}
