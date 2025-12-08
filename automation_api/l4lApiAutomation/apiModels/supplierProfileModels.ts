export interface LatLon {
	longitude: number;
	latitude: number;
}
export interface WorkingHour {
	day: string;
	closeTime: string;
	openTime: string;
	isChecked: boolean;
}
export interface SupplierProfile {
	companyBranchAddress: string;
	branchProvince: string;
	branchZip: string;
	branchLocation: string;
	branchTelephone?: string;
	email: string;
	website?: string;
	accountManager: string;
	logo?: string;
	ownerName: string;
	kvkNumber: string;
	companyName: string;
	adminEmail: string;
	legalForm: number;
	group: number;
	category: number;
	subcategory: number;
	supplierId: string;
	iban: string;
	bic: string;
	coordinates: string;
	latLon: LatLon;
}