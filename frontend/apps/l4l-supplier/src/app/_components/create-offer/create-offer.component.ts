//Todo: refactor this component to smaller components since component violates SRP

import { ChangeDetectorRef, Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {
	BenefitDto,
	BenefitService,
	CharacterLimitMessageService,
	CommonUtil,
	DateUtil,
	FormUtil,
	GenericStatusEnum,
	ModalData,
	OfferDto,
	OfferInformationDto,
	RestrictionsDto,
	TEXT_AREA_MAX_LENGTH,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';
import { forkJoin, Observable } from 'rxjs';

import { CreateOfferFormFields } from '../../enums/create-offer-form-field.enum';
import { OfferTypeEnum } from '../../enums/offer-type.enum';
import { RestrictionFormFields } from '../../enums/restriction.enum';
import { OfferType } from '../../models/offer-type.model';
import { OfferTypeVisibility } from '../../models/offer-type-visibility.model';
import { RestrictionType } from '../../models/restriction-type.model';
import { DiscountCodeService } from '../../services/discount-code/discount-code.service';
import { OfferService } from '../../services/offer-service/offer.service';

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
	public isOfferBenefitUnavailable = false;

	public selectedBenefits: BenefitDto[] = [];

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

	public RestrictionFormFields = RestrictionFormFields;

	//public restrictionsData: CheckboxData[];

	public isReactivating = false;
	public isOfferClaimed = false;
	public isViewMode = false;
	public isEditMode = false;
	public alertDismissed = false;
	public alertBenefitDismissed = false;
	public isReapplyMode = false;
	public shouldDisplayApprovalMessage = false;

	private selectedRestrictionValue: RestrictionType;

	private CITIZEN_WITH_PASS = 'CITIZEN_WITH_PASS';

	public get isReadOnlyMode(): boolean {
		return this.isViewMode;
	}

	public get hideAmount(): boolean {
		const hiddenOfferTypes = [OfferTypeEnum.membershipFee];
		return (
			!this.selectedOfferTypeId ||
			(this.selectedOfferTypeId !== null && !hiddenOfferTypes.includes(this.selectedOfferTypeId))
		);
	}

	public get amountLabel(): string {
		return this.selectedOfferTypeId === OfferTypeEnum.freeEntry ? 'offer.freeEntry' : 'offer.amount';
	}

	public get shouldDisplayTypeHint(): boolean {
		return (
			this.selectedOfferTypeId !== null &&
			[OfferTypeEnum.freeEntry, OfferTypeEnum.freeProduct].includes(this.selectedOfferTypeId)
		);
	}

	public get showPrefix(): string {
		const shouldShowEuroPrefix =
			this.selectedOfferTypeId !== null && [OfferTypeEnum.membershipFee].includes(this.selectedOfferTypeId);
		return shouldShowEuroPrefix ? '€ ' : '';
	}

	public get showSuffix(): string {
		// this was used when we had Discount offer type. We keep it since we are not sure if it will stay the same.
		//return this.selectedOfferTypeId === OfferTypeEnum.percentage ? '%' : '';
		return '';
	}

	public get showDecimal(): string {
		return 'separator.2';
	}

	public get maxLength(): number {
		return Number.MAX_SAFE_INTEGER;
	}

	public get benefitAmount(): number | null {
		const benefits = this.getSelectedBenefits();
		if (benefits.length === 0) {
			return null;
		}
		return Math.min(...benefits.map((benefit) => Number(benefit.amount)));
	}

	public get alertType(): 'info' | 'error' | 'warning' {
		return this.isOfferClaimed || this.isSuspendedOffer ? 'warning' : this.isBenefitExpired() ? 'error' : 'info';
	}

	public get alertMessage(): string {
		return this.isOfferClaimed
			? 'offer.offerAlreadyClaimed'
			: this.isBenefitExpired()
				? 'offer.reactivateAlertExpiredBenefit'
				: this.isSuspendedOffer
					? 'offer.suspendedOfferAlert'
					: 'offer.reactivateAlert';
	}

	public get alertBenefitMessage(): string {
		if (this.isOfferClaimed && this.isOfferBenefitUnavailable) {
			return 'offer.offerBenefitUnavailableAndClaimedAlert';
		} else if (this.isOfferBenefitUnavailable) {
			return 'offer.offerBenefitUnavailableAlert';
		}

		return '';
	}

	public get characterLimitServiceInstance(): CharacterLimitMessageService {
		return this.characterLimitMessageService;
	}

	public get title(): string {
		return this.isReactivating
			? 'offer.reactivateOffer'
			: this.isReapplyMode
				? 'general.button.applyAgain'
				: this.isViewMode
					? this.data?.offerToView?.title || this.data?.offerToSuspend?.title || ''
					: this.isEditMode
						? this.data?.offerToEdit?.title || ''
						: 'offer.addOffer';
	}

	public get isActiveOffer(): boolean {
		return this.data?.offerStatus === GenericStatusEnum.ACTIVE;
	}

	public get isRejectedOffer(): boolean {
		return this.data?.offerStatus === GenericStatusEnum.REJECTED;
	}

	public get isExpiredOffer(): boolean {
		return this.data?.offerStatus === GenericStatusEnum.EXPIRED;
	}

	public get isSuspendedOffer(): boolean {
		return this.data?.offerStatus === GenericStatusEnum.ACTIVE && !!this.data.offerToSuspend;
	}

	public get isNewOffer(): boolean {
		return (
			this.data?.offerToEdit === undefined &&
			this.data?.offerToReactivate === undefined &&
			this.data?.offerToView === undefined &&
			this.data?.offerToReapply === undefined
		);
	}

	public get shouldDisplayRestrictionsTitle(): boolean {
		if (!this.isViewMode) {
			return true;
		}

		const timeToValue = this.createOfferForm.get(RestrictionFormFields.timeTo)?.value;
		const timeFromValue = this.createOfferForm.get(RestrictionFormFields.timeFrom)?.value;
		const frequencyValue = this.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.value;

		return !!timeToValue || !!timeFromValue || !!frequencyValue;
	}

	public get getBenefitPlaceholder(): string {
		if (!this.isNewOffer && this.isOfferBenefitUnavailable) return 'offer.expiredBenefitPlaceholder';
		return 'offer.acceptedBenefitsPlaceholder';
	}

	private readonly toastrService = inject(ToastrService);
	private readonly dialogService = inject(DialogService);
	private readonly offerService = inject(OfferService);
	private readonly benefitsService = inject(BenefitService);
	private readonly translateService = inject(TranslateService);
	private readonly characterLimitMessageService = inject(CharacterLimitMessageService);
	private readonly discountCodeService = inject(DiscountCodeService);

	private readonly dialogRef = inject(MatDialogRef<CreateOfferComponent>);
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly formBuilder = inject(FormBuilder);

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data?: {
			offerToReactivate?: OfferInformationDto;
			offerToView?: OfferInformationDto;
			offerToEdit?: OfferInformationDto;
			offerToReapply?: OfferInformationDto;
			offerToSuspend?: OfferInformationDto;
			offerStatus?: GenericStatusEnum;
		},
	) {}

	public ngOnInit(): void {
		this.characterLimitMessageService.messageCount = TEXT_AREA_MAX_LENGTH;
		this.getOfferTypeAndBenefits();
		this.restrictionFields = this.initRestrictionFields();

		this.initializeFormType();
	}

	public shouldDisplayRestriction(restriction: RestrictionFormFields): boolean {
		if (!this.isViewMode) {
			return true;
		}

		if (restriction === RestrictionFormFields.timeSlots) {
			const timeToValue = this.createOfferForm.get(RestrictionFormFields.timeTo)?.value;
			const timeFromValue = this.createOfferForm.get(RestrictionFormFields.timeFrom)?.value;

			return !!timeToValue || !!timeFromValue;
		}

		const frequencyOfUseValue = this.createOfferForm.get(restriction);
		return !!frequencyOfUseValue?.value;
	}

	public deleteOffer(): void {
		const config = this.createDeleteDialogConfig();

		this.dialogService
			.alert(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				if (!data) {
					return;
				}

				this.dialogRef.close({ shouldDelete: true });
			});
	}

	public getExpirationDateMax(minusOneDay = false): Date | null {
		const benefits = this.getSelectedBenefits();
		if (!benefits || benefits.length === 0) {
			return null;
		}

		const expirationDate = benefits.reduce(
			(minDate, benefit) => {
				const benefitDate = new Date(benefit.expirationDate);
				return minDate && minDate < benefitDate ? minDate : benefitDate;
			},
			null as Date | null,
		);

		if (!expirationDate) {
			return null;
		}

		if (minusOneDay) {
			expirationDate.setDate(expirationDate.getDate() - 1);
		}
		return expirationDate;
	}

	public getInitDateMin(): Date | null {
		const benefits = this.getSelectedBenefits();
		if (!benefits || benefits.length === 0) {
			return null;
		}

		const startDate = benefits.reduce(
			(maxDate, benefit) => {
				const benefitDate = new Date(benefit.startDate);
				return maxDate && maxDate > benefitDate ? maxDate : benefitDate;
			},
			null as Date | null,
		);

		return startDate;
	}

	private getSelectedBenefits(): BenefitDto[] {
		if (!this.selectedBenefits || this.selectedBenefits.length === 0) {
			return [];
		}
		const selectedBenefitIds = this.selectedBenefits.map((benefit) => benefit?.id);
		return this.availableBenefits.filter((benefit) => benefit.id && selectedBenefitIds.includes(benefit.id));
	}

	public getAmountPlaceholder(offerType: number | null): string {
		switch (offerType) {
			case OfferTypeEnum.membershipFee:
				return this.translateService.instant('offer.amountFeeMembershipPlaceholder');
			default:
				return '';
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
			case CreateOfferFormFields.benefitIds:
				return this.translateService.instant('offer.formRequired.benefitFormControlRequired');
			case CreateOfferFormFields.offerTypeId:
				return this.translateService.instant('offer.formRequired.offerTypeFormControlRequired');
			default: {
				return null;
			}
		}
	}

	public displayDateValidityError(): boolean {
		return this.isControlInvalid('startDate') || this.isControlInvalid('expirationDate');
	}

	public close(success?: boolean): void {
		if (success || !this.createOfferForm.dirty) {
			this.dialogRef.close(success || false);
		} else {
			this.openWarningModal();
		}
	}

	public openWarningModal(): void {
		const data = new WarningDialogData();

		this.dialogService
			.message(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						this.isEditMode ? 'offer.leavingWarningEdit' : 'offer.leavingWarningCreate',
						'general.button.stay',
						'general.button.cancel',
						false,
						'warning',
						'theme',
						'',
						data,
					),
				),
				width: '400px',
				ariaLabel: this.translateService.instant('general.closingWarning'),
			})
			?.afterClosed()
			.subscribe((result) => {
				if (!result) {
					return;
				}

				this.dialogRef.close(false);
			});
	}

	public shouldDisableSaveButton(): boolean {
		const generalFormValid = this.createOfferForm?.valid;

		return !generalFormValid || this.isBenefitExpired();
	}

	public onStartDateChange(): void {
		CommonUtil.enforceStartDateBeforeExpiration(this.createOfferForm);
	}

	public shouldDisplayReactivationAlert(): boolean {
		return (
			((this.isReactivating || this.isOfferClaimed) &&
				!(this.isOfferClaimed && this.isOfferBenefitUnavailable) &&
				!this.alertDismissed) ||
			(this.isSuspendedOffer && !this.alertDismissed)
		);
	}

	public shouldDisplayExpiredBenefitAlert(): boolean {
		return this.isOfferBenefitUnavailable && !this.alertBenefitDismissed && !this.isNewOffer;
	}

	public confirmDialog(): void {
		if (this.isReactivating || this.isEditMode || this.isReapplyMode) {
			this.editOffer();
			return;
		}

		this.saveOffer();
	}

	public saveOffer(): void {
		const offerDto = this.mapOfferDto();
		offerDto.version = 0;

		this.offerService.createOffer(offerDto).subscribe(() => {
			this.close(true);
			this.displayPopupForOfferWithBenefits();
		});
	}

	public editOffer(): void {
		const offerDto = this.mapOfferDto();
		offerDto.benefitIds = Array.isArray(offerDto.benefitIds) ? offerDto.benefitIds : [offerDto.benefitIds || ''];

		this.cleanAmountFieldIfNeeded(offerDto);
		const offerId = this.isReactivating
			? this.data?.offerToReactivate?.id || ''
			: this.isReapplyMode
				? this.data?.offerToReapply?.id || ''
				: this.data?.offerToEdit?.id || '';
		this.offerService.editOffer(offerId, offerDto).subscribe({
			next: () => {
				this.close(true);
				this.displayPopupForOfferWithBenefits();
			},
			error: () => {
				this.close(true);
			},
		});
	}

	public onValueChangeOnOfferTypes(event: any): void {
		this.selectedOfferTypeId = event;

		this.resetFormValue(CreateOfferFormFields.amount, '');
		this.setFieldSpecificToOfferType();
		this.setupValidationOnChange();
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
		if (Array.isArray(event)) {
			this.selectedBenefits = event.length
				? event.map((benefitId: string) => ({ id: benefitId }) as BenefitDto)
				: [];
		} else if (event && typeof event === 'string') {
			this.selectedBenefits = [{ id: event } as BenefitDto];
		} else if (event) {
			this.selectedBenefits = [event as BenefitDto];
		} else {
			this.selectedBenefits = [];
			this.setErrorToFormField(CreateOfferFormFields.benefitIds);
		}
		this.setupValidationOnChange();
	}

	public suspendOffer(): void {
		const offerId = this.data?.offerToSuspend?.id;
		if (!offerId) {
			return;
		}

		this.offerService.suspendOffer(offerId).subscribe(() => {
			const toastText = this.translateService.instant('offer.offerSuspendedText');
			this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
			this.close(true);
		});
	}

	public reinitializeDialog(): void {
		this.isViewMode = false;
		this.isEditMode = true;

		if (this.data?.offerStatus === GenericStatusEnum.EXPIRED) {
			this.isReactivating = true;

			if (this.data) {
				this.data.offerToReactivate = { ...this.data.offerToView } as OfferInformationDto;
				this.data.offerToView = undefined;
			}
		} else if (this.data?.offerStatus === GenericStatusEnum.REJECTED) {
			this.isReapplyMode = true;

			if (this.data) {
				this.data.offerToReapply = { ...this.data.offerToView } as OfferInformationDto;
				this.data.offerToView = undefined;
			}
		} else {
			this.isReactivating = false;

			if (this.data) {
				this.data.offerToEdit = {
					...(this.data.offerToView || this.data.offerToSuspend),
				} as OfferInformationDto;
				this.data.offerToView = undefined;
				this.data.offerToSuspend = undefined;
			}
		}

		this.ngOnInit();
	}

	private setupValidationOnChange(): void {
		const amountControl = this.createOfferForm?.get('amount');
		const offerTypeId = this.createOfferForm?.get('offerTypeId')?.value;

		const benefitsMinAmount = this.benefitAmount;
		amountControl?.clearValidators();

		const validators = [Validators.required, FormUtil.nonZeroAmountValidator];

		if (benefitsMinAmount && offerTypeId === OfferTypeEnum.membershipFee) {
			validators.push((control) =>
				this.nonMaxBenefitAmountValidator(Number(control.value), Number(benefitsMinAmount)),
			);
		} else {
			amountControl?.setValue('');
		}

		if (offerTypeId === OfferTypeEnum.membershipFee) {
			amountControl?.setValidators(validators);
		}

		amountControl?.updateValueAndValidity();
		this.cdr.detectChanges();
	}

	private setFieldSpecificToOfferType(): void {
		switch (this.selectedOfferTypeId) {
			case OfferTypeEnum.membershipFee:
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
			// { restriction: 'ageRestriction' },
			// { restriction: 'priceRange' },
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

		if (this.isViewMode) {
			return;
		}

		const offerToEdit = this.data?.offerToReapply ?? this.data?.offerToEdit ?? this.data?.offerToReactivate;
		this.isOfferBenefitUnavailable = !data.some((benefit) => {
			return benefit.id === offerToEdit?.benefit?.id;
		});

		if (this.isEditMode && offerToEdit && this.isOfferClaimed) {
			this.updatedBenefits = [offerToEdit?.benefit];
			return;
		}

		this.availableBenefits = data;
		this.updatedBenefits = data;

		this.onValueChangeOnCheckedBenefits(offerToEdit?.benefit);
	}

	private mapTimeRestrictions(formControls: any, restrictions: RestrictionsDto): void {
		const timeFrom = formControls[RestrictionFormFields.timeFrom]?.value;
		const timeTo = formControls[RestrictionFormFields.timeTo]?.value;

		if (timeFrom) {
			restrictions[RestrictionFormFields.timeFrom] = this.toUtcTime(timeFrom).toISOString();
		}

		if (timeTo) {
			restrictions[RestrictionFormFields.timeTo] = this.toUtcTime(timeTo).toISOString();
		}
	}

	private toUtcTime(date: Date): Date {
		const dateObject = date instanceof Date ? date : new Date(date);
		return new Date(dateObject.getTime() - dateObject.getTimezoneOffset() * 60000);
	}

	private setFieldsSpecificToRestrictions(restrictions?: RestrictionsDto): void {
		if (!restrictions || this.selectedRestrictionValue) {
			return;
		}

		this.selectedRestrictionValue = {
			frequencyOfUse: !!restrictions.frequencyOfUse,
			timeSlots: !!(restrictions.timeTo || restrictions.timeFrom),
			offerCombinations: false,
			residenceRestriction: false,
		};
	}

	private initViewForm(offer: OfferInformationDto): void {
		this.updatedBenefits = [offer.benefit];
		this.updatedSource = [...this.dropdownSource];

		this.shouldDisplayApprovalMessage = offer.offerTypeId === 0;
		this.selectedOfferTypeId = offer.offerTypeId;

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
			startDate: [this.isReactivating ? new Date() : DateUtil.toMoment(offer.startDate), Validators.required],
			expirationDate: [this.isReactivating ? '' : DateUtil.toMoment(offer.expirationDate), Validators.required],
			amount: [offer.amount],
			benefitIds: [offer.benefit?.id],
			frequencyOfUse: [{ value: !!offer.restrictionRequestDto?.frequencyOfUse, disabled: true }],
			frequencyOfUseValue: [{ value: offer.restrictionRequestDto?.frequencyOfUse, disabled: true }],
			timeSlots: [
				{
					value: !!(offer.restrictionRequestDto?.timeFrom || offer.restrictionRequestDto?.timeTo),
					disabled: true,
				},
			],
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
		});
	}

	private initEditForm(offer: OfferInformationDto): void {
		this.updatedBenefits = [offer.benefit];
		this.updatedSource = [...this.dropdownSource];

		const offerToEdit = this.data?.offerToReapply ?? this.data?.offerToEdit ?? this.data?.offerToReactivate;

		if (!offerToEdit) {
			return;
		}

		this.shouldDisplayApprovalMessage = offer.offerTypeId === 0;
		this.selectedOfferTypeId = this.data ? offerToEdit.offerTypeId : null;

		this.createOfferForm = this.formBuilder.group({
			title: [offer.title, Validators.required],
			description: [offer.description, Validators.required],
			citizenOfferType: [
				{
					value: 'offer.citizenWithPass',
					disabled: true,
				},
			],
			offerTypeId: [offer.offerTypeId, Validators.required],
			startDate: [this.isReactivating ? new Date() : DateUtil.toMoment(offer.startDate), Validators.required],
			expirationDate: [this.isReactivating ? '' : DateUtil.toMoment(offer.expirationDate), Validators.required],
			amount: [offer.amount],
			benefitIds: [this.isOfferBenefitUnavailable ? null : offer.benefit?.id, Validators.required],
			frequencyOfUse: [{ value: !!offer.restrictionRequestDto?.frequencyOfUse, disabled: this.isOfferClaimed }],
			frequencyOfUseValue: [
				{ value: offer.restrictionRequestDto?.frequencyOfUse, disabled: this.isOfferClaimed },
			],
			timeSlots: [
				{
					value: !!(offer.restrictionRequestDto?.timeFrom || offer.restrictionRequestDto?.timeTo),
					disabled: this.isOfferClaimed,
				},
			],
			timeTo: [
				{
					value: this.getTimeSlot(offer.restrictionRequestDto?.timeTo),
					disabled: this.isOfferClaimed,
				},
			],
			timeFrom: [
				{
					value: this.getTimeSlot(offer.restrictionRequestDto?.timeFrom),
					disabled: this.isOfferClaimed,
				},
			],
		});

		setTimeout(() => {
			if (this.isOfferClaimed) {
				this.createOfferForm.get('frequencyOfUse')?.disable();
				this.createOfferForm.get('timeSlots')?.disable();
				this.createOfferForm.get('frequencyOfUseValue')?.disable();
				this.createOfferForm.get('timeTo')?.disable();
				this.createOfferForm.get('timeFrom')?.disable();
			} else {
				this.createOfferForm.get('frequencyOfUse')?.enable();
				this.createOfferForm.get('timeSlots')?.enable();
				this.createOfferForm.get('frequencyOfUseValue')?.enable();
				this.createOfferForm.get('timeTo')?.enable();
				this.createOfferForm.get('timeFrom')?.enable();
			}
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
			benefitIds: ['', defaultValidators],
			frequencyOfUse: [''],
			frequencyOfUseValue: [''],
			timeSlots: [''],
			timeTo: [],
			timeFrom: [],
			// Hidden for now

			// minPrice: [],
			// maxPrice: [],
			// ageRestriction: [''],
			// priceRange: [''],
			// ageRestrictionValue: [''],
			// ageRestrictionOtherValue: [''],
		});
	}

	private getTimeSlot(time: string | undefined): Date | null {
		if (!time) {
			return null;
		}
		const [hours, minutes, seconds] = time.split(':').map(Number);
		return new Date(1970, 0, 1, hours, minutes, seconds || 0);
	}

	private setErrorToFormField(type: string): void {
		const control = this.createOfferForm?.get(type);

		if (!control?.value) {
			return;
		}

		control?.setValidators([Validators.required]);
		control?.setErrors({ required: true });
	}

	private getFormValuesToOfferDto(): OfferDto {
		const rawFormValue = this.createOfferForm.getRawValue();
		const benefitIdsArray = Array.isArray(rawFormValue.benefitIds)
			? rawFormValue.benefitIds
			: rawFormValue.benefitIds
				? [rawFormValue.benefitIds]
				: [];

		const { frequencyOfUse, frequencyOfUseValue, timeSlots, timeTo, timeFrom, ...formValueWithoutExcluded } =
			this.createOfferForm.value;

		const offerToEdit = this.data?.offerToReapply ?? this.data?.offerToEdit ?? this.data?.offerToReactivate;
		const createBenefitFormData: OfferDto = {
			...formValueWithoutExcluded,
			benefitIds: benefitIdsArray,
			version: offerToEdit ? offerToEdit.version : 0,
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

	private isBenefitExpired(): boolean {
		return (
			this.selectedBenefits &&
			this.selectedBenefits.some((benefit) => benefit?.status === GenericStatusEnum.EXPIRED)
		);
	}

	private initializeFormType(): void {
		if (this.data?.offerToView || this.data?.offerToSuspend) {
			this.isViewMode = true;
			const offerToView = this.data.offerToView ?? this.data.offerToSuspend;

			if (offerToView) {
				this.setFieldsSpecificToRestrictions(offerToView.restrictionRequestDto);
				this.initViewForm(offerToView);
			}

			return;
		}

		if (this.data?.offerToEdit || this.data?.offerToReactivate || this.data?.offerToReapply) {
			const offerToEdit = this.data?.offerToEdit ?? this.data?.offerToReactivate ?? this.data?.offerToReapply;
			this.getIsDiscountCodeClaimedForOffer(offerToEdit);
			return;
		}

		this.initForm();
	}

	private mapOfferDto(): OfferDto {
		const offerDto = this.getFormValuesToOfferDto();

		const restrictions = this.mapRestrictionsValues();

		if (restrictions) {
			offerDto.restrictionRequestDto = restrictions;
		}

		return offerDto;
	}

	private mapRestrictionsValues(): RestrictionsDto | undefined {
		const restrictions = new RestrictionsDto();

		this.mapTimeRestrictions(this.createOfferForm.controls, restrictions);

		const frequencyOfUseValue = this.createOfferForm.get('frequencyOfUseValue')?.value;

		if (frequencyOfUseValue) {
			restrictions[RestrictionFormFields.frequencyOfUse] = frequencyOfUseValue;
		}

		return Object.keys(restrictions).length > 0 ? restrictions : undefined;
	}

	private getIsDiscountCodeClaimedForOffer(offerToEdit: OfferInformationDto | undefined): void {
		const offerId = offerToEdit?.id;

		if (!offerId || !offerToEdit) {
			return;
		}

		this.discountCodeService.isDiscountCodeClaimedForOffer(offerId).subscribe((isClaimed) => {
			this.isOfferClaimed = isClaimed;
			this.isViewMode = false;
			this.isEditMode = true;
			this.isReactivating = !!this.data?.offerToReactivate;
			this.isReapplyMode = !!this.data?.offerToReapply;
			this.setFieldsSpecificToRestrictions(offerToEdit.restrictionRequestDto);
			this.initEditForm(offerToEdit);
		});
	}

	private createDeleteDialogConfig(): MatDialogConfig {
		const data = new WarningDialogData();

		const modal = new ModalData(
			'offer.delete.titleSingular',
			'',
			'offer.delete.descriptionSingularWithoutName',
			'general.button.cancel',
			'general.button.delete',
			false,
			'danger',
			'danger',
			'',
			data,
		);

		return { ...CustomDialogConfigUtil.createMessageModal(modal), width: '400px' };
	}

	private cleanAmountFieldIfNeeded(offerDto: OfferDto): void {
		if (this.selectedOfferTypeId !== OfferTypeEnum.membershipFee) {
			offerDto.amount = undefined;
		}
	}
}
