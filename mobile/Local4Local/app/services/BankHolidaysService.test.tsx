import BankHolidaysService from './BankHolidaysService';
import api from '../utils/auth/api-interceptor';
import { trackPromise } from 'react-promise-tracker';
import { AUTH_HEADER } from '../utils/constants/headers';
import { StatusCode } from '../utils/enums/statusCode.enum';

jest.mock('../utils/auth/api-interceptor');
jest.mock('react-promise-tracker', () => ({
	trackPromise: jest.fn(),
}));
jest.mock('../utils/constants/headers', () => ({
	AUTH_HEADER: jest.fn(),
}));

describe('BankHolidaysService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe('getHolidays', () => {
		it('should return holidays data when API call is successful', async () => {
			const mockHeaders = { Authorization: 'Bearer token' };
			const mockResponse = { status: StatusCode.Ok, data: [{ date: '2023-01-01', name: 'New Year' }] };

			(AUTH_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
			(api.get as jest.Mock).mockResolvedValue(mockResponse);
			(trackPromise as jest.Mock).mockImplementation((promise) => promise);

			const result = await BankHolidaysService.getHolidays(2023);

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith('/bank-holidays?year=2023', {
				method: 'GET',
				headers: mockHeaders,
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should throw an error when API call fails', async () => {
			const mockHeaders = { Authorization: 'Bearer token' };
			const mockError = new Error('500');

			(AUTH_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
			(api.get as jest.Mock).mockResolvedValue({ status: 500 });
			(trackPromise as jest.Mock).mockImplementation((promise) => promise);

			await expect(BankHolidaysService.getHolidays(2023)).rejects.toThrow('500');

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith('/bank-holidays?year=2023', {
				method: 'GET',
				headers: mockHeaders,
			});
		});

		it('should throw an error when AUTH_HEADER fails', async () => {
			const mockError = new Error('Auth error');

			(AUTH_HEADER as jest.Mock).mockRejectedValue(mockError);

			await expect(BankHolidaysService.getHolidays(2023)).rejects.toThrow('Auth error');

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).not.toHaveBeenCalled();
		});
	});
});