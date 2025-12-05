export class CodeValidationDto {
	public code: string;
	public currentTime: string;
	public amount?: number;
	public offerName?: string;
	public offerType?: number;

	constructor(code: string, currentTime: string, amount?: number, offerName?: string, offerType?: number) {
		this.code = code;
		this.currentTime = currentTime;
		this.amount = amount;
		this.offerName = offerName;
		this.offerType = offerType;
	}
}
