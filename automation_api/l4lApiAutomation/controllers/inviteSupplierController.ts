import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { InviteSupplierRequestDto } from '../apiModels/inviteSupplierModels';

export class InviteSupplierController extends BaseApi {
	async inviteSupplier(data: InviteSupplierRequestDto): Promise<APIResponse> {
		return await this.post('invitations/send', data);
	}

	async getInvitations(page: number = 0, size: number = 25): Promise<APIResponse> {
		return await this.get('invitations', { page: page.toString(), size: size.toString() });
	}

	async countInvitationsByTenantId(): Promise<APIResponse> {
		return await this.get('invitations/count');
	}
}
