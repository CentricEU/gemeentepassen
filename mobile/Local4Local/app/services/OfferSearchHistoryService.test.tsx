import OfferSearchHistoryService from './OfferSearchHistoryService';
import api from '../utils/auth/api-interceptor';
import { AUTH_HEADER } from '../utils/constants/headers';
import { StatusCode } from '../utils/enums/statusCode.enum';

jest.mock('../utils/auth/api-interceptor');
jest.mock('../utils/constants/headers');

describe('OfferSearchHistoryService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('getSearchHistoryForCitizen', () => {
		it('should return search history when API call is successful', async () => {
			const mockHistory = ['search1', 'search2'];
			const mockResponse = { data: mockHistory, status: StatusCode.Ok };

			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockResolvedValue(mockResponse);

			const result = await OfferSearchHistoryService.getSearchHistoryForCitizen();

			expect(AUTH_HEADER).toHaveBeenCalled();
			expect(api.get).toHaveBeenCalledWith('/search-history', {
				headers: { Authorization: 'Bearer token' }
			});
			expect(result).toEqual(mockHistory);
		});

		it('should return empty array and log error if API call fails', async () => {
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

			const result = await OfferSearchHistoryService.getSearchHistoryForCitizen();

			expect(console.error).toHaveBeenCalledWith('Error fetching search history:', expect.any(Error));
			expect(result).toEqual([]);
		});

		it('should return empty array and log error if response status is not ok', async () => {
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });
			(api.get as jest.Mock).mockResolvedValue({ status: 500 });

			const result = await OfferSearchHistoryService.getSearchHistoryForCitizen();

			expect(console.error).toHaveBeenCalledWith('Error fetching search history:', expect.any(Error));
			expect(result).toEqual([]);
		});
	});
});
