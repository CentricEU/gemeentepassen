import { Component, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
	CategoryDto,
	CommonUtil,
	DropdownLabel,
	FILE_SIZE_THRESHOLD,
	FormInitializationType,
	FormUtil,
	GeneralInfoFormFields,
	GeneralInformation,
	IbanMatchesBicValidator,
	ProfileDropdownsDto,
	ProfileLabelDto,
	RegexUtil,
	SupplierProfile,
	SupplierProfileService,
	UserDto,
	UserService,
} from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from 'angular-iban';
import { Subscription } from 'rxjs';

@Component({
	selector: 'frontend-general-information',
	templateUrl: './general-information.component.html',
	styleUrls: ['./general-information.component.scss'],
	standalone: false,
})
export class GeneralInformationComponent implements OnInit, OnDestroy {
	@Input() isReadonly = false;
	@Input() isEditProfileComponent = false;

	@Output() selectedSupplierEvent: EventEmitter<string> = new EventEmitter<string>();
	@Output() generalInformationEvent = new EventEmitter<FormGroup>();

	public generalInformationForm: FormGroup;
	public fileName: string | undefined;

	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;

	public dropdownSourceCategories: CategoryDto[] = [];
	public dropdownSourceSubcategories: ProfileLabelDto[] = [];
	public dropdownSourceGroups: ProfileLabelDto[] = [];
	public dropdownSourceLegalForms: ProfileLabelDto[] = [];

	public updatedCategoriesSource: CategoryDto[] = [];
	public updatedSubcategoriesSource: ProfileLabelDto[] = [];
	public updatedGroupsSource: ProfileLabelDto[] = [];
	public updatedLegalFormsSource: ProfileLabelDto[] = [];

	public selectedCategory: string;
	public isSizeExceeded = false;

	public emailError: string;
	public cashierEmailsList = new Set<string>();
	private userInformationData: UserDto;
	private localStorageData: GeneralInformation = new GeneralInformation();

	private readonly formBuilder = inject(FormBuilder);
	private readonly translateService = inject(TranslateService);
	private readonly userService = inject(UserService);
	private readonly router = inject(Router);
	private readonly supplierProfileService = inject(SupplierProfileService);

	private userInformationSubscription: Subscription;

	public get dropdownLabelTypes(): typeof DropdownLabel {
		return DropdownLabel;
	}

	public get isCashierEmailsFieldValid(): boolean {
		if (this.isReadonly || this.isEditProfileComponent) {
			return true;
		}
		return this.cashierEmailsList.size > 0;
	}

	public ngOnInit(): void {
		this.loadInitialData();
	}

	public ngOnDestroy(): void {
		this.userInformationSubscription?.unsubscribe();
	}

	@HostListener('document:keydown.enter', ['$event'])
	handleEnterKey(event: Event): void {
		const keyboardEvent = event as KeyboardEvent;
		const activeElement = document.activeElement;

		if (activeElement?.tagName.toLowerCase() !== 'button') {
			keyboardEvent.preventDefault();
		}
	}

	public getErrorMessageGeneralFormInputs(value: string): string | null {
		switch (value) {
			case GeneralInfoFormFields.ownerName:
				return this.translateService.instant('generalInformation.ownerNameFormControlRequired');
			case GeneralInfoFormFields.catgeory:
				return this.translateService.instant('generalInformation.catgeoryFormControlRequired');
			case GeneralInfoFormFields.group:
				return this.translateService.instant('generalInformation.groupFormControlRequired');
			case GeneralInfoFormFields.subcategory:
				return this.translateService.instant('generalInformation.subcategoryFormControlRequired');
			case GeneralInfoFormFields.commerceNumber:
				return this.translateService.instant('generalInformation.commerceNumberFormControlRequired');
			case GeneralInfoFormFields.commerceMainLocation:
				return this.translateService.instant('generalInformation.commerceMainLocationFormControlRequired');
			case GeneralInfoFormFields.commercePostalAdress:
				return this.translateService.instant('generalInformation.commercePostalAdressFormControlRequired');
			case GeneralInfoFormFields.legalform:
				return this.translateService.instant('generalInformation.legalFormFormControlRequired');
			default: {
				return null;
			}
		}
	}

	public onSearchValueChanged(source: any[], event: string | null, property: string, labelType: DropdownLabel): void {
		const updatedSource =
			event === null
				? source
				: source.filter((item) => item[property].toLowerCase().includes(event.trim().toLowerCase()));

		switch (labelType) {
			case DropdownLabel.categoryLabel:
				this.updatedCategoriesSource = updatedSource;
				break;
			case DropdownLabel.subcategoryLabel:
				this.updatedSubcategoriesSource = updatedSource;
				break;
			case DropdownLabel.groupLabel:
				this.updatedGroupsSource = updatedSource;
				break;
			case DropdownLabel.legalFormLabel:
				this.updatedLegalFormsSource = updatedSource;
				break;
			default:
				break;
		}
	}

	public onValueChangeDropdowndId(event: any, dropdownType: string): void {
		this.updateLocalStorage();

		if (dropdownType !== 'category') {
			return;
		}

		this.resetFormValue('subcategory', '');

		if (!this.shouldDisableSubcategoryDropdown(event)) {
			this.generalInformationForm.get('subcategory')?.disable();
			return;
		}

		this.generalInformationForm.get('subcategory')?.enable();
		this.createSubcategories(event);
	}

	public fileInputClick(event: Event): void {
		const element = event.target as HTMLInputElement;
		element.value = '';
	}

	public onFileSelected(event: Event | any): void {
		this.isSizeExceeded = false;
		const filesSelected = (<HTMLInputElement>event.target).files;

		if (!filesSelected || !filesSelected.length) {
			return;
		}

		const file = filesSelected[0];

		if (file.size > FILE_SIZE_THRESHOLD) {
			this.isSizeExceeded = true;
			return;
		}

		this.fileName = file.name;
		this.convertImageToBase64(file);
	}

	public logoUploadText(): string {
		return this.fileName
			? this.translateService.instant('generalInformation.replaceLogo')
			: this.translateService.instant('generalInformation.uploadLogo');
	}

	public updateLocalStorage(): void {
		const currentRoute = this.router.url.slice(1);

		if (currentRoute !== '') {
			return;
		}

		const generalInformationData: GeneralInformation = {
			fileName: this.fileName,
			...this.generalInformationForm.value,
		};

		localStorage.setItem('generalFormInformation', JSON.stringify(generalInformationData));
	}

	public navigateToNextForm(): void {
		this.isSizeExceeded = false;
	}

	public removeLogo(): void {
		this.fileName = '';
		this.generalInformationForm.get('logo')?.setValue(null);
		this.updateLocalStorage();
	}

	public isCreateSupplierProfile(): boolean {
		return !this.isReadonly && !this.isEditProfileComponent;
	}

	public shouldDisableSubcategoryDropdown(event: any): boolean {
		const disallowedCategoryIds = [0, 5];
		const isEmptyState = event === null || event === undefined;
		return disallowedCategoryIds.includes(event) || isEmptyState;
	}

	public handleKeydown(event: KeyboardEvent): void {
		if (CommonUtil.isEnterOrSpace(event.key)) {
			event.preventDefault();
			this.handleKeyPressed();
			return;
		}
		const inputText = this.generalInformationForm.get('cashierEmails')?.value;
		if (!inputText || inputText.length === 0) {
			this.emailError = '';
		}
	}

	public removeEmailFromList(email: string): void {
		this.cashierEmailsList.delete(email);
		this.updateCashiersOnLocalStorage();
	}

	private updateCashiersOnLocalStorage(): void {
		localStorage.setItem('generalInformationCashiers', JSON.stringify([...this.cashierEmailsList]));
	}

	private handleKeyPressed(): void {
		const emailRegex = RegexUtil.emailRegexPattern;
		const email = this.generalInformationForm.get('cashierEmails')?.value;

		if (!email || !emailRegex.test(email)) {
			this.emailError = 'genericFields.email.validEmail';
			return;
		}

		if (this.cashierEmailsList.has(email)) {
			this.emailError = 'inviteSuppliers.emailAlreadyInList';
			return;
		}
		this.cashierEmailsList.add(email);
		this.updateCashiersOnLocalStorage();
		this.emailError = '';
		this.generalInformationForm.controls['cashierEmails'].setValue('');
	}

	private resetFormValue(controlName: string, value?: string): void {
		this.generalInformationForm.get(controlName)?.reset(value);
	}

	private initForm(enumValue: FormInitializationType, data?: SupplierProfile): void {
		this.generalInformationForm = this.formBuilder.group(
			{
				logo: [this.getFieldValue('logo', enumValue, data)],
				ownerName: [
					this.getFieldValue('ownerName', enumValue, data, this.userInformationData),
					[Validators.required],
				],
				legalForm: [this.getFieldValue('legalForm', enumValue, data), [Validators.required]],
				category: [this.getFieldValue('category', enumValue, data), [Validators.required]],
				kvkNumber: [
					this.getFieldValue('kvkNumber', enumValue, data, this.userInformationData),
					[Validators.required],
				],
				companyName: [
					this.getFieldValue('companyName', enumValue, data, this.userInformationData),
					[Validators.required],
				],
				adminEmail: [
					this.getFieldValue(this.checkFormControlName(enumValue), enumValue, data, this.userInformationData),
					[Validators.required],
				],
				group: [this.getFieldValue('group', enumValue, data), [Validators.required]],
				subcategory: [this.getFieldValue('subcategory', enumValue, data)],
				iban: [
					this.getFieldValue('iban', enumValue, data),
					[
						Validators.required,
						ValidatorService.validateIban,
						Validators.pattern(RegexUtil.dutchIbanRegexPattern),
					],
				],
				bic: [this.getFieldValue('bic', enumValue, data), [Validators.pattern(RegexUtil.dutchBicRegexPattern)]],
				cashierEmails: [''],
			},
			{
				validators: [IbanMatchesBicValidator],
			},
		);

		this.disableSubcategoryField(parseInt(this.selectedCategory));
	}

	private getFieldValue(
		field: string,
		enumValue: FormInitializationType,
		data?: SupplierProfile,
		userInfo?: UserDto,
	): string | boolean | null | undefined | number {
		switch (enumValue) {
			case FormInitializationType.EMPTY:
				return enumValue === FormInitializationType.EMPTY ? null : '';
			case FormInitializationType.LOCAL_STORAGE:
				if (field === 'ownerName') {
					return this.localStorageData[field]
						? this.localStorageData[field]
						: `${this.userInformationData['firstName']} ${this.userInformationData['lastName']}`;
				}

				return userInfo ? this.userInformationData[field] : this.localStorageData[field];
			case FormInitializationType.DATABASE:
				return data?.[field];
		}
	}

	private initUserInformationData(): void {
		this.userInformationData = this.userService.userInformation;
		this.selectedSupplierEvent.emit(this.userInformationData?.supplierId);
		this.initForm(FormInitializationType.LOCAL_STORAGE);
	}

	private convertImageToBase64(file: Blob): void {
		const reader = new FileReader();

		reader.onload = (e: any) => {
			const base64Image = e.target.result.split(',')[1];
			this.generalInformationForm.get('logo')?.setValue(base64Image);
			this.updateLocalStorage();
		};

		reader.readAsDataURL(file);
	}

	private initLocalStorageData(): void {
		const localStorageFormData = localStorage.getItem('generalFormInformation');
		this.initLocalStorageCashiers();
		if (!localStorageFormData) {
			return;
		}

		this.localStorageData = JSON.parse(localStorageFormData);
		this.selectedCategory = this.localStorageData['category'];
		this.fileName = this.localStorageData.fileName;
	}

	private initLocalStorageCashiers(): void {
		const localStorageCashiers = localStorage.getItem('generalInformationCashiers');
		if (!localStorageCashiers) {
			return;
		}

		try {
			this.cashierEmailsList = new Set<string>(JSON.parse(localStorageCashiers));
		} catch (e) {
			this.cashierEmailsList = new Set<string>();
		}
	}

	private getSupplierProfileInformation(): void {
		this.supplierProfileService.supplierProfileInformationObservable.subscribe((data) => {
			if (!data) {
				return;
			}
			this.setupProfileForm(data);
		});

		if (this.supplierProfileService.supplierProfileInformation) {
			this.setupProfileForm(this.supplierProfileService.supplierProfileInformation);
		}
	}

	private setupCashierEmails(supplierId: string): void {
		this.userService.getCashierEmailsForSupplier(supplierId).subscribe((data) => {
			if (!data) {
				return;
			}
			this.cashierEmailsList = new Set<string>(data);
		});
	}

	private setupProfileForm(profileInformation: SupplierProfile): void {
		this.selectedCategory = profileInformation.category;
		this.createSubcategories(parseInt(this.selectedCategory));
		this.initForm(FormInitializationType.DATABASE, profileInformation);
		this.disableSubcategoryField(parseInt(this.selectedCategory));
		this.generalInformationEvent.emit(this.generalInformationForm);
		this.setupCashierEmails(profileInformation.supplierId as string);
	}

	private loadInitialData(): void {
		this.initForm(FormInitializationType.EMPTY);

		if (this.isReadonly || this.isEditProfileComponent) {
			this.getSupplierProfileInformation();
		} else {
			this.initLocalStorageData();
			this.initUserInformationData();
		}

		this.initDropdownsData();
	}

	private checkFormControlName(formType: FormInitializationType): string {
		return formType === FormInitializationType.DATABASE ? 'adminEmail' : 'email';
	}

	private initDropdownsData(): void {
		this.supplierProfileService.getAllDropdownsData().subscribe((data) => {
			if (!data) {
				return;
			}

			this.initProfileDropdowns(data as ProfileDropdownsDto);
		});
	}

	private initProfileDropdowns(data: ProfileDropdownsDto): void {
		this.updatedCategoriesSource = this.createDropdowns<CategoryDto>(
			data.categories,
			(element) =>
				new CategoryDto(
					element.id,
					this.translateService.instant(element.categoryLabel),
					element.subcategoryLabels,
				),
		);

		this.updatedGroupsSource = this.createDropdowns<ProfileLabelDto>(
			data.groupLabels,
			(element) => new ProfileLabelDto(element.id, this.translateService.instant(element.label)),
		);

		this.updatedLegalFormsSource = this.createDropdowns<ProfileLabelDto>(
			data.legalFormLabels,
			(element) => new ProfileLabelDto(element.id, this.translateService.instant(element.label)),
		);

		this.dropdownSourceCategories = this.updatedCategoriesSource;
		this.dropdownSourceGroups = this.updatedGroupsSource;
		this.dropdownSourceLegalForms = this.updatedLegalFormsSource;

		this.createSubcategories(parseInt(this.selectedCategory));
	}

	private createDropdowns<T>(items: T[], createFunction: (item: T) => T): T[] {
		return items.map(createFunction);
	}

	private createSubcategories(event: number): void {
		const selectedCategory = this.updatedCategoriesSource.find((element) => element.id === event);

		if (!selectedCategory) {
			return;
		}

		this.updatedSubcategoriesSource = this.createDropdowns<ProfileLabelDto>(
			selectedCategory.subcategoryLabels,
			(element) => new ProfileLabelDto(element.id, this.translateService.instant(element.label)),
		);

		this.dropdownSourceSubcategories = this.updatedSubcategoriesSource;
	}

	private disableSubcategoryField(event: number): void {
		if (this.shouldDisableSubcategoryDropdown(event)) {
			return;
		}

		this.resetFormValue('subcategory', '');
		this.generalInformationForm.get('subcategory')?.disable();
	}
}
