import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';

export class WorkingHoursController extends BaseApi {
	async getWorkingHoursForSupplier(supplierId: string): Promise<APIResponse> {
		return await this.get(`working-hours/${supplierId}`);
	}

	async editWorkingHours(supplierId: string, workingHoursData: any): Promise<APIResponse> {
		return await this.patch(`working-hours/${supplierId}`, workingHoursData);
	}
}
