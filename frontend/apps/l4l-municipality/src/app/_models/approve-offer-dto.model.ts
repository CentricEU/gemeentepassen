export class ApproveOfferDto {
	public offerId: string;
	public version: number;

	constructor(offerId: string, version: number) {
		this.offerId = offerId;
		this.version = version;
	}
}
