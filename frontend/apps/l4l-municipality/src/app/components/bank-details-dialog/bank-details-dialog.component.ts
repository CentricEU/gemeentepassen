import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
	AuthService,
	FormUtil,
	IbanMatchesBicValidator,
	ModalData,
	NavigationService,
	RegexUtil,
	TenantService,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ValidatorService } from 'angular-iban';

@Component({
	selector: 'frontend-bank-details-dialog',
	templateUrl: './bank-details-dialog.component.html',
	styleUrls: ['./bank-details-dialog.component.scss'],
	standalone: false,
})
export class BankDetailsDialogComponent implements OnInit {
	public bankInformationForm: FormGroup;

	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	public emailValidator = FormUtil.validateEmail(false);
	public getEmailErrorMessage = FormUtil.getEmailErrorMessage;

	constructor(
		private readonly dialogRef: MatDialogRef<BankDetailsDialogComponent>,
		private readonly formBuilder: FormBuilder,
		private readonly dialogService: DialogService,
		private readonly authService: AuthService,
		private readonly navigationService: NavigationService,
		private readonly tenantService: TenantService,
	) {}

	public ngOnInit(): void {
		this.initForm();
	}

	public logout(): void {
		this.authService.logout();
		this.dialogRef.close();
		this.navigationService.reloadCurrentRoute();
	}

	public openWarningModal(): void {
		const data = new WarningDialogData();

		this.dialogService
			.message(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						'createUser.leavingWarning',
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
					this.dialogRef.close(false);
				}
			});
	}

	public finishSetup(): void {
		if (!this.bankInformationForm.valid) {
			return;
		}

		this.tenantService.saveBankInformation(this.bankInformationForm.value).subscribe(() => {
			this.dialogRef.close(true);
		});
	}

	private initForm(): void {
		this.bankInformationForm = this.formBuilder.group(
			{
				iban: [
					'',
					[
						Validators.required,
						ValidatorService.validateIban,
						Validators.pattern(RegexUtil.dutchIbanRegexPattern),
					],
				],
				bic: ['', [Validators.pattern(RegexUtil.dutchBicRegexPattern)]],
			},
			{
				validators: [IbanMatchesBicValidator],
			},
		);
	}
}
