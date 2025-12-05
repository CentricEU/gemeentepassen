import { CitizenOfferType } from "../enums/citizenOfferType";
import { LatLon } from "./latLon";
import { OfferType } from "./offerType";
import { WorkingHourDto } from "./workingHourDto";
import { Restrictions } from "./restriction";
import { OfferTransaction } from "./offerTransaction";

export type OfferMobileDetailDto = {
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
	grants: Object[];
	restrictions?: Restrictions;
	companyAddress: string;
	companyLogo: string;
	lastOfferTransaction?: OfferTransaction;
	workingHours: WorkingHourDto[];
	discountCode: string;
	isActive: boolean;
};
