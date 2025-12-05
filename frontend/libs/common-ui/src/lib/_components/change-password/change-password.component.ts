import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
	ChangePassword,
	ChangePasswordService,
	commonRoutingConstants,
	ConfirmPasswordValidator,
	FormUtil,
	ModalData,
	PasswordMatchValidator,
	RecoverPasswordService,
	Toaster,
} from '@frontend/common';
import { DialogService } from '@windmill/ng-windmill';

import { CustomDialogConfigUtil } from '../../_util/custom-dialog-config';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';

@Component({
	selector: 'frontend-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
	public form: FormGroup;
	public getConfirmPasswordErrorMessage = FormUtil.getConfirmPasswordErrorMessage;
	public passwordValidator = FormUtil.validatePassword;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;

	public shouldDisplaySuccessfulPasswordChangeDialog = false;

	private token: string;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private dialogService: DialogService,
		private changePasswordService: ChangePasswordService,
		private recoverPasswordService: RecoverPasswordService,
	) {}

	public ngOnInit(): void {
		this.initForm();
		this.getTokenFromParam();
	}

	public changePassword(): void {
		if (this.form.invalid) {
			return;
		}

		const changePasswordModel = new ChangePassword(this.token, this.form.get('confirmPassword')?.value);

		this.changePasswordService.changePassword(changePasswordModel).subscribe({
			next: () => {
				this.displaySuccessfulRecoveryDialog();
			},
			error: () => {
				this.form.reset();
			},
		});
	}

	public shouldDisplayPasswordConfirmationError(): boolean {
		return this.hasFormControlRequiredErrors('confirmPassword', this.form) || this.form.hasError('fieldsMismatch');
	}

	public getToasterType(): Toaster {
		return this.getPasswordValidationErrors() ? 'warning' : 'success';
	}

	public navigateToLogin(): void {
		this.router.navigate([commonRoutingConstants.login]);
	}

	public navigateToRecover(): void {
		this.router.navigate([commonRoutingConstants.recover]);
	}

	private initForm(): void {
		this.form = this.formBuilder.group(
			{
				password: ['', [Validators.required, this.passwordValidator]],
				confirmPassword: ['', [Validators.required, ConfirmPasswordValidator]],
			},
			{
				validator: PasswordMatchValidator,
			},
		);
	}

	private getPasswordValidationErrors(): ValidationErrors | null | undefined {
		return this.form?.get('password')?.errors;
	}

	private getTokenFromParam(): void {
		this.route?.params?.subscribe((params) => {
			if (!params || (params && !params['token'])) {
				return;
			}

			this.token = params['token'];
			this.getRecoverByToken(this.token);
		});
	}

	private displaySuccessfulRecoveryDialog(): void {
		this.shouldDisplaySuccessfulPasswordChangeDialog = true;
		this.showDialog(this.getPasswordChangeSuccessConfig());
	}

	private getPasswordChangeSuccessConfig(): MatDialogConfig {
		const passwordChangeModalData = new ModalData(
			'changePassword.changeSuccessull',
			'general.success.title',
			'general.success.passwordUpdateText',
			'',
			'modal.continueLogin',
			true,
			'success',
			'theme',
			'verified.svg',
		);

		return { ...CustomDialogConfigUtil.createMessageModal(passwordChangeModalData), disableClose: true };
	}

	private showDialog(dialogConfig: MatDialogConfig): void {
		this.dialogService
			.message(CustomDialogComponent, dialogConfig)
			?.afterClosed()
			.subscribe((response) => {
				if (response) {
					this.navigateToLogin();
				}
			});
	}

	private getRecoverByToken(token: string): void {
		this.recoverPasswordService.getRecoverByToken(token).subscribe({
			error: () => {
				this.navigateToRecover();
			},
		});
	}
}
