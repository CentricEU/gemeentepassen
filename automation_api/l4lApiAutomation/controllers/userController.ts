import { APIResponse } from '@playwright/test';
import BaseApi from '../serviceApi/baseApi';

export class UserController extends BaseApi {
	async getUser(id: string): Promise<APIResponse> {
		return this.get('users', { userId: id });
	}

	async getConfirmAccount(token?: string): Promise<APIResponse> {
		return this.get(`users/confirm-account/${token}`);
	}
}
