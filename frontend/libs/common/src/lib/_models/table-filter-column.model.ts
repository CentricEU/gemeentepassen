import { EnumValueDto } from './enum-value-dto.model';

export class TableFilterColumn {
	filterName: string;
	source: EnumValueDto[];
	placeholder: string;
	filteredSource: EnumValueDto[];

	constructor(filterName: string, source: EnumValueDto[], placeholder: string) {
		this.filterName = filterName;
		this.source = source;
		this.placeholder = placeholder;
		this.filteredSource = source;
	}
}
