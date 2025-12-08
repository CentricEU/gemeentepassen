import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {
	BenefitDto,
	BenefitService,
	CharacterLimitMessageService,
	CheckboxData,
	CommonUtil,
	FormUtil,
	FrequencyOfUse,
	ModalData,
	OfferDto,
	RestrictionsDto,
	TEXT_AREA_MAX_LENGTH,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';
import { forkJoin, Observable } from 'rxjs';

import { CreateOfferFormFields } from '../../enums/create-offer-form-field.enum';
import { OfferTypeEnum } from '../../enums/offer-type.enum';
import { RestrictionFormFields } from '../../enums/restriction.enum';
import { OfferType } from '../../models/offer-type.model';
import { OfferTypeVisibility } from '../../models/offer-type-visibility.model';
import { ReactivateOfferDto } from '../../models/reactivate-offer-dto.model';
import { RestrictionType } from '../../models/restriction-type.model';
import { OfferService } from '../../services/offer-service/offer.service';

type Changes = string | boolean;
type Restriction = {
	formControl: string;
};

@Component({
	selector: 'frontend-create-offer',
	templateUrl: './create-offer.component.html',
	styleUrls: ['./create-offer.component.scss'],
	standalone: false,
})
export class CreateOfferComponent implements OnInit {
	public updatedSource: OfferTypeVisibility[] = [];
	public dropdownSource: OfferTypeVisibility[] = [];

	public availableBenefits: BenefitDto[] = [];
	public updatedBenefits: BenefitDto[] = [];
	public clickedOutsideFieldPrice = false;
	public clickedOutsideFieldTime = false;

	public selectedBenefit: string;

	public selectedOfferTypeId: number | null;
	public createOfferForm: FormGroup;
	public restrictionFields: { restriction: string }[];
	public otherFieldValue: string | number;
	public characterLimitMessage = '';
	public isOverCharacterLimit = false;
	public maxTextAreaLength = TEXT_AREA_MAX_LENGTH;

	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	public validationNoSpaceFunctionError = FormUtil.validationNoSpaceFunctionError;
	public nonMaxBenefitAmountValidator = FormUtil.nonMaxBenefitAmountValidator;
	public validationFunctionErrorMinFieldCompleted = FormUtil.validationFunctionErrorMinFieldCompleted;
	public clearRestrictionValidatorsAndErrors = FormUtil.clearRestrictionValidatorsAndErrors;

	public expirationDateInit = FormUtil.calculateExpirationDate;

	public restrictionsData: CheckboxData[];

	public isReactivating = false;
	public alertDismissed = false;
	public shouldDisplayApprovalMessage = false;

	private selectedRestrictionValue: RestrictionType;
	private updatingFormValues = false;

	private CITIZEN_WITH_PASS = 'CITIZEN_WITH_PASS';

	public get hideAmount(): boolean {
		const hiddenOfferTypes = [OfferTypeEnum.percentage, OfferTypeEnum.credit, OfferTypeEnum.freeEntry];
		return this.selectedOfferTypeId !== null && !hiddenOfferTypes.includes(this.selectedOfferTypeId);
	}

	public get amountLabel(): string {
		return this.selectedOfferTypeId === OfferTypeEnum.freeEntry ? 'offer.freeEntry' : 'offer.amount';
	}

	public get showPrefix(): string {
		const shouldShowEuroPrefix =
			this.selectedOfferTypeId !== null &&
			[OfferTypeEnum.credit, OfferTypeEnum.freeEntry].includes(this.selectedOfferTypeId);
		return shouldShowEuroPrefix ? '€ ' : '';
	}

	public get showSuffix(): string {
		return this.selectedOfferTypeId === OfferTypeEnum.percentage ? '%' : '';
	}

	public get showDecimal(): string {
		return this.selectedOfferTypeId === OfferTypeEnum.percentage
			? 'percent' /* percent.2 this is not working on current windmill, needs to update nxg-mask*/
			: 'separator.2';
	}

	public get maxLength(): number {
		return this.selectedOfferTypeId === OfferTypeEnum.credit ? 14 : Number.MAX_SAFE_INTEGER;
	}

	public get benefitAmount(): number | null {
		const benefit = this.getSelectedBenefit();
		return benefit ? Number(benefit.amount) : null;
	}

	constructor(
		public readonly characterLimitMessageService: CharacterLimitMessageService,
		private readonly formBuilder: FormBuilder,
		private readonly dialogRef: MatDialogRef<CreateOfferComponent>,
		private readonly toastrService: ToastrService,
		private readonly dialogService: DialogService,
		private translateService: TranslateService,
		private offerService: OfferService,
		private benefitsService: BenefitService,
		private cdr: ChangeDetectorRef,
		@Inject(MAT_DIALOG_DATA) public data?: { offerToReactivate: string },
	) {}

	@HostListener('click', ['$event'])
	onClick() {
		if (!this.shouldHideRestrictionField(RestrictionFormFields.priceRange)) {
			this.clickedOutsideFieldPrice = true;
		}

		if (!this.shouldHideRestrictionField(RestrictionFormFields.timeSlots)) {
			this.clickedOutsideFieldTime = true;
		}
	}

	public ngOnInit(): void {
		this.characterLimitMessageService.messageCount = TEXT_AREA_MAX_LENGTH;
		this.getOfferTypeAndBenefits();
		this.initRestrictions();

		this.restrictionFields = this.initRestrictionFields();

		if (this.data) {
			this.initReactivateOffer();
		} else {
			this.initForm();
		}

		this.onRestrictionValueChanges();
		this.onAcceptedBenefitValuesChange();
		this.onOfferTypeValueChange();
	}

	public getExpirationDateMax(minusOneDay = false): Date | null {
		const expirationDate = this.getSelectedBenefit()?.expirationDate ?? null;
		if (!expirationDate) {
			return null;
		}
		const date = new Date(expirationDate);
		if (minusOneDay) {
			date.setDate(date.getDate() - 1);
		}
		return date;
	}

	public getInitDateMin(): Date | null {
		const startDate = this.getSelectedBenefit()?.startDate;
		return startDate ? new Date(startDate) : null;
	}

	public isTimeSlotChecked(restriction: any, changes: any): boolean {
		const { formControl } = restriction;
		const { timeSlots } = RestrictionFormFields;

		return formControl === timeSlots && changes[timeSlots];
	}

	public isPriceRangeChecked(restriction: any, changes: any): boolean {
		const { formControl } = restriction;
		const { priceRange } = RestrictionFormFields;

		return formControl === priceRange && changes[priceRange];
	}

	public isTimeSlotsOrPriceRangeUnchecked(restriction: Restriction, changes: { [key: string]: Changes }): boolean {
		const { formControl } = restriction;

		return !changes[formControl];
	}

	public shouldHideRestrictionField(type: string): boolean {
		return !this.selectedRestrictionValue?.[type];
	}

	public shouldNotIncludeAnyRestrictions(restrictionType: string): boolean {
		const excludedValues = [RestrictionFormFields.timeSlots, RestrictionFormFields.priceRange];

		return !excludedValues.some((val) => val === restrictionType);
	}

	public getAmountPlaceholder(offerType: number | null): string {
		switch (offerType) {
			case OfferTypeEnum.percentage:
				return this.translateService.instant('offer.amountPercentagePlaceholder');

			case OfferTypeEnum.credit:
				return this.translateService.instant('offer.amountCreditPlaceholder');

			case OfferTypeEnum.freeEntry:
				return this.translateService.instant('offer.amountFreeEntryPlaceholder');

			default: {
				return '';
			}
		}
	}

	public onTypeChange(): void {
		this.resetFormValue(CreateOfferFormFields.offerTypeId);
		this.resetFormValue(CreateOfferFormFields.amount, '');

		this.selectedOfferTypeId = null;
		this.updatedSource = this.dropdownSource.filter((item) => item.visible === true);
	}

	public getErrorMessageFormInputs(value: string): string | null {
		switch (value) {
			case CreateOfferFormFields.title:
				return this.translateService.instant('offer.formRequired.titleFormControlRequired');
			case CreateOfferFormFields.description:
				return this.translateService.instant('offer.formRequired.descriptionFormControlRequired');
			case CreateOfferFormFields.amount:
				return this.translateService.instant('genericFields.amount.amountFormControlRequired');
			case CreateOfferFormFields.validity:
				return this.translateService.instant('offer.formRequired.validityFormControlRequired');
			case CreateOfferFormFields.benefitId:
				return this.translateService.instant('offer.formRequired.benefitFormControlRequired');
			default: {
				return null;
			}
		}
	}

	public displayDateValidityError(): boolean {
		return this.isControlInvalid('startDate') || this.isControlInvalid('expirationDate');
	}

	public close(success?: boolean): void {
		this.dialogRef.close(success);
	}

	public shouldDisableSaveButton(): boolean {
		const generalFormValid = this.createOfferForm?.valid;

		return !generalFormValid;
	}

	public onStartDateChange(): void {
		CommonUtil.enforceStartDateBeforeExpiration(this.createOfferForm);
	}

	public shouldDisplayReactivationAlert(): boolean {
		if (!this.isReactivating) {
			return false;
		}

		return !this.alertDismissed;
	}

	public confirmDialog(): void {
		if (this.isReactivating) {
			this.reactivateOffer();
			return;
		}

		this.saveOffer();
	}

	public saveOffer(): void {
		const offerDto = this.getFormValuesToOfferDto();

		const restrictions = this.mapRestrictionsValues();

		if (restrictions) {
			offerDto.restrictionRequestDto = restrictions;
		}

		this.offerService.createOffer(offerDto).subscribe(() => {
			this.onOfferCreated(offerDto);
		});
	}

	public reactivateOffer(): void {
		if (!this.data) {
			return;
		}

		const reactivateOfferDto = new ReactivateOfferDto(
			this.data?.offerToReactivate,
			this.createOfferForm.get('startDate')?.value,
			this.createOfferForm.get('expirationDate')?.value,
		);

		this.offerService.reactivateOffer(reactivateOfferDto).subscribe(() => {
			this.onOfferReactivated();
		});
	}

	public onValueChangeOnOfferTypes(event: any): void {
		this.selectedOfferTypeId = event;
		this.resetFormValue(CreateOfferFormFields.amount, '');

		this.setFieldSpecificToOfferType();
	}

	public onSearchOnOfferTypes(event: string): void {
		this.updatedSource = !event
			? this.dropdownSource.filter((item) => item.visible === true)
			: this.dropdownSource.filter(
					(item) =>
						item.visible === true && item.offerTypeLabel.toLowerCase().includes(event.trim().toLowerCase()),
				);
	}

	public onSearchOnBenefits(event: string): void {
		this.updatedBenefits = !event
			? this.availableBenefits
			: this.availableBenefits.filter((item) => item.name.toLowerCase().includes(event.trim().toLowerCase()));
	}

	public onValueChangeOnCheckedBenefits(event: any): void {
		this.selectedBenefit = event;
	}

	private setupAmountValidatorsOnChange(controlName: 'benefitId' | 'offerTypeId'): void {
		if (!this.createOfferForm) {
			return;
		}

		const amountControl = this.createOfferForm.get('amount');
		this.createOfferForm.get(controlName)?.valueChanges.subscribe(() => {
			const offerTypeId = this.createOfferForm.get('offerTypeId')?.value;
			const benefitId = this.createOfferForm.get('benefitId')?.value;
			const benefit = this.availableBenefits.find((b) => b.id === benefitId);
			amountControl?.clearValidators();

			if (benefit && (offerTypeId === OfferTypeEnum.freeEntry || offerTypeId === OfferTypeEnum.credit)) {
				amountControl?.setValidators([
					Validators.required,
					FormUtil.nonZeroAmountValidator,
					(control) => this.nonMaxBenefitAmountValidator(Number(control.value), Number(benefit.amount)),
				]);
			} else {
				amountControl?.setValidators([Validators.required, FormUtil.nonZeroAmountValidator]);
			}

			amountControl?.updateValueAndValidity();
			this.cdr.detectChanges();
		});
	}

	private onAcceptedBenefitValuesChange(): void {
		this.setupAmountValidatorsOnChange('benefitId');
	}

	private onOfferTypeValueChange(): void {
		this.setupAmountValidatorsOnChange('offerTypeId');
	}

	private getSelectedBenefit(): BenefitDto | undefined {
		return this.availableBenefits.find((benefit) => benefit.id === this.selectedBenefit);
	}

	private onOfferReactivated(): void {
		this.close();

		if (this.shouldDisplayApprovalMessage) {
			this.displayPopupForOfferWithBenefits();
			return;
		}

		const toastText = this.translateService.instant('general.success.offerReactivatedText');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
	}

	private setFieldSpecificToOfferType(): void {
		switch (this.selectedOfferTypeId) {
			case OfferTypeEnum.percentage:
			case OfferTypeEnum.freeEntry:
			case OfferTypeEnum.credit:
				this.createOfferForm.get(CreateOfferFormFields.amount)?.enable();
				break;
			default:
				this.createOfferForm.get(CreateOfferFormFields.amount)?.disable();
				break;
		}
	}

	private initRestrictionFields(): { restriction: string }[] {
		return [
			{ restriction: 'frequencyOfUse' },
			{ restriction: 'timeSlots' },
			{ restriction: 'ageRestriction' },
			{ restriction: 'priceRange' },
		];
	}

	private isControlInvalid(controlName: string): boolean {
		if (!this.createOfferForm) {
			return true;
		}

		const control = this.createOfferForm.controls[controlName];

		return control.touched && !control.valid;
	}

	private resetFormValue(controlName: string, value?: string): void {
		this.createOfferForm.get(controlName)?.reset(value);
	}

	private onOfferCreated(offerDto: OfferDto): void {
		const toastText = this.translateService.instant('general.success.offerSavedText');
		this.close(true);
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
		this.displayPopupForOfferWithBenefits();
	}

	private getRequestsObservable(): Observable<(BenefitDto[] | OfferType[] | null)[]> {
		const requests = [this.offerService.getOfferTypes(), this.benefitsService.getAllBenefits()];

		return forkJoin(requests);
	}

	private getOfferTypeAndBenefits(): void {
		this.getRequestsObservable().subscribe((data) => {
			if (!data) {
				return;
			}

			this.initializeOfferTypes(data[0] as OfferType[]);
			this.initializeBenefits(data[1] as BenefitDto[]);
		});
	}

	private initializeOfferTypes(data: OfferType[]): void {
		if (!Array.isArray(data)) {
			return;
		}

		const offerTypes: OfferTypeVisibility[] = data.map((element) => ({
			offerTypeId: element.offerTypeId,
			offerTypeLabel: this.translateService.instant(element.offerTypeLabel),
			visible: true,
		}));

		this.dropdownSource = offerTypes;
		this.updatedSource = this.dropdownSource.filter((item) => item.visible === true);
	}

	private initializeBenefits(data: BenefitDto[]): void {
		if (!Array.isArray(data)) {
			return;
		}

		this.availableBenefits = data;
		this.updatedBenefits = this.availableBenefits;
	}

	private initRestrictions(): void {
		const generateRestriction = (formControl: string, label: string) =>
			new CheckboxData(formControl, label, `id-${formControl}-checkbox`, `data-testid-${label}`);

		this.restrictionsData = [
			generateRestriction(RestrictionFormFields.frequencyOfUse, 'offer.frequencyOfUse.label'),
			generateRestriction(RestrictionFormFields.timeSlots, 'offer.timeSlots'),
			generateRestriction(RestrictionFormFields.ageRestriction, 'offer.ageRestriction.label'),
			generateRestriction(RestrictionFormFields.priceRange, 'offer.priceRange.label'),
		];
	}

	private onRestrictionValueChanges(): void {
		if (!this.createOfferForm) {
			return;
		}

		this.createOfferForm.valueChanges.subscribe((changes) => {
			this.selectedRestrictionValue = changes;
			this.cdr.detectChanges();

			if (this.updatingFormValues) {
				return;
			}

			this.updatingFormValues = true;

			this.restrictionsData.forEach((restriction) => {
				const type = restriction.formControl;
				const value = changes[type];
				const valueControl = this.createOfferForm.get(`${type}Value`)?.value;

				if (this.shouldNotIncludeAnyRestrictions(type)) {
					this.manageRadioButtonOption(type, value, valueControl);
					return;
				}

				if (this.isTimeSlotsOrPriceRangeUnchecked(restriction, changes)) {
					this.resetTimeSlotsAndPriceRangeRestriction(type, value);
					return;
				}

				if (this.isTimeSlotChecked(restriction, changes)) {
					this.manageTimeSlotsRestriction(value);
					return;
				}

				if (this.isPriceRangeChecked(restriction, changes)) {
					this.managePriceRangeRestriction(value);
					return;
				}
			});

			this.updatingFormValues = false;
		});
	}

	private manageRadioButtonOption(type: string, value: string, valueControl: string): void {
		const frequencyOfUseControl = this.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue);
		const isFrequencyOfUseHidden = this.shouldHideRestrictionField(RestrictionFormFields.frequencyOfUse);
		let isDefaultOptionSelected = frequencyOfUseControl?.untouched && !frequencyOfUseControl.value;

		if (type === RestrictionFormFields.frequencyOfUse && !isFrequencyOfUseHidden && isDefaultOptionSelected) {
			frequencyOfUseControl?.setValue(FrequencyOfUse.SINGLE_USE);
			return;
		}

		const ageRestrictionControl = this.createOfferForm.get(RestrictionFormFields.ageRestrictionValue);
		const isAgeHidden = this.shouldHideRestrictionField(RestrictionFormFields.ageRestriction);
		isDefaultOptionSelected = ageRestrictionControl?.untouched && !ageRestrictionControl.value;

		if (type === RestrictionFormFields.ageRestriction && !isAgeHidden && isDefaultOptionSelected) {
			ageRestrictionControl?.setValue(18);
			return;
		}

		const isOtherValueSelected =
			valueControl === 'offer.ageRestriction.other' &&
			!this.createOfferForm.get(RestrictionFormFields.ageRestrictionOtherValue)?.value;

		if (value && (!valueControl || isOtherValueSelected)) {
			this.setErrorToFormField(type);
		}

		if (!value && valueControl) {
			this.clearRestrictionValidatorsAndErrors(this.createOfferForm, type, true);
		}
	}

	private resetTimeSlotsAndPriceRangeRestriction(type: string, value: any) {
		const isTimeSlots = type === RestrictionFormFields.timeSlots;
		const isPriceRange = type === RestrictionFormFields.priceRange;

		if ((isTimeSlots && !value) || (isPriceRange && !value)) {
			this.resetRangedFields(
				isTimeSlots ? RestrictionFormFields.timeFrom : RestrictionFormFields.minPrice,
				isTimeSlots ? RestrictionFormFields.timeTo : RestrictionFormFields.maxPrice,
				isPriceRange,
			);
		}
	}

	private manageTimeSlotsRestriction(value: string) {
		const { timeTo, timeFrom } = this.createOfferForm.controls;

		const isMissingValue = value && !timeTo?.value && !timeFrom?.value;

		if (!isMissingValue) {
			return;
		}

		this.setErrorToFormField(RestrictionFormFields.timeSlots);
	}

	private managePriceRangeRestriction(value: string) {
		const { maxPrice, minPrice } = this.createOfferForm.controls;

		const isMissingValue = value && !maxPrice?.value && !minPrice?.value;

		if (!isMissingValue) {
			return;
		}

		this.setErrorToFormField(RestrictionFormFields.priceRange);
	}

	private resetRangedFields(firstField: string, secondField: string, isPriceRange: boolean): void {
		this.resetFormValue(firstField, '');
		this.resetFormValue(secondField, '');

		if (isPriceRange) {
			this.clickedOutsideFieldPrice = false;
			return;
		}

		this.clickedOutsideFieldTime = false;
	}

	private mapRestrictionsValues(): RestrictionsDto | undefined {
		const restrictions: RestrictionsDto = new RestrictionsDto();
		const formControls = this.createOfferForm.controls;

		this.restrictionsData.forEach((restriction) => {
			const type = restriction.formControl;
			const value = this.createOfferForm.get(`${type}Value`)?.value;

			if (type === RestrictionFormFields.timeSlots) {
				this.mapTimeRestrictions(formControls, restrictions);
				return;
			}

			if (type === RestrictionFormFields.priceRange) {
				this.mapPriceRangeRestrictions(formControls, restrictions);
				return;
			}

			if (!value) {
				return;
			}

			const isAgeRestrictionOtherValue = value === 'offer.ageRestriction.other';

			if (type === RestrictionFormFields.ageRestriction && isAgeRestrictionOtherValue) {
				restrictions[type] = formControls[RestrictionFormFields.ageRestrictionOtherValue]?.value;
				return;
			}

			restrictions[type] = value;
		});

		return Object.keys(restrictions).length > 0 ? restrictions : undefined;
	}

	private mapTimeRestrictions(formControls: any, restrictions: RestrictionsDto): void {
		const timeFrom = formControls[RestrictionFormFields.timeFrom]?.value;
		const timeTo = formControls[RestrictionFormFields.timeTo]?.value;

		if (!timeFrom && !timeTo) {
			return;
		}

		restrictions[RestrictionFormFields.timeFrom] = this.toUtcTime(timeFrom).toISOString();
		restrictions[RestrictionFormFields.timeTo] = this.toUtcTime(timeTo).toISOString();
	}

	private toUtcTime(date: Date): Date {
		return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	}
	private mapPriceRangeRestrictions(formControls: any, restrictions: RestrictionsDto): void {
		const minPrice = formControls[RestrictionFormFields.minPrice]?.value;
		const maxPrice = formControls[RestrictionFormFields.maxPrice]?.value;

		if (!minPrice && !maxPrice) {
			return;
		}

		restrictions[RestrictionFormFields.minPrice] = minPrice;
		restrictions[RestrictionFormFields.maxPrice] = maxPrice;
	}

	private initReactivateOffer(): void {
		if (!this.data) {
			return;
		}

		this.isReactivating = true;

		this.offerService.getFullOffer(this.data.offerToReactivate).subscribe((offer) => {
			this.selectedOfferTypeId = offer.offerTypeId;

			this.initReactivateForm(offer);
			this.setFieldSpecificToOfferType();
			this.setFieldsSpecificToRestrictions(offer.restrictionRequestDto);
		});
	}

	private setFieldsSpecificToRestrictions(restrictions?: RestrictionsDto): void {
		if (!restrictions || this.selectedRestrictionValue) {
			return;
		}

		this.selectedRestrictionValue = {
			frequencyOfUse: !!restrictions.frequencyOfUse,
			priceRange: !!(restrictions.maxPrice || restrictions.minPrice),
			timeSlots: !!(restrictions.timeTo || restrictions.timeFrom),
			ageRestriction: !!restrictions.ageRestriction,
			offerCombinations: false,
			residenceRestriction: false,
		};
	}

	private convertTimeToCompatibleDate(time?: Date): string | null {
		return time ? time.toISOString() : null;
	}

	private initReactivateForm(offer: OfferDto): void {
		this.updatedSource = [...this.dropdownSource];

		this.shouldDisplayApprovalMessage = offer.offerTypeId === 0;

		this.createOfferForm = this.formBuilder.group({
			title: [offer.title],
			description: [offer.description],
			citizenOfferType: [
				{
					value: 'offer.citizenWithPass',
					disabled: true,
				},
			],
			offerTypeId: [offer.offerTypeId],
			startDate: [new Date(), Validators.required],
			expirationDate: ['', Validators.required],
			amount: [offer.amount],
			benefitId: [{ value: offer.benefitId, disabled: true }],
			frequencyOfUse: [{ value: !!offer.restrictionRequestDto?.frequencyOfUse, disabled: true }],
			timeSlots: [
				{
					value: !!(offer.restrictionRequestDto?.timeFrom || offer.restrictionRequestDto?.timeTo),
					disabled: true,
				},
			],
			ageRestriction: [{ value: !!offer.restrictionRequestDto?.ageRestriction, disabled: true }],
			priceRange: [
				{
					value: !!(offer.restrictionRequestDto?.minPrice || offer.restrictionRequestDto?.maxPrice),
					disabled: true,
				},
			],
			frequencyOfUseValue: [{ value: offer.restrictionRequestDto?.frequencyOfUse, disabled: true }],
			ageRestrictionValue: [{ value: offer.restrictionRequestDto?.ageRestriction, disabled: true }],
			ageRestrictionOtherValue: [{ value: offer.restrictionRequestDto?.ageRestriction, disabled: true }],
			timeTo: [
				{
					value: this.getTimeSlot(offer.restrictionRequestDto?.timeTo),
					disabled: true,
				},
			],
			timeFrom: [
				{
					value: this.getTimeSlot(offer.restrictionRequestDto?.timeFrom),
					disabled: true,
				},
			],
			minPrice: [offer.restrictionRequestDto?.minPrice],
			maxPrice: [offer.restrictionRequestDto?.maxPrice],
		});
	}

	private initForm(): void {
		const defaultValidators = [Validators.required];
		const defaultDisabledState = { value: '', disabled: true };

		this.createOfferForm = this.formBuilder.group({
			title: ['', [...defaultValidators, this.validationNoSpaceFunctionError]],
			description: [
				'',
				[...defaultValidators, Validators.maxLength(TEXT_AREA_MAX_LENGTH), this.validationNoSpaceFunctionError],
			],
			citizenOfferType: ['offer.citizenWithPass', defaultValidators],
			offerTypeId: ['', defaultValidators],
			startDate: ['', defaultValidators],
			expirationDate: ['', defaultValidators],
			amount: [defaultDisabledState, [...defaultValidators, FormUtil.nonZeroAmountValidator]],
			benefitId: ['', defaultValidators],
			frequencyOfUse: [''],
			timeSlots: [''],
			ageRestriction: [''],
			priceRange: [''],
			frequencyOfUseValue: [''],
			ageRestrictionValue: [''],
			ageRestrictionOtherValue: [''],
			timeTo: [],
			timeFrom: [],
			minPrice: [],
			maxPrice: [],
		});
	}

	private getTimeSlot(time: string | undefined): string | null {
		const defaultYear = '1970-01-01T';
		if (time) {
			return this.convertTimeToCompatibleDate(new Date(`${defaultYear}${time}`));
		}
		return null;
	}

	private setErrorToFormField(type: string): void {
		const control = this.createOfferForm.get(type);

		if (!control?.value) {
			return;
		}

		control?.setValidators([Validators.required]);
		control?.setErrors({ required: true });
	}

	private getFormValuesToOfferDto(): OfferDto {
		const createBenefitFormData: OfferDto = {
			...this.createOfferForm.value,
			startDate: FormUtil.normalizeDate(this.createOfferForm.controls['startDate'].value),
			expirationDate: FormUtil.normalizeDate(this.createOfferForm.controls['expirationDate'].value),
		};

		createBenefitFormData.citizenOfferType = this.CITIZEN_WITH_PASS;

		return createBenefitFormData;
	}

	private displayPopupForOfferWithBenefits(): void {
		this.dialogService
			?.message(CustomDialogComponent, this.getOfferWithBenefitsMessage())
			?.afterClosed()
			.subscribe();
	}

	private getOfferWithBenefitsMessage(): MatDialogConfig {
		const benefitsApprovalModalData = new ModalData(
			'offer.dialogOfferBenefits.createSuccessful',
			'offer.dialogOfferBenefits.mainContent',
			'offer.dialogOfferBenefits.mainContentText',
			'general.button.cancel',
			'general.button.understand',
			false,
			'success',
			'theme',
			'wait-clock.svg',
		);

		return { ...CustomDialogConfigUtil.createMessageModal(benefitsApprovalModalData), disableClose: true };
	}
}
