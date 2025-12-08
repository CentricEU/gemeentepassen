import { AUTH_HEADER } from '../utils/constants/headers';
import api from '../utils/auth/api-interceptor';
import { trackPromise } from 'react-promise-tracker';
import { StatusCode } from '../utils/enums/statusCode.enum';
import { OfferTransactionsGroupedDto } from '../utils/types/offerTransactionGroupedDto';

class OfferTransactionService {
	static async getUserTransactionsGrouped(
		page: number = 0,
		size: number = 25
	): Promise<Record<string, OfferTransactionsGroupedDto[]>> {
		const HEADERS_WITH_AUTH = await AUTH_HEADER();

		const requestObj = {
			method: 'GET',
			headers: HEADERS_WITH_AUTH
		};

		try {
			const response = await trackPromise(
				api.get(`/transactions/group-by-months?page=${page}&size=${size}`, requestObj)
			);

			if (response.status !== StatusCode.Ok) {
				throw new Error(`Status: ${response.status}`);
			}
			return await response.data;
		} catch (error) {
			console.error('Error fetching grouped transactions:', error);
			return {};
		}
	}
}

export default OfferTransactionService;
