import { GenericTableData } from './generic-table-data.model';

export class BenefitTableDto extends GenericTableData {
	name: string;
	description: string;
	startDate: Date;
	expirationDate: Date;
	citizenGroupIds: string[];
	citizenGroupsDto?: { groupName: string }[];	
	amount: number;
	constructor(
		name: string,
		description: string,
		startDate: Date,
		expirationDate: Date,
		citizenGroupIds: string[],
		amount: number,
	) {
		super();
		this.name = name;
		this.description = description;
		this.startDate = startDate;
		this.expirationDate = expirationDate;
		this.citizenGroupIds = citizenGroupIds;
		this.amount = amount;
	}
}
