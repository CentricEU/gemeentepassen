import { RejectionReason } from '../_enums/rejection-reason.enum';

export class RejectSupplierDto {
	public reason: RejectionReason;
	public comments?: string;
	public supplierId: string;
	public tenantName?: string;
}
