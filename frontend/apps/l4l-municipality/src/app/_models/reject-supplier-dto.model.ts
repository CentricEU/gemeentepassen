import { RejectionReason } from '@frontend/common';

export class RejectSupplierDto {
	public reason: RejectionReason;
	public comments?: string;
	public supplierId: string;

	constructor(reason: RejectionReason, supplierId: string, comments?: string) {
		this.reason = reason;
		this.supplierId = supplierId;
		this.comments = comments;
	}
}
