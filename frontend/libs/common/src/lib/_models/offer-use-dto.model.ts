export class OfferUseDto {
	public passholderId: string;
	public offerId: string;
	public amount?: number;
	public currentTime: string;

	constructor(passholderId: string, offerId: string, currentTime: string, amount?: number) {
		this.passholderId = passholderId;
		this.offerId = offerId;
		this.currentTime = currentTime;
		this.amount = amount ? amount : 0.0;
	}
}
