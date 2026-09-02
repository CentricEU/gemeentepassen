export class FilterPassholdersRequestDto {
	public bsnFilter: string;
	public passholderNumberFilter: string;

	constructor(bsnFilter: string, passholderNumberFilter: string) {
		this.bsnFilter = bsnFilter;
		this.passholderNumberFilter = passholderNumberFilter;
	}
}
