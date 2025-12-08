import DiscountCodeService from './DiscountCodeService';
import api from '../utils/auth/api-interceptor';
import { AUTH_HEADER } from '../utils/constants/headers';
import { StatusCode } from '../utils/enums/statusCode.enum';

jest.mock('../utils/auth/api-interceptor');
jest.mock('../utils/constants/headers');

describe('DiscountCodeService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getDiscountCode', () => {
		it('should return discount code data when API call is successful', async () => {
			const mockOfferId = '123';
			const mockResponse = { data: { code: 'DISCOUNT123' }, status: StatusCode.Ok };
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockResolvedValue(mockResponse);

			const result = await DiscountCodeService.getDiscountCode(mockOfferId);

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith(`/discount-codes/${encodeURIComponent(mockOfferId)}`, {
				method: 'GET',
				headers: { Authorization: 'Bearer token' },
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should throw an error when API call fails', async () => {
			const mockOfferId = '123';
			const mockError = new Error('404');
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockResolvedValue({ status: 404 });

			await expect(DiscountCodeService.getDiscountCode(mockOfferId)).rejects.toThrow(mockError);

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith(`/discount-codes/${encodeURIComponent(mockOfferId)}`, {
				method: 'GET',
				headers: { Authorization: 'Bearer token' },
			});
		});
	});

	describe('getAllDiscountCodes', () => {
		it('should return all discount codes data when API call is successful', async () => {
			const mockResponse = { data: [{ code: 'DISCOUNT123' }], status: StatusCode.Ok };
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockResolvedValue(mockResponse);

			const result = await DiscountCodeService.getAllDiscountCodes();

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith('/discount-codes', {
				headers: { Authorization: 'Bearer token' },
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should throw an error when API call fails', async () => {
			const mockError = new Error('Not Found');
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockResolvedValue({ status: 404, statusText: 'Not Found' });

			await expect(DiscountCodeService.getAllDiscountCodes()).rejects.toThrow(mockError);

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith('/discount-codes', {
				headers: { Authorization: 'Bearer token' },
			});
		});
	});
});