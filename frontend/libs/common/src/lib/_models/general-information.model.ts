export class GeneralInformation {
	public companyName: string;
	public adminEmail: string;
	public logo?: string;
	public kvkNumber: string;
	public ownerName: string;
	public legalForm: string;
	public group: string;
	public category: string;
	public subcategory: string;
	public iban: string;
	public bic?: string;
	public fileName?: string;
	[key: string]: string | undefined;

	constructor() {
		this.companyName = '';
		this.adminEmail = '';
		this.kvkNumber = '';
		this.ownerName = '';
		this.legalForm = '';
		this.group = '';
		this.category = '';
		this.subcategory = '';
		this.iban = '';
	}
}
