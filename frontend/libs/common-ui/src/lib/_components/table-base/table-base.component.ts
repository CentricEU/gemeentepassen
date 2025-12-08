import { Component, Input } from '@angular/core';
import { TableColumn } from '@frontend/common';

@Component({
	selector: 'frontend-table-base',
	template: '',
	standalone: false,
})
export class TableBaseComponent {
	@Input() public dataCount: number;
	public allColumns: TableColumn[];
}
