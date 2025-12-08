import { SupplierCoordinates } from './supplier-coordinates.model';
import { WorkingHoursDto } from './working-hours.model';

export class SupplierProfilePatchDto {
	public logo?: string;
	public ownerName: string;
	public legalForm: number;
	public group: number;
	public category: number;
	public subcategory: number;
	public companyBranchAddress: string;
	public branchProvince: string;
	public branchZip: string;
	public branchLocation: string;
	public branchTelephone?: string;
	public email?: string;
	public website?: string;
	public accountManager: string;
	public supplierId: string | undefined;
	public latlon?: SupplierCoordinates;
	public workingHours?: WorkingHoursDto[];
	public cashierEmails?: Set<string>;
}
