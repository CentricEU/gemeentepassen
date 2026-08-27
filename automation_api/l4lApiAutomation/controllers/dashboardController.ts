import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { IntervalPeriod, SupplierStatus } from '../apiModels/dashboardModels';

export class DashboardController extends BaseApi {
	async getUsedOfferStatistics(intervalPeriod: IntervalPeriod): Promise<APIResponse> {
		return await this.get('dashboard/used-offer/statistics', { intervalPeriod });
	}

	async getTransactionStatistics(intervalPeriod: IntervalPeriod): Promise<APIResponse> {
		return await this.get('dashboard/transaction/statistics', { intervalPeriod });
	}

	async getMunicipalityStatistics(statuses: SupplierStatus[]): Promise<APIResponse> {
		return await this.get('dashboard/statistics', { statuses: statuses.join(',') });
	}
}
