import UserService from './UserService';
import { CitizenRegisterDto } from '../utils/models/CitizenRegisterDto';
import { CitizenLoginDto } from '../utils/models/CitizenLoginDto';
import { AUTH_HEADER, HEADERS } from '../utils/constants/headers';
import { apiPath } from '../utils/constants/api';
import { DeleteAccountDto } from '../utils/models/DeleteAccountDto';
import { AccountDeletionReason } from '../utils/enums/accountDeletionReason';

global.fetch = jest.fn();

jest.mock('../utils/constants/headers', () => ({
    AUTH_HEADER: jest.fn(),
    HEADERS: {
      'Content-Type': 'application/json',
    },
  }));

describe('UserService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('registerUser', () => {
        it('should send a POST request to /api/users/register with correct data', async () => {
            const mockData: CitizenRegisterDto = {
                email: 'citizen@domain.com',
                firstName: 'Citizen',
                lastName: 'Citizen',
                password: '1234',
                retypedPassword: '1234',
                passNumber: '123456789',
            };

            const mockResponseData = undefined;
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponseData),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const response = await UserService.registerUser(mockData);

            expect(global.fetch).toHaveBeenCalledWith(
                `${apiPath}/users/register`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.any(Object),
                    body: JSON.stringify(mockData),
                })
            );
            expect(response).toEqual(mockResponseData);
        });

        it('should throw error when response is not ok', async () => {
            const mockResponse = {
                ok: false,
                status: 404,
                json: jest.fn().mockResolvedValue({})
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            await expect(UserService.registerUser({} as CitizenRegisterDto)).rejects.toBeTruthy();
        });

    });

    describe('login', () => {
        it('should send a POST request to /api/authenticate with correct data', async () => {
            const mockData: CitizenLoginDto = {
                username: 'citizen',
                password: '1234',
                role: 'ROLE_CITIZEN',
                reCaptchaResponse: '',
                rememberMe: false
            };

            const mockResponseData = { success: true };
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponseData),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const response = await UserService.login(mockData);

            expect(global.fetch).toHaveBeenCalledWith(
                `${apiPath}/authenticate`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.any(Object),
                    body: JSON.stringify(mockData),
                })
            );
            expect(response).toEqual(mockResponseData);
        });
    });

    describe('resendConfirmationToken', () => {
        it('should send a GET request to /api/users/resend-confirmation with correct email', async () => {
            const email = 'example@example.com';
            const mockResponseData = { success: true };
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponseData),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            await UserService.resendConfirmationToken(email);

            expect(global.fetch).toHaveBeenCalledWith(
                `${apiPath}/users/resend-confirmation?email=${encodeURIComponent(email)}`,
                expect.objectContaining({
                    method: 'GET',
                    headers: HEADERS,
                })
            );
        });

        it('should return response data when response is ok', async () => {
            const email = 'example@example.com';
            const mockResponseData = { success: true };
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponseData),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const response = await UserService.resendConfirmationToken(email);

            expect(response).toEqual(mockResponseData);
        });
    });

    describe('deleteAccount', () => {
        it('should send a POST request to /api/users/delete-account with correct data', async () => {
          const mockData: DeleteAccountDto = new DeleteAccountDto([AccountDeletionReason.NO_LONGER_USING]);
    
          const mockResponse = {
            ok: true,
          };
          (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
          (AUTH_HEADER as jest.Mock).mockResolvedValue({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
          });
    
          await UserService.deleteAccount(mockData);
    
          expect(global.fetch).toHaveBeenCalledWith(
            `${apiPath}/users/delete-account`,
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token'
              }),
              body: JSON.stringify(mockData),
            })
          );
        });
    
        it('should call AUTH_HEADER to get headers', async () => {
          const mockData: DeleteAccountDto = new DeleteAccountDto([AccountDeletionReason.NO_LONGER_USING]);
    
          const mockResponse = {
            ok: true,
          };
          (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
          (AUTH_HEADER as jest.Mock).mockResolvedValue({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
          });
    
          await UserService.deleteAccount(mockData);
    
          expect(AUTH_HEADER).toHaveBeenCalledTimes(1);
        });
      });
});
