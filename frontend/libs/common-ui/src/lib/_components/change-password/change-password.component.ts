import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
	AuthService,
	ChangePassword,
	ChangePasswordService,
	CommonL4LModule,
	commonRoutingConstants,
	ConfirmPasswordValidator,
	FormUtil,
	ModalData,
	PasswordMatchValidator,
	RecoverPasswordService,
	SetupPassword,
	SetupPasswordValidate,
	Toaster,
} from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha-2';
import { CustomDialogConfigUtil } from '../../_util/custom-dialog-config';
import { WindmillModule } from '../../windmil.module';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';
import { LogoTitleComponent } from '../logo-title/logo-title.component';
import { ToastrService } from '@windmill/ng-windmill/toastr';

@Component({
	selector: 'frontend-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		CommonL4LModule,
		TranslateModule,
		WindmillModule,
		LogoTitleComponent,
		RecaptchaFormsModule,
		RecaptchaModule,
	],
})
export class ChangePasswordComponent implements OnInit {
	public form: FormGroup;
	public getConfirmPasswordErrorMessage = FormUtil.getConfirmPasswordErrorMessage;
	public passwordValidator = FormUtil.validatePassword;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	private readonly toastrService = inject(ToastrService);
	private readonly translateService = inject(TranslateService);

	public readonly authService = inject(AuthService);

	public shouldDisplaySuccessfulPasswordChangeDialog = false;

	private token: string;
	private username: string | undefined;

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

	public savePassword(): void {
		if (this.form.invalid) {
			return;
		}

		if (this.router.url.includes(commonRoutingConstants.setupPassword) && this.username) {
			this.setupPassword();
		} else {
			this.changePassword();
		}
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

	private changePassword(): void {
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

	private setupPassword(): void {
		const setupPasswordModel = new SetupPassword(
			this.token,
			this.username ?? '',
			this.form.get('confirmPassword')?.value,
		);

		this.changePasswordService.setupPassword(setupPasswordModel).subscribe({
			next: () => {
				this.displaySuccessfulRecoveryDialog();
			},
			error: () => {
				this.form.reset();
			},
		});
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
			this.username = params['username'];

			if (this.username) {
				this.validateSetupPasswordToken(new SetupPasswordValidate(this.token, this.username));
				return;
			}
			this.getRecoverByToken(this.token);
		});
	}

	private validateSetupPasswordToken(setupPassValidate: SetupPasswordValidate): void {
		this.changePasswordService.validateSetupPasswordToken(setupPassValidate).subscribe({
			next: (isValid: boolean) => {
				if (!isValid) {
					this.navigateToLoginAndShowWarningToaster();
				}
			},
			error: () => {
				this.navigateToLoginAndShowWarningToaster();
			},
		});
	}

	private navigateToLoginAndShowWarningToaster(): void {
		this.navigateToLogin();
		this.displayWarningSetupPasswordToaster();
	}

	private displaySuccessfulRecoveryDialog(): void {
		this.shouldDisplaySuccessfulPasswordChangeDialog = true;
		this.showDialog(this.getPasswordChangeSuccessConfig());
	}

	private displayWarningSetupPasswordToaster(): void {
		const toasterMessage = this.translateService.instant(`setupProfile.passwordAlreadySetup`);

		this.toastrService.warning(`<p>${toasterMessage}</p>`, '', {
			toastBackground: 'toast-light',
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
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
