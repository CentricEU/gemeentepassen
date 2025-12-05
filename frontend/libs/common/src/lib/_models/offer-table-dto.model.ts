import { GenericStatusEnum } from '../_enums/generic-status.enum';
import { GenericTableData } from './generic-table-data.model';

export class OfferTableDto extends GenericTableData {
	public id?: string;
	public title: string;
	public amount?: number;
	public citizenOfferType: string;
	public offerType: string;
	public validity: string;
	public supplierId: string;
	public status: GenericStatusEnum;
	public supplierName?: string;

	constructor(
		id: string,
		title: string,
		amount: number,
		citizenOfferType: string,
		offerType: string,
		validity: string,
		status: GenericStatusEnum,
		supplierName = '',
		supplierId: string,
	) {
		super();
		this.id = id;
		this.title = title;
		this.amount = amount;
		this.citizenOfferType = citizenOfferType;
		this.offerType = offerType;
		this.validity = validity;
		this.status = status;
		this.supplierName = supplierName;
		this.supplierId = supplierId;
	}
}
