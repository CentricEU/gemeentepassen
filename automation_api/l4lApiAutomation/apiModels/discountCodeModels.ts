import { OfferType } from './offerModels';

export interface DiscountCode {
	companyName: string;
	offerType: OfferType;
	expirationDate: Date;
	code: string;
	isActive: boolean;
	companyLogo: string;
	amount: number;
	offerTitle: string;
}

export interface ResponseDiscountCode {
	active: DiscountCode[];
	inactive: DiscountCode[];
}

export interface DiscountCodeValidation{
    code: string;
    currentTime: string;
    amount: number;
}

export interface DiscountCodeValidationResponse{
	code: string;
	currentTime: string;
	offerName: string;
	offerType : number;
}
