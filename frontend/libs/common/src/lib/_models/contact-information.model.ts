export class ContactInformation {
	public companyBranchAddress: string;
	public branchProvince: string;
	public branchZip: string;
	public branchLocation: string;
	public branchTelephone?: string;
	public email?: string;
	public website?: string;
	public accountManager: string;
	[key: string]: string | undefined;

	constructor() {
		this.companyBranchAddress = '';
		this.branchProvince = '';
		this.branchZip = '';
		this.branchLocation = '';
		this.branchTelephone = '';
		this.email = '';
		this.website = '';
		this.accountManager = '';
	}
}
