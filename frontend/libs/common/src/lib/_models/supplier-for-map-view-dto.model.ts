export class SupplierForMapViewDto {
	public id: string;
	public companyName: string;
	public coordinatesString: string;

	constructor(id: string, companyName: string, coordinatesString: string) {
		this.id = id;
		this.companyName = companyName;
		this.coordinatesString = coordinatesString;
	}
}
