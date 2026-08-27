import BaseApi from './baseApi';
import { Roles } from '../utils/roles.enum';
import { StatusCodes } from '../utils/status-codes.enum';

export class GetToken extends BaseApi {
	async getAccessToken(role: Roles): Promise<string> {
		let email = '';
		let roleName = '';

		switch (role) {
			case Roles.MUNICIPALITY:
				email = process.env.EMAIL_MUNICIPALITY;
				roleName = process.env.ROLE_MUNICIPALITY;
				break;
			case Roles.SUPPLIER:
				email = process.env.EMAIL_SUPPLIER;
				roleName = process.env.ROLE_SUPPLIER;
				break;
			case Roles.SUPPLIER_REJECTED:
				email = process.env.EMAIL_SUPPLIER_REJECTED;
				roleName = process.env.ROLE_SUPPLIER;
				break;
			case Roles.CITIZEN:
				email = process.env.EMAIL_CITIZEN;
				roleName = process.env.ROLE_CITIZEN;
				break;
		}

		const data = {
			username: email,
			password: process.env.PASSWORD,
			role: roleName,
			reCaptchaResponse: '',
			rememberMe: false
		};

		const response = await this.post('authenticate', data);

		if (response.status() !== StatusCodes.OK) {
			throw new Error(`Failed to get access token for role ${role}. Status: ${response.status()}`);
		}

		const body = await response.json();
		return body.token;
	}

	async getAccessTokenWithCredentials(email: string, password: string, role: Roles): Promise<string> {
		const roleName =
			role === Roles.MUNICIPALITY
				? process.env.ROLE_MUNICIPALITY
				: role === Roles.SUPPLIER
					? process.env.ROLE_SUPPLIER
					: process.env.ROLE_CITIZEN;

		const data = {
			username: email,
			password: password,
			role: roleName,
			reCaptchaResponse: '',
			rememberMe: false
		};

		const response = await this.post('authenticate', data);
		if (response.status() !== StatusCodes.OK) {
			throw new Error(`Failed to get access token. Status: ${response.status()}`);
		}
		const body = await response.json();
		return body.token;
	}
}
