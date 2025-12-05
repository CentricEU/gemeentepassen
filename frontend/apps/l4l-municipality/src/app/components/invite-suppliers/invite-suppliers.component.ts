import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonUtil, FormUtil, ModalData, RegexUtil, WarningDialogData } from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { CentricCounterMessages, DialogService } from '@windmill/ng-windmill';

import { InviteSuppliersDto } from '../../_models/invite-suppliers-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';

@Component({
	selector: 'frontend-invite-suppliers',
	templateUrl: './invite-suppliers.component.html',
	styleUrls: ['./invite-suppliers.component.scss'],
})
export class InviteSuppliersComponent implements OnInit {
	public inviteSuppliersForm: FormGroup;
	public supplierEmails: Set<string> = new Set<string>();
	public emailError = '';
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	public getEmailErrorMessage = FormUtil.getEmailErrorMessage;
	public counterMessages: CentricCounterMessages = FormUtil.getTextAreaCounterMessages(this.translateService);

	constructor(
		private readonly dialogRef: MatDialogRef<InviteSuppliersComponent>,
		private formBuilder: FormBuilder,
		private suppliersService: MunicipalitySupplierService,
		private dialogService: DialogService,
		private translateService: TranslateService,
		@Inject(MAT_DIALOG_DATA) public data?: { email: string },
	) {}

	public ngOnInit(): void {
		this.initForm();

		if (this.data) {
			this.addEmailToList(this.data.email);
		}

		this.dialogRef.backdropClick().subscribe(() => {
			this.close();
		});
	}

	public handleKeydown(event: KeyboardEvent): void {
		if (CommonUtil.isEnterOrSpace(event.key)) {
			event.preventDefault();
			this.handleKeyPressed();
		}
	}

	public close(value?: string): void {
		if (this.inviteSuppliersForm.valid || this.supplierEmails.size > 0) {
			this.openWarningModal();
			return;
		}

		this.dialogRef.close(value);
	}

	private handleKeyPressed(): void {
		const emailRegex = RegexUtil.emailRegexPattern;
		const email = this.inviteSuppliersForm.controls['email'].value;

		if (!email || !emailRegex.test(email)) {
			this.emailError = 'genericFields.email.validEmail';
			return;
		}

		if (this.supplierEmails.has(email)) {
			this.emailError = 'inviteSuppliers.emailAlreadyInList';
			return;
		}

		if (this.supplierEmails.size >= 50) {
			this.emailError = 'inviteSuppliers.emailsLimitReached';
			return;
		}

		this.addEmailToList(email);
		this.emailError = '';
		this.inviteSuppliersForm.controls['email'].setValue('');
	}

	public removeEmailFromList(email: string): void {
		this.supplierEmails.delete(email);
	}

	public isFormValid(): boolean {
		return this.inviteSuppliersForm.valid && this.supplierEmails.size > 0;
	}

	public sendInvitations(): void {
		const inviteSuppliersDto = this.getFormValuesToInviteSuppliersDto();

		this.suppliersService.inviteSuppliers(inviteSuppliersDto).subscribe(() => {
			this.dialogRef.close(true);
		});
	}

	public openWarningModal(): void {
		const data = new WarningDialogData();

		this.dialogService
			.message(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						'inviteSuppliers.leavingWarning',
						'general.button.stay',
						'general.button.cancel',
						false,
						'warning',
						'theme',
						'',
						data,
					),
				),
				width: '400px',
			})
			?.afterClosed()
			.subscribe((result) => {
				if (result) {
					this.dialogRef.close();
				}
			});
	}

	private addEmailToList(email: string): void {
		this.supplierEmails.add(email);
	}

	private initForm(): void {
		this.inviteSuppliersForm = this.formBuilder.group({
			invitationMessage: ['', [Validators.required, Validators.maxLength(1024)]],
			email: [''],
		});
	}

	private getFormValuesToInviteSuppliersDto(): InviteSuppliersDto {
		return new InviteSuppliersDto(
			[...this.supplierEmails],
			this.inviteSuppliersForm.controls['invitationMessage'].value,
		);
	}
}
