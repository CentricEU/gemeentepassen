import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService, FormUtil, ModalData, UserService, WarningDialogData } from '@frontend/common';
import { CreateUserDto } from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';

@Component({
	selector: 'frontend-create-user-popup-popup',
	styleUrls: ['create-user-popup.component.scss'],
	templateUrl: './create-user-popup.component.html',
	standalone: false,
})
export class CreateUserPopupComponent implements OnInit {
	public createUserForm: FormGroup;

	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationNoSpaceFunctionError = FormUtil.validationNoSpaceFunctionError;

	public validationFunctionError = FormUtil.validationFunctionError;
	public emailValidator = FormUtil.validateEmail(false);
	public getEmailErrorMessage = FormUtil.getEmailErrorMessage;

	private readonly authService = inject(AuthService);
	private readonly dialogService = inject(DialogService);
	private readonly userService = inject(UserService);
	private readonly formBuilder = inject(FormBuilder);
	private readonly dialogRef = inject(MatDialogRef<CreateUserPopupComponent>);

	public get isSuperAdmin(): boolean {
		return this.authService.isSuperAdmin;
	}

	public ngOnInit(): void {
		this.initForm();

		this.dialogRef.backdropClick().subscribe(() => {
			this.close();
		});
	}

	public close(): void {
		if (!this.createUserForm.dirty) {
			this.dialogRef.close(false);
			return;
		}

		this.openWarningModal();
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

	public createUser(): void {
		const createUserDto = this.formValuesToCreateUserDto();

		this.userService.createUser(createUserDto).subscribe(() => {
			this.dialogRef.close(true);
		});
	}

	private formValuesToCreateUserDto(): CreateUserDto {
		const { firstName, lastName, email, isSuperAdmin } = this.createUserForm.controls;
		return new CreateUserDto(firstName?.value, lastName?.value, email?.value, isSuperAdmin?.value);
	}

	private initForm(): void {
		this.createUserForm = this.formBuilder.group({
			firstName: ['', [Validators.required, this.validationNoSpaceFunctionError]],
			lastName: ['', [Validators.required, this.validationNoSpaceFunctionError]],
			email: ['', [Validators.required, this.emailValidator]],
			isSuperAdmin: [false],
		});
	}
}
