import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'frontend-chip-remaining-dialog',
	templateUrl: './chip-remaining-dialog.component.html',
	standalone: false,
})
export class ChipRemainingDialogComponent {
	public arrayOfChips: [];
	public chipTitleColumn: string;
	constructor(
		@Inject(MAT_DIALOG_DATA) data: any,
		private readonly dialogRef: MatDialogRef<ChipRemainingDialogComponent>,
	) {
		this.arrayOfChips = data.arrayOfChips;
		this.chipTitleColumn = data.chipTitleColumn;
	}

	public close(): void {
		this.dialogRef.close();
	}
}
