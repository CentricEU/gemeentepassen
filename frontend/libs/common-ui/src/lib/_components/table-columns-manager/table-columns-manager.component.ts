import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TableColumn } from '@frontend/common';

@Component({
	selector: 'frontend-table-columns-manager',
	templateUrl: './table-columns-manager.component.html',
	styleUrls: ['./table-columns-manager.component.scss'],
	standalone: false,
})
export class TableColumnsManagerComponent implements OnInit {
	public tableColumns: TableColumn[];
	public initialTableColumnsState: boolean[];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private readonly dialogRef: MatDialogRef<TableColumnsManagerComponent>,
	) {
		this.tableColumns = data.tableColumns;
	}

	public ngOnInit(): void {
		this.initializeTableColumnsState();
	}

	public close(): void {
		this.dialogRef.close(false);
	}

	public accept(): void {
		this.dialogRef.close(this.tableColumns);
	}

	public isButtonDisabled(): boolean {
		return this.tableColumns.every(
			(column, index) => (column.isChecked ?? false) === this.initialTableColumnsState[index],
		);
	}

	private initializeTableColumnsState(): void {
		this.initialTableColumnsState = this.tableColumns.map((column) => column.isChecked ?? false);
	}
}
