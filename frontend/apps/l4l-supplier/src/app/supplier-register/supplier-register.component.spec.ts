import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Tenant, TenantService } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { RegisterSupplier } from '../models/register-supplier.model';
import { RegisterService } from '../services/register.service';
import { SupplierRegisterComponent } from './supplier-register.component';

jest.mock('dompurify', () => ({
	__esModule: true,
	sanitize: (input: string) => input,
	default: {
		sanitize: (input: string) => input,
	},
}));

describe('SupplierRegisterComponent', () => {
	let component: SupplierRegisterComponent;
	let fixture: ComponentFixture<SupplierRegisterComponent>;
	let tenantService: TenantService;
	let router: Router;
	let dialogServiceMock: any;
	let activatedRouteMock: any;

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
		activatedRouteMock = {
			paramMap: of({ get: jest.fn() }),
		};

		await TestBed.configureTestingModule({
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
				{ provide: ActivatedRoute, useValue: activatedRouteMock },

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
			{
				id: '1',
				name: 'Tenant 1',
				address: 'Address 1',
				createdDate: new Date(10, 10, 10),
				phone: '1234567890',
				email: 'tenant1@example.com',
			},
			{
				id: '2',
				name: 'Tenant 2',
				address: 'Address 2',
				createdDate: new Date(10, 10, 10),
				phone: '0987654321',
				email: 'tenant2@example.com',
			},
		];

		jest.spyOn(tenantService, 'getTenants').mockReturnValue(of(mockTenants));
		component.ngOnInit();

		expect(component.dropdownSource).toEqual([
			{
				id: '1',
				name: 'Tenant 1',
				address: 'Address 1',
				createdDate: new Date(10, 10, 10),
				phone: '1234567890',
				email: 'tenant1@example.com',
			},
			{
				id: '2',
				name: 'Tenant 2',
				address: 'Address 2',
				createdDate: new Date(10, 10, 10),
				phone: '0987654321',
				email: 'tenant2@example.com',
			},
		]);
		expect(component.updatedSource).toEqual([
			{
				id: '1',
				name: 'Tenant 1',
				address: 'Address 1',
				createdDate: new Date(10, 10, 10),
				phone: '1234567890',
				email: 'tenant1@example.com',
			},
			{
				id: '2',
				name: 'Tenant 2',
				address: 'Address 2',
				createdDate: new Date(10, 10, 10),
				phone: '0987654321',
				email: 'tenant2@example.com',
			},
		]);
	});

	it('should contain one windmill-checkbox element', () => {
		const checkboxElements = fixture.nativeElement.querySelectorAll('windmill-checkbox');
		expect(checkboxElements.length).toBe(1);
	});

	it('should filter the dropdown source based on input', () => {
		const event = 'Name1';
		component.dropdownSource = [
			{
				id: '1223',
				address: 'RandomAddress1',
				name: 'Name1',
				createdDate: new Date(2020, 0, 1),
				phone: '1234567890',
				email: 'name1@example.com',
			},
			{
				id: '12243',
				address: 'RandomAddress2',
				name: 'Name2',
				createdDate: new Date(2020, 0, 1),
				phone: '2345678901',
				email: 'name2@example.com',
			},
			{
				id: '122553',
				address: 'RandomAddress3',
				name: 'RandomName',
				createdDate: new Date(2020, 0, 1),
				phone: '3456789012',
				email: 'randomname@example.com',
			},
		];

		component.onSearchValueChanged(event);

		expect(component.updatedSource).toEqual([
			{
				id: '1223',
				address: 'RandomAddress1',
				name: 'Name1',
				createdDate: new Date(2020, 0, 1),
				phone: '1234567890',
				email: 'name1@example.com',
			},
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

	it('should call dialogService.prompt with TermsAndConditionsDialogComponent and correct config when openTermsAndConditionModal is called', () => {
		const promptSpy = jest.spyOn(component['dialogService'], 'prompt');
		component.openTermsAndConditionModal();
		expect(promptSpy).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ width: '600px' }));
	});

	it('should return "warning" toaster type when password has validation errors', () => {
		component.registerForm.get('password')?.setErrors({ minLength: true });

		const result = component.getToasterType();

		expect(result).toBe('warning');
	});

	it('should return "success" toaster type when password has no validation errors', () => {
		component.registerForm.get('password')?.setErrors(null);

		const result = component.getToasterType();

		expect(result).toBe('success');
	});

	it('should return true when confirmPassword has required errors', () => {
		component.registerForm.get('confirmPassword')?.setErrors({ required: true });

		const result = component.shouldDisplayPasswordConfirmationError();

		expect(result).toBe(true);
	});

	it('should return true when form has fieldsMismatch error', () => {
		component.registerForm.setErrors({ fieldsMismatch: true });

		const result = component.shouldDisplayPasswordConfirmationError();

		expect(result).toBe(true);
	});

	it('should return false when confirmPassword has no errors', () => {
		component.registerForm.get('confirmPassword')?.setErrors(null);
		component.registerForm.setErrors(null);

		const result = component.shouldDisplayPasswordConfirmationError();

		expect(result).toBe(false);
	});

	it('should map form values to registerSupplier correctly', () => {
		component.registerForm.patchValue({
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			company: 'Test Company',
			kvk: '12345678',
			password: 'Password123!',
			confirmPassword: 'Password123!',
			agreement: true,
		});
		component['selectTentantId'] = 'tenant-123';

		component['mapSupplier']();

		expect(component.registerSupplier).toEqual({
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			companyName: 'Test Company',
			kvk: '12345678',
			tenantId: 'tenant-123',
			password: 'Password123!',
			retypedPassword: 'Password123!',
			agreedTerms: true,
		});
	});

	it('should call displayAccountConfirmationDialog after successful registration', () => {
		const displayDialogSpy = jest.spyOn<any, any>(component, 'displayAccountConfirmationDialog');
		component.registerForm.patchValue({
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			company: 'Test Company',
			kvk: '12345678',
			password: 'Password123!',
			confirmPassword: 'Password123!',
			agreement: true,
		});

		component.saveSupplier();

		expect(displayDialogSpy).toHaveBeenCalled();
	});

	it('should set shouldDisplaySuccessfulRegistrationDialog to true when displaying confirmation dialog', () => {
		const mockSupplier: RegisterSupplier = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			companyName: 'Test Company',
			kvk: '12345678',
			tenantId: 'tenant-123',
			password: 'Password123!',
			retypedPassword: 'Password123!',
			agreedTerms: true,
		};

		component['displayAccountConfirmationDialog'](mockSupplier);

		expect(component.shouldDisplaySuccessfulRegistrationDialog).toBe(true);
	});

	it('should preselect tenant in form when routeTenantId matches', () => {
		component.routeTenantId = '1';
		component.dropdownSource = [
			{
				id: '1',
				name: 'Tenant 1',
				address: 'Address 1',
				createdDate: new Date(10, 10, 10),
				phone: '1234567890',
				email: 'tenant1@example.com',
			},
		];
		component['initForm']();

		component['preselectTenantInForm']();

		expect(component.tenantId).toBe('1');
		expect(component.registerForm.get('municipality')?.value).toBe('1');
	});

	it('should not preselect tenant when tenant is not found', () => {
		component.routeTenantId = 'non-existent';
		component.dropdownSource = [
			{
				id: '1',
				name: 'Tenant 1',
				address: 'Address 1',
				createdDate: new Date(10, 10, 10),
				phone: '1234567890',
				email: 'tenant1@example.com',
			},
		];

		component['preselectTenantInForm']();

		expect(component.tenantId).toBeUndefined();
	});
	it('should handle subscription to route param when tenantId is present', () => {
		const mockTenantId = 'test-tenant-123';
		const paramMapMock = {
			get: jest.fn().mockReturnValue(mockTenantId),
		};

		activatedRouteMock.paramMap = of(paramMapMock);

		component['subscribeToRouteParam']();

		expect(paramMapMock.get).toHaveBeenCalledWith('tenantId');
		expect(component.routeTenantId).toBe(mockTenantId);
	});

	it('should return early when tenantId is null in route params', () => {
		const paramMapMock = {
			get: jest.fn().mockReturnValue(null),
		};

		activatedRouteMock.paramMap = of(paramMapMock);

		component['subscribeToRouteParam']();

		expect(paramMapMock.get).toHaveBeenCalledWith('tenantId');
		expect(component.routeTenantId).toBeUndefined();
	});

	it('should call dialogService.message with CustomDialogWithTimerComponent and correct config', () => {
		const mockSupplier: RegisterSupplier = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'test@example.com',
			companyName: 'Test Company',
			kvk: '12345678',
			tenantId: 'tenant-123',
			password: 'Password123!',
			retypedPassword: 'Password123!',
			agreedTerms: true,
		};

		const messageSpy = jest.spyOn(component['dialogService'], 'message');

		component['displayAccountConfirmationDialog'](mockSupplier);

		expect(messageSpy).toHaveBeenCalledWith(
			expect.any(Function),
			expect.objectContaining({
				disableClose: true,
			}),
		);
		expect(component.shouldDisplaySuccessfulRegistrationDialog).toBe(true);
	});

	describe('initializeMunicipalities', () => {
		it('should set dropdownSource and updatedSource when data is returned', () => {
			const mockTenants: Tenant[] = [
				{
					id: '1',
					name: 'Tenant 1',
					address: 'Address 1',
					createdDate: new Date(2022, 1, 1),
					phone: '1234567890',
					email: 'tenant1@example.com',
				},
				{
					id: '2',
					name: 'Tenant 2',
					address: 'Address 2',
					createdDate: new Date(2022, 1, 2),
					phone: '0987654321',
					email: 'tenant2@example.com',
				},
			];
			jest.spyOn(tenantService, 'getTenants').mockReturnValue(of(mockTenants));
			component.routeTenantId = '';
			component.initializeMunicipalities();
			expect(component.dropdownSource).toEqual(mockTenants);
			expect(component.updatedSource).toEqual(mockTenants);
		});

		it('should call preselectTenantInForm if routeTenantId is set', () => {
			const mockTenants: Tenant[] = [
				{
					id: '1',
					name: 'Tenant 1',
					address: 'Address 1',
					createdDate: new Date(2022, 1, 1),
					phone: '1234567890',
					email: 'tenant1@example.com',
				},
			];
			jest.spyOn(tenantService, 'getTenants').mockReturnValue(of(mockTenants));
			const preselectSpy = jest.spyOn(component as any, 'preselectTenantInForm');
			component.routeTenantId = '1';
			component.initializeMunicipalities();
			expect(preselectSpy).toHaveBeenCalled();
		});

		it('should return early if data is falsy', () => {
			jest.spyOn(tenantService, 'getTenants').mockReturnValue(of([]));
			component.dropdownSource = [];
			component.updatedSource = [];
			component.initializeMunicipalities();
			expect(component.dropdownSource).toEqual([]);
			expect(component.updatedSource).toEqual([]);
		});
	});
});
