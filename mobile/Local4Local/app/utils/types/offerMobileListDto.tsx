import { CitizenOfferType } from "../enums/citizenOfferType";
import { BenefitLightDto } from "./benefitLightDto";
import { LatLon } from "./latLon";
import { OfferType } from "./offerType";
import { WorkingHourDto } from "./workingHourDto";

export type OfferMobileListDto = {
	id: string;
	title: string;
	description: string;
	amount: number;
	citizenOfferType: CitizenOfferType;
	offerType: OfferType;
	startDate: Date;
	expirationDate: Date;
	coordinatesString: LatLon;
	companyName: string;
	distance: number;
	benefit: BenefitLightDto;
	workingHours: WorkingHourDto[];
	isActive: boolean;
};
