import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AppType, ChangePassword, ChangePasswordService, RecoverPasswordService } from '@frontend/common';
import { AriaAttributesDirective } from '@innovation/accesibility';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { Observable, of, throwError } from 'rxjs';

import { CustomDialogConfigUtil } from '../../_util/custom-dialog-config';
import { CommonUiModule } from '../../common-ui.module';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
	let component: ChangePasswordComponent;
	let fixture: ComponentFixture<ChangePasswordComponent>;

	const routerMock = {
		navigate: jest.fn(),
	};

	const changePasswordServiceMock = {
		changePassword: jest.fn().mockReturnValue(of({})),
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

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ChangePasswordComponent, AriaAttributesDirective],
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), CommonUiModule],
			providers: [
				FormBuilder,
				{ provide: Router, useValue: routerMock },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: 'env', useValue: environmentMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: ChangePasswordService, useValue: changePasswordServiceMock },
				{ provide: RecoverPasswordService, useValue: recoverPasswordServiceMock },
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

	it('should not navigate to login if modal is open', fakeAsync(() => {
		mockDialogRef.afterClosed.mockReturnValue(of(false));

		component['showDialog'](dialogConfig);
		tick();

		expect(dialogServiceMock['message']).toHaveBeenCalledWith(CustomDialogComponent, dialogConfig);
		expect(routerMock.navigate).not.toHaveBeenCalled();
	}));

	it('should not navigate to login when dialog response is false', () => {
		const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

		const mockDialogRef = {
			afterClosed: () => of(false),
		};

		jest.spyOn(dialogServiceMock, 'message').mockReturnValue(mockDialogRef);

		component['showDialog'](dialogConfig);

		expect(dialogServiceMock['message']).toHaveBeenCalledWith(CustomDialogComponent, dialogConfig);
		expect(routerMock.navigate).not.toHaveBeenCalled();
	});

	it('should initialize the form', () => {
		component.ngOnInit();
		expect(component.form).toBeTruthy();
		expect(component.form.get('password')).toBeTruthy();
		expect(component.form.get('confirmPassword')).toBeTruthy();
	});

	it('should not call change password when recaptcha is null', () => {
		component.ngOnInit();
		component.form.setValue({
			password: 'test@example.com',
			confirmPassword: null,
		});
		component.changePassword();
		expect(changePasswordServiceMock.changePassword).toBeCalledTimes(0);
	});

	it('should not perform change password when form is invalid', () => {
		component.changePassword();
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

	it('should call changePassword with values from form group', () => {
		component.ngOnInit();
		component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
		component['token'] = 'token';
		component.changePassword();
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

	it('should navigate to login if modal is closed', () => {
		const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

		const mockDialogRef = {
			afterClosed: () => of(true),
		};

		jest.spyOn(dialogServiceMock, 'message').mockReturnValue(mockDialogRef);

		component['showDialog'](dialogConfig);

		expect(dialogServiceMock['message']).toHaveBeenCalledWith(CustomDialogComponent, dialogConfig);
		expect(routerMock.navigate).toHaveBeenCalled();
	});

	it('should throw error when match old password', () => {
		component.ngOnInit();
		component.form.setValue({
			password: 'Password1!',
			confirmPassword: 'Password1!',
		});
		changePasswordServiceMock.changePassword.mockReturnValue(throwError('Some other error message'));

		component.changePassword();

		expect(component.changePassword).toThrowError();
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

		component.changePassword();

		expect(passwordControl?.getRawValue()).toBe('');
		expect(confirmPasswordControl?.getRawValue()).toBe('');
	});

	it('should call change password from servuce when method is called', () => {
		component.ngOnInit();
		component.form.setValue({
			password: 'Password1!',
			confirmPassword: 'Password1!',
		});

		component.changePassword();

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

		component.changePassword();

		expect(changePasswordServiceMock.changePassword).toHaveBeenCalledWith(changePassMock);
	});

	it('should change password', () => {
		component.form.setValue({ password: 'Password1!', confirmPassword: 'Password1!' });
		component['token'] = 'token-example';
		component.changePassword();
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
		recoverPasswordServiceMock.getRecoverByToken.mockReturnValue(throwError('Some other error message'));

		component['getRecoverByToken'](expiredToken);

		expect(component['getRecoverByToken']).toThrowError();
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
});
