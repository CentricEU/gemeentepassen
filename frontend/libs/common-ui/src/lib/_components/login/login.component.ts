import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppType, AuthService, CaptchaService, CaptchaStatus, FormUtil, Role } from '@frontend/common';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
	selector: 'frontend-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
	public form: FormGroup;
	public autofilled: boolean;
	public hasControlRequiredErrorAndTouched = FormUtil.hasControlRequiredErrorAndTouched;
	public validationFunctionError = FormUtil.genericValidationFunctionError;
	public emailValidator = FormUtil.validateEmail(false);
	public getEmailErrorMessage = FormUtil.getEmailErrorMessage;
	public appLoginPage: string;
	public userIsBlocked = false;

	@ViewChild(RecaptchaComponent) ngRecaptcha!: RecaptchaComponent;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private captchaService: CaptchaService,
	) {
		this.subscribeToRouteData();
		this.subscribeToCaptcha();
	}

	public ngOnInit(): void {
		this.initForm();
	}

	public login(): void {
		if (!this.form.valid) {
			return;
		}
		this.performLogin();
	}

	public performLogin(): void {
		if (this.userIsBlocked && !this.form.controls['recaptcha'].value) {
			return;
		}

		this.authService
			.login(
				this.form.controls['email'].value,
				this.form.controls['password'].value,
				this.form.controls['recaptcha'].value,
				this.form.controls['rememberMe'].value,
				this.appLoginPage === AppType.municipality ? Role.MUNICIPALITY_ADMIN : Role.SUPPLIER,
			)
			.subscribe(() => {
				const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
				this.router.navigate([returnUrl]);
			});
	}

	private initForm(): void {
		this.form = this.formBuilder.group({
			email: ['', [Validators.required, this.emailValidator]],
			password: ['', [Validators.required]],
			rememberMe: false,
			recaptcha: ['', this.userIsBlocked ? [Validators.required] : []],
		});
	}

	private subscribeToRouteData(): void {
		this.route.data.subscribe((data) => {
			this.appLoginPage = data['app'];
		});
	}

	private subscribeToCaptcha(): void {
		this.captchaService.displayCaptchaObservable.subscribe((data) => {
			if (data === CaptchaStatus.CREATED) {
				this.addRecaptcha();
			} else {
				this.ngRecaptcha?.reset();
			}
			this.addRecaptchaValidatorsAndDetechChanges();
		});
	}

	private addRecaptcha(): void {
		if (this.userIsBlocked && this.form.get('recaptcha')) {
			return;
		}

		this.userIsBlocked = true;
	}

	private addRecaptchaValidatorsAndDetechChanges(): void {
		const recaptcha = this.form.get('recaptcha');
		if (recaptcha && !recaptcha.hasValidator(Validators.required)) {
			recaptcha.addValidators(Validators.required);
		}
	}
}
