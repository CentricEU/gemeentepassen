import { trackPromise } from 'react-promise-tracker';
import { CitizenLoginDto } from '../utils/models/CitizenLoginDto';
import { CitizenRegisterDto } from '../utils/models/CitizenRegisterDto';
import { DeleteAccountDto } from '../utils/models/DeleteAccountDto';
import api from '../utils/auth/api-interceptor';
import { CitizenProfileDto } from '../utils/models/CitizenProfileDto';
import { AUTH_HEADER, getLanguageCookieHeader, HEADERS } from '../utils/constants/headers';
import { StatusCode } from '../utils/enums/statusCode.enum';
import { ForgotPasswordDto } from '../utils/models/ForgotPasswordDto';
import { ResetPasswordDto } from '../utils/models/ResetPasswordDto';

class UserService {
	static async handleResponse(response: any) {
		if (response.status !== StatusCode.Ok) {
			const errorData = response.data;
			const errorMessage = errorData;

			throw new Error(errorMessage);
		}
		return response.data;
	}

	static async forgotPassword(forgotPasswordDto: ForgotPasswordDto, language: string) {
		try {
			const extraHeaders = getLanguageCookieHeader(language);

			const response = await trackPromise(
				api.post('/users/recover', forgotPasswordDto, {
					headers: { ...HEADERS, ...extraHeaders },
					withCredentials: true
				})
			);

			if (response.status !== StatusCode.NoContent) {
				throw Error(response.status.toString());
			}

			return response.data;
		} catch (error: any) {
			console.log('Forgot password error:', error);
			throw error.response.data;
		}
	}

	static async resetPassword(resetPasswordDto: ResetPasswordDto) {
		try {
			const response = await trackPromise(
				api.put('/users/recover/reset-password', resetPasswordDto, {
					headers: { ...HEADERS },
					withCredentials: true
				})
			);

			if (response.status !== StatusCode.NoContent) {
				throw Error(response.status.toString());
			}

			return response.data;
		} catch (error: any) {
			console.log('Change password error:', error);
			throw error.response.data;
		}
	}

	static async validateResetPasswordToken(token: string) {
		try {
			const response = await trackPromise(
				api.get(`/users/recover?token=${encodeURIComponent(token)}`, {
					headers: HEADERS,
					withCredentials: true
				})
			);

			if (response.status !== StatusCode.Ok) {
				const errorData = response.data;

				throw new Error(errorData);
			}

			return response;
		} catch (error: any) {
			console.log('Validate reset password token error:', error);
			throw error.response.data;
		}
	}

	static async registerUser(data: CitizenRegisterDto, language: string) {
		try {
			const extraHeaders = getLanguageCookieHeader(language);

			const response = await trackPromise(
				api.post('/users/register', data, {
					headers: { ...HEADERS, ...extraHeaders },
					withCredentials: true
				})
			);

			if (response.status !== StatusCode.Ok) {
				const errorData = response.data;
				throw new Error(errorData);
			}

			return response.data;
		} catch (error: any) {
			console.log('Registration error:', error.response.data);
			throw error.response.data;
		}
	}

	static async login(data: CitizenLoginDto) {
		try {
			const response = await trackPromise(
				api.post('/authenticate', data, {
					headers: HEADERS
				})
			);

			if (response.status !== StatusCode.Ok) {
				const errorData = response.data;

				throw new Error(errorData);
			}

			const accessToken = response.data.token;
			const refreshToken = response.data.refreshToken;

			return { accessToken, refreshToken };
		} catch (error: any) {
			throw error.response.data;
		}
	}

	static async loginWithSignicat(tokenId: string, accessToken: string) {
		try {
			const response = await trackPromise(
				api.post(
					'/authenticate/signicat',
					{ tokenId, accessToken },
					{
						headers: HEADERS
					}
				)
			);

			if (response.status !== StatusCode.Ok) {
				throw new Error(`Server error: ${response.status}`);
			}

			const accessTokenStore = response.data.token;
			const refreshToken = response.data.refreshToken;

			return { accessTokenStore, refreshToken };
		} catch (error: any) {
			throw error.response.data;
		}
	}

	static async resendConfirmationToken(email: string) {
		try {
			const response = await trackPromise(
				api.get(`/users/resend-confirmation?email=${encodeURIComponent(email)}`, {
					headers: HEADERS
				})
			);
			return this.handleResponse(response);
		} catch (error) {
			throw error;
		}
	}

	static async getCitizenProfile(): Promise<CitizenProfileDto> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: 'GET',
				headers: HEADERS_WITH_AUTH
			};

			const response = await trackPromise(api.get('/users/citizen-profile', requestObj));

			if (response.status !== StatusCode.Ok) {
				throw Error(response.status.toString());
			}

			return response.data;
		} catch (error) {
			throw error;
		}
	}

	static async deleteAccount(data: DeleteAccountDto): Promise<void> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const response = await trackPromise(
				api.post('/users/delete-account', data, {
					headers: HEADERS_WITH_AUTH
				})
			);
			return this.handleResponse(response);
		} catch (error) {
			throw error;
		}
	}

	static async updateUserInformation(data: CitizenProfileDto): Promise<CitizenProfileDto> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const response = await trackPromise(
				api.post('/users/citizen-profile', data, {
					headers: HEADERS_WITH_AUTH
				})
			);

			return this.handleResponse(response);
		} catch (error) {
			throw error;
		}
	}
}

export default UserService;
