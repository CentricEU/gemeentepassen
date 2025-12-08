import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CheckboxData, CitizenGroupsService, FileExtension, FormUtil } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { PassholdersService } from '../../_services/passholders.service';

@Component({
	selector: 'frontend-import-passholders',
	templateUrl: './import-passholders.component.html',
	styleUrls: ['./import-passholders.component.scss'],
	standalone: false,
})
export class ImportPassholdersComponent implements OnInit {
	private readonly formBuilder = inject(FormBuilder);
	private readonly passholderService = inject(PassholdersService);
	private readonly translateService = inject(TranslateService);
	private readonly toastrService = inject(ToastrService);
	private readonly dialogRef = inject(MatDialogRef<ImportPassholdersComponent>);
	private readonly citizenGroupsService = inject(CitizenGroupsService);

	public file: File;
	public importPassholdersForm: FormGroup;
	public citizenGroupData: CheckboxData[];

	public get acceptedFormats(): FileExtension[] {
		return [FileExtension.CSV];
	}

	public get isImportDisabled(): boolean {
		return !(this.file && this.importPassholdersForm?.get('citizenGroup')?.value);
	}

	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;

	public ngOnInit(): void {
		this.initForm();
		this.loadInitialData();
	}

	public close(success?: string): void {
		this.dialogRef.close(success);
	}

	public onFileSelected(file: File): void {
		this.file = file;
	}

	public uploadCsv(): void {
		const selectedCitizenGroup = this.importPassholdersForm.get('citizenGroup')?.value;

		this.passholderService.uploadCSV(this.file, selectedCitizenGroup).subscribe(() => {
			this.showToastSuccessfulImport();
			this.dialogRef.close(true);
		});
	}

	private initForm(): void {
		this.importPassholdersForm = this.formBuilder.group({
			citizenGroup: ['', [Validators.required]],
		});

		if (this.citizenGroupData) {
			this.citizenGroupData.forEach((citizenGroup: { formControl: string }) => {
				this.importPassholdersForm.addControl(citizenGroup.formControl, this.formBuilder.control(false));
			});
		}
	}

	private loadInitialData(): void {
		this.citizenGroupsService.getCitizenGroups().subscribe((data) => {
			this.citizenGroupData = data.map((citizenGroup) => ({
				id: citizenGroup.id,
				label: citizenGroup.groupName,
				formControl: `formControlCitizenGroup-${citizenGroup.groupName}`,
				dataTestId: `citizenGroup-${citizenGroup.groupName}`,
			}));

			this.citizenGroupData.forEach((citizenGroup) => {
				this.importPassholdersForm.addControl(citizenGroup.formControl, this.formBuilder.control(false));
			});

			if (this.citizenGroupData.length === 1) {
				this.importPassholdersForm.get('citizenGroup')?.setValue(this.citizenGroupData[0].id);
			}
		});
	}

	private showToastSuccessfulImport(): void {
		const toastText = this.translateService.instant('passholders.successImport');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
	}
}
