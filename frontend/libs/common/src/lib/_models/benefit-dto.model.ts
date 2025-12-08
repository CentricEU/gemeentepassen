export class BenefitDto {
	id?: string;
	name: string;
	description: string;
	startDate: Date | string;
	expirationDate: Date | string;
	citizenGroupIds: string[];
	amount: number;
	constructor(
		name: string,
		description: string,
		startDate: Date | string,
		expirationDate: Date | string,
		citizenGroupIds: string[],
		amount: number,
	) {
		this.name = name;
		this.description = description;
		this.startDate = startDate;
		this.expirationDate = expirationDate;
		this.citizenGroupIds = citizenGroupIds;
		this.amount = amount;
	}
}
