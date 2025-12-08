import BenefitService from './BenefitService';
import api from '../../utils/auth/api-interceptor';
import { AUTH_HEADER } from '../../utils/constants/headers';
import { StatusCode } from '../../utils/enums/statusCode.enum';

jest.mock('../utils/auth/api-interceptor');
jest.mock('../utils/constants/headers');

describe('BenefitService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllBenefits', () => {
		it('should return benefits data when API call is successful', async () => {
			const mockResponse = { data: { code: 'DISCOUNT123' }, status: StatusCode.Ok };
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockResolvedValue(mockResponse);

			const result = await BenefitService.getAllBenefits();

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith(`/benefits/all-for-citizen}`, {
				method: 'GET',
				headers: { Authorization: 'Bearer token' },
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should throw an error when API call fails', async () => {
			const mockError = new Error('404');
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockResolvedValue({ status: 404 });

			await expect(BenefitService.getAllBenefits()).rejects.toThrow(mockError);

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith(`/benefits/all-for-citizen}`, {
				method: 'GET',
				headers: { Authorization: 'Bearer token' },
			});
		});
	});
});