import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { CitizenGroupDto, CitizenMessageDto } from '../apiModels/citizenGroupModels';

export class CitizenGroupController extends BaseApi {
	async getAllCitizenGroups(): Promise<APIResponse> {
		return await this.get('citizen-groups');
	}

	async createCitizenGroup(data: CitizenGroupDto): Promise<APIResponse> {
		return await this.post('citizen-groups', data);
	}

	async sendCitizenMessage(data: CitizenMessageDto): Promise<APIResponse> {
		return await this.post('citizen-groups/none-category-fit', data);
	}

	async getAllCitizenGroupsPaginated(page: number = 0, size: number = 25): Promise<APIResponse> {
		return await this.get('citizen-groups/paginated', { page: page.toString(), size: size.toString() });
	}

	async getRequiredDocuments(): Promise<APIResponse> {
		return await this.get('citizen-groups/documents');
	}

	async countAllCitizenGroups(): Promise<APIResponse> {
		return await this.get('citizen-groups/count');
	}
}
