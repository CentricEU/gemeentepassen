import OfferService from './OfferService';
import api from '../utils/auth/api-interceptor';
import DateUtils from '../utils/DateUtils';
import { AUTH_HEADER } from '../utils/constants/headers';
import { UseOfferDto } from '../utils/models/UseOfferDto';
import { StatusCode } from '../utils/enums/statusCode.enum';

jest.mock('../utils/auth/api-interceptor');
jest.mock('../utils/DateUtils');
jest.mock('../utils/constants/headers');

describe('OfferService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getMapOffersWithViewport', () => {
		it('should fetch map offers with viewport', async () => {
			const region = { latitude: 1, longitude: 1, latitudeDelta: 0.1, longitudeDelta: 0.1 };
			const offerType = 1;
			const mockResponse = { data: { '1,1': [{ coordinatesString: '{"lat":1,"lng":1}' }] } };
			(api.get as jest.Mock).mockResolvedValue(mockResponse);
			(DateUtils.getCurrentDay as jest.Mock).mockReturnValue('2023-10-10');
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });

			const result = await OfferService.getMapOffersWithViewport(region, offerType);

			expect(api.get).toHaveBeenCalledWith(
				expect.stringContaining('/offers/map-with-viewport'),
				expect.any(Object)
			);
			expect(result).toEqual({ '1,1': [{ coordinatesString: { lat: 1, lng: 1 } }] });
		});
	});

	describe('useOffer', () => {
		it('should use an offer', async () => {
			const data: UseOfferDto = new UseOfferDto('1', '2023-10-10', 10);
			const mockResponse = { status: StatusCode.NoContent };
			(api.post as jest.Mock).mockResolvedValue(mockResponse);
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });

			const result = await OfferService.useOffer(data);

			expect(api.post).toHaveBeenCalledWith('/offers/use', data, { headers: { Authorization: 'Bearer token' } });
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getFullOffer', () => {
		it('should fetch full offer details', async () => {
			const offerId = '1';
			const latitude = '1';
			const longitude = '1';
			const mockResponse = { status: StatusCode.Ok, data: { id: '1', name: 'Offer 1' } };
			(api.get as jest.Mock).mockResolvedValue(mockResponse);
			(DateUtils.getCurrentDay as jest.Mock).mockReturnValue('2023-10-10');
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });

			const result = await OfferService.getFullOffer(offerId, latitude, longitude);

			expect(api.get).toHaveBeenCalledWith(
				expect.stringContaining(`/offers/details/${offerId}`),
				expect.any(Object)
			);
			expect(result).toEqual(mockResponse.data);
		});
	});

	describe('getOffers', () => {
		it('should fetch offers list', async () => {
			const currentPage = 1;
			const latitude = 1;
			const longitude = 1;
			const mockResponse = {
				status: StatusCode.Ok,
				data: [{ coordinatesString: '{"lat":1,"lng":1}' }]
			};
			(api.get as jest.Mock).mockResolvedValue(mockResponse);
			(DateUtils.getCurrentDay as jest.Mock).mockReturnValue('2023-10-10');
			(AUTH_HEADER as jest.Mock).mockResolvedValue({ Authorization: 'Bearer token' });

			const result = await OfferService.getOffers(currentPage, latitude, longitude, 1);

			expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/offers/list'), expect.any(Object));
			expect(result).toEqual([{ coordinatesString: { lat: 1, lng: 1 } }]);
		});
	});
});
