import { OfferType } from "./offerType";

export type DiscountCodeDto = {
	expirationDate: Date;
	companyName: string;
	code: string;
	offerType: OfferType;
	offerTitle: string;
	companyLogo: string;
	isActive: boolean;
	amount: number;
};
