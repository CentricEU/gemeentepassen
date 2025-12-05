import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import {
	ConfirmPasswordValidator,
	FormUtil,
	ModalData,
	PasswordMatchValidator,
	Tenant,
	TenantService,
	Toaster,
} from '@frontend/common';
import { CustomDialogConfigUtil, CustomDialogWithTimerComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';

import { FormFields } from '../enums/form-fields.enum';
import { RegisterSupplier } from '../models/register-supplier.model';
import { RegisterService } from '../services/register.service';

@Component({
	selector: 'frontend-supplier-register',
	templateUrl: './supplier-register.component.html',
	styleUrls: ['./supplier-register.component.scss'],
})
export class SupplierRegisterComponent implements OnInit {
	public registerForm: FormGroup;
	public updatedSource: Tenant[] = [];
	public dropdownSource: Tenant[] = [];
	public checkboxId = 'id-required-fc-checkbox';
	public registerSupplier: RegisterSupplier;
	public shouldDisplaySuccessfulRegistrationDialog = false;

	public passwordValidator = FormUtil.validatePassword;
	public emailValidator = FormUtil.validateEmail(false);
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	public validationFunctionErrorForKVK = FormUtil.validationFunctionErrorForKVK;
	public getEmailErrorMessage = FormUtil.getEmailErrorMessage;
	public getConfirmPasswordErrorMessage = FormUtil.getConfirmPasswordErrorMessage;

	private selectTentantId: string;

	public get tenantId() {
		return this.selectTentantId;
	}

	public get translateServiceInstance() {
		return this.translateService;
	}
	constructor(
		private readonly dialogService: DialogService,
		private translateService: TranslateService,
		private registerService: RegisterService,
		private tenantService: TenantService,
	) {}

	public ngOnInit(): void {
		this.initializeMunicipalities();
		this.initForm();
	}

	public onSearchValueChanged(event: string): void {
		this.updatedSource = !event
			? this.dropdownSource
			: this.dropdownSource.filter((item) => item.name.toLowerCase().includes(event.trim().toLowerCase()));
	}

	public getErrorMessageFormInputs(value: string): string | null {
		switch (value) {
			case FormFields.firstName:
				return this.translateService.instant('genericFields.firstName.requiredError');
			case FormFields.lastName:
				return this.translateService.instant('genericFields.lastName.requiredError');
			case FormFields.company:
				return this.translateService.instant('register.companyFormControlRequired');
			case FormFields.password:
				return this.translateService.instant('register.passwordFormControlRequired');
			case FormFields.municipality:
				return this.translateService.instant('register.requiredMunicipality');
			default: {
				return null;
			}
		}
	}

	public shouldDisplayPasswordConfirmationError(): boolean {
		return (
			this.hasFormControlRequiredErrors('confirmPassword', this.registerForm) ||
			this.registerForm.hasError('fieldsMismatch')
		);
	}

	public getToasterType(): Toaster {
		return this.getPasswordValidationErrors() ? 'warning' : 'success';
	}

	public getKVKErrorMessage(): string | null {
		const kvkControl = this.registerForm.get('kvk');
		const lengthValue = kvkControl?.value.length;
		const lengthValidator = (lengthValue ?? 0) > 0 && (lengthValue ?? 0) < 8;

		if (lengthValidator) {
			return this.translateService.instant('register.kvkFormControlLength');
		}

		if (kvkControl?.errors?.['required']) {
			return this.translateService.instant('register.kvkFormControlRequired');
		}

		return null;
	}

	public saveSupplier(): void {
		this.mapSupplier();
		this.registerService.registerSupplier(this.registerSupplier).subscribe(() => {
			this.displayAccountConfirmationDialog(this.registerSupplier);
		});
	}

	public onValueChangedTenantId(event: any): void {
		this.selectTentantId = event;
	}

	public initializeMunicipalities(): void {
		this.tenantService.getTenants().subscribe((data) => {
			if (!data) {
				return;
			}
			this.dropdownSource = data;
			this.updatedSource = [...this.dropdownSource];
		});
	}

	private getPasswordValidationErrors(): ValidationErrors | null | undefined {
		return this.registerForm?.get('password')?.errors;
	}

	private initForm(): void {
		this.registerForm = new FormGroup({
			firstName: new FormControl('', Validators.required),
			lastName: new FormControl('', Validators.required),
			company: new FormControl('', Validators.required),
			kvk: new FormControl('', Validators.required),
			municipality: new FormControl('', Validators.required),
			email: new FormControl('', [Validators.required, this.emailValidator]),
			password: new FormControl('', [Validators.required, this.passwordValidator]),
			confirmPassword: new FormControl('', [Validators.required, ConfirmPasswordValidator]),
			agreement: new FormControl('', Validators.required),
		});
		this.registerForm.addValidators(PasswordMatchValidator);
	}

	private mapSupplier(): void {
		const registerFormValue = this.registerForm.value;

		this.registerSupplier = {
			firstName: registerFormValue.firstName,
			lastName: registerFormValue.lastName,
			email: registerFormValue.email,
			companyName: registerFormValue.company,
			kvk: registerFormValue.kvk,
			tenantId: this.selectTentantId,
			password: registerFormValue.password,
			retypedPassword: registerFormValue.confirmPassword,
			agreedTerms: registerFormValue.agreement,
		};
	}

	private getAccountConfirmationConfig(registerSupplier: RegisterSupplier): MatDialogConfig {
		const data = {
			comments: '',
			tenantName: '',
			reason: '',
			email: registerSupplier.email || '',
		};

		const accountConfirmationModalData = new ModalData(
			'register.accountConfirmation.title',
			'register.accountConfirmation.title',
			'register.accountConfirmation.content',
			'',
			'register.accountConfirmation.resendConfirmation',
			true,
			'success',
			'theme',
			'email.svg',
			data,
		);
		return { ...CustomDialogConfigUtil.createMessageModal(accountConfirmationModalData), disableClose: true };
	}

	private displayAccountConfirmationDialog(registerSupplier: RegisterSupplier): void {
		this.shouldDisplaySuccessfulRegistrationDialog = true;

		this.dialogService?.message(
			CustomDialogWithTimerComponent,
			this.getAccountConfirmationConfig(registerSupplier),
		);
	}
}
