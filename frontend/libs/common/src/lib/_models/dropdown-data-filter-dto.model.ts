import { EnumValueDto } from './enum-value-dto.model';

export class DropdownDataFilterDto {
	public statuses: EnumValueDto[];
	public offerTypes: any;

	constructor(statuses: EnumValueDto[], targets: EnumValueDto[], offerTypes: EnumValueDto[]) {
		this.statuses = statuses;
		this.offerTypes = offerTypes;
	}
}
