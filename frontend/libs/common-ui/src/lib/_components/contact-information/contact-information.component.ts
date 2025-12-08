import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
	ContactInfoFormFields,
	ContactInformation,
	FormInitializationType,
	FormUtil,
	RegexUtil,
	SupplierProfile,
	SupplierProfileService,
	UserDto,
	UserService,
} from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'frontend-contact-information',
	templateUrl: './contact-information.component.html',
	styleUrls: ['./contact-information.component.scss'],
	standalone: false,
})
export class ContactInformationComponent implements OnInit {
	@Input() isReadonly = false;
	@Input() isEditProfileComponent = false;

	@Output() contactInformationEvent = new EventEmitter<FormGroup>();

	public maxLinesNumber = 1;
	public contactInformationForm: FormGroup;

	public emailValidator = FormUtil.validateEmail(true);
	public zipCodeValidator = FormUtil.validatedZip;
	public telephoneValidator = FormUtil.validateTelephone;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	public validationFunctionErrorNonRequiredFields = FormUtil.formControlValidatorNonRequiredFields;
	public validationFieldRequired = FormUtil.hasControlRequiredErrorAndTouched;
	public hasPatternError = FormUtil.hasPatternError;

	private localStorageData: ContactInformation = new ContactInformation();
	private userInformationData: UserDto;

	constructor(
		private formBuilder: FormBuilder,
		private translateService: TranslateService,
		private userService: UserService,
		private supplierProfileService: SupplierProfileService,
	) {}

	public ngOnInit(): void {
		this.loadInitialData();
	}

	public getErrorMessageContactFormInputs(value: string): string | null {
		switch (value) {
			case ContactInfoFormFields.companyBranchAddress:
				return this.translateService.instant('contactInformation.companyBranchAddressFormControlRequired');
			case ContactInfoFormFields.branchProvince:
				return this.translateService.instant('contactInformation.branchProvinceFormControlRequired');
			case ContactInfoFormFields.branchLocation:
				return this.translateService.instant('contactInformation.branchLocationFormControlRequired');
			case ContactInfoFormFields.branchTelephone:
				return this.translateService.instant('contactInformation.branchTelephoneFormControlRequired');
			case ContactInfoFormFields.accountManager:
				return this.translateService.instant('contactInformation.accountManagerFormControlRequired');
			default: {
				return null;
			}
		}
	}

	public updateLocalStorage(): void {
		const contactInformationData: ContactInformation = {
			...this.contactInformationForm.value,
		};

		localStorage.setItem('contactFormInformation', JSON.stringify(contactInformationData));
	}

	public getErrorMessage(controlName: string, errorType: string, translationKey: string): string | null {
		const formControl = this.contactInformationForm.get(controlName);
		if (formControl?.errors?.[errorType] && formControl.value) {
			return this.translateService.instant(translationKey);
		}
		return null;
	}

	private initForm(enumValue: FormInitializationType, data?: SupplierProfile): void {
		this.contactInformationForm = this.formBuilder.group({
			companyBranchAddress: [this.getFieldValue('companyBranchAddress', enumValue, data), [Validators.required]],
			branchProvince: [this.getFieldValue('branchProvince', enumValue, data), [Validators.required]],
			branchZip: [this.getFieldValue('branchZip', enumValue, data), [Validators.required, this.zipCodeValidator]],
			branchLocation: [this.getFieldValue('branchLocation', enumValue, data), [Validators.required]],
			branchTelephone: [this.getFieldValue('branchTelephone', enumValue, data), [this.telephoneValidator]],
			email: [this.getFieldValue('email', enumValue, data), [this.emailValidator]],
			website: [this.getFieldValue('website', enumValue, data), [Validators.pattern(RegexUtil.urlRegexPattern)]],
			accountManager: [this.getFieldValue('accountManager', enumValue, data), [Validators.required]],
		});
	}

	private getFieldValue(
		field: string,
		enumValue: FormInitializationType,
		data?: SupplierProfile,
	): string | undefined {
		switch (enumValue) {
			case FormInitializationType.EMPTY:
				return '';
			case FormInitializationType.LOCAL_STORAGE:
				if (field === 'accountManager') {
					return this.localStorageData[field]
						? this.localStorageData[field]
						: `${this.userInformationData['firstName']} ${this.userInformationData['lastName']}`;
				}

				if (field === 'email') {
					return this.localStorageData[field]
						? this.localStorageData[field]
						: this.userInformationData[field];
				}

				return this.localStorageData[field];
			case FormInitializationType.DATABASE:
				return data?.[field];
		}
	}

	private initLocalStorageData(): void {
		const localStorageFormData = localStorage.getItem('contactFormInformation');

		if (!localStorageFormData) {
			return;
		}

		this.localStorageData = JSON.parse(localStorageFormData);
	}

	private getSupplierProfileInformation(): void {
		this.supplierProfileService.supplierProfileInformationObservable.subscribe((data) => {
			if (!data) {
				return;
			}

			this.setupContactForm(data);
		});

		if (this.supplierProfileService.supplierProfileInformation) {
			this.setupContactForm(this.supplierProfileService.supplierProfileInformation);
		}
	}

	private setupContactForm(profileInformation: SupplierProfile): void {
		this.initForm(FormInitializationType.DATABASE, profileInformation);
		this.contactInformationEvent.emit(this.contactInformationForm);
	}

	private loadInitialData(): void {
		this.userInformationData = this.userService.userInformation;
		if (this.isReadonly || this.isEditProfileComponent) {
			this.initForm(FormInitializationType.EMPTY);
			this.getSupplierProfileInformation();
			return;
		}

		this.initLocalStorageData();
		this.initForm(FormInitializationType.LOCAL_STORAGE);
	}
}
