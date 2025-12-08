import { StatusCode } from '../utils/enums/statusCode.enum';
import OfferTransactionService from './TransactionService';

jest.mock('../utils/constants/headers', () => ({
	AUTH_HEADER: jest.fn().mockResolvedValue({ Authorization: 'Bearer test-token' })
}));

jest.mock('../utils/auth/api-interceptor', () => ({
	get: jest.fn()
}));

jest.mock('react-promise-tracker', () => ({
	trackPromise: (promise: any) => promise
}));

describe('OfferTransactionService.getUserTransactionsGrouped', () => {
	const api = require('../utils/auth/api-interceptor');

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return data when response is successful (200)', async () => {
		const mockData = {
			'2024-12': [{ offerTitle: 'Test Offer', amount: 100 }]
		};

		api.get.mockResolvedValueOnce({
			status: StatusCode.Ok,
			data: mockData
		});

		const result = await OfferTransactionService.getUserTransactionsGrouped();

		expect(api.get).toHaveBeenCalledWith(
			'/transactions/group-by-months?page=0&size=25',
			expect.objectContaining({
				method: 'GET',
				headers: { Authorization: 'Bearer test-token' }
			})
		);

		expect(result).toEqual(mockData);
	});

	it('should return empty object when status is not 200', async () => {
		api.get.mockResolvedValueOnce({
			status: 400,
			data: {}
		});

		const result = await OfferTransactionService.getUserTransactionsGrouped();

		expect(result).toEqual({});
	});

	it('should return empty object and log error when request fails', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
		api.get.mockRejectedValueOnce(new Error('Network error'));

		const result = await OfferTransactionService.getUserTransactionsGrouped();

		expect(consoleSpy).toHaveBeenCalledWith('Error fetching grouped transactions:', expect.any(Error));
		expect(result).toEqual({});
	});
});
