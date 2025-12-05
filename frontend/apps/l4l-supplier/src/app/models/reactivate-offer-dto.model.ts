export class ReactivateOfferDto {
	public offerId: string;
	public startDate: Date;
	public expirationDate: Date;

	constructor(offerId: string, startDate: Date, expirationDate: Date) {
		this.offerId = offerId;
		this.startDate = startDate;
		this.expirationDate = expirationDate;
	}
}
