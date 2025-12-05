import { SupplierViewDto } from '@frontend/common';

export class MunicipalityMockUtil {
	public static createSuppliersArray(count: number): SupplierViewDto[] {
		const returnArray = [];
		for (let i = 0; i < count; i++) {
			returnArray.push(
				new SupplierViewDto(
					'id' + i,
					'name' + i,
					'kvk1' + i,
					'accountManager' + i,
					'district' + i,
					'category',
					new Date(),
					'status',
				),
			);
		}
		return returnArray;
	}
}
