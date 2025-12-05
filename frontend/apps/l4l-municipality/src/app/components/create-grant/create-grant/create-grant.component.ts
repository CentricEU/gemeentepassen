import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormUtil, GrantDto, GrantHolder, GrantService, ModalData, WarningDialogData } from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { CentricCounterMessages, DialogService, ToastrService } from '@windmill/ng-windmill';

import { Grant } from '../../../_models/grant.model';
import { CreateGrantFormFields } from '../../../enums/create-grant-form-field.enum';

@Component({
	selector: 'frontend-create-grant',
	templateUrl: './create-grant.component.html',
	styleUrls: ['./create-grant.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateGrantComponent implements OnInit {
	public createGrantForm: FormGroup;
	public typeOfHolder = ['grants.cardHolder', 'grants.childrenHolder'];
	public isEditable = false;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	public expirationDateInit = FormUtil.calculateExpirationDate;
	public counterMessages: CentricCounterMessages = FormUtil.getTextAreaCounterMessages(this.translateService);

	public get title(): string {
		return this.grantData ? 'grants.editGrant' : 'grants.addGrant';
	}

	constructor(
		private formBuilder: FormBuilder,
		private translateService: TranslateService,
		private readonly dialogRef: MatDialogRef<CreateGrantComponent>,
		private grantService: GrantService,
		@Inject(MAT_DIALOG_DATA) public grantData: GrantDto,
		private cdr: ChangeDetectorRef,
		private readonly dialogService: DialogService,
		private readonly toastrService: ToastrService,
	) {}

	public ngOnInit(): void {
		this.init();
		this.setIsEditable();

		this.dialogRef.backdropClick().subscribe(() => {
			this.close();
		});
	}

	public getErrorMessageFormInputs(value: string): string | null {
		switch (value) {
			case CreateGrantFormFields.title:
				return this.translateService.instant('grants.titleFormControlRequired');
			case CreateGrantFormFields.description:
				return this.translateService.instant('grants.descriptionFormControlRequired');
			case CreateGrantFormFields.amount:
				return this.translateService.instant('genericFields.amount.amountFormControlRequired');
			case CreateGrantFormFields.validity:
				return this.translateService.instant('grants.validityFormControlRequired');
			default: {
				return null;
			}
		}
	}

	public displayValidityError(): boolean {
		return this.isControlInvalid('startDate') || this.isControlInvalid('expirationDate');
	}

	public close(value?: string): void {
		if (!this.isEditable) {
			this.dialogRef.close(value);
			return;
		}

		const config = this.createWarningDialogConfig();
		this.dialogService
			.message(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				if (!data) {
					return;
				}
				this.dialogRef.close(value);
			});
	}

	private isControlInvalid(controlName: string): boolean {
		const control = this.createGrantForm.controls[controlName];
		return control?.touched && !control.valid;
	}

	private createWarningDialogConfig(): MatDialogConfig {
		const data = new WarningDialogData();

		const modal = new ModalData(
			'general.warning',
			'',
			'grants.editWarningMessage',
			'general.button.stay',
			'general.button.cancel',
			false,
			'warning',
			'theme',
			'',
			data,
		);
		return CustomDialogConfigUtil.createMessageModal(modal);
	}

	public onStartDateChange(): void {
		const startDate = new Date(this.createGrantForm.controls['startDate'].value).getTime();
		const expirationDate = new Date(this.createGrantForm.controls['expirationDate'].value).getTime();

		if (startDate > expirationDate) {
			this.createGrantForm.controls['expirationDate'].setValue('');
			this.createGrantForm.controls['expirationDate'].markAsTouched();
		}
	}

	public isFormValid(): boolean {
		return this.createGrantForm.valid && !this.createGrantForm.pristine;
	}

	public saveGrant(): void {
		if (!this.grantData) {
			this.saveNewGrant();
		} else {
			this.updateGrant();
		}
	}

	private saveNewGrant(): void {
		const toastText = this.translateService.instant('grants.success');

		this.grantService.createGrant(this.mapData()).subscribe((result) => {
			if (!result) {
				return;
			}

			this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
			this.dialogRef.close(true);
		});
	}

	private updateGrant(): void {
		const grantToUpdate = this.mapData();
		grantToUpdate.id = this.grantData.id;

		const toastText = this.translateService.instant('general.success.changesSavedText');

		this.grantService.editGrant(grantToUpdate).subscribe((result) => {
			if (!result) {
				return;
			}

			this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
			this.dialogRef.close(true);
		});
	}

	private mapData(): GrantDto {
		const createGrantFormData: GrantDto = {
			...this.createGrantForm.value,
			startDate: FormUtil.normalizeDate(this.createGrantForm.controls['startDate'].value),
			expirationDate: FormUtil.normalizeDate(this.createGrantForm.controls['expirationDate'].value),
		};

		if (createGrantFormData.createFor === this.typeOfHolder[0]) {
			createGrantFormData.createFor = GrantHolder.PASS_OWNER;
		} else {
			createGrantFormData.createFor = GrantHolder.PASS_CHILD;
		}

		return createGrantFormData;
	}

	private init(): void {
		const poplateData = this.populateData();

		this.createGrantForm = this.formBuilder.group({
			title: [poplateData.title, [Validators.required]],
			description: [poplateData.description, [Validators.required]],
			amount: [poplateData.amount, [Validators.required]],
			createFor: [poplateData.createFor, [Validators.required]],
			startDate: [poplateData.startDate, [Validators.required]],
			expirationDate: [poplateData.expirationDate, [Validators.required]],
		});

		if (this.grantData) {
			this.createGrantForm.markAsPristine();
			this.cdr.detectChanges();
		}
	}

	private populateData(): Grant {
		const grant: Grant = {
			title: this.grantData?.title || '',
			description: this.grantData?.description || '',
			amount: this.grantData?.amount?.toString() || '',
			createFor: this.beneficiary(this.grantData?.createFor),
			startDate: this.grantData?.startDate?.toString() || '',
			expirationDate: this.grantData?.expirationDate?.toString() || '',
		};

		return grant;
	}

	private setIsEditable(): void {
		this.isEditable = !!this.grantData;
	}

	private beneficiary(grantHolder?: GrantHolder): string {
		if (!this.grantData?.createFor) return this.typeOfHolder[0];
		return grantHolder === GrantHolder.PASS_OWNER ? this.typeOfHolder[0] : this.typeOfHolder[1];
	}
}
