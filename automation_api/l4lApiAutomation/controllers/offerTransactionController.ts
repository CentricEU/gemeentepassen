import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';

export class OfferTransactionController extends BaseApi {
	async getDistinctYearsForTransactionsBySupplierId(): Promise<APIResponse> {
		return await this.get('transactions/supplier/years');
	}

	async getTransactionsByInterval(
		startDate: string,
		endDate: string,
		page: number = 0,
		size: number = 25
	): Promise<APIResponse> {
		return await this.get('transactions/supplier/filter', {
			startDate,
			endDate,
			page: page.toString(),
			size: size.toString()
		});
	}

	async countMonthYearTransactionsBySupplierId(startDate: string, endDate: string): Promise<APIResponse> {
		return await this.get('transactions/supplier/count', { startDate, endDate });
	}

	async countAllTransactionsBySupplierId(): Promise<APIResponse> {
		return await this.get('transactions/supplier/count-all');
	}

	async getAllValidTransactions(): Promise<APIResponse> {
		return await this.get('transactions/supplier/all');
	}

	async getTransactionsGroupedByMonths(page: number = 0, size: number = 25): Promise<APIResponse> {
		return await this.get('transactions/group-by-months', { page: page.toString(), size: size.toString() });
	}

	async getDistinctYearsForTransactionsByTenantId(): Promise<APIResponse> {
		return await this.get('transactions/admin/years');
	}

	async getTransactionsByMonthYearAndTenant(
		startDate: string,
		endDate: string,
		page: number = 0,
		size: number = 25,
		supplierId?: string
	): Promise<APIResponse> {
		const params: Record<string, string> = { startDate, endDate, page: page.toString(), size: size.toString() };
		if (supplierId) {
			params.supplierId = supplierId;
		}
		return await this.get('transactions/admin/filter', params);
	}

	async countIntervalTransactionsByTenantId(
		startDate: string,
		endDate: string,
		supplierId?: string
	): Promise<APIResponse> {
		const params: Record<string, string> = { startDate, endDate };
		if (supplierId) {
			params.supplierId = supplierId;
		}
		return await this.get('transactions/admin/count', params);
	}

	async countAllTransactionsByTenantId(): Promise<APIResponse> {
		return await this.get('transactions/admin/count-all');
	}
}
