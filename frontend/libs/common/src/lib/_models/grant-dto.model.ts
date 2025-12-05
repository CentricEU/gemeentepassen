import { GrantHolder } from '../_enums/grant-holder.enum';
import { GenericTableData } from './generic-table-data.model';

export class GrantDto extends GenericTableData {
	public id?: string;
	public title: string;
	public description: string;
	public amount: number;
	public createFor: GrantHolder;
	public startDate: Date;
	public expirationDate: Date;
	public nrBeneficiaries?: number;
	public tableAmount?: string;
	public validity?: string;
	public beneficiaries?: string;

	constructor(
		id: string,
		title: string,
		description: string,
		amount: number,
		createFor: GrantHolder,
		startDate: Date,
		expirationDate: Date,
		nrBeneficiaries?: number,
		tableAmount?: string,
		validity?: string,
		beneficiaries?: string,
	) {
		super();
		this.id = id;
		this.title = title;
		this.description = description;
		this.amount = amount;
		this.createFor = createFor;
		this.startDate = startDate;
		this.expirationDate = expirationDate;
		this.nrBeneficiaries = nrBeneficiaries;
		this.tableAmount = tableAmount;
		this.beneficiaries = beneficiaries;
		this.validity = validity;
	}
}
