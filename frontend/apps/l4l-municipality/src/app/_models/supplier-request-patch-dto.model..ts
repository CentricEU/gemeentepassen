import { SupplierProfilePatchDto, WorkingHoursDto } from '@frontend/common';

export class SupplierRequestPatchDto {
	supplierId?: string;

	companyName?: string;

	kvkNumber?: string;

	adminEmail?: string;

	workingHours: WorkingHoursDto[] = [];

	profile?: SupplierProfilePatchDto;

	constructor(data?: Partial<SupplierRequestPatchDto>) {
		Object.assign(this, data);
	}
}
