export class AssignPassholderGrants {
	public passholderIds: string[];
	public grantsIds: string[];

	constructor(passholderIds: string[], grantsIds: string[]) {
		this.passholderIds = passholderIds;
		this.grantsIds = grantsIds;
	}
}
