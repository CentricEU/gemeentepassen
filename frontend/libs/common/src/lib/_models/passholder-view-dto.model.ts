import { GenericTableData } from './generic-table-data.model';

export class PassholderViewDto extends GenericTableData {
	public id: string;
	public name: string;
	public bsn: string;
	public address: string;
	public passNumber: string;
	public residenceCity: string;
	public expiringDate: Date;
	public citizenGroupName: string;

	constructor(
		id: string,
		address: string,
		name: string,
		bsn: string,
		passNumber: string,
		residenceCity: string,
		expiringDate: Date,
		citizenGroupName: string,
	) {
		super();
		this.address = address;
		this.name = name;
		this.bsn = bsn;
		this.passNumber = passNumber;
		this.residenceCity = residenceCity;
		this.expiringDate = expiringDate;
		this.id = id;
		this.citizenGroupName = citizenGroupName;
	}
}
