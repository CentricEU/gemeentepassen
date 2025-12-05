export class RejectOfferDto {
	public offerId: string;
	public reason: string;

	constructor(offerId: string, reason: string) {
		this.offerId = offerId;
		this.reason = reason;
	}
}
