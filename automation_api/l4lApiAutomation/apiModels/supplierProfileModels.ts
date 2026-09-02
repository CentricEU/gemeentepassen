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
export interface SupplierProfilePatchDto {
	logo?: string;
	ownerName: string;
	legalForm: number;
	group: number;
	category: number;
	subcategory: number;
	iban: string;
	bic: string;
	companyBranchAddress: string;
	branchProvince: string;
	branchZip: string;
	branchLocation: string;
	branchTelephone?: string;
	email: string;
	website?: string;
	accountManager: string;
	supplierId: string;
	latlon: LatLon;
	workingHours: WorkingHour[];
	cashierEmails: string[];
}

export interface SupplierProfileRequestDto {
	companyName: string;
	kvkNumber: string;
	adminEmail: string;
	supplierProfilePatchDto: SupplierProfilePatchDto;
}
