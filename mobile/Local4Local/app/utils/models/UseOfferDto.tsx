export class UseOfferDto {

	public offerId: string;
	public amount?: number;
	public currentTime: string;


	constructor(offerId: string, currentTime: string, amount?: number) {
		this.offerId = offerId;
		this.currentTime = currentTime;
		this.amount = amount? amount : 0.0;
	}

}

