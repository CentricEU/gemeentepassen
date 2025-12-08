import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
	AppType,
	ChangePassword,
	ChangePasswordService,
	commonRoutingConstants,
	RecoverPasswordService,
	SetupPasswordValidate,
} from '@frontend/common';
import { AriaAttributesDirective } from '@innovation/accesibility';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { Observable, of, throwError } from 'rxjs';
import { CustomDialogConfigUtil } from '../../_util/custom-dialog-config';
import { CommonUiModule } from '../../common-ui.module';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';
import { ChangePasswordComponent } from './change-password.component';
import { ToastrService } from '@windmill/ng-windmill/toastr';

describe('ChangePasswordComponent', () => {
	let component: ChangePasswordComponent;
	let fixture: ComponentFixture<ChangePasswordComponent>;

	const routerMock = {
		url: '/test-url',
		navigate: jest.fn(),
	};

	let toastrServiceMock: { error: jest.Mock; warning: jest.Mock };

	const changePasswordServiceMock = {
		changePassword: jest.fn().mockReturnValue(of({})),
		setupPassword: jest.fn().mockReturnValue(of({})),
		validateSetupPasswordToken: jest.fn().mockReturnValue(of(true)),
	};

	const recoverPasswordServiceMock = {
		getRecoverByToken: jest.fn().mockReturnValue(of({})),
	};

	const dialogServiceMock = {
		message: jest.fn(),
	};

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

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		toastrServiceMock = { error: jest.fn(), warning: jest.fn() };

		await TestBed.configureTestingModule({
			declarations: [AriaAttributesDirective],
			imports: [
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				CommonUiModule,
				ChangePasswordComponent,
				NoopAnimationsModule,
			],
			providers: [
				FormBuilder,
				{ provide: Router, useValue: routerMock },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: 'env', useValue: environmentMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: ChangePasswordService, useValue: changePasswordServiceMock },
				{ provide: RecoverPasswordService, useValue: recoverPasswordServiceMock },
				{ provide: ToastrService, useValue: toastrServiceMock },
				TranslateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ChangePasswordComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should not set the token if params are not available', () => {
		const activatedRoute = TestBed.inject(ActivatedRoute);
		const params: Observable<Params> = of({});
		activatedRoute.params = params;

		component['getTokenFromParam']();

		expect(component['token']).toBeUndefined();
	});

	it('should initialize the form', () => {
		component.ngOnInit();
		expect(component.form).toBeTruthy();
		expect(component.form.get('password')).toBeTruthy();
		expect(component.form.get('confirmPassword')).toBeTruthy();
	});

	it('should not call change password when recaptcha is null', () => {
		component.ngOnInit();
		component['username'] = undefined;
		component.form.setValue({
			password: 'test@example.com',
			confirmPassword: null,
		});
		component.savePassword();
		expect(changePasswordServiceMock.changePassword).toHaveBeenCalledTimes(0);
	});

	it('should not perform change password when form is invalid', () => {
		component.savePassword();
		expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
	});

	it('should define form group on init', () => {
		component.ngOnInit();
		expect(component.form).toBeDefined();
	});

	it('should mark password form control as invalid when empty', () => {
		const passwordControl = component.form.get('password');
		passwordControl?.setValue('');
		expect(passwordControl?.valid).toBeFalsy();
		expect(passwordControl?.hasError('required')).toBeTruthy();
	});

	it('should mark password form control as invalid when invalid', () => {
		const passwordControl = component.form.get('password');
		passwordControl?.setValue('invalid');
		expect(passwordControl?.valid).toBeFalsy();
	});

	it('should mark confirmpassword as invalid when empty', () => {
		const confirmPasswordControl = component.form.get('confirmPassword');
		confirmPasswordControl?.setValue('');
		expect(confirmPasswordControl?.valid).toBeFalsy();
	});

	it('should navigate to login when navigateToLogin method is called', () => {
		component.navigateToLogin();
		expect(routerMock.navigate).toHaveBeenCalled();
	});

	it('should navigate to recover when navigateToRecover method is called', () => {
		component.navigateToRecover();
		expect(routerMock.navigate).toHaveBeenCalled();
	});

	it('should have required on password & confirmPassword validator', () => {
		component.ngOnInit();
		component.form.setValue({
			password: null,
			confirmPassword: null,
		});

		expect(component.form.get('password')?.hasValidator(Validators.required)).toBe(true);
		expect(component.form.get('confirmPassword')?.hasValidator(Validators.required)).toBe(true);
	});

	it('should call savePassword with values from form group', () => {
		component.ngOnInit();
		component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
		component['token'] = 'token';
		component['username'] = undefined;
		component.savePassword();
		expect(changePasswordServiceMock.changePassword).toHaveBeenCalledWith({
			password: 'Password1!',
			token: 'token',
		});
		expect(routerMock.navigate).toHaveBeenCalledWith(['login']);
	});

	it('should render success message when shouldDisplaySuccessfulPasswordChangeDialog is true', () => {
		component.shouldDisplaySuccessfulPasswordChangeDialog = true;
		fixture.detectChanges();
		const formElement = fixture.debugElement.query(By.css('form'));
		expect(formElement).toBeNull();
	});

	it('should not render success message when shouldDisplaySuccessfulPasswordChangeDialog is true', () => {
		component.shouldDisplaySuccessfulPasswordChangeDialog = false;
		fixture.detectChanges();
		const formElement = fixture.debugElement.query(By.css('form'));
		expect(formElement).toBeTruthy();
	});

	it('should throw error when match old password', () => {
		component.ngOnInit();
		component.form.setValue({
			password: 'Password1!',
			confirmPassword: 'Password1!',
		});
		changePasswordServiceMock.changePassword.mockReturnValue(
			throwError(() => new Error('Some other error message')),
		);

		component.savePassword();

		expect(component.savePassword).toThrow();
	});

	it('should reset form after throw error', () => {
		const passwordControl = component?.form?.get('password');
		const confirmPasswordControl = component.form.get('confirmPassword');

		component.ngOnInit();
		component.form.setValue({
			password: 'Password1!',
			confirmPassword: 'Password1!',
		});
		changePasswordServiceMock.changePassword.mockReturnValue(throwError('Some other error message'));

		component.savePassword();

		expect(passwordControl?.getRawValue()).toBe('');
		expect(confirmPasswordControl?.getRawValue()).toBe('');
	});

	it('should call change password from servuce when method is called', () => {
		component.ngOnInit();
		component.form.setValue({
			password: 'Password1!',
			confirmPassword: 'Password1!',
		});

		component.savePassword();

		expect(changePasswordServiceMock.changePassword).toHaveBeenCalled();
	});

	it('should intializate model when sendEmail is called', () => {
		const changePassMock = new ChangePassword('token', 'Password1!');

		component.ngOnInit();
		component.form.setValue({
			password: 'Password1!',
			confirmPassword: 'Password1!',
		});

		component['token'] = 'token';

		component.savePassword();

		expect(changePasswordServiceMock.changePassword).toHaveBeenCalledWith(changePassMock);
	});

	it('should change password', () => {
		component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
		component['token'] = 'token-example';
		component.savePassword();
		fixture.detectChanges();
		expect(changePasswordServiceMock.changePassword).toHaveBeenCalledWith(
			expect.objectContaining({ token: 'token-example', password: 'Password1!' }),
		);
	});

	it('should disable the change button until all the fields are valid', () => {
		const passwordControl = component.form.get('password');
		const confirmPasswordControl = component.form.get('confirmPassword');

		const element: HTMLElement = fixture.nativeElement;
		const registerButton = element.querySelector('.form-button') as HTMLButtonElement;

		expect((registerButton.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(true);

		passwordControl?.setValue('Password1!');
		confirmPasswordControl?.setValue('Password1!');

		fixture.whenStable().then(() => {
			fixture.detectChanges();
			expect((registerButton.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(false);
		});
	});

	it('should mark the confirmPassword field as invalid when it does not match password', () => {
		const passwordControl = component.form.get('password');
		const confirmPasswordControl = component.form.get('confirmPassword');

		passwordControl?.setValue('password123');
		confirmPasswordControl?.setValue('differentPassword');

		fixture.whenStable().then(() => {
			fixture.detectChanges();
			expect(confirmPasswordControl?.hasError('fieldsMismatch')).toBeTruthy();
		});
	});

	it('should mark the confirmPassword field as valid  when it does match password', () => {
		const passwordControl = component.form.get('password');
		const confirmPasswordControl = component.form.get('confirmPassword');

		passwordControl?.setValue('password123');
		confirmPasswordControl?.setValue('password123');

		expect(confirmPasswordControl?.hasError('fieldsMismatch')).toBeFalsy();
	});

	it('should mark the password field as invalid for an invalid password', () => {
		const passwordControl = component.form.get('password');

		passwordControl?.setValue('WeakPass');
		expect(passwordControl?.valid).toBeFalsy();
	});

	it('should mark the password field as valid for a valid password', () => {
		const passwordControl = component.form.get('password');

		passwordControl?.setValue('StrongPass1!');
		expect(passwordControl?.valid).toBeTruthy();
	});

	it('should return password validation errors', () => {
		component.ngOnInit();

		const validationErrors = component['getPasswordValidationErrors']();

		expect(validationErrors).toBeTruthy();
		expect(validationErrors?.['required']).toBeTruthy();
	});

	it('should return null for no password validation errors', () => {
		component.ngOnInit();

		const validationErrors = component['getPasswordValidationErrors']();
		expect(validationErrors).toStrictEqual({ required: true, validPassword: true });
	});

	it('should throw error token is expired', () => {
		const expiredToken = 'expiredToken';
		component.ngOnInit();
		component.form.setValue({
			password: 'Password1!',
			confirmPassword: 'Password1!',
		});
		recoverPasswordServiceMock.getRecoverByToken.mockReturnValue(
			throwError(() => new Error('Some other error message')),
		);

		component['getRecoverByToken'](expiredToken);

		expect(component['getRecoverByToken']).toThrow();
	});

	describe('testTokenFromParam', () => {
		beforeEach(() => {
			component.ngOnInit();
		});

		it('should not set the token if "token" param is not present', () => {
			const activatedRoute = TestBed.inject(ActivatedRoute);
			activatedRoute.params = of({ otherParam: 'some-value' });

			component['getTokenFromParam']();

			expect(component['token']).toBeUndefined();
		});

		it('should set the token from ActivatedRoute params', () => {
			const mockToken = 'your-test-token';
			const activatedRoute = TestBed.inject(ActivatedRoute);
			activatedRoute.params = of({ token: mockToken });

			component['getTokenFromParam']();
			expect(component['token']).toEqual(mockToken);
		});

		it('should set the token from ActivatedRoute params when params are available', () => {
			const mockToken = 'your-test-token';
			const activatedRoute = TestBed.inject(ActivatedRoute);
			const params: Observable<Params> = of({ token: mockToken });
			activatedRoute.params = params;

			component['getTokenFromParam']();

			params.subscribe(() => {
				expect(component['token']).toEqual(mockToken);
			});
		});
	});

	describe('showDialog', () => {
		it('should navigate to login after successful password change dialog closed', fakeAsync(() => {
			const mockDialogRef = {
				afterClosed: jest.fn().mockReturnValue(of(true)),
			};

			const dialogServiceMock = {
				message: jest.fn().mockReturnValue(mockDialogRef),
			};

			const routerMock = {
				navigate: jest.fn(),
			};

			component['dialogService'] = dialogServiceMock as any;
			component['router'] = routerMock as any;

			const dialogConfig = {
				data: { message: 'Password changed successfully!' },
				width: '400px',
				maxWidth: 'auto',
				panelClass: ['responsive-max-width', 'responsive-max-height', 'responsive-max-height'],
			};

			component['showDialog'](dialogConfig);
			tick();

			expect(dialogServiceMock.message).toHaveBeenCalledWith(CustomDialogComponent, dialogConfig);
			expect(mockDialogRef.afterClosed).toHaveBeenCalled();
			expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.login]);
		}));

		it('should navigate to recover if token retrieval fails', fakeAsync(() => {
			recoverPasswordServiceMock.getRecoverByToken.mockReturnValueOnce(throwError(() => new Error('error')));
			component['getRecoverByToken']('invalid-token');
			tick();
			expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.recover]);
		}));

		it('should correctly determine if password confirmation error should be displayed', () => {
			component.form.get('confirmPassword')?.setErrors({ required: true });
			expect(component.shouldDisplayPasswordConfirmationError()).toBe(true);

			component.form.get('confirmPassword')?.setErrors(null);
			component.form.setErrors({ fieldsMismatch: true });
			expect(component.shouldDisplayPasswordConfirmationError()).toBe(true);
		});

		it('should return correct toaster type', () => {
			component.form.get('password')?.setErrors({ required: true });
			expect(component.getToasterType()).toBe('warning');

			component.form.get('password')?.setErrors(null);
			expect(component.getToasterType()).toBe('success');
		});

		it('should reset the form if changePasswordService fails', fakeAsync(() => {
			changePasswordServiceMock.changePassword.mockReturnValueOnce(throwError(() => new Error('error')));

			component['token'] = 'some-token';
			component.form.setValue({ password: 'Valid123!', confirmPassword: 'Valid123!' });

			component.savePassword();
			tick();

			expect(component.form.value.password).toBeNull();
			expect(component.form.value.confirmPassword).toBeNull();
		}));

		it('should not navigate to login if modal is open', fakeAsync(() => {
			const mockDialogRef = { afterClosed: () => of(false) };
			const dialogServiceMock = { message: jest.fn().mockReturnValue(mockDialogRef) };
			const routerMock = { navigate: jest.fn() };

			component['dialogService'] = dialogServiceMock as any;
			component['router'] = routerMock as any;

			const dialogMessage = 'Password change failed';
			const expectedDialogConfig = {
				data: { message: dialogMessage },
				width: '400px',
				maxWidth: 'auto',
				panelClass: ['responsive-max-width', 'responsive-max-height', 'responsive-max-height'],
			};

			component['showDialog'](expectedDialogConfig);
			tick();

			expect(dialogServiceMock.message).toHaveBeenCalledWith(CustomDialogComponent, expectedDialogConfig);
			expect(routerMock.navigate).not.toHaveBeenCalled();
		}));

		it('should not navigate to login if dialog is closed with response false', () => {
			const dialogConfig = { data: 'test' } as any;
			const afterClosedMock = jest.fn().mockReturnValue(of(false));
			const dialogRefMock = { afterClosed: afterClosedMock };
			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(dialogRefMock);

			routerMock.navigate.mockClear();

			component['showDialog'](dialogConfig);

			expect(routerMock.navigate).not.toHaveBeenCalledWith([expect.stringContaining('login')]);
		});

		it('should not throw if dialogService.message returns undefined', () => {
			const dialogConfig = { data: 'test' } as any;
			jest.spyOn(dialogServiceMock, 'message').mockReturnValue(undefined);

			expect(() => component['showDialog'](dialogConfig)).not.toThrow();
		});

		it('should call showDialog with correct config in displaySuccessfulRecoveryDialog', () => {
			const showDialogSpy = jest.spyOn(component as any, 'showDialog');
			component['displaySuccessfulRecoveryDialog']();
			expect(showDialogSpy).toHaveBeenCalled();
		});

		it('should call getRecoverByToken when token param is present', () => {
			const getRecoverByTokenSpy = jest.spyOn(component as any, 'getRecoverByToken');
			const activatedRoute = TestBed.inject(ActivatedRoute);
			activatedRoute.params = of({ token: 'my-token' });
			component['getTokenFromParam']();
			expect(getRecoverByTokenSpy).toHaveBeenCalledWith('my-token');
		});

		it('getPasswordChangeSuccessConfig should return config with disableClose true', () => {
			const config = (component as any).getPasswordChangeSuccessConfig();
			expect(config.disableClose).toBe(true);
		});

		it('should call navigateToRecover if getRecoverByToken fails', fakeAsync(() => {
			const recoverPasswordServiceMockLocal = {
				getRecoverByToken: jest.fn().mockReturnValue(throwError(() => new Error('error'))),
			};
			const routerMockLocal = { navigate: jest.fn() };
			component['recoverPasswordService'] = recoverPasswordServiceMockLocal as any;
			component['router'] = routerMockLocal as any;
			component['getRecoverByToken']('bad-token');
			tick();
			expect(routerMockLocal.navigate).toHaveBeenCalledWith([commonRoutingConstants.recover]);
		}));

		it('should call form.reset() if setupPassword fails', fakeAsync(() => {
			const authServiceMock = {
				isLoggedIn: true,
				credentialsExpired: true,
				getUpdateAccessToken: jest.fn(),
				logout: jest.fn(),
			};
			const setupPasswordMock = jest.fn().mockReturnValue(throwError(() => new Error('error')));
			Object.defineProperty(component, 'authService', {
				value: authServiceMock,
				writable: true,
			});
			component['changePasswordService'].setupPassword = setupPasswordMock;
			const resetSpy = jest.spyOn(component.form, 'reset');
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component.savePassword();
			tick();
			expect(resetSpy).toHaveBeenCalled();
		}));

		it('should call form.reset() if changePassword fails', fakeAsync(() => {
			const changePasswordMock = jest.fn().mockReturnValue(throwError(() => new Error('error')));
			component['changePasswordService'].changePassword = changePasswordMock;
			const resetSpy = jest.spyOn(component.form, 'reset');
			component['token'] = 'token';
			component['username'] = 'username';
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component.savePassword();
			tick();
			expect(resetSpy).toHaveBeenCalled();
		}));

		it('should set shouldDisplaySuccessfulPasswordChangeDialog to true and call showDialog in displaySuccessfulRecoveryDialog', () => {
			const showDialogSpy = jest.spyOn(component as any, 'showDialog');
			component.shouldDisplaySuccessfulPasswordChangeDialog = false;
			(component as any).displaySuccessfulRecoveryDialog();
			expect(component.shouldDisplaySuccessfulPasswordChangeDialog).toBe(true);
			expect(showDialogSpy).toHaveBeenCalled();
		});
	});
	describe('savePassword', () => {
		// it('should not proceed if form is invalid', () => {
		// 	component.form.setErrors({ invalid: true });
		// 	component.savePassword();
		// 	expect(changePasswordServiceMock.changePassword).not.toHaveBeenCalled();
		// });

		// it('should call setupPassword if url includes setupPassword and username is defined', () => {
		// 	component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
		// 	component['token'] = 'token';
		// 	component['username'] = 'user';
		// 	routerMock.url = '/setup-password';
		// 	const setupPasswordSpy = jest
		// 		.spyOn(component['changePasswordService'], 'setupPassword')
		// 		.mockReturnValue(of({} as any));
		// 	component.savePassword();
		// 	expect(setupPasswordSpy).toHaveBeenCalled();
		// });

		it('should call changePassword if url does not include setupPassword', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token';
			component['username'] = undefined;
			routerMock.url = '/change-password';
			const changePasswordSpy = jest
				.spyOn(component['changePasswordService'], 'changePassword')
				.mockReturnValue(of({} as any));
			component.savePassword();
			expect(changePasswordSpy).toHaveBeenCalled();
		});

		it('should reset form if changePasswordService.changePassword errors', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token';
			component['username'] = undefined;
			routerMock.url = '/change-password';
			jest.spyOn(component['changePasswordService'], 'changePassword').mockReturnValue(
				throwError(() => new Error('error')),
			);
			const resetSpy = jest.spyOn(component.form, 'reset');
			component.savePassword();
			expect(resetSpy).toHaveBeenCalled();
		});

		it('should reset form if changePasswordService.setupPassword errors', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token';
			component['username'] = 'user';
			routerMock.url = '/setup-password';
			jest.spyOn(component['changePasswordService'], 'setupPassword').mockReturnValue(
				throwError(() => new Error('error')),
			);
			const resetSpy = jest.spyOn(component.form, 'reset');
			component.savePassword();
			expect(resetSpy).toHaveBeenCalled();
		});
	});
	describe('setupPassword', () => {
		it('should call changePasswordService.setupPassword with correct model', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token123';
			component['username'] = 'user1';
			const setupPasswordSpy = jest
				.spyOn(component['changePasswordService'], 'setupPassword')
				.mockReturnValue(of({} as any));

			component['setupPassword']();

			expect(setupPasswordSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					token: 'token123',
					username: 'user1',
					password: 'Password1!',
				}),
			);
		});

		it('should call displaySuccessfulRecoveryDialog on success', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token123';
			component['username'] = 'user1';
			jest.spyOn(component['changePasswordService'], 'setupPassword').mockReturnValue(of({} as any));
			const displayDialogSpy = jest.spyOn(component as any, 'displaySuccessfulRecoveryDialog');

			component['setupPassword']();

			expect(displayDialogSpy).toHaveBeenCalled();
		});

		it('should reset form on error', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token123';
			component['username'] = 'user1';
			jest.spyOn(component['changePasswordService'], 'setupPassword').mockReturnValue(
				throwError(() => new Error('error')),
			);
			const resetSpy = jest.spyOn(component.form, 'reset');

			component['setupPassword']();

			expect(resetSpy).toHaveBeenCalled();
		});
	});
	describe('getTokenFromParam', () => {
		it('should set token and username if both are present in params', () => {
			const activatedRoute = TestBed.inject(ActivatedRoute);
			activatedRoute.params = of({ token: 'token123', username: 'user1' });

			component['getTokenFromParam']();

			expect(component['token']).toBe('token123');
			expect(component['username']).toBe('user1');
		});

		it('should set token and call getRecoverByToken if username is not present', () => {
			const activatedRoute = TestBed.inject(ActivatedRoute);
			const getRecoverByTokenSpy = jest.spyOn(component as any, 'getRecoverByToken');
			activatedRoute.params = of({ token: 'token456' });

			component['getTokenFromParam']();

			expect(component['token']).toBe('token456');
			expect(component['username']).toBeUndefined();
			expect(getRecoverByTokenSpy).toHaveBeenCalledWith('token456');
		});

		it('should call validateSetupPasswordToken when username is present in params', () => {
			const validateSetupPasswordTokenSpy = jest.spyOn(component as any, 'validateSetupPasswordToken');
			const activatedRoute = TestBed.inject(ActivatedRoute);
			activatedRoute.params = of({ token: 'token123', username: 'user1' });

			component['getTokenFromParam']();

			expect(validateSetupPasswordTokenSpy).toHaveBeenCalledWith(new SetupPasswordValidate('token123', 'user1'));
		});

		it('should navigate to login if validateSetupPasswordToken returns false', () => {
			const validateSetupPasswordMock = jest.fn().mockReturnValue(of(false));
			component['changePasswordService'].validateSetupPasswordToken = validateSetupPasswordMock;
			const navigateToLoginSpy = jest.spyOn(component, 'navigateToLogin');

			component['validateSetupPasswordToken'](new SetupPasswordValidate('token123', 'user1'));

			expect(validateSetupPasswordMock).toHaveBeenCalledWith({ token: 'token123', username: 'user1' });
			expect(navigateToLoginSpy).toHaveBeenCalled();
		});

		it('should not navigate to login if validateSetupPasswordToken returns true', () => {
			const validateSetupPasswordMock = jest.fn().mockReturnValue(of(true));
			component['changePasswordService'].validateSetupPasswordToken = validateSetupPasswordMock;
			const navigateToLoginSpy = jest.spyOn(component, 'navigateToLogin');

			component['validateSetupPasswordToken'](new SetupPasswordValidate('token123', 'user1'));

			expect(validateSetupPasswordMock).toHaveBeenCalledWith({ token: 'token123', username: 'user1' });
			expect(navigateToLoginSpy).not.toHaveBeenCalled();
		});

		it('should navigate to login if validateSetupPasswordToken errors', () => {
			const validateSetupPasswordMock = jest.fn().mockReturnValue(throwError(() => new Error('error')));
			component['changePasswordService'].validateSetupPasswordToken = validateSetupPasswordMock;
			const navigateToLoginSpy = jest.spyOn(component, 'navigateToLogin');

			component['validateSetupPasswordToken'](new SetupPasswordValidate('token123', 'user1'));

			expect(navigateToLoginSpy).toHaveBeenCalled();
		});

		it('should call changePassword when url does not include setupPassword', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token';
			component['username'] = undefined;
			routerMock.url = '/change-password';
			const changePasswordSpy = jest.spyOn(component as any, 'changePassword');

			component.savePassword();

			expect(changePasswordSpy).toHaveBeenCalled();
		});

		it('should call displaySuccessfulRecoveryDialog on successful changePassword', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token123';
			jest.spyOn(component['changePasswordService'], 'changePassword').mockReturnValue(of({} as any));
			const displayDialogSpy = jest.spyOn(component as any, 'displaySuccessfulRecoveryDialog');

			component['changePassword']();

			expect(displayDialogSpy).toHaveBeenCalled();
		});

		it('should call displayWarningSetupPasswordToaster when validateSetupPasswordToken returns false', () => {
			const validateSetupPasswordMock = jest.fn().mockReturnValue(of(false));
			component['changePasswordService'].validateSetupPasswordToken = validateSetupPasswordMock;
			const displayWarningSpy = jest.spyOn(component as any, 'displayWarningSetupPasswordToaster');

			component['validateSetupPasswordToken'](new SetupPasswordValidate('token123', 'user1'));

			expect(displayWarningSpy).toHaveBeenCalled();
		});

		it('should call displayWarningSetupPasswordToaster when validateSetupPasswordToken errors', () => {
			const validateSetupPasswordMock = jest.fn().mockReturnValue(throwError(() => new Error('error')));
			component['changePasswordService'].validateSetupPasswordToken = validateSetupPasswordMock;
			const displayWarningSpy = jest.spyOn(component as any, 'displayWarningSetupPasswordToaster');

			component['validateSetupPasswordToken'](new SetupPasswordValidate('token123', 'user1'));

			expect(displayWarningSpy).toHaveBeenCalled();
		});
	});

	describe('displayWarningSetupPasswordToaster', () => {
		it('should call translateService.instant with correct key', () => {
			const instantSpy = jest.spyOn(component['translateService'], 'instant');

			component['displayWarningSetupPasswordToaster']();

			expect(instantSpy).toHaveBeenCalledWith('setupProfile.passwordAlreadySetup');
		});
	});

	describe('savePassword with setup flow', () => {
		it('should call setupPassword if url includes setupPassword and username is defined', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token';
			component['username'] = 'user';
			routerMock.url = '/set-password';
			const setupPasswordSpy = jest.spyOn(component as any, 'setupPassword');

			component.savePassword();

			expect(setupPasswordSpy).toHaveBeenCalled();
		});

		it('should call changePassword if username is undefined even with setupPassword in url', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token';
			component['username'] = undefined;
			routerMock.url = '/setup-password';
			const changePasswordSpy = jest.spyOn(component as any, 'changePassword');

			component.savePassword();

			expect(changePasswordSpy).toHaveBeenCalled();
		});
	});

	describe('getPasswordValidationErrors', () => {
		it('should return password field errors', () => {
			component.ngOnInit();
			const passwordControl = component.form.get('password');
			passwordControl?.setErrors({ required: true, minLength: true });

			const errors = component['getPasswordValidationErrors']();

			expect(errors).toEqual({ required: true, minLength: true });
		});

		it('should return null when password field has no errors', () => {
			component.ngOnInit();
			component.form.get('password')?.setValue('ValidPassword1!');
			component.form.get('password')?.setErrors(null);

			const errors = component['getPasswordValidationErrors']();

			expect(errors).toBeNull();
		});

		it('should call toastrService.warning with correct parameters in displayWarningSetupPasswordToaster', () => {
			const mockTranslatedMessage = 'Password already setup message';
			jest.spyOn(component['translateService'], 'instant').mockReturnValue(mockTranslatedMessage);

			component['displayWarningSetupPasswordToaster']();

			expect(toastrServiceMock.warning).toHaveBeenCalledWith(`<p>${mockTranslatedMessage}</p>`, '', {
				toastBackground: 'toast-light',
				enableHtml: true,
				progressBar: true,
				tapToDismiss: true,
				timeOut: 8000,
				extendedTimeOut: 8000,
			});
		});

		it('should call navigateToLogin and displayWarningSetupPasswordToaster in navigateToLoginAndShowWarningToaster', () => {
			const navigateToLoginSpy = jest.spyOn(component, 'navigateToLogin');
			const displayWarningSpy = jest.spyOn(component as any, 'displayWarningSetupPasswordToaster');

			component['navigateToLoginAndShowWarningToaster']();

			expect(navigateToLoginSpy).toHaveBeenCalled();
			expect(displayWarningSpy).toHaveBeenCalled();
		});

		it('should return undefined when password field does not exist', () => {
			component.form = component['formBuilder'].group({});

			const errors = component['getPasswordValidationErrors']();

			expect(errors).toBeUndefined();
		});

		it('should handle params subscription error gracefully', () => {
			const activatedRoute = TestBed.inject(ActivatedRoute);
			activatedRoute.params = throwError(() => new Error('params error'));

			expect(() => component['getTokenFromParam']()).not.toThrow();
		});

		it('should use empty string for username when username is undefined in setupPassword', () => {
			component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
			component['token'] = 'token123';
			component['username'] = undefined;
			const setupPasswordSpy = jest
				.spyOn(component['changePasswordService'], 'setupPassword')
				.mockReturnValue(of({} as any));

			component['setupPassword']();

			expect(setupPasswordSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					token: 'token123',
					username: '',
					password: 'Password1!',
				}),
			);
		});

		it('should return early from savePassword when form is invalid', () => {
			component.form.setErrors({ invalid: true });
			const changePasswordSpy = jest.spyOn(component as any, 'changePassword');
			const setupPasswordSpy = jest.spyOn(component as any, 'setupPassword');

			component.savePassword();

			expect(changePasswordSpy).not.toHaveBeenCalled();
			expect(setupPasswordSpy).not.toHaveBeenCalled();
		});
	});
});
