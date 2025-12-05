import { trackPromise } from "react-promise-tracker";
import { apiPath } from "../utils/constants/api";
import { AUTH_HEADER } from "../utils/constants/headers";
import { UseOfferDto } from "../utils/models/UseOfferDto";
import { OfferMobileListDto } from "../utils/types/offerMobileListDto";
import { OffersMapDto } from "../utils/types/offerMapDto";
import { Region } from "react-native-maps";
import DateUtils from "../utils/DateUtils";

class OfferService {
	static async getMapOffersWithViewport(
		region: Region
	): Promise<OffersMapDto> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: "GET",
				headers: HEADERS_WITH_AUTH,
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
			});

			const response = await trackPromise(fetch(`${apiPath}/offers/map-with-viewport?${params.toString()}`, requestObj));
			const offersMap: OffersMapDto = await response.json();

			Object.entries(offersMap).forEach(([coordinates, offers]) => {
				offers.forEach((offer) => {
					offer.coordinatesString = JSON.parse(
						offer.coordinatesString as string
					);
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

			const requestObj = {
				method: "POST",
				headers: HEADERS_WITH_AUTH,
				body: JSON.stringify(data),
			};


			const response = await trackPromise(fetch(`${apiPath}/offers/use`, requestObj));
			if (!response.ok) {
				throw Error(response.status.toString());
			}

			return response;
		} catch (error) {
			throw error;
		}
	}

	static async getFullOffer(
		offerId: string,
		latitude: string,
		longitude: string
	) {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: "GET",
				headers: HEADERS_WITH_AUTH,
			};

			const params = new URLSearchParams({
				latitude,
				longitude,
				currentDay: DateUtils.getCurrentDay(),
			});


			const response = await trackPromise(fetch(`${apiPath}/offers/details/${offerId}?${params.toString()}`, requestObj));

			if (!response.ok) {
				throw Error(response.status.toString());
			}

			return response.json();
		} catch (error) {
			throw error;
		}
	}

	static async getOffers(
		currentPage: number,
		latitude: number,
		longitude: number
	): Promise<OfferMobileListDto[]> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: "GET",
				headers: HEADERS_WITH_AUTH,
			};

			const response = await trackPromise(
				fetch(
					`${apiPath}/offers/list?page=${currentPage}&latitude=${latitude}&longitude=${longitude}&currentDay=${DateUtils.getCurrentDay()}`,
					requestObj
				)
			);

			const offers: OfferMobileListDto[] = await response.json();

			offers.forEach((offer: any) => {
				offer.coordinatesString = JSON.parse(offer.coordinatesString);
			});

			return offers;
		} catch (error) {
			console.error(error);
			return [];
		}
	}
}

export default OfferService;
