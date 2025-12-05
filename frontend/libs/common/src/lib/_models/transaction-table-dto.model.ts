import { GenericTableData } from './generic-table-data.model';

export class TransactionTableDto extends GenericTableData {
	public id?: string;
	public passNumber: string;
	public citizenName: string;
	public amount: number;
	public createdDate: string;
	public createdTime: string;

	constructor(
		id: string,
		passholderNumber: string,
		citizenName: string,
		amount: number,
		createdDate: string,
		createdTime: string,
	) {
		super();
		this.id = id;
		this.passNumber = passholderNumber;
		this.citizenName = citizenName;
		this.amount = amount;
		this.createdDate = createdDate;
		this.createdTime = createdTime;
	}
}
