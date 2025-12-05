import { LatLon } from "./latLon";
import { OfferMobileDetailDto } from "./offerMobileDetailDto";
import { OfferType } from "./offerType";

export type OfferMobileMapLightDto = {
	id: string;
	title: string;
	description: string;
	offerType: OfferType;
	coordinatesString: LatLon | string;
	isActive: boolean;
	loadedOffer?: OfferMobileDetailDto;

};
