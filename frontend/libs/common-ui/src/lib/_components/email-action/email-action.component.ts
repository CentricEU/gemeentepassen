import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
	AppType,
	CommonL4LModule,
	commonRoutingConstants,
	EmailConfirmationService,
	FormUtil,
	ModalData,
	RecoverPassword,
	RecoverPasswordService,
	Role,
} from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { RecaptchaComponent, RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha-2';

import { CustomDialogConfigUtil } from '../../_util/custom-dialog-config';
import { WindmillModule } from '../../windmil.module';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';
import { LogoTitleComponent } from '../logo-title/logo-title.component';

@Component({
	selector: 'frontend-email-action',
	templateUrl: './email-action.component.html',
	styleUrls: ['./email-action.component.scss'],
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
export class EmailActionComponent implements OnInit {
	@ViewChild(RecaptchaComponent) ngRecaptcha!: RecaptchaComponent;

	public form: FormGroup;
	public emailValidator = FormUtil.validateEmail(false);
	public validationFunctionError = FormUtil.genericValidationFunctionError;
	public getEmailErrorMessage = FormUtil.getEmailErrorMessage;
	public shouldDisplaySuccessfulDialog = false;

	private appUserType: string;

	public get description(): string {
		return this.isConfirmationEmailComponent()
			? 'register.accountConfirmation.validateEmailDescription'
			: 'forgotPassword.description';
	}

	public get title(): string {
		return this.isConfirmationEmailComponent()
			? 'register.accountConfirmation.validateEmailTitle'
			: 'forgotPassword.title';
	}

	constructor(
		private recoverPasswordService: RecoverPasswordService,
		private emailConfirmationService: EmailConfirmationService,
		private formBuilder: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private dialogService: DialogService,
	) {
		this.subscribeToRouteData();
	}

	public ngOnInit(): void {
		this.initForm();
	}

	public isConfirmationEmailComponent(): boolean {
		const route = this.route.snapshot.url?.[0]?.path;
		return route === commonRoutingConstants.resendConfirmationEmail;
	}

	public sendEmail(): void {
		if (this.form.invalid) {
			return;
		}

		if (!this.isConfirmationEmailComponent()) {
			this.recoverPassword();
			return;
		}

		this.resendConfirmationEmail();
	}

	public navigateToLogin(): void {
		this.router.navigate([commonRoutingConstants.login]);
	}

	private resendConfirmationEmail(): void {
		const email = this.form.get('email')?.value;
		this.emailConfirmationService.resendConfirmationEmail(email).subscribe(() => {
			this.displaySuccessDialog();
		});
	}

	private subscribeToRouteData(): void {
		this.route.data.subscribe((data) => {
			this.appUserType = data['app'];
		});
	}

	private recoverPassword(): void {
		const recoverPasswordModel = new RecoverPassword(
			this.form.get('email')?.value,
			this.form.get('recaptcha')?.value,
			this.appUserType === AppType.municipality ? Role.MUNICIPALITY_ADMIN : Role.SUPPLIER,
		);

		this.recoverPasswordService.recoverPassword(recoverPasswordModel).subscribe({
			next: () => {
				this.displaySuccessDialog();
			},
			error: () => {
				this.ngRecaptcha.reset();
			},
		});
	}

	private initForm(): void {
		const recaptchaValidators = this.isConfirmationEmailComponent() ? [] : [Validators.required];

		this.form = this.formBuilder.group({
			email: ['', [Validators.required, this.emailValidator]],
			recaptcha: ['', recaptchaValidators],
		});
	}

	private displaySuccessDialog(): void {
		this.shouldDisplaySuccessfulDialog = true;
		const dialogConfig = this.isConfirmationEmailComponent()
			? this.getDialogConfig(
					'register.accountConfirmation.confirmationSuccessful',
					'general.success.confirmEmailText',
				)
			: this.getDialogConfig('forgotPassword.recoverSuccessful', 'general.success.recoverPasswordText');
		this.showDialog(dialogConfig);
	}

	private getDialogConfig(titleKey: string, contentKey: string): MatDialogConfig {
		const modalData = new ModalData(
			titleKey,
			'general.success.title',
			contentKey,
			'',
			'modal.continueLogin',
			true,
			'success',
			'theme',
			'verified.svg',
		);
		return { ...CustomDialogConfigUtil.createMessageModal(modalData), disableClose: true };
	}

	private showDialog(dialogConfig: MatDialogConfig): void {
		this.dialogService
			.message(CustomDialogComponent, dialogConfig)
			?.afterClosed()
			.subscribe((response) => {
				if (!response) {
					return;
				}

				this.navigateToLogin();
			});
	}
}
