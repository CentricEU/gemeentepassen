export class OfferRejectionReasonDto {
	public offerId: string;
	public offerTitle: string;
	public reason: string;

	constructor(offerId: string, offerTitle: string, reason: string) {
		this.offerId = offerId;
		this.offerTitle = offerTitle;
		this.reason = reason;
	}
}
