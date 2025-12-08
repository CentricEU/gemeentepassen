import { GenericTableData } from './generic-table-data.model';

export class TransactionTableTenantDto extends GenericTableData {
	public id?: string;
	public passNumber: string;
	public citizenName: string;
	public amount: number;
	public suplierName: string;
	public benefit: string;
	public createdDate: string;
	public createdTime: string;

	constructor(
		id: string,
		passholderNumber: string,
		citizenName: string,
		amount: number,
		suplierName: string,
		benefit: string,
		createdDate: string,
		createdTime: string,
	) {
		super();
		this.id = id;
		this.passNumber = passholderNumber;
		this.citizenName = citizenName;
		this.amount = amount;
		this.suplierName = suplierName;
		this.benefit = benefit;
		this.createdDate = createdDate;
		this.createdTime = createdTime;
	}
}
