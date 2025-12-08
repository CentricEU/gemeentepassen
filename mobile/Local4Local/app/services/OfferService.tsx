import { trackPromise } from 'react-promise-tracker';
import { AUTH_HEADER } from '../utils/constants/headers';
import { UseOfferDto } from '../utils/models/UseOfferDto';
import { OfferMobileListDto } from '../utils/types/offerMobileListDto';
import { OffersMapDto } from '../utils/types/offerMapDto';
import { Region } from 'react-native-maps';
import DateUtils from '../utils/DateUtils';
import { MINIMUM_SEARCH_KEYWORD_LENGTH } from '../utils/constants/constants';
import api from '../utils/auth/api-interceptor';
import { StatusCode } from '../utils/enums/statusCode.enum';

class OfferService {
	static async getMapOffersWithViewport(
		region: Region,
		offerType: number,
		searchKeyword?: string
	): Promise<OffersMapDto> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: 'GET',
				headers: HEADERS_WITH_AUTH
			};

			const minLatitude = region.latitude - region.latitudeDelta / 2;
			const maxLatitude = region.latitude + region.latitudeDelta / 2;
			const minLongitude = region.longitude - region.longitudeDelta / 2;
			const maxLongitude = region.longitude + region.longitudeDelta / 2;

			const params = new URLSearchParams({
				minLatitude: minLatitude.toString(),
				maxLatitude: maxLatitude.toString(),
				minLongitude: minLongitude.toString(),
				maxLongitude: maxLongitude.toString(),
				currentDay: DateUtils.getCurrentDay(),
				offerType: offerType.toString()
			});

			if (searchKeyword && searchKeyword.length >= MINIMUM_SEARCH_KEYWORD_LENGTH) {
				params.append('searchKeyword', searchKeyword);
			}

			const response = await trackPromise(api.get(`/offers/map-with-viewport?${params.toString()}`, requestObj));

			const offersMap: OffersMapDto = await response.data;

			Object.entries(offersMap).forEach(([coordinates, offers]) => {
				offers.forEach((offer) => {
					offer.coordinatesString = JSON.parse(offer.coordinatesString as string);
				});
			});

			return offersMap;
		} catch (error) {
			console.error(error);
			return {};
		}
	}

	static async useOffer(data: UseOfferDto) {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const response = await trackPromise(
				api.post('/offers/use', data, {
					headers: HEADERS_WITH_AUTH
				})
			);

			if (response.status !== StatusCode.NoContent) {
				throw new Error(`Server error: ${response.status}`);
			}

			return response;
		} catch (error: any) {
			throw error.response.data;
		}
	}

	static async getFullOffer(offerId: string, latitude: string, longitude: string) {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: 'GET',
				headers: HEADERS_WITH_AUTH
			};

			const params = new URLSearchParams({
				latitude,
				longitude,
				currentDay: DateUtils.getCurrentDay()
			});

			const response = await trackPromise(api.get(`/offers/details/${offerId}?${params.toString()}`, requestObj));

			if (response.status !== StatusCode.Ok) {
				throw Error(response.status.toString());
			}

			return response.data;
		} catch (error) {
			throw error;
		}
	}
	static async getOffers(
		currentPage: number,
		latitude: number,
		longitude: number,
		offerType: number,
		searchKeyword?: string
	): Promise<OfferMobileListDto[]> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: 'GET',
				headers: HEADERS_WITH_AUTH
			};

			const params = new URLSearchParams({
				page: currentPage.toString(),
				latitude: latitude.toString(),
				longitude: longitude.toString(),
				currentDay: DateUtils.getCurrentDay(),
				offerType: offerType.toString()
			});

			if (searchKeyword && searchKeyword.length >= MINIMUM_SEARCH_KEYWORD_LENGTH) {
				params.append('searchKeyword', searchKeyword);
			}

			const response = await trackPromise(api.get(`/offers/list?${params.toString()}`, requestObj));

			if (response.status !== StatusCode.Ok) {
				throw new Error(`Error fetching offers: ${response.statusText}`);
			}

			const offers: OfferMobileListDto[] = await response.data;

			offers.forEach((offer: any) => {
				offer.coordinatesString = JSON.parse(offer.coordinatesString);
			});

			return offers;
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	static async searchOffersByKeyword(searchKeyword: string): Promise<string[]> {
		if (searchKeyword.length < MINIMUM_SEARCH_KEYWORD_LENGTH) {
			throw new Error('Search keyword must have at least 3 characters');
		}

		if (searchKeyword.length > 100) {
			throw new Error('Search keyword must have at maximum 100 characters');
		}

		const HEADERS_WITH_AUTH = await AUTH_HEADER();

		const requestObj = {
			method: 'GET',
			headers: HEADERS_WITH_AUTH
		};

		try {
			const response = await trackPromise(
				api.get(`/offers/search?searchKeyword=${encodeURIComponent(searchKeyword)}`, requestObj)
			);

			if (response.status !== StatusCode.Ok) {
				throw Error(response.status.toString());
			}

			const data = await response.data;
			return data;
		} catch (error) {
			console.error('Error searching offers:', error);
			return [];
		}
	}
}

export default OfferService;
