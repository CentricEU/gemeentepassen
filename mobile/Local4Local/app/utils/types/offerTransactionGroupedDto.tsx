import { OfferType } from "./offerType";

export type OfferTransactionsGroupedDto = {
	offerTitle: string;
	supplierName: string;
	amount: number;
	createdDate: string;
	offerType: OfferType;
}