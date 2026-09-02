import { StatusUpdate } from '../_enums/status-update.enum';
import { SupplierStatus } from '../_enums/supplier-status.enum';

export class UserDto {
	public companyName: string;
	public kvkNumber: string;
	public email: string;
	public status: SupplierStatus;
	public isProfileSet: boolean;
	public supplierId: string;
	public statusUpdate?: StatusUpdate;
	public isApproved: boolean;
	public tenantName?: string;
	public firstName: string;
	public lastName: string;
	[key: string]: string | boolean | undefined;
}
