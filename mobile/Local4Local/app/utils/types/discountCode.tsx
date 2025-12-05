import { OfferType } from "./offerType";

export type DiscountCodeDto = {
	expirationDate: Date;
	companyName: string;
	code: string;
	offerType: OfferType;
	companyLogo: string;
	isActive: boolean;
	amount: number;
};
