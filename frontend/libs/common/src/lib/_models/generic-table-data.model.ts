import { TableActionButton } from './table-action-button.model';

export class GenericTableData {
	actionButtons?: TableActionButton[];
	selected: boolean;
	isCheckboxDisabled = false;
}
