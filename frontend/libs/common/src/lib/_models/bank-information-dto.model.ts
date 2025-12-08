export class BankInformationDto {
	public iban: string;
	public bic?: string;

	constructor(iban: string, bic?: string) {
		this.bic = bic;
		this.iban = iban;
	}
}
