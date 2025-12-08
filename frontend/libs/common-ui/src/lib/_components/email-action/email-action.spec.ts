import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
	AppType,
	commonRoutingConstants,
	EmailConfirmationService,
	FormUtil,
	RecoverPassword,
	RecoverPasswordService,
	Role,
} from '@frontend/common';
import { AriaAttributesDirective } from '@innovation/accesibility';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of, throwError } from 'rxjs';

import { CustomDialogConfigUtil } from '../../_util/custom-dialog-config';
import { CommonUiModule } from '../../common-ui.module';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';
import { EmailActionComponent } from './email-action.component';

describe('EmailActionComponent', () => {
	let component: EmailActionComponent;
	let fixture: ComponentFixture<EmailActionComponent>;
	let emailConfirmationService: EmailConfirmationService;

	const routerMock = {
		navigate: jest.fn(),
	};

	const recoverPasswordServiceMock = {
		recoverPassword: jest.fn().mockReturnValue(of({})),
	};

	const dialogServiceMock = {
		message: jest.fn(),
	};

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	const activatedRouteMock = {
		snapshot: {
			queryParams: { returnUrl: '/' },
		},
		data: of({ app: AppType.municipality }),
	};

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const mockDialogRef = {
		afterClosed: jest.fn().mockReturnValue(of(true)),
	};

	const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AriaAttributesDirective],
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), CommonUiModule, EmailActionComponent],
			providers: [
				FormBuilder,
				{
					provide: EmailConfirmationService,
					useValue: { resendConfirmationEmail: jest.fn().mockReturnValue(of({})) },
				}, // Provide a mock for EmailConfirmationService
				{ provide: Router, useValue: routerMock },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: 'env', useValue: environmentMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: RecoverPasswordService, useValue: recoverPasswordServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(EmailActionComponent);
		emailConfirmationService = TestBed.inject(EmailConfirmationService); // Inject EmailConfirmationService
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('form group initialize', () => {
		it('should create the form with all expected input fields', () => {
			expect(component.form.controls['email']).toBeTruthy();
			expect(component.form.controls['recaptcha']).toBeTruthy();
		});

		it('should initialize the form', () => {
			component['initForm']();
			expect(component.form).toBeTruthy();
			expect(component.form.get('email')).toBeTruthy();
			expect(component.form.get('recaptcha')).toBeTruthy();
		});

		it('should define form group on init', () => {
			component['initForm']();
			expect(component.form).toBeDefined();
		});
	});

	describe('form control valid/invalid', () => {
		it('should mark email form control as invalid when empty', () => {
			const emailControl = component.form.get('email');
			emailControl?.setValue('');
			expect(emailControl?.valid).toBeFalsy();
			expect(emailControl?.hasError('required')).toBeTruthy();
			expect(emailControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should mark email form control as invalid when null', () => {
			const emailControl = component.form.get('email');
			emailControl?.setValue(null);
			expect(emailControl?.valid).toBeFalsy();
			expect(emailControl?.hasError('required')).toBeTruthy();
			expect(emailControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should mark email form control as invalid when undefined', () => {
			const emailControl = component.form.get('email');
			emailControl?.setValue(undefined);
			expect(emailControl?.valid).toBeFalsy();
			expect(emailControl?.hasError('required')).toBeTruthy();
			expect(emailControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should mark email form control as invalid when invalid email', () => {
			const emailControl = component.form.get('email');
			emailControl?.setValue('emailInvalid');
			expect(emailControl?.valid).toBeFalsy();
			expect(emailControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should mark recaptcha as invalid when empty', () => {
			const recaptchaControl = component.form.get('recaptcha');
			recaptchaControl?.setValue('');
			expect(recaptchaControl?.valid).toBeFalsy();
			expect(recaptchaControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should mark recaptcha as invalid when null', () => {
			const recaptchaControl = component.form.get('recaptcha');
			recaptchaControl?.setValue(null);
			expect(recaptchaControl?.valid).toBeFalsy();
			expect(recaptchaControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should mark recaptcha as invalid when undefined', () => {
			const recaptchaControl = component.form.get('recaptcha');
			recaptchaControl?.setValue(undefined);
			expect(recaptchaControl?.valid).toBeFalsy();
			expect(recaptchaControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should mark recaptcha as valid when completed', () => {
			const recaptchaControl = component.form.get('recaptcha');
			recaptchaControl?.setValue('test');
			expect(recaptchaControl?.valid).toBeTruthy();
			expect(recaptchaControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should mark email as valid when completed', () => {
			const emailControl = component.form.get('email');
			emailControl?.setValue('valid@email.com');
			expect(emailControl?.valid).toBeTruthy();
			expect(emailControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('should initialize the form with the correct controls and validators', () => {
			component['initForm']();

			const emailControl = component.form.get('email');
			const recaptchaControl = component.form.get('recaptcha');

			expect(emailControl).toBeTruthy();
			expect(recaptchaControl).toBeTruthy();

			expect(emailControl?.value).toBe('');
			expect(recaptchaControl?.value).toBe('');

			expect(emailControl?.hasValidator(Validators.required)).toBe(true);
			expect(emailControl?.hasValidator(component.emailValidator)).toBe(true);
			expect(recaptchaControl?.hasValidator(Validators.required)).toBe(true);
		});

		it('it should show recaptcha and have validators', () => {
			component.ngOnInit();
			component.form.setValue({
				email: 'test@example.com',
				recaptcha: null,
			});

			expect(component.form.get('recaptcha')?.hasValidator(Validators.required)).toBe(true);
		});

		it('should validate email correctly', () => {
			const emailControl = component.form.get('email');
			if (emailControl) {
				emailControl.setValue('invalidEmail');
				expect(FormUtil.validateEmail(true)(emailControl)).toEqual({ validEmail: true });
			} else {
				fail('email control not found in formGroup');
			}
		});
	});

	describe('save button', () => {
		it('should disable save button when email is invalid ', () => {
			const emailControl = component.form.get('email');

			const element: HTMLElement = fixture.nativeElement;
			const saveBtn = element.querySelector('.form-button') as HTMLButtonElement;

			expect((saveBtn.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(true);

			emailControl?.setValue('123@123.com');

			fixture.whenStable().then(() => {
				fixture.detectChanges();
				expect((saveBtn.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(false);
			});
		});

		it('should disable save button when recaptcha is invalid ', () => {
			const recaptchaControl = component.form.get('recaptcha');

			const element: HTMLElement = fixture.nativeElement;
			const saveBtn = element.querySelector('.form-button') as HTMLButtonElement;

			expect((saveBtn.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(true);

			recaptchaControl?.setValue('recaptcha');

			fixture.whenStable().then(() => {
				fixture.detectChanges();
				expect((saveBtn.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(false);
			});
		});
	});

	describe('getEmailErrorMessage', () => {
		beforeEach(() => {
			component.ngOnInit();
		});

		it('should return "genericFields.email.requiredEmail" when email is required but missing', () => {
			component.form.setValue({
				email: '',
				recaptcha: 'asdsadsadsa',
			});
			const result = component.getEmailErrorMessage(component.form);
			expect(result).toBe('genericFields.email.requiredEmail');
		});

		it('should return "genericFields.email.validEmail" when email is required and invalid', () => {
			component.form.setValue({
				email: 'test@example',
				recaptcha: 'asdsadsadsa',
			});
			const result = component.getEmailErrorMessage(component.form);
			expect(result).toBe('genericFields.email.validEmail');
		});

		it('should return an empty string when email is valid', () => {
			component.form.setValue({
				email: 'test@example.com',
				recaptcha: 'asdasdsaasd',
			});
			const result = component.getEmailErrorMessage(component.form);
			expect(result).toBe('');
		});

		it('should get the email error message', () => {
			component.form.get('email')?.setErrors({ required: true });
			expect(component.getEmailErrorMessage(component.form)).toBe('genericFields.email.requiredEmail');

			component.form.get('email')?.setErrors({ validEmail: true });
			expect(component.getEmailErrorMessage(component.form)).toBe('genericFields.email.validEmail');

			component.form.get('email')?.setErrors(null);
			expect(component.getEmailErrorMessage(component.form)).toBe('');
		});

		it('should return the translation for email when required error exists for email', () => {
			const hasOwnPropertyMock = jest.fn().mockReturnValue(true);

			const originalHasOwnProperty = Object.prototype.hasOwnProperty;

			Object.prototype.hasOwnProperty = hasOwnPropertyMock;

			const result = component.getEmailErrorMessage(component.form);

			Object.prototype.hasOwnProperty = originalHasOwnProperty;

			expect(hasOwnPropertyMock).toHaveBeenCalledWith('email');
			expect(result).toBe('genericFields.email.requiredEmail');
		});
	});

	describe('navigatetoLogin', () => {
		it('should not navigate to login if modal is open', fakeAsync(() => {
			const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

			const mockDialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false)),
			};

			component['dialogService'] = {
				message: jest.fn().mockReturnValue(mockDialogRef),
			} as any;

			component['router'] = routerMock as any;

			component['showDialog'](dialogConfig);
			tick();

			expect(component['dialogService'].message).toHaveBeenCalledWith(
				CustomDialogComponent,
				expect.objectContaining({ data: dialogConfig.data }),
			);
			expect(mockDialogRef.afterClosed).toHaveBeenCalled();
			expect(routerMock.navigate).not.toHaveBeenCalled();
		}));

		it('should not navigate to login when dialog response is false', () => {
			const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

			// 1. Create the mock dialog ref
			const mockDialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(false)),
			};

			// 2. Assign mocks before calling showDialog
			component['dialogService'] = {
				message: jest.fn().mockReturnValue(mockDialogRef),
			} as any;
			component['router'] = routerMock as any;

			// 3. Call the method
			component['showDialog'](dialogConfig);

			// 4. Assertions
			expect(component['dialogService'].message).toHaveBeenCalledWith(CustomDialogComponent, dialogConfig);
			expect(mockDialogRef.afterClosed).toHaveBeenCalled();
			expect(routerMock.navigate).not.toHaveBeenCalled();
		});

		it('should not navigate to login when dialog response is null', () => {
			const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

			const mockDialogRef = {
				afterClosed: () => of(null),
			};

			component['dialogService'] = dialogServiceMock as any;
			component['router'] = routerMock as any;

			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(mockDialogRef);

			component['showDialog'](dialogConfig);

			expect(dialogServiceMock['message']).toHaveBeenCalledWith(
				CustomDialogComponent,
				expect.objectContaining({ data: dialogConfig.data }),
			);
			expect(routerMock.navigate).not.toHaveBeenCalled();
		});

		it('should not navigate to login when dialog response is undefined', () => {
			const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

			const mockDialogRef = {
				afterClosed: () => of(undefined),
			};

			component['dialogService'] = dialogServiceMock as any;
			component['router'] = routerMock as any;

			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(mockDialogRef);

			component['showDialog'](dialogConfig);

			expect(dialogServiceMock['message']).toHaveBeenCalledWith(CustomDialogComponent, dialogConfig);
			expect(routerMock.navigate).not.toHaveBeenCalled();
		});

		it('should not navigate to login when dialog response is false', () => {
			const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

			const mockDialogRef = {
				afterClosed: () => of(false),
			};

			component['dialogService'] = dialogServiceMock as any;
			component['router'] = routerMock as any;

			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(mockDialogRef);

			component['showDialog'](dialogConfig);

			expect(dialogServiceMock['message']).toHaveBeenCalledWith(CustomDialogComponent, dialogConfig);
			expect(routerMock.navigate).not.toHaveBeenCalled();
		});

		it('should not navigate to login if modal is open', fakeAsync(() => {
			mockDialogRef.afterClosed.mockReturnValue(of(false));

			component['showDialog'](dialogConfig);
			tick();

			expect(dialogServiceMock['message']).toHaveBeenCalledWith(
				CustomDialogComponent,
				expect.objectContaining({ data: dialogConfig.data }),
			);
			expect(routerMock.navigate).not.toHaveBeenCalled();
		}));

		it('should navigate to login if modal is closed', fakeAsync(() => {
			const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

			const mockDialogRef = { afterClosed: jest.fn().mockReturnValue(of(true)) };

			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(mockDialogRef);

			component['dialogService'] = dialogServiceMock as any;
			component['router'] = routerMock as any;

			component['showDialog'](dialogConfig);
			tick();

			expect(dialogServiceMock.message).toHaveBeenCalledWith(
				CustomDialogComponent,
				expect.objectContaining({ data: dialogConfig.data }),
			);
			expect(mockDialogRef.afterClosed).toHaveBeenCalled();
			expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.login]);
		}));

		it('should navigate to login when navigateToLogin method is called', () => {
			component.navigateToLogin();
			expect(routerMock.navigate).toHaveBeenCalled();
			expect(routerMock.navigate).toHaveBeenCalledWith(['login']);
		});
	});

	describe('shouldDisplaySuccessfulRegistrationDialog', () => {
		it('should have shouldDisplaySuccessfulRegistrationDialog to false on init', () => {
			component.ngOnInit();
			expect(component.shouldDisplaySuccessfulDialog).toBe(false);
		});

		it('should render success message when shouldDisplaySuccessfulRegistrationDialog is true', () => {
			component.shouldDisplaySuccessfulDialog = true;
			fixture.detectChanges();
			const formElement = fixture.debugElement.query(By.css('form'));
			expect(formElement).toBeNull();
		});

		it('should not render success message when shouldDisplaySuccessfulRegistrationDialog is true', () => {
			component.shouldDisplaySuccessfulDialog = false;
			fixture.detectChanges();
			const formElement = fixture.debugElement.query(By.css('form'));
			expect(formElement).toBeTruthy();
		});

		it('should set shouldDisplaySuccessfulRegistrationDialog to false and not navigate to login on response', () => {
			const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

			const mockDialogRef = {
				afterClosed: () => of(true),
			};

			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(mockDialogRef);

			component['showDialog'](dialogConfig);

			expect(component.shouldDisplaySuccessfulDialog).toBe(false);

			component['displaySuccessDialog']();

			expect(component.shouldDisplaySuccessfulDialog).toBe(true);
		});
	});

	describe('dialog service message', () => {
		it('should call router navigate', async () => {
			component.navigateToLogin();
			expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.login]);
		});

		// it('should navigate to login when the dialog returns true', fakeAsync(() => {
		// 	const dialogRef = {
		// 		afterClosed: () => of(true) // must be a function returning an Observable
		// 	};

		// 	const navigateToLoginSpy = jest.spyOn(component, 'navigateToLogin');

		// 	jest.spyOn(dialogServiceMock, 'message').mockReturnValue(dialogRef as any);

		// 	// Act: show dialog
		// 	component['showDialog'](dialogConfig);

		// 	flushMicrotasks(); // triggers all microtasks (subscribes, promises)
		// 	fixture.detectChanges();

		// 	// Assert
		// 	expect(navigateToLoginSpy).toHaveBeenCalled();
		// }));

		it('should not navigate to login when the dialog returns false', () => {
			const dialogRef = {
				afterClosed: () => {
					return {
						subscribe: (callback: (response: any) => void) => {
							callback(false);
						},
					};
				},
			};

			const navigateToLoginSpy = jest.spyOn(component, 'navigateToLogin');

			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(dialogRef as any);

			component['showDialog'](dialogConfig);

			expect(navigateToLoginSpy).not.toHaveBeenCalled();
		});

		it('should not navigate to login when the dialog returns null', () => {
			const dialogRef = {
				afterClosed: () => {
					return {
						subscribe: (callback: (response: any) => void) => {
							callback(null);
						},
					};
				},
			};

			const navigateToLoginSpy = jest.spyOn(component, 'navigateToLogin');

			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(dialogRef as any);

			component['showDialog'](dialogConfig);

			expect(navigateToLoginSpy).not.toHaveBeenCalled();
		});

		it('should not navigate to login when the dialog returns undefined', () => {
			const dialogRef = {
				afterClosed: () => {
					return {
						subscribe: (callback: (response: any) => void) => {
							callback(null);
						},
					};
				},
			};

			const navigateToLoginSpy = jest.spyOn(component, 'navigateToLogin');

			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(dialogRef as any);

			component['showDialog'](dialogConfig);

			expect(navigateToLoginSpy).not.toHaveBeenCalled();
		});
	});

	describe('validate function', () => {
		it('should check for control with genericValidationFunctionError', () => {
			component.form.get('otherField')?.setValue('validValue');
			component.form.get('otherField')?.markAsTouched();
			expect(component.validationFunctionError('otherField', component.form)).toBe(false);
		});

		it('should return false when the form control does not exist on genericValidationFunctionError', () => {
			component.form.get('random')?.setValue('validValue');
			expect(component.validationFunctionError('random', component.form)).toBe(false);
		});
	});

	describe('sendEmail()', () => {
		it('should not call any service method when form is invalid', () => {
			component.form.setValue({ email: '', recaptcha: '' });
			const recoverPasswordSpy = jest.spyOn(component as any, 'recoverPassword');
			const resendConfirmationEmailSpy = jest.spyOn(component as any, 'resendConfirmationEmail');

			component.sendEmail();

			expect(recoverPasswordSpy).not.toHaveBeenCalled();
			expect(resendConfirmationEmailSpy).not.toHaveBeenCalled();
		});
	});

	describe('resendConfirmationEmail()', () => {
		it('should call emailConfirmationService.resendConfirmationEmail() with correct email', () => {
			component.form.setValue({ email: 'test@example.com', recaptcha: 'recaptcha-response' });
			const resendConfirmationEmailSpy = jest
				.spyOn(emailConfirmationService, 'resendConfirmationEmail')
				.mockReturnValue(of());

			component['resendConfirmationEmail']();

			expect(resendConfirmationEmailSpy).toHaveBeenCalledWith('test@example.com');
		});

		it('should not call displaySuccessDialog() on error', () => {
			component.form.setValue({ email: 'test@example.com', recaptcha: 'recaptcha-response' });
			jest.spyOn(emailConfirmationService, 'resendConfirmationEmail').mockReturnValue(throwError('error'));
			const displaySuccessDialogSpy = jest.spyOn(component as any, 'displaySuccessDialog');

			component['resendConfirmationEmail']();

			expect(displaySuccessDialogSpy).not.toHaveBeenCalled();
		});
	});

	describe('sendEmail()', () => {
		it('should not call any service method when form is invalid', () => {
			component.form.setValue({ email: '', recaptcha: '' });
			const recoverPasswordSpy = jest.spyOn(component as any, 'recoverPassword');
			const resendConfirmationEmailSpy = jest.spyOn(component as any, 'resendConfirmationEmail');

			component.sendEmail();

			expect(recoverPasswordSpy).not.toHaveBeenCalled();
			expect(resendConfirmationEmailSpy).not.toHaveBeenCalled();
		});
	});

	it('should call recoverPasswordService.recoverPassword() and display success dialog on next', () => {
		const validFormValue = { email: 'test@example.com', recaptcha: 'recaptcha-response' };
		component.form.setValue(validFormValue);
		const recoverPasswordModel = new RecoverPassword(
			validFormValue.email,
			validFormValue.recaptcha,
			Role.MUNICIPALITY_ADMIN,
		);
		const recoverPasswordServiceSpy = jest
			.spyOn(recoverPasswordServiceMock, 'recoverPassword')
			.mockReturnValue(of({}));
		const displaySuccessDialogSpy = jest.spyOn(component as any, 'displaySuccessDialog');

		component['recoverPassword']();

		expect(recoverPasswordServiceSpy).toHaveBeenCalledWith(recoverPasswordModel);
		expect(displaySuccessDialogSpy).toHaveBeenCalled();
	});

	it('should call recoverPasswordService.recoverPassword() and reset recaptcha on error', () => {
		const validFormValue = { email: 'test@example.com', recaptcha: 'recaptcha-response' };
		component.form.setValue(validFormValue);
		const recoverPasswordModel = new RecoverPassword(
			validFormValue.email,
			validFormValue.recaptcha,
			Role.MUNICIPALITY_ADMIN,
		);
		const errorResponse = new Error('Recover password failed');
		const recoverPasswordServiceSpy = jest
			.spyOn(recoverPasswordServiceMock, 'recoverPassword')
			.mockReturnValue(throwError(errorResponse));
		const ngRecaptchaResetSpy = jest.spyOn(component.ngRecaptcha, 'reset');

		component['recoverPassword']();

		expect(recoverPasswordServiceSpy).toHaveBeenCalledWith(recoverPasswordModel);
		expect(ngRecaptchaResetSpy).toHaveBeenCalled();
	});

	it('should call recoverPassword() when form is valid and not confirmation email component', () => {
		const validFormValue = { email: 'test@example.com', recaptcha: 'recaptcha-response' };
		component.form.setValue(validFormValue);
		const recoverPasswordSpy = jest.spyOn(component as any, 'recoverPassword');
		const resendConfirmationEmailSpy = jest.spyOn(component as any, 'resendConfirmationEmail');
		jest.spyOn(component, 'isConfirmationEmailComponent').mockReturnValue(false);

		component.sendEmail();

		expect(recoverPasswordSpy).toHaveBeenCalled();
		expect(resendConfirmationEmailSpy).not.toHaveBeenCalled();
	});

	it('should call recoverPasswordService.recoverPassword() and display success dialog on next', () => {
		const validFormValue = { email: 'test@example.com', recaptcha: 'recaptcha-response' };
		component.form.setValue(validFormValue);
		const recoverPasswordModel = new RecoverPassword(
			validFormValue.email,
			validFormValue.recaptcha,
			Role.MUNICIPALITY_ADMIN,
		);
		const recoverPasswordServiceSpy = jest
			.spyOn(recoverPasswordServiceMock, 'recoverPassword')
			.mockReturnValue(of({}));
		const displaySuccessDialogSpy = jest.spyOn(component as any, 'displaySuccessDialog');

		component['recoverPassword']();

		expect(recoverPasswordServiceSpy).toHaveBeenCalledWith(recoverPasswordModel);
		expect(displaySuccessDialogSpy).toHaveBeenCalled();
	});

	it('should call displaySuccessDialog() when sendEmail() is called with a valid form and not confirmation email component', () => {
		const validFormValue = { email: 'test@example.com', recaptcha: 'recaptcha-response' };
		component.form.setValue(validFormValue);
		const displaySuccessDialogSpy = jest.spyOn(component as any, 'displaySuccessDialog');
		jest.spyOn(component, 'isConfirmationEmailComponent').mockReturnValue(false);

		component.sendEmail();

		expect(displaySuccessDialogSpy).toHaveBeenCalled();
	});

	describe('form validation edge cases', () => {
		it('should mark form as invalid when only email field is filled', () => {
			component.form.setValue({ email: 'test@example.com', recaptcha: '' });
			expect(component.form.invalid).toBe(true);
		});

		it('should mark form as invalid when only recaptcha field is filled', () => {
			component.form.setValue({ email: '', recaptcha: 'recaptcha-response' });
			expect(component.form.invalid).toBe(true);
		});

		it('should mark form as invalid when both email and recaptcha fields are empty', () => {
			component.form.setValue({ email: '', recaptcha: '' });
			expect(component.form.invalid).toBe(true);
		});

		it('should mark email field as invalid when email format is invalid', () => {
			const emailControl = component.form.get('email');
			emailControl?.setValue('invalidEmail');
			expect(emailControl?.valid).toBe(false);
			expect(emailControl?.hasError('validEmail')).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should reset recaptcha and not display success dialog on recoverPasswordService error', () => {
			const validFormValue = { email: 'test@example.com', recaptcha: 'recaptcha-response' };
			component.form.setValue(validFormValue);
			jest.spyOn(recoverPasswordServiceMock, 'recoverPassword').mockReturnValue(throwError('error'));
			const ngRecaptchaResetSpy = jest.spyOn(component.ngRecaptcha, 'reset');
			const displaySuccessDialogSpy = jest.spyOn(component as any, 'displaySuccessDialog');

			component['recoverPassword']();

			expect(ngRecaptchaResetSpy).toHaveBeenCalled();
			expect(displaySuccessDialogSpy).not.toHaveBeenCalled();
		});
	});

	describe('dialog service', () => {
		it('should not navigate to login if dialog is closed with response false', () => {
			const dialogConfig = { data: 'test' } as any;
			const afterClosedMock = jest.fn().mockReturnValue(of(false));
			const dialogRefMock = { afterClosed: afterClosedMock };
			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(dialogRefMock);

			routerMock.navigate.mockClear();

			component['showDialog'](dialogConfig);

			expect(routerMock.navigate).not.toHaveBeenCalledWith([expect.stringContaining('login')]);
		});
	});

	it('should call resendConfirmationEmail() when form is valid and it is confirmation email component', () => {
		const validFormValue = { email: 'test@example.com', recaptcha: 'recaptcha-response' };
		component.form.setValue(validFormValue);
		jest.spyOn(component, 'isConfirmationEmailComponent').mockReturnValue(true);
		const resendConfirmationEmailSpy = jest.spyOn(component as any, 'resendConfirmationEmail');

		component.sendEmail();

		expect(resendConfirmationEmailSpy).toHaveBeenCalled();
	});
});
