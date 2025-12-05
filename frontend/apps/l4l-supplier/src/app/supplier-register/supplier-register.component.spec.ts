import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Tenant, TenantService } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { AriaAttributesDirective } from '@innovation/accesibility';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { RegisterService } from '../services/register.service';
import { SupplierRegisterComponent } from './supplier-register.component';

describe('SupplierRegisterComponent', () => {
	let component: SupplierRegisterComponent;
	let fixture: ComponentFixture<SupplierRegisterComponent>;
	let tenantService: TenantService;
	let router: Router;
	let dialogServiceMock: any;

	const routerMock = {
		navigate: jest.fn(),
	};

	const registerMock = {
		registerSupplier: jest.fn(() => of(null)),
	};

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SupplierRegisterComponent, AriaAttributesDirective],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				HttpClientModule,
			],
			providers: [
				{ provide: Router, useValue: routerMock },
				{ provide: RegisterService, useValue: registerMock },
				{ provide: 'env', useValue: environmentMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				TenantService,
			],
		}).compileComponents();

		tenantService = TestBed.inject(TenantService);
		dialogServiceMock = {
			message: jest.fn(() => ({ afterClosed: () => of(true) })),
		};
		fixture = TestBed.createComponent(SupplierRegisterComponent);
		router = TestBed.inject(Router);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should create the form with all expected input fields', () => {
		expect(component.registerForm.controls['firstName']).toBeTruthy();
		expect(component.registerForm.controls['lastName']).toBeTruthy();
		expect(component.registerForm.controls['company']).toBeTruthy();
		expect(component.registerForm.controls['kvk']).toBeTruthy();
		expect(component.registerForm.controls['municipality']).toBeTruthy();
		expect(component.registerForm.controls['email']).toBeTruthy();
		expect(component.registerForm.controls['password']).toBeTruthy();
		expect(component.registerForm.controls['confirmPassword']).toBeTruthy();
	});

	it('should have a check-box', () => {
		expect(component.registerForm.controls['agreement']).toBeTruthy();
	});

	it('should mark firstName as invalid when empty', () => {
		const firstNameControl = component.registerForm.get('firstName');

		// Set the value to an empty string
		firstNameControl?.setValue('');

		// Expect the control to be invalid when empty
		expect(firstNameControl?.valid).toBeFalsy();
		expect(firstNameControl?.hasError('required')).toBeTruthy();
	});

	it('should mark lastName as invalid when empty', () => {
		const lastNameControl = component.registerForm.get('lastName');

		// Set the value to an empty string
		lastNameControl?.setValue('');

		// Expect the control to be invalid when empty
		expect(lastNameControl?.valid).toBeFalsy();
		expect(lastNameControl?.hasError('required')).toBeTruthy();
	});

	it('should mark company as invalid when empty', () => {
		const companyControl = component.registerForm.get('company');

		companyControl?.setValue('');
		expect(companyControl?.valid).toBeFalsy();
		expect(companyControl?.hasError('required')).toBeTruthy();
	});

	it('should mark KVK number as invalid when empty', () => {
		const kvkControl = component.registerForm.get('kvk');

		kvkControl?.setValue('');
		expect(kvkControl?.valid).toBeFalsy();
		expect(kvkControl?.hasError('required')).toBeTruthy();
	});

	it('should mark municipality as invalid when empty', () => {
		const municipalityControl = component.registerForm.get('municipality');

		municipalityControl?.setValue('');
		expect(municipalityControl?.valid).toBeFalsy();
		expect(municipalityControl?.hasError('required')).toBeTruthy();
	});

	it('should mark email as invalid when empty', () => {
		const emailControl = component.registerForm.get('email');

		emailControl?.setValue('');
		expect(emailControl?.valid).toBeFalsy();
		expect(emailControl?.hasError('required')).toBeTruthy();
	});

	it('should mark password as invalid when empty', () => {
		const passwordControl = component.registerForm.get('password');

		passwordControl?.setValue('');
		expect(passwordControl?.valid).toBeFalsy();
		expect(passwordControl?.hasError('required')).toBeTruthy();
	});

	it('should mark confirmPassword as invalid when empty', () => {
		const confirmPasswordControl = component.registerForm.get('confirmPassword');

		confirmPasswordControl?.setValue('');
		expect(confirmPasswordControl?.valid).toBeFalsy();
		expect(confirmPasswordControl?.hasError('required')).toBeTruthy();
	});

	it('should check the checkbox when clicked', () => {
		const checkboxElement: HTMLInputElement = fixture.nativeElement.querySelector('windmill-checkbox');

		expect(checkboxElement.checked).toBeFalsy();

		checkboxElement.click();

		fixture.whenStable().then(() => {
			fixture.detectChanges();
			expect(checkboxElement.checked).toBeTruthy();
		});
	});

	it('should disable the Register button until all the fields are valid and checkbox is true', () => {
		const firstNameControl = component.registerForm.get('firstName');
		const lastNameControl = component.registerForm.get('lastName');
		const companyControl = component.registerForm.get('company');
		const kvkControl = component.registerForm.get('kvk');
		const municipalityControl = component.registerForm.get('municipality');
		const emailControl = component.registerForm.get('email');
		const passwordControl = component.registerForm.get('password');
		const confirmPasswordControl = component.registerForm.get('confirmPassword');
		const checkboxElement: HTMLInputElement = fixture.nativeElement.querySelector('windmill-checkbox');

		const element: HTMLElement = fixture.nativeElement;
		const registerButton = element.querySelector('.account-button') as HTMLButtonElement;

		// Initially, the register button should be disabled
		expect((registerButton.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(true);

		// Set valid values for all fields
		firstNameControl?.setValue('user123');
		lastNameControl?.setValue('user123');
		companyControl?.setValue('Company123');
		kvkControl?.setValue('12345678');
		municipalityControl?.setValue('Municipality123');
		emailControl?.setValue('123@123.com');
		passwordControl?.setValue('pass');
		confirmPasswordControl?.setValue('pass');

		// The register button should still be disabled
		expect((registerButton.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(true);

		checkboxElement.click();

		// The register button should be enabled
		fixture.whenStable().then(() => {
			fixture.detectChanges();
			expect((registerButton.firstChild as HTMLButtonElement).hasAttribute('disabled')).toBe(false);
		});
	});

	it('should validate the length of kvk form control value', () => {
		const kvkFormControl = component.registerForm.get('kvk');

		// Set a value with an exact length of 8 characters
		kvkFormControl?.setValue('12345678');
		expect(kvkFormControl?.valid).toBeTruthy();
	});

	it('should mark the email field as invalid for an invalid email address', () => {
		const emailControl = component.registerForm.get('email');

		emailControl?.setValue('invalid-email');

		expect(emailControl?.valid).toBeFalsy();
		expect(emailControl?.hasError('validEmail')).toBeTruthy();
	});

	it('should mark the email field as valid for a valid email address', () => {
		const emailControl = component.registerForm.get('email');

		emailControl?.setValue('valid@email.com');

		expect(emailControl?.valid).toBeTruthy();
		expect(emailControl?.hasError('email')).toBeFalsy();
	});

	it('should mark the confirmPassword field as invalid when it does not match password', () => {
		const passwordControl = component.registerForm.get('password');
		const confirmPasswordControl = component.registerForm.get('confirmPassword');

		passwordControl?.setValue('password123');
		confirmPasswordControl?.setValue('differentPassword');

		fixture.whenStable().then(() => {
			fixture.detectChanges();
			expect(confirmPasswordControl?.hasError('fieldsMismatch')).toBeTruthy();
		});
	});

	it('should mark the confirmPassword field as valid  when it does match password', () => {
		const passwordControl = component.registerForm.get('password');
		const confirmPasswordControl = component.registerForm.get('confirmPassword');

		passwordControl?.setValue('password123');
		confirmPasswordControl?.setValue('password123');

		expect(confirmPasswordControl?.hasError('fieldsMismatch')).toBeFalsy();
	});

	it('should mark the password field as invalid for an invalid password', () => {
		const passwordControl = component.registerForm.get('password');

		passwordControl?.setValue('WeakPass');
		expect(passwordControl?.valid).toBeFalsy();
	});

	it('should mark the password field as valid for a valid password', () => {
		const passwordControl = component.registerForm.get('password');

		passwordControl?.setValue('StrongPass1!');
		expect(passwordControl?.valid).toBeTruthy();
	});

	it('should set dropdownSource and updatedSource when ngOnInit is called', () => {
		const mockTenants: Tenant[] = [
			{ id: '1', name: 'Tenant 1', address: 'Address 1', createdDate: new Date(10, 10, 10) },
			{ id: '2', name: 'Tenant 2', address: 'Address 2', createdDate: new Date(10, 10, 10) },
		];

		jest.spyOn(tenantService, 'getTenants').mockReturnValue(of(mockTenants));
		component.ngOnInit();

		expect(component.dropdownSource).toEqual([
			{ id: '1', name: 'Tenant 1', address: 'Address 1', createdDate: new Date(10, 10, 10) },
			{ id: '2', name: 'Tenant 2', address: 'Address 2', createdDate: new Date(10, 10, 10) },
		]);
		expect(component.updatedSource).toEqual([
			{ id: '1', name: 'Tenant 1', address: 'Address 1', createdDate: new Date(10, 10, 10) },
			{ id: '2', name: 'Tenant 2', address: 'Address 2', createdDate: new Date(10, 10, 10) },
		]);
	});

	it('should contain one windmill-checkbox element', () => {
		const checkboxElements = fixture.nativeElement.querySelectorAll('windmill-checkbox');
		expect(checkboxElements.length).toBe(1);
	});

	it('should filter the dropdown source based on input', () => {
		const event = 'Name1';
		component.dropdownSource = [
			{ id: '1223', address: 'RandomAddress1', name: 'Name1', createdDate: new Date(2020, 0, 1) },
			{ id: '12243', address: 'RandomAddress2', name: 'Name2', createdDate: new Date(2020, 0, 1) },
			{ id: '122553', address: 'RandomAddress3', name: 'RandomName', createdDate: new Date(2020, 0, 1) },
		];

		component.onSearchValueChanged(event);

		expect(component.updatedSource).toEqual([
			{ id: '1223', address: 'RandomAddress1', name: 'Name1', createdDate: new Date(2020, 0, 1) },
		]);
	});

	it('should return null error message for unknown field', () => {
		expect(component.getErrorMessageFormInputs('unknown')).toBeNull();
	});

	it('should return early when data is falsy', () => {
		const getTenantsStub = () => of([]);

		(tenantService as TenantService).getTenants = getTenantsStub;

		component.initializeMunicipalities();

		expect(component.updatedSource).toEqual([]);
	});

	it('should return early when data is empty input', () => {
		const getTenantsStub = () => of('');

		(tenantService as any).getTenants = getTenantsStub;

		component.initializeMunicipalities();

		expect(component.updatedSource).toEqual([]);
	});

	it('should return the translation for confirmPassword when required error exists', () => {
		const hasOwnPropertyMock = jest.fn().mockReturnValue(true);

		const originalHasOwnProperty = Object.prototype.hasOwnProperty;

		Object.prototype.hasOwnProperty = hasOwnPropertyMock;

		const result = component.getConfirmPasswordErrorMessage(component.registerForm);

		Object.prototype.hasOwnProperty = originalHasOwnProperty;

		expect(hasOwnPropertyMock).toHaveBeenCalledWith('confirmPassword');
		expect(result).toBe('genericFields.password.confirmPasswordRequired');
	});

	it('should return a translated string for fieldsMismatch when it has an error', () => {
		const form = new FormGroup({});
		form.setErrors({ fieldsMismatch: true });
		component.registerForm = form;

		const result = component.getConfirmPasswordErrorMessage(component.registerForm);

		expect(result).toBe(component.translateServiceInstance.instant('genericFields.password.confirmPasswordMatch'));
	});

	it('should return null when there are no errors for confirmPassword', () => {
		const form = new FormGroup({});
		component.registerForm = form;

		const result = component.getConfirmPasswordErrorMessage(component.registerForm);

		expect(result).toBe('');
	});

	it('should return the translation for kvk when required error exists', () => {
		const hasOwnPropertyMock = jest.fn().mockReturnValue(true);

		const originalHasOwnProperty = Object.prototype.hasOwnProperty;

		Object.prototype.hasOwnProperty = hasOwnPropertyMock;

		const result = component.getKVKErrorMessage();

		Object.prototype.hasOwnProperty = originalHasOwnProperty;

		expect(hasOwnPropertyMock).toHaveBeenCalledWith('kvk');
		expect(result).toBe('register.kvkFormControlRequired');
	});

	it('should return a translated string when length for kvk is invalid', () => {
		const form = new FormGroup({
			kvk: new FormControl('123', Validators.minLength(8)),
		});
		component.registerForm = form;

		const result = component.getKVKErrorMessage();

		expect(result).toBe(component.translateServiceInstance.instant('register.kvkFormControlLength'));
	});

	it('should return null when there are no errors for kvk', () => {
		const form = new FormGroup({});
		component.registerForm = form;

		const result = component.getKVKErrorMessage();

		expect(result).toBeNull();
	});

	it('should return the translation for email when required error exists for email', () => {
		const hasOwnPropertyMock = jest.fn().mockReturnValue(true);

		const originalHasOwnProperty = Object.prototype.hasOwnProperty;

		Object.prototype.hasOwnProperty = hasOwnPropertyMock;

		const result = component.getEmailErrorMessage(component.registerForm);

		Object.prototype.hasOwnProperty = originalHasOwnProperty;

		expect(hasOwnPropertyMock).toHaveBeenCalledWith('email');
		expect(result).toBe('genericFields.email.requiredEmail');
	});

	it('should return the correct error message if isEmailok error exists', () => {
		component.registerForm.get('email')?.setErrors({ validEmail: true });

		const errorMessage = component.getEmailErrorMessage(component.registerForm);

		expect(errorMessage).toEqual(component.translateServiceInstance.instant('genericFields.email.validEmail'));
	});

	it('should return null when there are no errors for email', () => {
		const form = new FormGroup({});
		component.registerForm = form;

		const result = component.getEmailErrorMessage(component.registerForm);

		expect(result).toBe('');
	});

	it('should update the tenant property', () => {
		const event = 'tenant';

		component.onValueChangedTenantId(event);

		expect(component.tenantId).toEqual(event);
	});

	it('should call saveSupplier and navigateToLogin on success', () => {
		const saveSpy = jest.spyOn(component, 'saveSupplier');

		component.saveSupplier();

		expect(saveSpy).toHaveBeenCalled();
	});

	it('should not render register form content when shouldDisplaySuccessfulRegistrationDialog is true', () => {
		component.shouldDisplaySuccessfulRegistrationDialog = true;

		fixture.detectChanges();

		const formElement = fixture.debugElement.query(By.css('form'));

		expect(formElement).toBeNull();
	});

	it('should render register form content when shouldDisplaySuccessfulRegistrationDialog is false', () => {
		component.shouldDisplaySuccessfulRegistrationDialog = false;

		fixture.detectChanges();

		const formElement = fixture.debugElement.query(By.css('form'));

		expect(formElement).toBeTruthy();
	});

	it('should return validation errors if they exist', () => {
		const validationErrors: ValidationErrors = { required: true };
		component.registerForm = { get: () => ({ errors: validationErrors }) } as any;

		const result = component['getPasswordValidationErrors']();

		expect(result).toEqual(validationErrors);
	});

	it('should return null if there are no errors', () => {
		component.registerForm = { get: () => ({ errors: null }) } as any;

		const result = component['getPasswordValidationErrors']();

		expect(result).toBe(null);
	});

	it('should create the form', () => {
		expect(component.registerForm).toBeTruthy();
	});

	it('should mark form as invalid if fields are empty', () => {
		expect(component.registerForm.valid).toBeFalsy();
	});

	it('should mark form as valid if all fields are filled', () => {
		const form = component.registerForm;
		form.controls['firstName'].setValue('John');
		form.controls['lastName'].setValue('Doe');
		form.controls['company'].setValue('ABC Company');
		form.controls['kvk'].setValue('123456789');
		form.controls['municipality'].setValue('Some Municipality');
		form.controls['email'].setValue('john.doe@example.com');
		form.controls['password'].setValue('password123');
		form.controls['confirmPassword'].setValue('password123');
		form.controls['agreement'].setValue(false);

		expect(form.valid).toBeFalsy();
	});
});
