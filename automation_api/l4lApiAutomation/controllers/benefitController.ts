import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { BenefitRequestDto } from '../apiModels/benefitModels';

export class BenefitController extends BaseApi {
	async getAllBenefitsForCitizenGroup(): Promise<APIResponse> {
		return await this.get('benefits');
	}

	async createBenefit(data: BenefitRequestDto): Promise<APIResponse> {
		return await this.post('benefits', data);
	}

	async getAllBenefitsForPassholder(passholderId: string): Promise<APIResponse> {
		return await this.get(`benefits/passholder/${passholderId}`);
	}

	async getAllBenefitsForTenantPaginated(page: number = 0, size: number = 25): Promise<APIResponse> {
		return await this.get('benefits/paginated', { page: page.toString(), size: size.toString() });
	}

	async countAllBenefitsByTenantId(): Promise<APIResponse> {
		return await this.get('benefits/count');
	}

	async getAllBenefitsForTenant(): Promise<APIResponse> {
		return await this.get('benefits/all');
	}

	async getAllBenefitsForCitizen(): Promise<APIResponse> {
		return await this.get('benefits/all-for-citizen');
	}
}
