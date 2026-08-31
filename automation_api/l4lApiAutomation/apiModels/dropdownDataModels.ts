export interface OfferType {
	offerTypeId: number;
	offerTypeLabel: string;
	enabled: boolean;
}

export interface Statuses {
	key: string;
	value: string;
}

export interface DropdownDataFilterDto {
	statuses: Statuses[];
	offerTypes: OfferType[];
}
