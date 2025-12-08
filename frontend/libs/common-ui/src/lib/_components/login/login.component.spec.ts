import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppType, AuthService, CaptchaService, CaptchaStatus, Role } from '@frontend/common';
import { AriaAttributesDirective } from '@innovation/accesibility';
import { TranslateModule } from '@ngx-translate/core';
import { of, take, throwError } from 'rxjs';

import { CommonUiModule } from '../../common-ui.module';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let captchaService: CaptchaService;

	const authServiceMock = {
		login: jest.fn().mockReturnValue(of({})),
	};

	const routerMock = {
		navigate: jest.fn(),
	};

	const activatedRouteMock = {
		snapshot: {
			queryParams: { returnUrl: '/' },
		},
		data: of({ app: AppType.municipality }),
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [AriaAttributesDirective],
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), CommonUiModule, LoginComponent],
			providers: [
				FormBuilder,
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: Router, useValue: routerMock },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				CaptchaService,
			],
		});

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		captchaService = TestBed.inject(CaptchaService);
		component.ngOnInit();
	});

	it('should create the LoginComponent', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize the form', () => {
		component.ngOnInit();
		expect(component.form).toBeTruthy();
		expect(component.form.get('email')).toBeTruthy();
		expect(component.form.get('password')).toBeTruthy();
		expect(component.form.get('rememberMe')).toBeTruthy();
		expect(component.form.get('recaptcha')).toBeTruthy();
		expect(component.form.get('recaptcha')?.hasValidator(Validators.required)).toBe(false);
		expect(component.form.get('email')?.hasValidator(Validators.required)).toBe(true);
		expect(component.form.get('password')?.hasValidator(Validators.required)).toBe(true);
	});

	it('should initialize the form with recaptcha if user is blocked', () => {
		component.userIsBlocked = true;
		component.ngOnInit();
		expect(component.form).toBeTruthy();
		expect(component.form.get('email')).toBeTruthy();
		expect(component.form.get('password')).toBeTruthy();
		expect(component.form.get('rememberMe')).toBeTruthy();
		expect(component.form.get('recaptcha')).toBeTruthy();
		expect(component.form.get('email')?.hasValidator(Validators.required)).toBe(true);
		expect(component.form.get('password')?.hasValidator(Validators.required)).toBe(true);
		expect(component.form.get('recaptcha')?.hasValidator(Validators.required)).toBe(true);
	});

	it('it should not perform login when user is blocked and no captcha', () => {
		component.ngOnInit();
		component.form.setValue({
			email: 'test@example.com',
			password: 'password',
			rememberMe: false,
			recaptcha: '',
		});
		component.userIsBlocked = true;
		component.login();
		expect(authServiceMock.login).toHaveBeenCalledTimes(0);
	});

	it('should not perform login when form is invalid', () => {
		component.login();
		expect(authServiceMock.login).not.toHaveBeenCalled();
		expect(routerMock.navigate).not.toHaveBeenCalled();
	});

	it('should perform login when form is valid', () => {
		component.ngOnInit();
		component.appLoginPage = AppType.municipality;
		component.form.setValue({ email: 'test@example.com', password: 'password', rememberMe: false, recaptcha: '' });
		component.login();
		expect(authServiceMock.login).toHaveBeenCalledWith(
			'test@example.com',
			'password',
			'',
			false,
			Role.MUNICIPALITY_ADMIN,
		);
		expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
	});

	it('should set returnUrl to / if there is no returnUrl query parameter', () => {
		activatedRouteMock.snapshot.queryParams = { returnUrl: '' };
		component.ngOnInit();
		component.appLoginPage = AppType.municipality;
		component.form.setValue({ email: 'test@example.com', password: 'password', rememberMe: false, recaptcha: '' });
		component.login();
		expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
	});

	it('should set returnUrl to the specified value if returnUrl query parameter exists', () => {
		activatedRouteMock.snapshot.queryParams = { returnUrl: '/some-other-route' };
		component.ngOnInit();
		component.appLoginPage = AppType.municipality;
		component.form.setValue({ email: 'test@example.com', password: 'password', rememberMe: false, recaptcha: '' });
		component.login();
		component.performLogin();

		expect(routerMock.navigate).toHaveBeenCalledWith(['/some-other-route']);
	});

	describe('When form is valid should perform login', () => {
		beforeEach(() => {
			component.ngOnInit();
			component.form.setValue({
				email: 'test@example.com',
				password: 'password',
				rememberMe: false,
				recaptcha: '',
			});
		});

		it('should perform login with MUNICIPALITY_ADMIN role when form is valid and appType is municipality', () => {
			component.appLoginPage = AppType.municipality;
			component.login();
			expect(authServiceMock.login).toHaveBeenCalledWith(
				'test@example.com',
				'password',
				'',
				false,
				Role.MUNICIPALITY_ADMIN,
			);
			expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
		});

		it('should perform login with SUPPLIER role when form is valid and appType is supplier', () => {
			component.appLoginPage = AppType.supplier;
			component.login();
			expect(authServiceMock.login).toHaveBeenCalledWith(
				'test@example.com',
				'password',
				'',
				false,
				Role.SUPPLIER,
			);
			expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
		});
	});

	it('should set appLoginPage from route data', () => {
		expect(component.appLoginPage).toBe(AppType.municipality);
	});

	it('it should throw error and captcha validator to be null', () => {
		component.ngOnInit();
		component.form.setValue({
			email: 'test@example.com',
			password: 'password',
			rememberMe: false,
			recaptcha: '',
		});
		authServiceMock.login.mockReturnValue(throwError('Some other error message'));

		component.login();

		expect(authServiceMock.login).toHaveBeenCalled();
		expect(component.form.get('recaptcha')?.validator).toBe(null);
	});

	describe('getEmailErrorMessage', () => {
		beforeEach(() => {
			component.ngOnInit();
		});

		it('should return "genericFields.email.requiredEmail" when email is required but missing', () => {
			component.form.setValue({
				email: '',
				password: 'password',
				rememberMe: false,
				recaptcha: '',
			});
			const result = component.getEmailErrorMessage(component.form);
			expect(result).toBe('genericFields.email.requiredEmail');
		});

		it('should return "genericFields.email.validEmail" when email is required and invalid', () => {
			component.form.setValue({
				email: 'test@example',
				password: 'password',
				rememberMe: false,
				recaptcha: '',
			});
			const result = component.getEmailErrorMessage(component.form);
			expect(result).toBe('genericFields.email.validEmail');
		});

		it('should return an empty string when email is valid', () => {
			component.form.setValue({
				email: 'test@example.com',
				password: 'password',
				rememberMe: false,
				recaptcha: '',
			});
			const result = component.getEmailErrorMessage(component.form);
			expect(result).toBe('');
		});
	});

	describe('Recaptcha', () => {
		beforeEach(() => {
			component.ngOnInit();
		});
		it('should not add validators if user is not blocked', () => {
			component.userIsBlocked = true;
			const expectedStatus: CaptchaStatus = CaptchaStatus.CREATED;

			captchaService.displayCaptchaObservable.pipe(take(1)).subscribe((status) => {
				expect(status).toEqual(expectedStatus);
				expect(component['addRecaptchaValidatorsAndDetechChanges']).not.toBeCalled();
				expect(component.userIsBlocked).toBeFalsy();
				expect(component.form.get('recaptcha')?.hasValidator(Validators.required)).toBe(false);
			});
			captchaService.displayCaptchaSubject.next(expectedStatus);
		});
		it('should subscribe to captcha service and reset recaptcha when status is not CREATED', () => {
			const expectedStatus: CaptchaStatus = CaptchaStatus.CREATED;

			captchaService.displayCaptchaObservable.pipe(take(1)).subscribe((status) => {
				expect(status).toEqual(expectedStatus);
				expect(component['addRecaptchaValidatorsAndDetechChanges']).toBeCalled();
				expect(component.userIsBlocked).toBeTruthy();
				expect(component.form.get('recaptcha')?.hasValidator(Validators.required)).toBe(true);
			});
			captchaService.displayCaptchaSubject.next(expectedStatus);
		});

		it('should show recaptcha and have validators when form is valid and user is not blocked', () => {
			const expectedStatus: CaptchaStatus = CaptchaStatus.INVALID_CREDENTIALS;
			captchaService.displayCaptchaObservable.pipe(take(1)).subscribe((status) => {
				expect(status).toEqual(expectedStatus);
				expect(component['addRecaptchaValidatorsAndDetechChanges']).toBeCalled();
				expect(component['ngRecaptcha']['reset']).toBeCalled();
				const recaptcha = component.form.get('recaptcha');
				if (recaptcha) {
					expect(recaptcha.hasValidator(Validators.required)).toBe(true);
				}
			});
			captchaService.displayCaptchaSubject.next(expectedStatus);
		});

		it('should not add validators if recaptcha is null', () => {
			component.form.setValue({
				email: 'test@example.com',
				password: 'password',
				rememberMe: false,
				recaptcha: null,
			});
			const expectedStatus: CaptchaStatus = CaptchaStatus.INVALID_CREDENTIALS;
			captchaService.displayCaptchaObservable.pipe(take(1)).subscribe(() => {
				expect(component.form.get('recaptcha')?.hasValidator(Validators.required)).toBe(true);
			});
			captchaService.displayCaptchaSubject.next(expectedStatus);
		});
	});

	describe('shouldDisplayRegister', () => {
		it('should return false when appLoginPage is municipality', () => {
			component.appLoginPage = AppType.municipality;
			expect(component.shouldDisplayRegister).toBeFalsy();
		});

		it('should return true when appLoginPage is supplier', () => {
			component.appLoginPage = AppType.supplier;
			expect(component.shouldDisplayRegister).toBeTruthy();
		});
	});
});
