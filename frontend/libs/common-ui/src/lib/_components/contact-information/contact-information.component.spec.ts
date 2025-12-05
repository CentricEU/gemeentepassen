import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
	ContactInfoFormFields,
	ContactInformation,
	FormInitializationType,
	SupplierProfile,
	SupplierProfileService,
} from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { WindmillModule } from '../../windmil.module';
import { ContactInformationComponent } from './contact-information.component';

describe('ContactInformationComponent', () => {
	let component: ContactInformationComponent;
	let fixture: ComponentFixture<ContactInformationComponent>;
	let httpClientSpy: { get: jest.Mock; post: jest.Mock };
	let translate: TranslateService;
	let supplierProfileServiceMock: jest.Mocked<SupplierProfileService>;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const databaseData: SupplierProfile = {
		companyName: 'Database Company',
		companyBranchAddress: 'Database Address',
		branchProvince: 'Database Province',
		branchZip: 'Database Zip',
		branchLocation: 'Database Location',
		branchTelephone: 'Database Telephone',
		email: 'Database Email',
		website: 'Database Website',
		accountManager: 'Database Manager',
		adminEmail: 'Email Database',
		kvkNumber: '12345678',
		ownerName: 'Owner Database',
		legalForm: 'Form Database',
		group: 'Group Database',
		category: 'Category Database',
		subcategory: 'Subcategory Database',
		supplierId: '123',
	};

	beforeEach(async () => {
		supplierProfileServiceMock = {
			supplierProfileInformationObservable: new BehaviorSubject({}),
			isReadonly: false,
		} as unknown as jest.Mocked<SupplierProfileService>;

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [WindmillModule, CommonModule, HttpClientModule, TranslateModule.forRoot()],
			declarations: [ContactInformationComponent],
			providers: [
				{ provide: 'env', useValue: environmentMock },
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: SupplierProfileService, useValue: supplierProfileServiceMock },
			],
		}).compileComponents();

		translate = TestBed.inject(TranslateService);
		fixture = TestBed.createComponent(ContactInformationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	test.each([
		[ContactInfoFormFields.companyBranchAddress, 'contactInformation.companyBranchAddressFormControlRequired'],
		[ContactInfoFormFields.branchProvince, 'contactInformation.branchProvinceFormControlRequired'],
		[ContactInfoFormFields.branchLocation, 'contactInformation.branchLocationFormControlRequired'],
		[ContactInfoFormFields.branchTelephone, 'contactInformation.branchTelephoneFormControlRequired'],
		[ContactInfoFormFields.accountManager, 'contactInformation.accountManagerFormControlRequired'],
	])('should return the correct error message for %s', (field, expectedErrorMessage) => {
		const errorMessage = component.getErrorMessageContactFormInputs(field);
		expect(errorMessage).toBe(translate.instant(expectedErrorMessage));
	});

	it('should return null when value is not present', () => {
		const errorMessage = component.getErrorMessageContactFormInputs('dsadasad');
		expect(errorMessage).toBe(null);
	});

	it('should return null when errors do not match', () => {
		component.contactInformationForm = new FormGroup({
			branchTelephone: new FormControl('', Validators.required),
		});
		component.contactInformationForm.get('branchTelephone')?.setValue('');

		const errorMessage = component.getErrorMessage(
			'branchTelephone',
			'validTelephone',
			'contactInformation.validTelephone',
		);
		expect(errorMessage).toBeNull();
	});

	it('should create the form with all expected input fields', () => {
		expect(component.contactInformationForm.controls['companyBranchAddress']).toBeTruthy();
		expect(component.contactInformationForm.controls['branchProvince']).toBeTruthy();
		expect(component.contactInformationForm.controls['branchLocation']).toBeTruthy();
		expect(component.contactInformationForm.controls['branchTelephone']).toBeTruthy();
		expect(component.contactInformationForm.controls['accountManager']).toBeTruthy();
	});

	test.each([['companyBranchAddress'], ['branchProvince'], ['branchZip'], ['branchLocation'], ['accountManager']])(
		'should initialize %s control and default value',
		(controlName) => {
			const control = component.contactInformationForm.get(controlName);
			control?.setValue('');

			expect(control?.valid).toBeFalsy();
			expect(control?.value).toBe('');
			expect(control?.hasError('required')).toBeTruthy();
		},
	);

	it('should return the translated error message when errors match', () => {
		component.ngOnInit();
		component.contactInformationForm.get('branchTelephone')?.setErrors({ validTelephone: true });
		component.contactInformationForm.get('branchTelephone')?.setValue('+dsads');
		const translationKey = 'contactInformation.validTelephone';

		const errorMessage = component.getErrorMessage('branchTelephone', 'validTelephone', translationKey);

		expect(errorMessage).toBe(translate.instant(translationKey));
	});

	it('should return the translated error message when errors match', () => {
		component.ngOnInit();
		component.contactInformationForm.get('branchTelephone')?.setErrors({ validTelephone: true });
		component.contactInformationForm.get('branchTelephone')?.setValue('');
		const translationKey = 'contactInformation.validTelephone';

		const errorMessage = component.getErrorMessage('branchTelephone', 'validTelephone', translationKey);

		expect(errorMessage).toBe(null);
	});

	it('should update local storage when updateLocalStorage is called', () => {
		const contactInformationDataMock: ContactInformation = {
			companyBranchAddress: 'company',
			branchProvince: 'province',
			branchZip: '1234fe',
			branchLocation: 'location',
			accountManager: 'accountManager',
			branchTelephone: '+31123456789',
			email: 'email@domain.com',
			website: 'website',
		};
		component.contactInformationForm.setValue(contactInformationDataMock);
		component['updateLocalStorage']();

		const localStorageData = localStorage.getItem('contactFormInformation');
		if (localStorageData) {
			const storedData = JSON.parse(localStorageData);

			expect(storedData).toEqual(contactInformationDataMock);
			return;
		}
	});

	it('should init local storage on onInit', () => {
		component.ngOnInit();

		const localStorageData = localStorage.getItem('contactFormInformation');
		if (localStorageData) {
			const storedData = JSON.parse(localStorageData);

			expect(storedData).toBeTruthy();
			return;
		}
	});
	it('should call loadInitialData on ngOnInit', () => {
		const loadInitialDataSpy = jest.spyOn(component as any, 'loadInitialData');

		component.ngOnInit();

		expect(loadInitialDataSpy).toHaveBeenCalled();
	});

	it('should initialize the form with empty data', () => {
		component['initForm'](FormInitializationType.EMPTY);
		const form = component.contactInformationForm;

		expect(form.value).toEqual({
			companyBranchAddress: '',
			branchProvince: '',
			branchZip: '',
			branchLocation: '',
			branchTelephone: '',
			email: '',
			website: '',
			accountManager: '',
		});

		expect(form.get('companyBranchAddress')?.hasError('required')).toBe(true);
		expect(form.get('branchProvince')?.hasError('required')).toBe(true);
		expect(form.get('branchZip')?.hasError('required')).toBe(true);
		expect(form.get('branchLocation')?.hasError('required')).toBe(true);
		expect(form.get('accountManager')?.hasError('required')).toBe(true);
	});

	it('should initialize the form with local storage data', () => {
		const localStorageData = {
			companyBranchAddress: 'Local Address',
			branchProvince: 'Local Province',
			branchZip: 'Local Zip',
			branchLocation: 'Local Location',
			branchTelephone: 'Local Telephone',
			email: 'Local Email',
			website: 'Local Website',
			accountManager: 'Local Manager',
		};

		component['localStorageData'] = localStorageData;

		component['initForm'](FormInitializationType.LOCAL_STORAGE);
		const form = component.contactInformationForm;

		expect(form.value).toEqual(localStorageData);
	});

	it('should initialize the form with database data', () => {
		const {
			companyName,
			adminEmail,
			kvkNumber,
			ownerName,
			legalForm,
			group,
			category,
			subcategory,
			supplierId,
			...expectedData
		} = databaseData;

		component['initForm'](FormInitializationType.DATABASE, databaseData);
		const form = component.contactInformationForm;

		expect(form.value).toEqual(expectedData);
	});

	it('should load initial data for approval popup', () => {
		jest.spyOn(component as any, 'initForm');
		jest.spyOn(component as any, 'getSupplierProfileInformation');

		component.isReadonly = true;
		component['loadInitialData']();

		expect(component['initForm']).toHaveBeenCalledWith(FormInitializationType.EMPTY);
		expect(component['getSupplierProfileInformation']).toHaveBeenCalled();
	});

	it('should attempt to setup the form if there is data available', () => {
		jest.spyOn(component as any, 'setupContactForm');

		supplierProfileServiceMock.supplierProfileInformation = databaseData;

		component['getSupplierProfileInformation']();

		expect(component['setupContactForm']).toHaveBeenCalledWith(databaseData);
	});

	it('should initialize the contact form and emit the event for it', () => {
		jest.spyOn(component as any, 'initForm');
		jest.spyOn(component['contactInformationEvent'], 'emit');

		component['setupContactForm'](databaseData);

		expect(component['initForm']).toHaveBeenCalledWith(FormInitializationType.DATABASE, databaseData);
		expect(component['contactInformationEvent'].emit).toHaveBeenCalledWith(component.contactInformationForm);
	});

	it('should load initial data for regular case', () => {
		component.isReadonly = false;

		jest.spyOn(component as any, 'initLocalStorageData');
		jest.spyOn(component as any, 'initForm');

		component['loadInitialData']();

		expect(component['initLocalStorageData']).toHaveBeenCalled();
		expect(component['initForm']).toHaveBeenCalledWith(FormInitializationType.LOCAL_STORAGE);
	});
});
