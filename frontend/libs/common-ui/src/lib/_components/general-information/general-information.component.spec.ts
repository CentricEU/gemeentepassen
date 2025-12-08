import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import {
	AuthService,
	CategoryDto,
	DropdownLabel,
	FormInitializationType,
	GeneralInfoFormFields,
	GeneralInformation,
	ProfileDropdownsDto,
	ProfileLabelDto,
	SupplierProfile,
	SupplierProfileService,
	UserService,
} from '@frontend/common';
import { AriaAttributesDirective } from '@innovation/accesibility';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, Subscription } from 'rxjs';

import { WindmillModule } from '../../windmil.module';
import { GeneralInformationComponent } from './general-information.component';

function createBlobWithSize(sizeInBytes: number): Blob {
	return new Blob([new Uint8Array(sizeInBytes)], { type: 'application/octet-stream' });
}

describe('GeneralInformationComponent', () => {
	let component: GeneralInformationComponent;
	let fixture: ComponentFixture<GeneralInformationComponent>;
	let translate: TranslateService;
	let userSubscription: Subscription;
	let supplierProfileServiceMock: jest.Mocked<SupplierProfileService>;
	let mockRouter: { url: string };

	const formBuilder: FormBuilder = new FormBuilder();
	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const authServiceMock = {
		extractSupplierInformation: jest.fn(),
	};

	const userServiceMock = {
		getUserInformation: jest.fn(),
		getCashierEmailsForSupplier: jest.fn(() => of([])),
		userInformation: {
			supplierId: 123,
		},
	};

	const testData: SupplierProfile = {
		ownerName: 'John Doe',
		legalForm: 'Sole Proprietorship',
		category: 'Some Category',
		kvkNumber: '123456789',
		companyName: 'ABC Corp',
		adminEmail: 'john.doe@example.com',
		group: 'Some Group',
		subcategory: 'Some Subcategory',
		companyBranchAddress: 'Address',
		branchProvince: 'Province',
		branchZip: '1234fe',
		branchLocation: 'Location',
		accountManager: 'Manager',
		supplierId: '1234ff',
	};

	beforeEach(async () => {
		mockRouter = { url: '/some-url' };

		supplierProfileServiceMock = {
			supplierProfileInformationObservable: new BehaviorSubject({}),
			getAllDropdownsData: jest.fn(() => new BehaviorSubject({})),
			isReadonly: false,
		} as unknown as jest.Mocked<SupplierProfileService>;

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [GeneralInformationComponent, AriaAttributesDirective],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				HttpClientModule,
				TranslateModule.forRoot(),
				ReactiveFormsModule,
				BrowserAnimationsModule,
			],
			providers: [
				TranslateService,
				{ provide: 'env', useValue: environmentMock },
				{ provide: FormBuilder, useValue: formBuilder },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: UserService, useValue: userServiceMock },
				{ provide: SupplierProfileService, useValue: supplierProfileServiceMock },
				{ provide: Router, useValue: mockRouter },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(GeneralInformationComponent);
		component = fixture.componentInstance;
		translate = TestBed.inject(TranslateService);
		component.generalInformationForm = formBuilder.group({
			logo: [''],
			ownerName: ['', Validators.required],
			legalForm: ['legalForm', Validators.required],
			category: ['category'],
			kvkNumber: ['kvk'],
			companyName: ['company'],
			adminEmail: ['email'],
			group: ['group'],
			subcategory: ['subcategory'],
		});
		userSubscription = new Subscription();
		component['userInformationSubscription'] = userSubscription;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set the value of the input element to an empty string', () => {
		const mockEvent: any = {
			target: document.createElement('input'),
		};

		const initialValue = 'value';
		(mockEvent.target as HTMLInputElement).value = initialValue;

		component.fileInputClick(mockEvent);

		expect((mockEvent.target as HTMLInputElement).value).toBe('');
	});

	it('should update the fileName property with the selected file name', () => {
		const file = new File(['sample file content'], 'sample-file.txt', { type: 'text/plain' });

		const mockEvent: any = {
			target: {
				files: [file],
			},
		};

		component.onFileSelected(mockEvent);
		expect(component.fileName).toBe('sample-file.txt');
	});

	it('should set isSizeExceeded to true when file size exceeds 200 * 1024', () => {
		const mockFile = new File([createBlobWithSize(201 * 1024)], 'example.jpg', { type: 'image/jpeg' });
		const event = { target: { files: [mockFile] } } as any;

		component.onFileSelected(event);

		expect(component.isSizeExceeded).toBe(true);
	});

	it('should not set isSizeExceeded to true when file size is within the limit', () => {
		const mockFile = new File([createBlobWithSize(199 * 1024)], 'example.jpg', { type: 'image/jpeg' });
		const event = { target: { files: [mockFile] } } as any;

		component.onFileSelected(event);

		expect(component.isSizeExceeded).toBe(false);
	});

	it('should do nothing when no files are selected', () => {
		const mockEvent: any = {
			target: {},
		};

		const initialFileName = 'initial-file.txt';
		component.fileName = initialFileName;

		component.onFileSelected(mockEvent);

		expect(component.fileName).toBe(initialFileName);
	});

	test.each([
		['sample-file.txt', 'generalInformation.replaceLogo'],
		['', 'generalInformation.uploadLogo'],
	])('should return name of the file when uploading or replacing', (fileName, expectedTranslationKey) => {
		component.fileName = fileName;

		const result = component.logoUploadText();

		expect(result).toBe(expectedTranslationKey);
	});

	it('should return null for not existing value', () => {
		const errorMessage = component.getErrorMessageGeneralFormInputs('none');

		expect(errorMessage).toBe(null);
	});

	it('should convert an image to base64', () => {
		const file = new Blob(['image data'], { type: 'image/jpeg' });
		component['convertImageToBase64'](file);
		fixture.detectChanges();
		expect(component.generalInformationForm.get('logo')?.value).toBe(null);
	});

	it('should remove logo when press on remove icon', () => {
		component.fileName = 'image';
		component.removeLogo();
		fixture.detectChanges();
		expect(component.generalInformationForm.get('logo')?.value).toBe(null);
	});

	it('should remove the logo and update the form value and local storage', () => {
		const setValueMock = jest.fn();
		const generalInformationFormMock: any = {
			get: jest.fn(() => ({ setValue: setValueMock })),
		};

		const updateLocalStorageSpy = jest.spyOn(component, 'updateLocalStorage');

		component.generalInformationForm = generalInformationFormMock;

		component.removeLogo();

		expect(component.fileName).toBe('');
		expect(setValueMock).toHaveBeenCalledWith(null);
		expect(updateLocalStorageSpy).toHaveBeenCalled();
	});

	it('should update local storage when updateLocalStorage is called', () => {
		const generalInformationDataMock: GeneralInformation = {
			companyName: 'company',
			logo: 'logo',
			adminEmail: 'email',
			kvkNumber: '12345678',
			ownerName: 'owner',
			legalForm: 'form',
			group: 'group',
			category: 'category',
			subcategory: 'subcategory',
			bic: 'ABNANL2A',
			iban: 'NL91ABNA0417164300',
			cashierEmails: '',
		};
		component.generalInformationForm.setValue(generalInformationDataMock);
		component['updateLocalStorage']();

		const localStorageData = localStorage.getItem('generalFormInformation');
		if (localStorageData) {
			const storedData = JSON.parse(localStorageData);
			const { fileName, ...storedData1 } = storedData;
			expect(storedData1).toEqual(generalInformationDataMock);
			return;
		}
	});

	test.each([
		[GeneralInfoFormFields.ownerName, 'generalInformation.ownerNameFormControlRequired'],
		[GeneralInfoFormFields.catgeory, 'generalInformation.catgeoryFormControlRequired'],
		[GeneralInfoFormFields.group, 'generalInformation.groupFormControlRequired'],
		[GeneralInfoFormFields.subcategory, 'generalInformation.subcategoryFormControlRequired'],
		[GeneralInfoFormFields.commerceNumber, 'generalInformation.commerceNumberFormControlRequired'],
		[GeneralInfoFormFields.commerceMainLocation, 'generalInformation.commerceMainLocationFormControlRequired'],
		[GeneralInfoFormFields.commercePostalAdress, 'generalInformation.commercePostalAdressFormControlRequired'],
		[GeneralInfoFormFields.legalform, 'generalInformation.legalFormFormControlRequired'],
	])('should return the correct translation message for %s', (field, expectedErrorMessage) => {
		const errorMessage = component.getErrorMessageGeneralFormInputs(field);
		expect(errorMessage).toBe(translate.instant(expectedErrorMessage));
	});

	it('should return null when value is not present', () => {
		const errorMessage = component.getErrorMessageGeneralFormInputs('invalid');
		expect(errorMessage).toBe(null);
	});

	it('should convert an image to base64 and update the form value', () => {
		const readAsDataURL = jest.fn();
		const addEventListener = jest.fn();
		const file: Blob = new Blob(['sample content'], { type: 'image/png' });
		const fileReaderMock: any = {
			readAsDataURL,
			addEventListener,
		};
		jest.spyOn(global, 'FileReader').mockImplementation(() => fileReaderMock);

		const setValueMock = jest.fn();
		const generalInformationFormMock: any = {
			get: jest.fn(() => ({ setValue: setValueMock })),
		};
		component.generalInformationForm = generalInformationFormMock;

		component['convertImageToBase64'](file);

		const base64Image = 'base64-encoded-image';
		fileReaderMock.result = `data:image/png;base64,${base64Image}`;
		fileReaderMock.onload({ target: { result: fileReaderMock.result } });

		expect(readAsDataURL).toHaveBeenCalledWith(file);
		expect(setValueMock).toHaveBeenCalledWith(base64Image);
		expect(setValueMock).toHaveBeenCalledWith(base64Image);
	});

	test.each([
		['logo', 'field1'],
		['ownerName', 'field2'],
		['legalForm', 'field3'],
		['category', 'field4'],
		['kvkNumber', 'field5d'],
		['companyName', 'field6'],
		['adminEmail', 'field7'],
		['subcategory', 'field9'],
		['group', 'field8'],
	])('should init values to specific values in the form %s', (formControl, field) => {
		component.generalInformationForm.get(formControl)?.setValue(field);
		expect(component.generalInformationForm.get(formControl)?.value).toBe(field);
	});

	it('isSizeExcedeed should be false when navigateToNextForm is called', () => {
		component.isSizeExceeded = true;
		component.navigateToNextForm();
		expect(component.isSizeExceeded).toBe(false);
	});

	it('should unsubscribe from the userSubscription on ngOnDestroy', () => {
		const unsubscribeSpy = jest.spyOn(userSubscription, 'unsubscribe');

		component.ngOnDestroy();

		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should initialize the user and emit its supplierId', () => {
		const emitSpy = jest.spyOn(component.selectedSupplierEvent, 'emit');
		component['initUserInformationData']();

		expect(component['userInformationData']).toEqual({ supplierId: 123 });
		expect(emitSpy).toHaveBeenCalledWith(123);
	});

	it('should load initial data', () => {
		const getSupplierProfileInformationSpy = jest.spyOn(component as any, 'getSupplierProfileInformation');
		const initLocalStorageDataSpy = jest.spyOn(component as any, 'initLocalStorageData');
		const initFormSpy = jest.spyOn(component as any, 'initForm');

		component['loadInitialData']();

		expect(initFormSpy).toHaveBeenCalled();

		component.isReadonly = true;
		component['loadInitialData']();
		expect(getSupplierProfileInformationSpy).toHaveBeenCalled();

		component.isReadonly = false;
		component['loadInitialData']();
		expect(initLocalStorageDataSpy).toHaveBeenCalled();
		expect(initFormSpy).toHaveBeenCalled();
	});

	it('should attempt to setup the form if there is data available', () => {
		jest.spyOn(component as any, 'setupProfileForm');
		supplierProfileServiceMock.supplierProfileInformation = testData;

		component['getSupplierProfileInformation']();

		expect(component['setupProfileForm']).toHaveBeenCalledWith(testData);
	});

	it('should receive undefined when logo is undefined and try to remove logo', () => {
		component.generalInformationForm = component['formBuilder'].group({});
		component['initForm'](FormInitializationType.EMPTY);
		component.removeLogo();
		expect(component.generalInformationForm.get('logo')?.value).toBe(null);
	});

	it('should load initial data for approval popup', () => {
		jest.spyOn(component as any, 'initForm');
		jest.spyOn(component as any, 'getSupplierProfileInformation');

		component.isReadonly = true;
		component['loadInitialData']();

		expect(component['initForm']).toHaveBeenCalledWith(FormInitializationType.EMPTY);
		expect(component['getSupplierProfileInformation']).toHaveBeenCalled();
	});

	it('should initialize form with EMPTY enum', () => {
		const enumValue = FormInitializationType.EMPTY;

		component['initForm'](enumValue, testData);

		expect(component.generalInformationForm.value).toEqual({
			ownerName: null,
			legalForm: null,
			category: null,
			kvkNumber: null,
			companyName: null,
			adminEmail: null,
			group: null,
			logo: null,
			bic: null,
			iban: null,
			cashierEmails: '',
		});
	});

	it('should return the correct field value for EMPTY enum', () => {
		const enumValue = FormInitializationType.EMPTY;

		const fieldValue = component['getFieldValue']('logo', enumValue);

		expect(fieldValue).toBe(null);
	});

	it('should prevent default when Enter key is pressed and active element is not a button', () => {
		const event = new KeyboardEvent('keydown', { key: 'Enter' });

		const documentSpy = jest.spyOn(document, 'activeElement', 'get');
		documentSpy.mockReturnValue({ tagName: 'input' } as HTMLElement);

		jest.spyOn(event, 'preventDefault');

		component.handleEnterKey(event);

		expect(event.preventDefault).toHaveBeenCalled();
	});

	it('should not prevent default when Enter key is pressed and active element is a button', () => {
		const event = new KeyboardEvent('keydown', { key: 'Enter' });

		const documentSpy = jest.spyOn(document, 'activeElement', 'get');
		documentSpy.mockReturnValue({ tagName: 'button' } as HTMLElement);

		jest.spyOn(event, 'preventDefault');

		component.handleEnterKey(event);

		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	it('should initialize profile dropdowns', () => {
		const subcategory: ProfileLabelDto[] = [
			{
				id: 0,
				label: 'subcategory',
			},
		];
		const categories: CategoryDto[] = [
			{
				id: 1,
				categoryLabel: 'category',
				subcategoryLabels: subcategory,
			},
		];
		const legalFormLabels: ProfileLabelDto[] = [
			{
				id: 3,
				label: 'legalForm',
			},
		];
		const groupLabels: ProfileLabelDto[] = [
			{
				id: 3,
				label: 'group',
			},
		];
		const dataMock: ProfileDropdownsDto = {
			categories: categories,
			legalFormLabels: legalFormLabels,
			groupLabels: groupLabels,
		};

		jest.spyOn(translate as any, 'instant').mockImplementation((label) => label);

		component['initProfileDropdowns'](dataMock);

		expect(component.dropdownSourceCategories).toEqual(dataMock.categories);
		expect(component.dropdownSourceGroups).toEqual(dataMock.groupLabels);
		expect(component.dropdownSourceLegalForms).toEqual(dataMock.legalFormLabels);
	});

	it('should not initialize dropdowns data when data is falsy', () => {
		const initProfileDropdownsSpy = jest.spyOn(component as any, 'initProfileDropdowns');

		jest.spyOn(supplierProfileServiceMock, 'getAllDropdownsData').mockReturnValue(
			of(null as unknown as ProfileDropdownsDto),
		);

		component['initDropdownsData']();

		fixture.detectChanges();

		expect(initProfileDropdownsSpy).not.toHaveBeenCalled();
	});

	it('should disable subcategory dropdown for disallowed category IDs', () => {
		const shouldBeDisabled = component.shouldDisableSubcategoryDropdown(0);
		expect(shouldBeDisabled).toBe(true);

		const shouldBeEnabled = component.shouldDisableSubcategoryDropdown(1);
		expect(shouldBeEnabled).toBe(false);
	});

	it('should filter and update categories source', () => {
		const source = [{ categoryLabel: 'Category1' }, { categoryLabel: 'Category2' }];

		component.onSearchValueChanged(source, 'Category1', DropdownLabel.categoryLabel, DropdownLabel.categoryLabel);

		expect(component.updatedCategoriesSource).toEqual([{ categoryLabel: 'Category1' }]);
	});

	it('should update categories source when event is null', () => {
		const subcategoryLabels: ProfileLabelDto[] = [
			{
				id: 0,
				label: 'subcategory',
			},
		];
		const source: CategoryDto[] = [
			{ id: 0, categoryLabel: 'Category1', subcategoryLabels: subcategoryLabels },
			{ id: 1, categoryLabel: 'Category2', subcategoryLabels: subcategoryLabels },
		];

		component.updatedCategoriesSource = source;

		component.onSearchValueChanged(source, null, DropdownLabel.categoryLabel, DropdownLabel.categoryLabel);

		expect(component.updatedCategoriesSource).toEqual(source);
	});

	it('should filter and update subcategories source', () => {
		const source = [{ subcategoryLabel: 'Subcategory1' }, { subcategoryLabel: 'Subcategory2' }];

		component.onSearchValueChanged(
			source,
			'Subcategory1',
			DropdownLabel.subcategoryLabel,
			DropdownLabel.subcategoryLabel,
		);

		expect(component.updatedSubcategoriesSource).toEqual([{ subcategoryLabel: 'Subcategory1' }]);
	});

	it('should update subcategories source when event is null', () => {
		const source: ProfileLabelDto[] = [
			{ id: 0, label: 'Subcategory1' },
			{ id: 1, label: 'Subcategory2' },
		];

		component.updatedSubcategoriesSource = source;

		component.onSearchValueChanged(source, null, DropdownLabel.subcategoryLabel, DropdownLabel.subcategoryLabel);

		expect(component.updatedSubcategoriesSource).toEqual(source);
	});

	it('should filter and update groups source', () => {
		const source = [{ groupLabel: 'Group1' }, { groupLabel: 'Group2' }];

		component.onSearchValueChanged(source, 'Group1', DropdownLabel.groupLabel, DropdownLabel.groupLabel);

		expect(component.updatedGroupsSource).toEqual([{ groupLabel: 'Group1' }]);
	});

	it('should update groups source when event is null', () => {
		const source: ProfileLabelDto[] = [
			{ id: 0, label: 'Group1' },
			{ id: 1, label: 'Group2' },
		];

		component.updatedGroupsSource = source;

		component.onSearchValueChanged(source, null, DropdownLabel.groupLabel, DropdownLabel.groupLabel);

		expect(component.updatedGroupsSource).toEqual(source);
	});

	it('should filter and update legal forms source', () => {
		const source = [{ legalFormLabel: 'LegalForm1' }, { legalFormLabel: 'LegalForm2' }];

		component.onSearchValueChanged(
			source,
			'LegalForm1',
			DropdownLabel.legalFormLabel,
			DropdownLabel.legalFormLabel,
		);

		expect(component.updatedLegalFormsSource).toEqual([{ legalFormLabel: 'LegalForm1' }]);
	});

	it('should update legal forms source when event is null', () => {
		const source: ProfileLabelDto[] = [
			{ id: 0, label: 'LegalForm1' },
			{ id: 1, label: 'LegalForm2' },
		];

		component.updatedLegalFormsSource = source;

		component.onSearchValueChanged(source, null, DropdownLabel.legalFormLabel, DropdownLabel.legalFormLabel);

		expect(component.updatedLegalFormsSource).toEqual(source);
	});

	it('should do nothing for unsupported property in onSearchValueChanged', () => {
		const source: [] = [];

		component.updatedCategoriesSource = source;
		component.updatedSubcategoriesSource = source;
		component.updatedGroupsSource = source;
		component.updatedLegalFormsSource = source;

		component.onSearchValueChanged(
			source,
			'someValue',
			'unsupportedProperty',
			undefined as unknown as DropdownLabel,
		);

		expect(component.updatedCategoriesSource).toEqual(source);
		expect(component.updatedSubcategoriesSource).toEqual(source);
		expect(component.updatedGroupsSource).toEqual(source);
		expect(component.updatedLegalFormsSource).toEqual(source);
	});

	it('should update local storage and disable subcategory dropdown if dropdownType is not category', () => {
		const updateLocalStorageSpy = jest.spyOn(component, 'updateLocalStorage');
		const resetFormValueSpy = jest.spyOn(component as any, 'resetFormValue');
		const disableSpy = jest.spyOn(component.generalInformationForm.get('subcategory') as any, 'disable');

		component.onValueChangeDropdowndId('someEvent', 'someDropdownType');

		expect(updateLocalStorageSpy).toHaveBeenCalled();

		expect(resetFormValueSpy).not.toHaveBeenCalled();
		expect(disableSpy).not.toHaveBeenCalled();
		expect(component.updatedSubcategoriesSource).toStrictEqual([]);
		expect(component.dropdownSourceSubcategories).toStrictEqual([]);
	});

	it('should update local storage and disable subcategory dropdown when dropdown type is not category', () => {
		const updateLocalStorageSpy = jest.spyOn(component, 'updateLocalStorage');

		component.onValueChangeDropdowndId('event', 'someOtherType');

		expect(updateLocalStorageSpy).toHaveBeenCalled();
	});

	it('should reset the form control value', () => {
		const controlName = 'exampleControl';
		const initialValue = 'initialValue';
		const updatedValue = 'updatedValue';

		const formGroup = new FormGroup({ exampleControl: new FormControl(initialValue) });

		component.generalInformationForm = formGroup;

		component['resetFormValue'](controlName, updatedValue);

		expect(formGroup.get(controlName)?.value).toEqual(updatedValue);
	});

	it('should update local storage and disable subcategory dropdown when dropdownType is not category', () => {
		const updateLocalStorageSpy = jest.spyOn(component, 'updateLocalStorage');
		const resetFormValueSpy = jest.spyOn(component as any, 'resetFormValue');
		const disableSpy = jest.spyOn(component.generalInformationForm.get('subcategory') as any, 'disable');

		component.onValueChangeDropdowndId('event', 'otherDropdownType');

		expect(updateLocalStorageSpy).toHaveBeenCalled();
		expect(resetFormValueSpy).not.toHaveBeenCalled();
		expect(disableSpy).not.toHaveBeenCalled();
	});

	it('should disable subcategory dropdown and reset form value when shouldDisableSubcategoryDropdown returns true', () => {
		const event = {};
		const dropdownType = 'category';

		jest.spyOn(component, 'updateLocalStorage');
		jest.spyOn(component, 'shouldDisableSubcategoryDropdown').mockReturnValue(true);

		const mockForm = {
			resetFormValue: jest.fn(),
			get: jest.fn(),
			disable: jest.fn(),
		};
		component.generalInformationForm = mockForm as any;

		component.onValueChangeDropdowndId(event, dropdownType);

		expect(component.updateLocalStorage).toHaveBeenCalled();
		expect(component.shouldDisableSubcategoryDropdown).toHaveBeenCalledWith(event);
		expect(mockForm.get).toHaveBeenCalledWith('subcategory');
	});

	it('should reset subcategory value and disable form control when shouldDisableSubcategoryDropdown returns false', () => {
		const event = {};
		const dropdownType = 'category';

		jest.spyOn(component, 'shouldDisableSubcategoryDropdown').mockReturnValue(false);

		const mockForm = {
			get: jest.fn().mockReturnValue({ reset: jest.fn(), disable: jest.fn() }),
		};
		component.generalInformationForm = mockForm as any;

		component.onValueChangeDropdowndId(event, dropdownType);

		expect(component.shouldDisableSubcategoryDropdown).toHaveBeenCalledWith(event);
		expect(mockForm.get).toHaveBeenCalledWith('subcategory');
		expect(mockForm.get('subcategory').reset).toHaveBeenCalled();
		expect(mockForm.get('subcategory').disable).toHaveBeenCalled();
	});

	it('should update subcategories source based on selected category', () => {
		const updatedCategoriesSource = [
			{
				id: 0,
				categoryLabel: 'category',
				subcategoryLabels: [{ id: 1, label: 'Subcategory 1' }],
			},
		];

		component['updatedCategoriesSource'] = updatedCategoriesSource;

		expect(component.updatedSubcategoriesSource.length).toBe(0);
		expect(component.dropdownSourceSubcategories).toEqual(component.updatedSubcategoriesSource);
	});

	it('should disable subcategory field when shouldDisableSubcategoryField returns true', () => {
		jest.spyOn(component, 'shouldDisableSubcategoryDropdown').mockReturnValue(false);
		const resetFormValueSpy = jest.spyOn(component as any, 'resetFormValue');

		component['disableSubcategoryField'](123);

		expect(resetFormValueSpy).toHaveBeenCalledWith('subcategory', '');
		expect(component.generalInformationForm.get('subcategory')?.disabled).toBe(true);
	});

	it('should create subcategories correctly', () => {
		const event = 1;

		component['createSubcategories'](event);

		expect(component.updatedSubcategoriesSource).toBeDefined();
		expect(component.dropdownSourceSubcategories).toEqual(component.updatedSubcategoriesSource);
	});

	it('should do nothing when an invalid category is selected', () => {
		const event = 3;

		component['createSubcategories'](event);

		expect(component.dropdownSourceSubcategories).toStrictEqual([]);
	});

	it('should create subcategories', () => {
		component.updatedCategoriesSource = [
			{ id: 1, categoryLabel: 'category', subcategoryLabels: [{ id: 101, label: 'Subcategory 1' }] },
		];

		component.updatedSubcategoriesSource = [];

		component['createSubcategories'](1);

		expect(component.updatedSubcategoriesSource).toEqual([new ProfileLabelDto(101, 'Subcategory 1')]);
	});

	it('should not update local storage when the current route is not empty', () => {
		mockRouter.url = '/some-non-empty-route';

		component.updateLocalStorage();

		const storedDataString = localStorage.getItem('generalFormInformation');
		expect(storedDataString).toBeNull();
	});

	it('should update local storage when the current route is empty', () => {
		mockRouter.url = '';

		component.updateLocalStorage();

		const storedDataString = localStorage.getItem('generalFormInformation');
		expect(storedDataString).not.toBeNull();

		if (storedDataString !== null) {
			const storedData = JSON.parse(storedDataString);
			expect(storedData.fileName).toEqual(component.fileName);
		}
	});

	it('should disable subcategory field when shouldDisableSubcategoryDropdown returns true', () => {
		jest.spyOn(component, 'shouldDisableSubcategoryDropdown').mockReturnValue(true);

		component.generalInformationForm = new FormGroup({
			subcategory: new FormControl('initialValue'),
		});

		component['disableSubcategoryField'](123);

		expect(component.generalInformationForm.get('subcategory')?.value).toBe('initialValue');
		expect(component.generalInformationForm.get('subcategory')?.disabled).toBe(false);
	});

	it('should not disable subcategory field when shouldDisableSubcategoryDropdown returns false', () => {
		jest.spyOn(component, 'shouldDisableSubcategoryDropdown').mockReturnValue(false);

		component.generalInformationForm = new FormGroup({
			subcategory: new FormControl(''),
		});

		component['disableSubcategoryField'](456);

		expect(component.generalInformationForm.get('subcategory')?.value).toBe('');
		expect(component.generalInformationForm.get('subcategory')?.disabled).toBe(true);
	});

	it('should return the correct type for dropdownLabelTypes', () => {
		const result = component.dropdownLabelTypes;
		expect(result).toEqual(DropdownLabel);
	});

	it('should return true when isReadonly is true', () => {
		component.isReadonly = true;
		component.isEditProfileComponent = false;
		component.cashierEmailsList.clear();

		expect(component.isCashierEmailsFieldValid).toBe(true);
	});

	it('should return true when isEditProfileComponent is true', () => {
		component.isReadonly = false;
		component.isEditProfileComponent = true;
		component.cashierEmailsList.clear();

		expect(component.isCashierEmailsFieldValid).toBe(true);
	});

	it('should return true when cashierEmailsList has at least one email and not readonly or edit', () => {
		component.isReadonly = false;
		component.isEditProfileComponent = false;
		component.cashierEmailsList.clear();
		component.cashierEmailsList.add('cashier@example.com');

		expect(component.isCashierEmailsFieldValid).toBe(true);
	});

	it('should return false when cashierEmailsList is empty and not readonly or edit', () => {
		component.isReadonly = false;
		component.isEditProfileComponent = false;
		component.cashierEmailsList.clear();

		expect(component.isCashierEmailsFieldValid).toBe(false);
	});

	it('should add e-mail to list if it is valid when enter key is pressed', () => {
		const emailControl = component.generalInformationForm.get('cashierEmails');
		emailControl?.setValue('email@domain.com');

		component.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

		expect([...component.cashierEmailsList]).toEqual(['email@domain.com']);
	});

	it('should display an error when trying to add an e-mail that is already in the list', () => {
		component.cashierEmailsList.add('email@domain.com');

		const emailControl = component.generalInformationForm.get('cashierEmails');
		emailControl?.setValue('email@domain.com');

		component.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

		expect(component.emailError).toEqual('inviteSuppliers.emailAlreadyInList');
	});

	it('should remove given email from list', () => {
		component.cashierEmailsList = new Set<string>();
		component.cashierEmailsList.add('email1@domain.com');
		component.cashierEmailsList.add('email2@domain.com');

		component.removeEmailFromList('email1@domain.com');

		expect([...component.cashierEmailsList]).toEqual(['email2@domain.com']);
	});

	it('handleKeyPressed should set emailError when email is missing or invalid', () => {
		// invalid email
		component.cashierEmailsList = new Set<string>();
		component.generalInformationForm.get('cashierEmails')?.setValue('invalid-email');
		(component as any).handleKeyPressed();
		expect(component.emailError).toBe('genericFields.email.validEmail');
		expect(component.cashierEmailsList.size).toBe(0);

		// empty email
		component.generalInformationForm.get('cashierEmails')?.setValue('');
		(component as any).handleKeyPressed();
		expect(component.emailError).toBe('genericFields.email.validEmail');
		expect(component.cashierEmailsList.size).toBe(0);
	});

	it('handleKeyPressed should set emailError when email is already in the list', () => {
		component.cashierEmailsList = new Set<string>();

		component.cashierEmailsList.add('exists@domain.com');
		component.generalInformationForm.get('cashierEmails')?.setValue('exists@domain.com');

		(component as any).handleKeyPressed();

		expect(component.emailError).toBe('inviteSuppliers.emailAlreadyInList');
		expect(component.cashierEmailsList.size).toBe(1);
	});

	it('handleKeyPressed should add valid email, clear error and reset control', () => {
		component.cashierEmailsList = new Set<string>();
		component.generalInformationForm.get('cashierEmails')?.setValue('new@domain.com');

		(component as any).handleKeyPressed();

		expect(component.cashierEmailsList.has('new@domain.com')).toBe(true);
		expect(component.emailError).toBe('');
		expect(component.generalInformationForm.controls['cashierEmails'].value).toBe('');
	});

	it('should clear emailError when cashierEmails is empty string', () => {
		component.generalInformationForm.get('cashierEmails')?.setValue('');
		const event = new KeyboardEvent('keydown', { key: 'a' });

		component.handleKeydown(event);

		expect(component.emailError).toBe('');
	});

	it('should NOT clear emailError if cashierEmails has a value', () => {
		component.generalInformationForm.get('cashierEmails')?.setValue('test@email.com');
		component.emailError = 'Some error';
		const event = new KeyboardEvent('keydown', { key: 'a' });

		component.handleKeydown(event);

		expect(component.emailError).toBe('Some error');
	});

	describe('initLocalStorageCashiers', () => {
		it('should initialize cashierEmailsList with data from localStorage', () => {
			const mockCashiers = ['email1@example.com', 'email2@example.com'];
			localStorage.setItem('generalInformationCashiers', JSON.stringify(mockCashiers));

			component['initLocalStorageCashiers']();

			expect(component.cashierEmailsList).toEqual(new Set(mockCashiers));
		});

		it('should not modify cashierEmailsList if localStorage data is null', () => {
			localStorage.removeItem('generalInformationCashiers');
			component.cashierEmailsList = new Set<string>();

			component['initLocalStorageCashiers']();

			expect(component.cashierEmailsList.size).toBe(0);
		});

		it('should handle invalid JSON data in localStorage gracefully', () => {
			localStorage.setItem('generalInformationCashiers', 'invalid-json');
			component.cashierEmailsList = new Set<string>();

			expect(() => component['initLocalStorageCashiers']()).not.toThrow();
			expect(component.cashierEmailsList.size).toBe(0);
		});
	});

	describe('updateCashiersOnLocalStorage', () => {
		it('should update local storage with the current cashier emails list', () => {
			const mockEmails = ['email1@example.com', 'email2@example.com'];
			component.cashierEmailsList = new Set(mockEmails);
			component['updateCashiersOnLocalStorage']();
			const storedEmails = localStorage.getItem('generalInformationCashiers');
			expect(storedEmails).toBe(JSON.stringify(mockEmails));
		});

		it('should store an empty array in local storage when the cashier emails list is empty', () => {
			component.cashierEmailsList = new Set();
			component['updateCashiersOnLocalStorage']();
			const storedEmails = localStorage.getItem('generalInformationCashiers');
			expect(storedEmails).toBe(JSON.stringify([]));
		});
	});
});
