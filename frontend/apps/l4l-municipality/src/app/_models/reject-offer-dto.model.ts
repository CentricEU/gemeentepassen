export class RejectOfferDto {
	public offerId: string;
	public reason: string;
	public version: number;

	constructor(offerId: string, reason: string, version: number) {
		this.offerId = offerId;
		this.version = version;
		this.reason = reason;
	}
}
