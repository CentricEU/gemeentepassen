import { SupplierStatus } from '../_enums/supplier-status.enum';

export class UserDto {
	public companyName: string;
	public kvkNumber: string;
	public email: string;
	public status: SupplierStatus;
	public isProfileSet: boolean;
	public supplierId: string;
	public hasStatusUpdate: boolean;
	public isApproved: boolean;
	public tenantName?: string;
	[key: string]: string | boolean | undefined;
}
