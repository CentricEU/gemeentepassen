import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FileExtension } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@windmill/ng-windmill';

import { PassholdersService } from '../../_services/passholders.service';

@Component({
	selector: 'frontend-import-passholders',
	templateUrl: './import-passholders.component.html',
	styleUrls: ['./import-passholders.component.scss'],
})
export class ImportPassholdersComponent {
	public file: File;

	public get acceptedFormats(): FileExtension[] {
		return [FileExtension.CSV];
	}

	public get isImportDisabled(): boolean {
		return !this.file;
	}

	constructor(
		private passholderService: PassholdersService,
		private readonly toastrService: ToastrService,
		private translateService: TranslateService,
		private readonly dialogRef: MatDialogRef<ImportPassholdersComponent>,
	) {}

	public close(success?: string): void {
		this.dialogRef.close(success);
	}

	public onFileSelected(file: File): void {
		this.file = file;
	}

	public uploadCsv(): void {
		this.passholderService.uploadCSV(this.file).subscribe(() => {
			this.showToastSuccessfulImport();
			this.dialogRef.close(true);
		});
	}

	private showToastSuccessfulImport(): void {
		const toastText = this.translateService.instant('passholders.successImport');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
	}
}
