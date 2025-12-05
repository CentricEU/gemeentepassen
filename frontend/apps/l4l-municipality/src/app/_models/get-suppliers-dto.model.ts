import { SupplierStatus } from '@frontend/common';

export class GetSuppliersDto {
	public pageIndex: string;
	public perPage: string;
	public tenantId: string;
	public status: string;
	constructor(pageIndex: number, perPage: number, tenantId: string, status: SupplierStatus | string) {
		this.pageIndex = pageIndex.toString();
		this.perPage = perPage.toString();
		this.tenantId = tenantId;
		this.status = status;
	}
}
