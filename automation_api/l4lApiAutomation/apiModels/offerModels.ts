import { Grant } from './grantModels';
import { LatLon, WorkingHour } from './supplierProfileModels';

export interface OfferResponse {
	id: string;
	title: string;
	amount: number;
	citizenOfferType: string;
	offerType: string;
	validity: string;
	status: string;
	supplierName: string;
	supplierId: string;
	startDate: Date;
	expirationDate: Date;
	description: string;
	grants: Grant[];
}

export interface OfferReactivate {
	offerId: string;
	startDate: string;
	expirationDate: string;
}

export interface OfferRequest {
	title: string;
	description: string;
	citizenOfferType: string;
	amount: number;
	offerTypeId: number;
	startDate: Date;
	expirationDate: Date;
	grantsIds: string[];
	restrictionRequestDto?: Restriction;
}

export interface Restriction {
	ageRestriction: number;
	frequencyOfUse: string;
	minPrice: number;
	maxPrice: number;
	timeFrom: string;
	timeTo: string;
}

export interface OfferUse {
	offerId: string;
	currentTime: string;
	amount: number;
}

export interface OfferReject {
	offerId: string;
	reason: string;
}

export interface OfferType {
	offerTypeId: number;
	offerTypeLabel: string;
}

export interface OfferCountsTimePeriod {
	activeCount: number;
	expiredCount: number;
	pendingCount: number;
}

export interface OfferFull {
	id: string;
	title: string;
	description: string;
	amount: number;
	citizenOfferType: string;
	offerTypeId: number;
	startDate: Date;
	expirationDate: Date;
	grants: Grant[];
	restrictionRequestDto: Restriction;
}

export interface OfferDetails {
	id: string;
	title: string;
	description: string;
	amount: number;
	citizenOfferType: string;
	offerType: OfferType;
	startDate: Date;
	expirationDate: Date;
	coordinatesString: LatLon;
	status: string;
	companyName: string;
	distance: number;
	companyAddress: string;
	companyCategory: string;
	restrictions: Restriction & { id: string };
	companyLogo: string;
	grants: Grant[];
	workingHours: WorkingHour[];
	discountCode: string;
	isActive: boolean;
}

export interface OffersMapViewport {
	minLat: number;
	maxLat: number;
	minLong: number;
	maxLong: number;
	currentDay: string;
	offerTypeId: number;
	searchKeyword?: string;
}

export interface OffersListViewport {
	page: number;
	latitude: number;
	longitude: number;
	currentDay: string;
	offerTypeId: number;
	searchKeyword?: string;
}
