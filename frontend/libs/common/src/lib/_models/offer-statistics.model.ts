export class OfferStatisticsDto {
	offerTypeId: number;
	offerTypeLabel: string;
	citizenCount: number;
	[key: string]: number | string | undefined;

	constructor(offerTypeId: number, offerTypeLabel: string, citizenCount: number) {
		this.offerTypeId = offerTypeId;
		this.offerTypeLabel = offerTypeLabel;
		this.citizenCount = citizenCount;
	}
}
