export class BenefitDto {
	id?: string;
	name: string;
	description: string;
	startDate: Date | string;
	expirationDate: Date | string;
	citizenGroupIds: string[];
	amount: number;
	status?: string;
	constructor(
		name: string,
		description: string,
		startDate: Date | string,
		expirationDate: Date | string,
		citizenGroupIds: string[],
		amount: number,
		status: string,
	) {
		this.name = name;
		this.description = description;
		this.startDate = startDate;
		this.expirationDate = expirationDate;
		this.citizenGroupIds = citizenGroupIds;
		this.amount = amount;
		this.status = status;
	}
}
