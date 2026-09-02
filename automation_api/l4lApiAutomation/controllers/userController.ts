import { APIResponse } from '@playwright/test';
import BaseApi from '../serviceApi/baseApi';
import { ChangePasswordDTO, SetupPasswordDTO, SetupPasswordValidateDTO } from '../apiModels/userModels';

export class UserController extends BaseApi {
	async setupPassword(data: SetupPasswordDTO): Promise<APIResponse> {
		return this.put('users/setup-password', data);
	}

	async changePassword(data: ChangePasswordDTO): Promise<APIResponse> {
		return this.put('users/recover/reset-password', data);
	}

	async validateToken(data: SetupPasswordValidateDTO): Promise<APIResponse> {
		return this.post('users/setup-password/validate', data);
	}

	async registerCitizen(data: any): Promise<APIResponse> {
		return this.post('users/register', data);
	}

	async getRecoverPasswordByToken(token: string): Promise<APIResponse> {
		return this.get('users/recover', { token });
	}

	async recoverPassword(data: any): Promise<APIResponse> {
		return this.post('users/recover', data);
	}

	async deleteAccount(data: any): Promise<APIResponse> {
		return this.post('users/delete-account', data);
	}

	async createUser(data: any): Promise<APIResponse> {
		return this.post('users/create', data);
	}

	async getCitizenProfile(): Promise<APIResponse> {
		return this.get('users/citizen-profile');
	}

	async updateCitizenProfile(data: any): Promise<APIResponse> {
		return this.post('users/citizen-profile', data);
	}

	async getUser(id: string): Promise<APIResponse> {
		return this.get('users', { userId: id });
	}

	async resendConfirmation(email: string): Promise<APIResponse> {
		return this.get(`users/resend-confirmation?email=${encodeURIComponent(email)}`);
	}

	async getConfirmAccount(token?: string): Promise<APIResponse> {
		return this.get(`users/confirm-account/${token}`);
	}

	async getAllAdmin(page: number = 0, size: number = 25): Promise<APIResponse> {
		return this.get('users/admins/paginated', { page: page.toString(), size: size.toString() });
	}

	async countAdminsByTenantId(): Promise<APIResponse> {
		return this.get('users/admins/count');
	}
}
