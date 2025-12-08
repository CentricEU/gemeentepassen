import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'frontend-custom-dialog',
	templateUrl: './custom-dialog.component.html',
	styleUrls: ['./custom-dialog.component.scss'],
	standalone: false,
})
export class CustomDialogComponent {
	@Input() customButton: boolean;

	public get isRejectionDialog(): boolean {
		return !!this.data.optionalText?.reason;
	}

	public get isShown(): boolean {
		return this.data.acceptButtonText;
	}

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		protected readonly dialogRef: MatDialogRef<CustomDialogComponent>,
	) {}

	public close(): void {
		this.dialogRef.close(false);
	}

	public accept(): void {
		this.dialogRef.close(true);
	}

	public shouldDisplayMainContent(): boolean {
		return this.data.mainContent && this.data.mainContent.length > 0;
	}
}
