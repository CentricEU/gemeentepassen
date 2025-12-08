import UserService from './UserService';
import api from '../utils/auth/api-interceptor';
import { CitizenLoginDto } from '../utils/models/CitizenLoginDto';
import { CitizenRegisterDto } from '../utils/models/CitizenRegisterDto';
import { CitizenProfileDto } from '../utils/models/CitizenProfileDto';
import { DeleteAccountDto } from '../utils/models/DeleteAccountDto';
import { StatusCode } from '../utils/enums/statusCode.enum';

jest.mock('../utils/auth/api-interceptor');
jest.mock('../utils/constants/headers', () => ({
	AUTH_HEADER: jest.fn().mockResolvedValue({}),
	HEADERS: {}
}));

describe('UserService', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('registerUser', () => {
		it('should register a user successfully', async () => {
			const mockData: CitizenRegisterDto = {
				email: 'test@example.com',
				password: 'password',
				firstName: 'John',
				lastName: 'Doe',
				retypedPassword: 'password',
				passNumber: '123456'
			};
			const mockResponse = { status: StatusCode.Ok, data: { message: 'User registered successfully' } };
			(api.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await UserService.registerUser(mockData, 'en');

			expect(result).toEqual(mockResponse.data);
			expect(api.post).toHaveBeenCalledWith('/users/register', mockData, { headers: {} });
		});

		it('should throw an error if registration fails', async () => {
			const mockData: CitizenRegisterDto = {
				email: 'test@example.com',
				password: 'password',
				firstName: 'John',
				lastName: 'Doe',
				retypedPassword: 'password',
				passNumber: '123456'
			};
			const mockError = new Error('Registration failed');
			(api.post as jest.Mock).mockRejectedValue(mockError);

			await expect(UserService.registerUser(mockData, 'en')).rejects.toThrow('Registration failed');
		});
	});

	describe('login', () => {
		it('should login a user successfully', async () => {
			const mockData: CitizenLoginDto = {
				username: 'test@example.com',
				password: 'password',
				role: 'user',
				reCaptchaResponse: 'test',
				rememberMe: true
			};

			const mockResponse = {
				status: StatusCode.Ok,
				data: {
					token: 'accessToken',
					refreshToken: 'refreshTokenValue'
				}
			};

			(api.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await UserService.login(mockData);

			expect(result).toEqual({
				accessToken: 'accessToken',
				refreshToken: 'refreshTokenValue'
			});
			expect(api.post).toHaveBeenCalledWith('/authenticate', mockData, { headers: {} });
		});
	});

	describe('resendConfirmationToken', () => {
		it('should resend confirmation token successfully', async () => {
			const email = 'test@example.com';
			const mockResponse = { status: StatusCode.Ok, data: { message: 'Token resent successfully' } };
			(api.get as jest.Mock).mockResolvedValue(mockResponse);

			const result = await UserService.resendConfirmationToken(email);

			expect(result).toEqual(mockResponse.data);
			expect(api.get).toHaveBeenCalledWith(`/users/resend-confirmation?email=${encodeURIComponent(email)}`, {
				headers: {}
			});
		});

		it('should throw an error if resending token fails', async () => {
			const email = 'test@example.com';
			const mockError = new Error('Resend token failed');
			(mockError as any).response = { status: 400, data: 'Resend token failed' };
			(api.get as jest.Mock).mockRejectedValue(mockError);

			await expect(UserService.resendConfirmationToken(email)).rejects.toThrow('Resend token failed');
		});
	});

	describe('getCitizenProfile', () => {
		it('should get citizen profile successfully', async () => {
			const mockResponse = { status: StatusCode.Ok, data: { name: 'John Doe' } };
			(api.get as jest.Mock).mockResolvedValue(mockResponse);

			const result = await UserService.getCitizenProfile();

			expect(result).toEqual(mockResponse.data);
			expect(api.get).toHaveBeenCalledWith('/users/citizen-profile', { method: 'GET', headers: {} });
		});

		it('should throw an error if getting profile fails', async () => {
			const mockError = new Error('Get profile failed');
			(api.get as jest.Mock).mockRejectedValue(mockError);

			await expect(UserService.getCitizenProfile()).rejects.toThrow('Get profile failed');
		});
	});

	describe('deleteAccount', () => {
		it('should delete account successfully', async () => {
			const mockData: DeleteAccountDto = { accountDeletionReasons: [] };
			const mockResponse = { status: StatusCode.Ok, data: { message: 'Account deleted successfully' } };
			(api.post as jest.Mock).mockResolvedValue(mockResponse);

			await UserService.deleteAccount(mockData);

			expect(api.post).toHaveBeenCalledWith('/users/delete-account', mockData, { headers: {} });
		});

		it('should throw an error if deleting account fails', async () => {
			const mockData: DeleteAccountDto = { accountDeletionReasons: [] };
			const mockError = new Error('Delete account failed');
			(mockError as any).response = { status: 400, data: 'Delete account failed' };
			(api.post as jest.Mock).mockRejectedValue(mockError);

			await expect(UserService.deleteAccount(mockData)).rejects.toThrow('Delete account failed');
		});
	});

	describe('updateUserInformation', () => {
		it('should update user information successfully', async () => {
			const mockData: CitizenProfileDto = { username: 'johndoe', firstName: 'John', lastName: 'Doe' };
			const mockResponse = { status: StatusCode.Ok, data: { name: 'John Doe' } };
			(api.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await UserService.updateUserInformation(mockData);

			expect(result).toEqual(mockResponse.data);
			expect(api.post).toHaveBeenCalledWith('/users/citizen-profile', mockData, { headers: {} });
		});

		it('should throw an error if updating information fails', async () => {
			const mockData: CitizenProfileDto = { username: 'johndoe', firstName: 'John', lastName: 'Doe' };
			const mockError = new Error('Update information failed');
			(api.post as jest.Mock).mockRejectedValue(mockError);

			await expect(UserService.updateUserInformation(mockData)).rejects.toThrow('Update information failed');
		});
	});

	describe('loginWithSignicat', () => {
		it('should login a user with Signicat successfully', async () => {
			const tokenId = 'signicat-token-id';
			const mockResponse = {
				status: StatusCode.Ok,
				data: {
					token: 'accessTokenSignicat',
					refreshToken: 'refreshTokenSignicat'
				}
			};

			(api.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await UserService.loginWithSignicat(tokenId);

			expect(result).toEqual({
				accessTokenStore: 'accessTokenSignicat',
				refreshToken: 'refreshTokenSignicat'
			});
			expect(api.post).toHaveBeenCalledWith('/authenticate/signicat', { tokenId }, { headers: {} });
		});

		it('should throw an error if Signicat login fails with non-OK status', async () => {
			const tokenId = 'signicat-token-id';
			const mockResponse = {
				status: 500,
				data: 'Internal Server Error'
			};
			(api.post as jest.Mock).mockResolvedValue(mockResponse);

			await expect(UserService.loginWithSignicat(tokenId)).rejects.toThrow(
				"Cannot read properties of undefined (reading 'data')"
			);
		});

		it('should throw an error if Signicat login fails with rejected promise', async () => {
			const tokenId = 'signicat-token-id';
			const mockError = { response: { data: 'Signicat login failed' } };
			(api.post as jest.Mock).mockRejectedValue(mockError);

			await expect(UserService.loginWithSignicat(tokenId)).rejects.toBe('Signicat login failed');
		});
	});
});
