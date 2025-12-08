import BaseApi from './baseApi';
import { Roles } from '../utils/roles.enum';
import { StatusCodes } from '../utils/status-codes.enum';

export class GetToken extends BaseApi {
	async getAccessToken(role: Roles) {
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
			rememberMe: true
		};

		const response = await this.post('authenticate', data);

		if (response.status() !== StatusCodes.OK) {
			throw new Error(`Failed to get access token for role ${role}. Status: ${response.status()}`);
		}

		const token = await response.json();

		process.env.TOKEN = token.token;

		return response;
	}
}
