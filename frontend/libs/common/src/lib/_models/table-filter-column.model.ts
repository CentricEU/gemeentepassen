import { EnumValueDto } from './enum-value-dto.model';

export class TableFilterColumn {
	filterName: string;
	source: EnumValueDto[];
	placeholder: string;
	filteredSource: EnumValueDto[];
	filterType?: 'text' | 'dropdown';

	constructor(filterName: string, source: EnumValueDto[], placeholder: string, filterType?: 'text' | 'dropdown') {
		this.filterName = filterName;
		this.source = source;
		this.placeholder = placeholder;
		this.filteredSource = source;
		this.filterType = filterType ?? 'dropdown';
	}
}
