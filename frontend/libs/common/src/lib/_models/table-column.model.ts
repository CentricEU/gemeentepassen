import { ColumnDataType } from '../_enums/column-data-type.enum';

export class TableColumn {
	columnLabel: string;
	isDefault?: boolean;
	isChecked?: boolean;
	isFixed?: boolean;
	property: string;
	value: string;
	useTranslation: boolean;
	columnDataType: ColumnDataType;

	constructor(
		columnLabel: string,
		property: string,
		value: string,
		isChecked: boolean | undefined,
		isDefault?: boolean | undefined,
		columnDataType: ColumnDataType = ColumnDataType.DEFAULT,
		isFixed?: boolean | undefined,
	) {
		this.isChecked = isChecked;
		this.columnLabel = columnLabel;
		this.isDefault = isDefault;
		this.property = property;
		this.columnDataType = columnDataType;
		this.value = value;
		this.isFixed = isFixed;
	}
}
