export class SupplierProfile {
	public companyName: string;
	public adminEmail: string;
	public logo?: string;
	public kvkNumber: string;
	public ownerName: string;
	public legalForm: string;
	public group: string;
	public category: string;
	public subcategory: string;
	public companyBranchAddress: string;
	public branchProvince: string;
	public branchZip: string;
	public branchLocation: string;
	public branchTelephone?: string;
	public email?: string;
	public website?: string;
	public accountManager: string;
	public supplierId: string | undefined;
	[key: string]: string | undefined;
}
