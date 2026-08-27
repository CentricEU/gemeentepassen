import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	BenefitDto,
	BenefitService,
	GenericStatusEnum,
	OfferDto,
	OfferInformationDto,
	RestrictionsDto,
} from '@frontend/common';
import { CustomDialogComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
import { CentricToastrModule, ToastrService } from '@windmill/ng-windmill/toastr';
import DOMPurify from 'dompurify';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { CreateOfferFormFields } from '../../enums/create-offer-form-field.enum';
import { OfferTypeEnum } from '../../enums/offer-type.enum';
import { RestrictionFormFields } from '../../enums/restriction.enum';
import { OfferType } from '../../models/offer-type.model';
import { OfferTypeVisibility } from '../../models/offer-type-visibility.model';
import { DiscountCodeService } from '../../services/discount-code/discount-code.service';
import { OfferService } from '../../services/offer-service/offer.service';
import { CreateOfferComponent } from './create-offer.component';

jest.mock('dompurify', () => ({
	default: {
		sanitize: jest.fn((value: any) => value),
	},
}));

describe('CreateOfferComponent', () => {
	let component: CreateOfferComponent;

	let fixture: ComponentFixture<CreateOfferComponent>;
	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };

	let offerServiceMock: any;
	let discountServiceMock: any;
	let translateService: TranslateService;
	let toastrService: ToastrService;
	let dialogService: DialogService;
	let formBuilder: FormBuilder;
	let benefitServiceMock: any;

	const offerToReactivate: OfferDto = {
		id: '29',
		title: 'title',
		description: 'description',
		amount: 12,
		citizenOfferType: 'CITIZEN_WITH_PASS',
		offerTypeId: 1,
		version: 1,
		startDate: new Date('2023-01-01'),
		expirationDate: new Date('2030-01-01'),
		benefits: [
			new BenefitDto(
				'Benefit Name 1',
				'Benefit Description',
				new Date('2023-01-01'),
				new Date('2023-12-31'),
				[],
				10,
				'EXPIRED',
			),
		],
	};

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		const dialogServiceMock = {
			message: jest.fn(),
			alert: jest.fn(),
		};

		(DOMPurify.sanitize as jest.Mock).mockImplementation((value: any) => value);

		offerServiceMock = {
			createOffer: jest.fn().mockReturnValue(of({})),
			getOfferTypes: jest.fn().mockReturnValue(of({})),
			getFullOffer: jest.fn().mockReturnValue(of({ offerToReactivate })),
			reactivateOffer: jest.fn().mockReturnValue(of({})),
			editOffer: jest.fn().mockReturnValue(of({})),
			suspendOffer: jest.fn().mockReturnValue(of({})),
		};

		discountServiceMock = {
			isDiscountCodeClaimedForOffer: jest.fn(),
		};

		benefitServiceMock = {
			getAllBenefits: jest.fn().mockReturnValue(of([])),
		};

		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			declarations: [CreateOfferComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				CentricToastrModule.forRoot(),
				HttpClientModule,
				AppModule,
			],
			providers: [
				FormBuilder,
				ToastrService,
				TranslateService,
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: OfferService, useValue: offerServiceMock },
				{ provide: DiscountCodeService, useValue: discountServiceMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: BenefitService, useValue: benefitServiceMock },
				{ provide: MAT_DIALOG_DATA, useValue: null },
			],
		}).compileComponents();
	});

	function setup(matDialogDataValue?: any): any {
		TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: matDialogDataValue });
		fixture = TestBed.createComponent(CreateOfferComponent);
		const component = fixture.componentInstance;
		translateService = TestBed.inject(TranslateService);
		toastrService = TestBed.inject(ToastrService);
		dialogService = TestBed.inject(DialogService);
		formBuilder = TestBed.inject(FormBuilder);
		fixture.detectChanges();
		return component;
	}

	it('should suspend offer, show toast and close dialog', () => {
		fixture = TestBed.createComponent(CreateOfferComponent);
		component = fixture.componentInstance;

		component.data = {
			offerToSuspend: { id: '29' },
		} as any;

		const toastSpy = jest.spyOn(component['toastrService'], 'success');
		const translateSpy = jest.spyOn(component['translateService'], 'instant').mockReturnValue('Offer suspended');
		const closeSpy = jest.spyOn(component, 'close');

		component.suspendOffer();

		expect(offerServiceMock.suspendOffer).toHaveBeenCalledWith('29');
		expect(translateSpy).toHaveBeenCalledWith('offer.offerSuspendedText');
		expect(toastSpy).toHaveBeenCalledWith('Offer suspended', '', { toastBackground: 'toast-light' });
		expect(closeSpy).toHaveBeenCalledWith(true);
	});

	it('should not call suspendOffer if no offerId is provided', () => {
		fixture = TestBed.createComponent(CreateOfferComponent);
		component = fixture.componentInstance;

		component.data = {
			offerToSuspend: null,
		} as any;

		component.suspendOffer();

		expect(offerServiceMock.suspendOffer).not.toHaveBeenCalled();
	});

	describe('create offer process', () => {
		beforeEach(() => {
			component = setup(null);
		});

		it('should create', () => {
			expect(component).toBeTruthy();
		});

		describe('Tests for for form validation', () => {
			it('should close the dialog when close method is called', () => {
				jest.spyOn(dialogRefStub, 'close');

				component.close();

				expect(dialogRefStub.close).toHaveBeenCalled();
			});

			it('should mark title as invalid if empty', () => {
				const titleControl = component.createOfferForm.get('title');
				titleControl?.setValue('');
				expect(titleControl?.valid).toBeFalsy();
			});

			it('should clear expiration date if start date is after expiration date', () => {
				component.createOfferForm.controls['startDate'].setValue(new Date('2023-01-01'));
				component.createOfferForm.controls['expirationDate'].setValue(new Date('2022-12-31'));
				component.onStartDateChange();
				expect(component.createOfferForm.controls['expirationDate'].value).toBe('');
			});

			it('should return false when neither control is touched', () => {
				expect(component.displayDateValidityError()).toBeFalsy();
			});

			it('should return true when one control is touched and invalid and the other is untouched', () => {
				component.createOfferForm.controls['startDate'].setValue('');
				component.createOfferForm.controls['startDate'].markAsTouched();
				expect(component.displayDateValidityError()).toBeTruthy();
			});

			it('should return true when one control is touched and invalid and the other is untouched', () => {
				component.createOfferForm.controls['expirationDate'].setValue('');
				component.createOfferForm.controls['expirationDate'].markAsTouched();
				expect(component.displayDateValidityError()).toBeTruthy();
			});

			it('should return false when expirationDate is valid and touched, startDate is untouched', () => {
				component.createOfferForm.controls['expirationDate'].setValue('2023-12-31');
				component.createOfferForm.controls['expirationDate'].markAsTouched();

				expect(component.displayDateValidityError()).toBeFalsy();
			});

			it('should return false when startDate is valid and touched, expirationDate is untouched', () => {
				component.createOfferForm.controls['startDate'].setValue('2023-01-01');
				component.createOfferForm.controls['startDate'].markAsTouched();

				expect(component.displayDateValidityError()).toBeFalsy();
			});

			it('should return true when both controls are touched and invalid', () => {
				component.createOfferForm.controls['startDate'].setValue('');
				component.createOfferForm.controls['startDate'].markAsTouched();
				component.createOfferForm.controls['startDate'].setErrors({ invalid: true });

				component.createOfferForm.controls['expirationDate'].setValue('');
				component.createOfferForm.controls['expirationDate'].markAsTouched();
				component.createOfferForm.controls['expirationDate'].setErrors({ invalid: true });

				expect(component.displayDateValidityError()).toBeTruthy();
			});

			it('should create form with expected form controls', () => {
				const form = component.createOfferForm;
				expect(form.contains('title')).toBeTruthy();
				expect(form.contains('description')).toBeTruthy();
				expect(form.contains('startDate')).toBeTruthy();
				expect(form.contains('expirationDate')).toBeTruthy();
			});

			it('should return translated validity error message for amount', () => {
				jest.spyOn(translateService, 'instant').mockReturnValue('validity error message');
				const errorMessage = component.getErrorMessageFormInputs(CreateOfferFormFields.amount);
				expect(errorMessage).toBe('validity error message');
				expect(translateService.instant).toHaveBeenCalledWith('genericFields.amount.amountFormControlRequired');
			});

			it('should return translated validity error message for description', () => {
				jest.spyOn(translateService, 'instant').mockReturnValue('validity error message');
				const errorMessage = component.getErrorMessageFormInputs(CreateOfferFormFields.description);
				expect(errorMessage).toBe('validity error message');
				expect(translateService.instant).toHaveBeenCalledWith(
					'offer.formRequired.descriptionFormControlRequired',
				);
			});

			it('should return translated validity error message for description', () => {
				jest.spyOn(translateService, 'instant').mockReturnValue('validity error message');
				const errorMessage = component.getErrorMessageFormInputs(CreateOfferFormFields.description);
				expect(errorMessage).toBe('validity error message');
				expect(translateService.instant).toHaveBeenCalledWith(
					'offer.formRequired.descriptionFormControlRequired',
				);
			});

			it('should return translated validity error message for title', () => {
				jest.spyOn(translateService, 'instant').mockReturnValue('validity error message');
				const errorMessage = component.getErrorMessageFormInputs(CreateOfferFormFields.title);
				expect(errorMessage).toBe('validity error message');
				expect(translateService.instant).toHaveBeenCalledWith('offer.formRequired.titleFormControlRequired');
			});

			it('should return translated validityFormControlRequired', () => {
				jest.spyOn(translateService, 'instant').mockReturnValue('validity error message');
				const errorMessage = component.getErrorMessageFormInputs(CreateOfferFormFields.validity);
				expect(errorMessage).toBe('validity error message');
				expect(translateService.instant).toHaveBeenCalledWith('offer.formRequired.validityFormControlRequired');
			});

			it('should return translated benefitIds error message for title', () => {
				jest.spyOn(translateService, 'instant').mockReturnValue('validity error message');
				const errorMessage = component.getErrorMessageFormInputs(CreateOfferFormFields.benefitIds);
				expect(errorMessage).toBe('validity error message');
				expect(translateService.instant).toHaveBeenCalledWith('offer.formRequired.benefitFormControlRequired');
			});

			it('should return null for an unrecognized form field', () => {
				const errorMessage = component.getErrorMessageFormInputs('unrecognizedField');
				expect(errorMessage).toBeNull();
			});
		});

		describe('Tests for isControlInvalid method', () => {
			it('should return false when the control is not touched', () => {
				const controlName = 'startDate';

				const result = component['isControlInvalid'](controlName);

				expect(result).toBe(false);
			});

			it('should return false when the control is touched but valid', () => {
				const controlName = 'startDate';
				const control = component.createOfferForm.get(controlName);
				control?.markAsTouched();
				control?.setValue(new Date('2023-01-01'));
				const result = component['isControlInvalid'](controlName);

				expect(result).toBe(false);
			});

			it('should return true when the control is touched and invalid', () => {
				const controlName = 'startDate';
				const control = component.createOfferForm.get(controlName);
				control?.markAsTouched();
				control?.setErrors({ someError: true });

				const result = component['isControlInvalid'](controlName);

				expect(result).toBe(true);
			});
		});

		describe('Tests for hideAmount method', () => {
			it.each([
				{ offerTypeId: OfferTypeEnum.bogo, expected: false },
				{ offerTypeId: OfferTypeEnum.freeEntry, expected: false },
				{ offerTypeId: OfferTypeEnum.freeProduct, expected: false },
				{ offerTypeId: OfferTypeEnum.membershipFee, expected: true },
				{ offerTypeId: OfferTypeEnum.storeCredit, expected: false },
			])('should have hideAmount set to %s when selectedOfferTypeId is %s', ({ offerTypeId, expected }) => {
				component.selectedOfferTypeId = offerTypeId;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					expect(component.hideAmount).toEqual(expected);
				});
			});
		});

		describe('Tests for shouldDisplayTypeHint method', () => {
			it.each([
				{ offerTypeId: OfferTypeEnum.bogo, expected: false },
				{ offerTypeId: OfferTypeEnum.freeEntry, expected: true },
				{ offerTypeId: OfferTypeEnum.freeProduct, expected: true },
				{ offerTypeId: OfferTypeEnum.membershipFee, expected: false },
				{ offerTypeId: OfferTypeEnum.storeCredit, expected: false },
			])('should return $expected when selectedOfferTypeId is $offerTypeId', ({ offerTypeId, expected }) => {
				component.selectedOfferTypeId = offerTypeId;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					expect(component.hideAmount).toEqual(expected);
				});
			});
		});

		describe('Tests for getAmountPlaceholder method', () => {
			it('should return amountFeeMembershipPlaceholder when selectedOfferTypeId is membershipFee', () => {
				const value = OfferTypeEnum.membershipFee;
				const translation = 'translated fee';

				jest.spyOn(translateService, 'instant').mockReturnValue(translation);
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).toHaveBeenCalledWith('offer.amountFeeMembershipPlaceholder');
				expect(result).toBe(translation);
			});

			it('should return empty placeholder when selectedOfferTypeId is bogo', () => {
				const value = OfferTypeEnum.bogo;

				jest.spyOn(translateService, 'instant').mockReturnValue('translated credit');
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).not.toHaveBeenCalled();
				expect(result).toBe('');
			});

			it('should return empty placeholder when selectedOfferTypeId is freeEntry', () => {
				const value = OfferTypeEnum.freeEntry;

				jest.spyOn(translateService, 'instant').mockReturnValue('translated credit');
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).not.toHaveBeenCalled();
				expect(result).toBe('');
			});

			it('should return empty placeholder when selectedOfferTypeId is freeProduct', () => {
				const value = OfferTypeEnum.freeProduct;

				jest.spyOn(translateService, 'instant').mockReturnValue('translated credit');
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).not.toHaveBeenCalled();
				expect(result).toBe('');
			});

			it('should return empty placeholder when selectedOfferTypeId is storeCredit', () => {
				const value = OfferTypeEnum.storeCredit;

				jest.spyOn(translateService, 'instant').mockReturnValue('translated credit');
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).not.toHaveBeenCalled();
				expect(result).toBe('');
			});
		});

		describe('Tests for showPrefix method', () => {
			it('should return "€ " when selectedOfferTypeId is membershipFee', () => {
				component.selectedOfferTypeId = OfferTypeEnum.membershipFee;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.showPrefix;
					expect(result).toBe('€ ');
				});
			});

			it('should return an empty string for other offer types', () => {
				component.selectedOfferTypeId = OfferTypeEnum.bogo;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.showPrefix;
					expect(result).toBe('');
				});
			});

			it('should return an empty string for null', () => {
				component.selectedOfferTypeId = null;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.showPrefix;
					expect(result).toBe('');
				});
			});

			it('should return an empty string for 999', () => {
				component.selectedOfferTypeId = 999;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.showPrefix;
					expect(result).toBe('');
				});
			});
		});

		describe('Tests for showSuffix method', () => {
			it('should return an empty string for other offer types', () => {
				component.selectedOfferTypeId = OfferTypeEnum.bogo;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.showPrefix;
					expect(result).toBe('');
				});
			});

			describe('Tests for showDecimal method', () => {
				it('should return "separator.2" when selectedOfferTypeId is membershipFee', () => {
					component.selectedOfferTypeId = OfferTypeEnum.membershipFee;

					fixture.whenStable().then(() => {
						fixture.detectChanges();
						const result = component.showPrefix;
						expect(result).toBe('separator.2');
					});
				});
			});

			describe('Tests for onValueChangeOnOfferTypes method', () => {
				it('should update selectedOfferTypeId, reset form values, and enable/disable form controls correctly for membershipFee offer type', () => {
					component.selectedOfferTypeId = OfferTypeEnum.bogo;

					component.onValueChangeOnOfferTypes(OfferTypeEnum.membershipFee);

					expect(component.selectedOfferTypeId).toBe(OfferTypeEnum.membershipFee);

					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.value).toBe('');

					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.enabled).toBe(true);
					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.disabled).toBe(false);
				});

				it('should handle default case with optional parameter with undefined', () => {
					const event = undefined;

					component.onValueChangeOnOfferTypes(event);

					expect(component.selectedOfferTypeId).toBe(undefined);

					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.value).toBe('');

					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.enabled).toBe(false);
					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.disabled).toBe(true);
				});

				it('should handle default case with optional parameter with null', () => {
					const event = null;

					component.onValueChangeOnOfferTypes(event);

					expect(component.selectedOfferTypeId).toBe(null);

					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.value).toBe('');

					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.enabled).toBe(false);
					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.disabled).toBe(true);
				});
			});

			describe('Tests for onValueChangeOnCheckedBenefits method', () => {
				it('should add item to selectedBenefits if not already present', () => {
					component.selectedBenefits = [{ id: 'benefit1' }] as BenefitDto[];

					component.onValueChangeOnCheckedBenefits(['benefit3']);

					expect(component.selectedBenefits).toEqual([{ id: 'benefit3' }]);
				});
			});

			describe('Tests for resetFormValue method', () => {
				it('should reset form control value to the default value if no value is provided', () => {
					component.createOfferForm.get(CreateOfferFormFields.amount)?.setValue('initialValue');

					component['resetFormValue'](CreateOfferFormFields.amount);

					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.value).toBe(null);
				});
			});

			describe('Tests for onSearchOnOfferTypes method', () => {
				it('should filter dropdownSource based on the provided search event when event is not empty', () => {
					component.dropdownSource = [
						{ offerTypeId: 0, offerTypeLabel: 'Type1', visible: true },
						{ offerTypeId: 1, offerTypeLabel: 'Type2', visible: true },
						{ offerTypeId: 2, offerTypeLabel: 'Type3', visible: true },
					];

					component.onSearchOnOfferTypes('Type2');

					expect(component.updatedSource).toEqual([
						{ offerTypeId: 1, offerTypeLabel: 'Type2', visible: true },
					]);
				});

				it('should include all visible items from dropdownSource when event is empty', () => {
					component.dropdownSource = [
						{ offerTypeId: 0, offerTypeLabel: 'Type1', visible: true },
						{ offerTypeId: 1, offerTypeLabel: 'Type2', visible: true },
						{ offerTypeId: 2, offerTypeLabel: 'Type3', visible: false },
					];

					component.onSearchOnOfferTypes('');

					expect(component.updatedSource).toEqual([
						{ offerTypeId: 0, offerTypeLabel: 'Type1', visible: true },
						{ offerTypeId: 1, offerTypeLabel: 'Type2', visible: true },
					]);
				});

				it('should filter dropdownSource based on the provided search event (case-insensitive)', () => {
					component.dropdownSource = [
						{ offerTypeId: 0, offerTypeLabel: 'Type1', visible: true },
						{ offerTypeId: 1, offerTypeLabel: 'Type2', visible: true },
						{ offerTypeId: 2, offerTypeLabel: 'Type3', visible: true },
					];

					component.onSearchOnOfferTypes('type2');

					expect(component.updatedSource).toEqual([
						{ offerTypeId: 1, offerTypeLabel: 'Type2', visible: true },
					]);
				});
			});

			describe('Tests for onSearchOnBenefits method', () => {
				it('should include all available benefits when search event is empty', () => {
					component.availableBenefits = [
						{
							name: 'Benefit 1',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 2',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 3',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
					];

					component.onSearchOnBenefits('');

					expect(component.updatedBenefits).toEqual([
						{
							name: 'Benefit 1',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 2',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 3',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
					]);
				});

				it('should filter available benefits based on the provided search event', () => {
					component.availableBenefits = [
						{
							name: 'Benefit 1',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 2',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 3',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
					];

					component.onSearchOnBenefits('Benefit 2');

					expect(component.updatedBenefits).toEqual([
						{
							name: 'Benefit 2',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
					]);
				});

				it('should filter available benefits based on the provided search event (case-insensitive)', () => {
					component.availableBenefits = [
						{
							name: 'Benefit 1',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 2',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 3',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
					];

					component.onSearchOnBenefits('benefit 2');

					expect(component.updatedBenefits).toEqual([
						{
							name: 'Benefit 2',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
					]);
				});
			});

			describe('Tests for getFormValuesToOfferDto method', () => {
				it('should transform form values to OfferDto with CITIZEN citizenOfferType', () => {
					component.createOfferForm.setValue({
						title: 'Title',
						description: 'Description',
						amount: '123',
						citizenOfferType: 'offer.citizenWithPass',
						offerTypeId: 1,
						startDate: new Date('2023-01-01'),
						expirationDate: new Date('2022-12-31'),
						frequencyOfUse: 'Frequency of use',
						frequencyOfUseValue: 'Frequency of use value',
						timeSlots: 'Time slots',
						timeTo: '',
						timeFrom: '',
						benefitIds: ['id'],
					});

					const result: OfferDto = component['getFormValuesToOfferDto']();

					expect(result.citizenOfferType).toBe('CITIZEN_WITH_PASS');
				});

				it('should transform form values to OfferDto with CITIZEN_WITH_PASS citizenOfferType', () => {
					component.createOfferForm.setValue({
						title: 'Title',
						description: 'Description',
						amount: '123',
						citizenOfferType: 'offer.citizenWithPass',
						offerTypeId: 1,
						startDate: new Date('2023-01-01'),
						expirationDate: new Date('2022-12-31'),
						frequencyOfUse: 'Frequency of use',
						frequencyOfUseValue: 'Frequency of use value',
						timeSlots: 'Time slots',
						timeTo: '',
						timeFrom: '',
						benefitIds: ['id'],
					});

					const result: OfferDto = component['getFormValuesToOfferDto']();

					expect(result.citizenOfferType).toBe('CITIZEN_WITH_PASS');
				});
			});

			describe('Tests for initForm method', () => {
				it('should initialize the form with default values and validators', () => {
					component['initForm']();

					expect(component.createOfferForm.contains('title')).toBe(true);
					expect(component.createOfferForm.contains('description')).toBe(true);
					expect(component.createOfferForm.contains('citizenOfferType')).toBe(true);
					expect(component.createOfferForm.contains('startDate')).toBe(true);
					expect(component.createOfferForm.contains('expirationDate')).toBe(true);

					expect(component.createOfferForm.get('title')?.value).toBe('');
					expect(component.createOfferForm.get('description')?.value).toBe('');
					expect(component.createOfferForm.get('citizenOfferType')?.value).toBe('offer.citizenWithPass');
					expect(component.createOfferForm.get('startDate')?.value).toBe('');
					expect(component.createOfferForm.get('expirationDate')?.value).toBe('');
				});
			});

			describe('Tests for initializeBenefits method', () => {
				it('should initialize availableBenefits and updatedBenefits with the provided data', () => {
					const testData: BenefitDto[] = [
						{
							name: 'Benefit 1',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 2',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
						{
							name: 'Benefit 3',
							description: 'Benefit Description',
							startDate: new Date('2023-01-01'),
							expirationDate: new Date('2023-12-31'),
							citizenGroupIds: [],
							amount: 10,
						},
					];

					component['initializeBenefits'](testData);

					expect(component.availableBenefits).toEqual(testData);
					expect(component.updatedBenefits).toEqual(testData);
				});
			});

			describe('Tests for initializeOfferTypes method', () => {
				it('should initialize dropdownSource and updatedSource with the provided data', () => {
					const testData: OfferType[] = [
						{ offerTypeId: 1, offerTypeLabel: 'Type1' },
						{ offerTypeId: 2, offerTypeLabel: 'Type2' },
						{ offerTypeId: 3, offerTypeLabel: 'Type3' },
					];

					component['initializeOfferTypes'](testData);

					expect(component.dropdownSource).toEqual([
						{ offerTypeId: 1, offerTypeLabel: 'Type1', visible: true },
						{ offerTypeId: 2, offerTypeLabel: 'Type2', visible: true },
						{ offerTypeId: 3, offerTypeLabel: 'Type3', visible: true },
					]);

					expect(component.updatedSource).toEqual([
						{ offerTypeId: 1, offerTypeLabel: 'Type1', visible: true },
						{ offerTypeId: 2, offerTypeLabel: 'Type2', visible: true },
						{ offerTypeId: 3, offerTypeLabel: 'Type3', visible: true },
					]);
				});

				describe('Tests for getOfferTypeAndBenefits method', () => {
					it('should call initializeOfferTypes and initializeBenefits with correct data', fakeAsync(() => {
						const offerTypesData: OfferTypeVisibility[] = [
							{ offerTypeId: 1, offerTypeLabel: 'Type1', visible: true },
							{ offerTypeId: 2, offerTypeLabel: 'Type2', visible: true },
						];

						const benefitsData: BenefitDto[] = [
							{
								name: 'Benefit 1',
								description: 'Benefit Description',
								startDate: new Date('2023-01-01'),
								expirationDate: new Date('2023-12-31'),
								citizenGroupIds: [],
								amount: 10,
							},
							{
								name: 'Benefit 2',
								description: 'Benefit Description',
								startDate: new Date('2023-01-01'),
								expirationDate: new Date('2023-12-31'),
								citizenGroupIds: [],
								amount: 10,
							},
						];

						jest.spyOn(component as any, 'getRequestsObservable').mockReturnValue(
							of([offerTypesData, benefitsData]),
						);

						const spyInitializeOfferTypes = jest.spyOn(component as any, 'initializeOfferTypes');
						const spyInitializeBenefits = jest.spyOn(component as any, 'initializeBenefits');

						(component as any).getOfferTypeAndBenefits();

						tick();

						expect(spyInitializeOfferTypes).toHaveBeenCalledWith(offerTypesData);
						expect(spyInitializeBenefits).toHaveBeenCalledWith(benefitsData);
					}));

					it('should call initializeOfferTypes and initializeBenefits with empty  data', fakeAsync(() => {
						const offerTypesData = null;

						const benefitsData = null;

						jest.spyOn(component as any, 'getRequestsObservable').mockReturnValue(
							of([offerTypesData, benefitsData]),
						);

						const spyInitializeOfferTypes = jest.spyOn(component as any, 'initializeOfferTypes');
						const spyInitializeBenefits = jest.spyOn(component as any, 'initializeBenefits');

						(component as any).getOfferTypeAndBenefits();

						tick();

						expect(spyInitializeOfferTypes).toHaveBeenCalledWith(offerTypesData);
						expect(spyInitializeBenefits).toHaveBeenCalledWith(benefitsData);
					}));

					it('should handle null data during initialization', fakeAsync(() => {
						jest.spyOn(component as any, 'initializeOfferTypes');
						jest.spyOn(component as any, 'initializeBenefits');

						jest.spyOn(component as any, 'getRequestsObservable').mockReturnValue(of(null));

						component['getOfferTypeAndBenefits']();
						tick();

						expect(component['initializeOfferTypes']).not.toHaveBeenCalled();
						expect(component['initializeBenefits']).not.toHaveBeenCalled();
					}));
				});
			});
		});

		describe('Tests for maxLength method', () => {
			it('should return Number.MAX_SAFE_INTEGER', () => {
				component.selectedOfferTypeId = OfferTypeEnum.membershipFee;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.maxLength;
					expect(result).toBe(Number.MAX_SAFE_INTEGER);
				});
			});
		});

		it('should reset the form control value', () => {
			const controlName = 'exampleControl';
			const initialValue = 'initialValue';
			const updatedValue = 'updatedValue';

			const formGroup = new FormGroup({ exampleControl: new FormControl(initialValue) });

			component.createOfferForm = formGroup;

			component['resetFormValue'](controlName, updatedValue);

			expect(formGroup.get(controlName)?.value).toEqual(updatedValue);
		});

		it('should not throw an error if control name does not exist', () => {
			const nonExistentControlName = 'nonExistentControl';
			const updatedValue = 'updatedValue';

			const formGroup = new FormGroup({ exampleControl: new FormControl('initialValue') });

			component.createOfferForm = formGroup;

			expect(() => {
				component['resetFormValue'](nonExistentControlName, updatedValue);
			}).not.toThrow();

			expect(formGroup.get('exampleControl')?.value).toEqual('initialValue');
		});

		it('should return "€ " for showPrefix when selectedOfferTypeId is membershipFee', () => {
			component.selectedOfferTypeId = OfferTypeEnum.membershipFee;
			expect(component.showPrefix).toBe('€ ');
		});

		it('should return an empty string for showPrefix when selectedOfferTypeId is freeEntry', () => {
			component.selectedOfferTypeId = OfferTypeEnum.freeEntry;
			expect(component.showPrefix).toBe('');
		});

		it('should return an empty string for showPrefix when selectedOfferTypeId is bogo', () => {
			component.selectedOfferTypeId = OfferTypeEnum.bogo;
			expect(component.showPrefix).toBe('');
		});

		it('should return an empty string for showPrefix when selectedOfferTypeId is storeCreditt', () => {
			component.selectedOfferTypeId = OfferTypeEnum.storeCredit;
			expect(component.showPrefix).toBe('');
		});

		it('should return "separator.2" for showDecimal', () => {
			component.selectedOfferTypeId = OfferTypeEnum.membershipFee;
			expect(component.showDecimal).toBe('separator.2');
		});

		it('should return 14 for maxLength when selectedOfferTypeId is credit', () => {
			component.selectedOfferTypeId = OfferTypeEnum.membershipFee;
			expect(component.maxLength).toBe(Number.MAX_SAFE_INTEGER);
		});

		it('should return Number.MAX_SAFE_INTEGER for maxLength when selectedOfferTypeId is not credit', () => {
			component.selectedOfferTypeId = OfferTypeEnum.bogo;
			expect(component.maxLength).toBe(Number.MAX_SAFE_INTEGER);
		});

		describe('Tests for displayPopupForOfferWithBenefits method', () => {
			it('should display popup for offer with benefits', () => {
				jest.spyOn(component, 'close').mockImplementation(() => undefined);
				jest.spyOn(translateService, 'instant');
				jest.spyOn(toastrService, 'success');
				jest.spyOn(dialogService, 'message');

				component.createOfferForm.setValue({
					title: 'Title',
					description: 'Description',
					amount: '123',
					citizenOfferType: 'offer.citizenWithPass',
					offerTypeId: OfferTypeEnum.membershipFee,
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2022-12-31'),
					frequencyOfUse: 'Frequency of use',
					frequencyOfUseValue: 'Frequency of use value',
					timeSlots: 'Time slots',
					timeTo: '',
					timeFrom: '',
					benefitIds: ['id'],
				});

				component.saveOffer();
				expect(dialogService['message']).toHaveBeenCalled();
			});
		});

		it.each([
			['Initial Title', true],
			['', false],
			[null, false],
		])('should set required validation error to form field when value is "%s"', (value, expected) => {
			const component = fixture.componentInstance;
			const formBuilder = TestBed.inject(FormBuilder);
			component.createOfferForm = formBuilder.group({
				title: [value],
			});

			component['setErrorToFormField']('title');

			const titleControl = component.createOfferForm.get('title');
			expect(titleControl?.hasError('required')).toBe(expected);
		});

		it.each([
			['startDate', true, true, true],
			['startDate', true, false, false],
			['startDate', false, true, true],
			['startDate', false, false, false],
		])(
			'should clear restriction validators and errors for field "%s"',
			(field, resetValue, valueControlExists, expectValueReset) => {
				const component = fixture.componentInstance;
				const formBuilder = TestBed.inject(FormBuilder);
				component.createOfferForm = formBuilder.group({
					[field]: ['Initial Value'],
					[`${field}Value`]: [resetValue ? 'Some Value' : null],
				});

				component['clearRestrictionValidatorsAndErrors'](component.createOfferForm, field, resetValue);

				const control = component.createOfferForm.get(field);

				expect(control?.validator).toBeFalsy();
				expect(control?.errors).toBeNull();

				if (expectValueReset && valueControlExists) {
					control?.setValue(null);
					control?.updateValueAndValidity();

					expect(control?.value).toBeNull();
				}
			},
		);

		it.each([
			['nonExistentField', true, true],
			['nonExistentField', true, false],
			['nonExistentField', false, true],
			['nonExistentField', false, false],
		])('should handle case where control "%s" does not exist', (field, resetValue) => {
			const component = fixture.componentInstance;
			const formBuilder = TestBed.inject(FormBuilder);
			component.createOfferForm = formBuilder.group({});

			component['clearRestrictionValidatorsAndErrors'](component.createOfferForm, field, resetValue);

			expect(component.createOfferForm).toBeTruthy();
		});

		test.each([
			[{}, null],
			[{ someField: 'value' }, null],
			[{}, {}],
		])('should call createOffer with correct parameters', (offerDto, restrictions) => {
			jest.spyOn(component as any, 'getFormValuesToOfferDto').mockReturnValue(offerDto);
			jest.spyOn(component as any, 'mapRestrictionsValues').mockReturnValue(restrictions);

			component.saveOffer();

			if (restrictions) {
				expect(offerServiceMock.createOffer).toHaveBeenCalledWith({
					...offerDto,
					restrictionRequestDto: restrictions,
				});
			} else {
				expect(offerServiceMock.createOffer).toHaveBeenCalledWith(offerDto);
			}
		});

		it('should call getTimeSlot with correct arguments', () => {
			const spy = jest.spyOn(component as any, 'getTimeSlot');
			const time = '10:00:00';
			(component as any).getTimeSlot(time);
			expect(spy).toHaveBeenCalledWith(time);
		});

		it('should return null when time is undefined', () => {
			const result = (component as any).getTimeSlot(undefined);
			expect(result).toBeNull();
		});

		it('should return a formatted date string when time is provided', () => {
			const time = '15:30:00';
			const result = (component as any).getTimeSlot(time);
			const expectedDate = new Date(`1970-01-01T${time}`).toISOString();
			expect(result.toISOString()).toBe(expectedDate);
		});
	});

	describe('reactivate offer process', () => {
		beforeEach(() => {
			component = setup({ offerToReactivate: '29' });
		});

		describe('reactivation alert', () => {
			it('should not display alert when an offer is not being reactivated', () => {
				jest.spyOn(component, 'shouldDisplayReactivationAlert');
				component.isReactivating = false;

				component.shouldDisplayReactivationAlert();

				expect(component.shouldDisplayReactivationAlert).toHaveReturnedWith(false);
			});

			it('should display alert when an offer is being reactivated and it has not been dismissed yet', () => {
				jest.spyOn(component, 'shouldDisplayReactivationAlert');
				component.alertDismissed = false;
				component.shouldDisplayReactivationAlert();

				expect(component.shouldDisplayReactivationAlert).toHaveReturnedWith(false);
			});

			it('should not display alert when an offer is being reactivated but it has already been dismissed', () => {
				jest.spyOn(component, 'shouldDisplayReactivationAlert');
				component.alertDismissed = true;
				component.shouldDisplayReactivationAlert();

				expect(component.shouldDisplayReactivationAlert).toHaveReturnedWith(false);
			});
		});

		it('should mark the form as invalid if it has not been created yet', () => {
			jest.spyOn(component as any, 'isControlInvalid');
			component.createOfferForm = null as any;

			component['isControlInvalid']('test');

			expect(component['isControlInvalid']).toHaveReturnedWith(true);
		});
	});

	describe('toUtcTime', () => {
		it('should convert a given date to UTC time', () => {
			const localDate = new Date('2024-07-29T10:00:00');
			const utcDate = component['toUtcTime'](localDate);

			const expectedUtcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

			expect(utcDate.getTime()).toBe(expectedUtcDate.getTime());
		});
	});

	describe('onTypeChange method', () => {
		beforeEach(() => {
			component = setup(null);
		});

		it('should reset the offerTypeId form value', () => {
			jest.spyOn(component as any, 'resetFormValue');

			component.onTypeChange();

			expect(component['resetFormValue']).toHaveBeenCalledWith(CreateOfferFormFields.offerTypeId);
		});

		it('should reset the amount form value to an empty string', () => {
			jest.spyOn(component as any, 'resetFormValue');

			component.onTypeChange();

			expect(component['resetFormValue']).toHaveBeenCalledWith(CreateOfferFormFields.amount, '');
		});

		it('should set selectedOfferTypeId to null', () => {
			component.selectedOfferTypeId = OfferTypeEnum.bogo;
			component.onTypeChange();

			expect(component.selectedOfferTypeId).toBeNull();
		});

		it('should update the updatedSource with visible dropdown items', () => {
			component.dropdownSource = [
				{ offerTypeId: 1, offerTypeLabel: 'Type1', visible: true },
				{ offerTypeId: 2, offerTypeLabel: 'Type2', visible: false },
				{ offerTypeId: 3, offerTypeLabel: 'Type3', visible: true },
			];

			component.onTypeChange();

			expect(component.updatedSource).toEqual([
				{ offerTypeId: 1, offerTypeLabel: 'Type1', visible: true },
				{ offerTypeId: 3, offerTypeLabel: 'Type3', visible: true },
			]);
		});
	});

	describe('onRestrictionValueChanges', () => {
		let component: CreateOfferComponent;
		let fixture: ComponentFixture<CreateOfferComponent>;

		beforeEach(() => {
			component = setup(null);
		});

		describe('Tests for getOfferTypeAndBenefits method', () => {
			it('should call initializeOfferTypes and initializeBenefits with correct data', fakeAsync(() => {
				const mockOfferTypes: OfferType[] = [
					{ offerTypeId: 1, offerTypeLabel: 'Type1' },
					{ offerTypeId: 2, offerTypeLabel: 'Type2' },
				];
				const mockBenefits: BenefitDto[] = [
					{
						name: 'Benefit 1',
						description: 'Benefit Description',
						startDate: new Date('2023-01-01'),
						expirationDate: new Date('2023-12-31'),
						citizenGroupIds: [],
						amount: 10,
					},
				];

				offerServiceMock.getOfferTypes.mockReturnValue(of(mockOfferTypes));
				benefitServiceMock.getAllBenefits.mockReturnValue(of(mockBenefits));

				jest.spyOn(component as any, 'initializeOfferTypes');
				jest.spyOn(component as any, 'initializeBenefits');

				component['getOfferTypeAndBenefits']();

				tick();

				expect(offerServiceMock.getOfferTypes).toHaveBeenCalled();
				expect(benefitServiceMock.getAllBenefits).toHaveBeenCalled();
				expect(component['initializeOfferTypes']).toHaveBeenCalledWith(mockOfferTypes);
				expect(component['initializeBenefits']).toHaveBeenCalledWith(mockBenefits);
			}));

			it('should call initializeOfferTypes and initializeBenefits with empty data', fakeAsync(() => {
				const mockOfferTypes: OfferType[] = [];
				const mockBenefits: BenefitDto[] = [];

				offerServiceMock.getOfferTypes.mockReturnValue(of(mockOfferTypes));

				benefitServiceMock.getAllBenefits.mockReturnValue(of(mockBenefits));

				jest.spyOn(component as any, 'initializeOfferTypes');
				jest.spyOn(component as any, 'initializeBenefits');

				component['getOfferTypeAndBenefits']();

				tick();

				expect(component['initializeOfferTypes']).toHaveBeenCalledWith(mockOfferTypes);
				expect(component['initializeBenefits']).toHaveBeenCalledWith(mockBenefits);
			}));

			describe('confirmDialog', () => {
				it('should call saveOffer when isReactivating is false', () => {
					component.createOfferForm.setValue({
						title: 'Title',
						description: 'Description',
						amount: '123',
						citizenOfferType: 'offer.citizenWithPass',
						offerTypeId: OfferTypeEnum.bogo,
						startDate: new Date('2023-01-01'),
						expirationDate: new Date('2022-12-31'),
						frequencyOfUse: 'Frequency of use',
						frequencyOfUseValue: 'Frequency of use value',
						timeSlots: 'Time slots',
						timeTo: '',
						timeFrom: '',
						benefitIds: ['id'],
					});
					component.isReactivating = false;
					const saveOfferSpy = jest.spyOn(component, 'saveOffer');
					component.confirmDialog();
					expect(saveOfferSpy).toHaveBeenCalled();
				});

				it('should call editOffer when isEditMode is true and isReactivating is false', () => {
					component.isReactivating = false;
					component.isViewMode = false;
					component.isEditMode = true;

					component.createOfferForm = component['formBuilder'].group({
						startDate: [new Date()],
						expirationDate: [new Date()],
						amount: [50],
						offerTypeId: [1],
						benefitIds: [[]],
					});

					const editOfferSpy = jest.spyOn(component, 'editOffer');
					component.confirmDialog();
					expect(editOfferSpy).toHaveBeenCalled();
				});
			});

			describe('getExpirationDateMax', () => {
				it('should return null if no selected benefit', () => {
					component.availableBenefits = [];
					component.selectedBenefits = [{ id: 'undefined' }] as BenefitDto[];
					const result = component.getExpirationDateMax();
					expect(result).toBeNull();
				});

				it('should return expirationDate of selected benefit when minusOneDay is false', () => {
					const expirationDate = new Date('2030-01-01');
					component.availableBenefits = [
						{
							id: 'benefit1',
							expirationDate,
							startDate: new Date(),
							name: '',
							description: '',
							citizenGroupIds: [],
							amount: 0,
						},
					];
					component.selectedBenefits = [{ id: 'benefit1' }] as BenefitDto[];
					const result = component.getExpirationDateMax(false);
					expect(result).toEqual(expirationDate);
				});

				it('should return expirationDate minus one day when minusOneDay is true', () => {
					const expirationDate = new Date('2030-01-01T00:00:00.000Z');
					component.availableBenefits = [
						{
							id: 'benefit1',
							expirationDate,
							startDate: new Date(),
							name: '',
							description: '',
							citizenGroupIds: [],
							amount: 0,
						},
					];
					component.selectedBenefits = [{ id: 'benefit1' }] as BenefitDto[];
					const result = component.getExpirationDateMax(true);
					const expectedDate = new Date(expirationDate);
					expectedDate.setDate(expectedDate.getDate() - 1);
					expect(result).toEqual(expectedDate);
				});

				describe('getInitDateMin', () => {
					it('should return null if no selected benefit', () => {
						component.availableBenefits = [];
						component.selectedBenefits = [{ id: 'undefined' }] as BenefitDto[];
						const result = component.getInitDateMin();
						expect(result).toBeNull();
					});

					it('should return startDate of selected benefit', () => {
						const startDate = new Date('2025-01-01');
						component.availableBenefits = [
							{
								id: 'benefit1',
								expirationDate: new Date('2030-01-01'),
								startDate,
								name: '',
								description: '',
								citizenGroupIds: [],
								amount: 0,
							},
						];
						component.selectedBenefits = [{ id: 'benefit1' }] as BenefitDto[];
						const result = component.getInitDateMin();
						expect(result).toEqual(startDate);
					});
				});

				describe('setupAmountValidatorsOnChange', () => {
					describe('benefitAmount getter', () => {
						it('should return the amount of the selected benefit as a number', () => {
							component.availableBenefits = [
								{ id: '1', name: 'Benefit 1', amount: 42 } as BenefitDto,
								{ id: '2', name: 'Benefit 2', amount: 99 } as BenefitDto,
							];
							component.selectedBenefits = [{ id: '2' }] as BenefitDto[];
							expect(component.benefitAmount).toBe(99);
						});

						it('should return null if no benefit is selected', () => {
							component.availableBenefits = [{ id: '1', name: 'Benefit 1', amount: 42 } as BenefitDto];
							component.selectedBenefits = undefined as any;
							expect(component.benefitAmount).toBe(null);
						});

						it('should return null if selectedBenefit does not match any available benefit', () => {
							component.availableBenefits = [{ id: '1', name: 'Benefit 1', amount: 42 } as BenefitDto];
							component.selectedBenefits = [{ id: 'non-existent-id' }] as BenefitDto[];
							expect(component.benefitAmount).toBe(null);
						});
					});
				});
			});
		});
	});

	describe('Tests for alertMessage getter', () => {
		it('should return offer.reactivateAlertExpiredBenefit when benefit is expired', () => {
			component = setup(null);
			component.selectedBenefits = [
				{
					id: 'benefit1',
					name: 'Expired Benefit',
					description: 'Description',
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2023-12-31'),
					citizenGroupIds: [],
					amount: 10,
					status: GenericStatusEnum.EXPIRED,
				},
			] as BenefitDto[];

			expect(component.alertMessage).toBe('offer.reactivateAlertExpiredBenefit');
		});

		it('should return offer.reactivateAlert when benefit is not expired', () => {
			component = setup(null);
			component.selectedBenefits = [
				{
					id: 'benefit1',
					name: 'Active Benefit',
					description: 'Description',
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2030-12-31'),
					citizenGroupIds: [],
					amount: 10,
					status: GenericStatusEnum.ACTIVE,
				},
			] as BenefitDto[];

			expect(component.alertMessage).toBe('offer.reactivateAlert');
		});
	});

	describe('Tests for alertType getter', () => {
		it('should return error when benefit is expired', () => {
			component = setup(null);
			component.selectedBenefits = [
				{
					id: 'benefit1',
					name: 'Expired Benefit',
					description: 'Description',
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2023-12-31'),
					citizenGroupIds: [],
					amount: 10,
					status: GenericStatusEnum.EXPIRED,
				},
			] as BenefitDto[];

			expect(component.alertType).toBe('error');
		});

		it('should return info when benefit is not expired', () => {
			component = setup(null);
			component.selectedBenefits = [
				{
					id: 'benefit1',
					name: 'Active Benefit',
					description: 'Description',
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2030-12-31'),
					citizenGroupIds: [],
					amount: 10,
					status: GenericStatusEnum.ACTIVE,
				},
			] as BenefitDto[];

			expect(component.alertType).toBe('info');
		});
	});

	it('should set isViewMode and call setFieldsSpecificToRestrictions and initViewForm when data.offerToView exists', () => {
		const restrictionMock = { minAge: 18, maxAge: 30 };
		const offerToViewMock: OfferDto = {
			id: '29',
			title: 'title',
			description: 'description',
			amount: 12,
			citizenOfferType: 'CITIZEN_WITH_PASS',
			offerTypeId: 1,
			version: 1,
			startDate: new Date('2023-01-01'),
			expirationDate: new Date('2030-01-01'),
			benefits: [
				new BenefitDto(
					'Benefit Name 1',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					[],
					10,
					'EXPIRED',
				),
			],
			restrictionRequestDto: restrictionMock,
		};

		component = setup({ offerToView: offerToViewMock });
		const setFieldsSpy = jest.spyOn(component as any, 'setFieldsSpecificToRestrictions');
		const initViewFormSpy = jest.spyOn(component as any, 'initViewForm');

		component['initializeFormType']();

		expect(component.isViewMode).toBe(true);
		expect(setFieldsSpy).toHaveBeenCalledWith(restrictionMock);
		expect(initViewFormSpy).toHaveBeenCalledWith(offerToViewMock);
	});
	describe('getInitDateMin', () => {
		beforeEach(() => {
			component = setup(null);
		});

		it('should return null if there are no selected benefits', () => {
			component.selectedBenefits = [];
			const result = component.getInitDateMin();
			expect(result).toBeNull();
		});

		it('should return the max start date from the selected benefits', () => {
			component.selectedBenefits = [
				{ id: '1', startDate: new Date('2023-01-01') } as BenefitDto,
				{ id: '2', startDate: new Date('2022-12-31') } as BenefitDto,
				{ id: '3', startDate: new Date('2023-06-01') } as BenefitDto,
			];
			component.availableBenefits = [
				{ id: '1', startDate: new Date('2023-01-01') } as BenefitDto,
				{ id: '2', startDate: new Date('2022-12-31') } as BenefitDto,
				{ id: '3', startDate: new Date('2023-06-01') } as BenefitDto,
			];

			const result = component.getInitDateMin();
			expect(result).toEqual(new Date('2023-06-01'));
		});

		it('should return null if no matching benefits are found in availableBenefits', () => {
			component.selectedBenefits = [{ id: '1', startDate: new Date('2023-01-01') } as BenefitDto];
			component.availableBenefits = [{ id: '2', startDate: new Date('2022-12-31') } as BenefitDto];

			const result = component.getInitDateMin();
			expect(result).toBeNull();
		});

		it('should return null if selectedBenefits is null', () => {
			component.selectedBenefits = null as any;
			const result = component.getInitDateMin();
			expect(result).toBeNull();
		});

		it('should return null if availableBenefits is empty', () => {
			component.selectedBenefits = [{ id: '1', startDate: new Date('2023-01-01') } as BenefitDto];
			component.availableBenefits = [];

			const result = component.getInitDateMin();
			expect(result).toBeNull();
		});
		describe('shouldDisplayTypeHint', () => {
			it('should return true when selectedOfferTypeId is freeEntry', () => {
				component.selectedOfferTypeId = OfferTypeEnum.freeEntry;

				const result = component.shouldDisplayTypeHint;

				expect(result).toBe(true);
			});

			it('should return true when selectedOfferTypeId is freeProduct', () => {
				component.selectedOfferTypeId = OfferTypeEnum.freeProduct;

				const result = component.shouldDisplayTypeHint;

				expect(result).toBe(true);
			});

			it('should return false when selectedOfferTypeId is null', () => {
				component.selectedOfferTypeId = null;

				const result = component.shouldDisplayTypeHint;

				expect(result).toBe(false);
			});

			it('should return false when selectedOfferTypeId is membershipFee', () => {
				component.selectedOfferTypeId = OfferTypeEnum.membershipFee;

				const result = component.shouldDisplayTypeHint;

				expect(result).toBe(false);
			});

			it('should return false when selectedOfferTypeId is bogo', () => {
				component.selectedOfferTypeId = OfferTypeEnum.bogo;

				const result = component.shouldDisplayTypeHint;

				expect(result).toBe(false);
			});
		});
		describe('getExpirationDateMax', () => {
			it('should return null if no benefits are selected', () => {
				component.selectedBenefits = [];
				const result = component.getExpirationDateMax();
				expect(result).toBeNull();
			});

			it('should return the earliest expiration date from selected benefits', () => {
				component.selectedBenefits = [
					{ id: '1', expirationDate: new Date('2023-12-31') } as BenefitDto,
					{ id: '2', expirationDate: new Date('2023-11-30') } as BenefitDto,
					{ id: '3', expirationDate: new Date('2024-01-01') } as BenefitDto,
				];
				component.availableBenefits = [
					{ id: '1', expirationDate: new Date('2023-12-31') } as BenefitDto,
					{ id: '2', expirationDate: new Date('2023-11-30') } as BenefitDto,
					{ id: '3', expirationDate: new Date('2024-01-01') } as BenefitDto,
				];
				const result = component.getExpirationDateMax();
				expect(result).toEqual(new Date('2023-11-30'));
			});

			it('should return the earliest expiration date minus one day if minusOneDay is true', () => {
				component.selectedBenefits = [
					{ id: '1', expirationDate: new Date('2023-12-31') } as BenefitDto,
					{ id: '2', expirationDate: new Date('2023-11-30') } as BenefitDto,
					{ id: '3', expirationDate: new Date('2024-01-01') } as BenefitDto,
				];
				component.availableBenefits = [
					{ id: '1', expirationDate: new Date('2023-12-31') } as BenefitDto,
					{ id: '2', expirationDate: new Date('2023-11-30') } as BenefitDto,
					{ id: '3', expirationDate: new Date('2024-01-01') } as BenefitDto,
				];
				const result = component.getExpirationDateMax(true);
				expect(result).toEqual(new Date('2023-11-29'));
			});

			it('should return null if no expiration dates are available in selected benefits', () => {
				component.selectedBenefits = [
					{ id: '1', expirationDate: null } as unknown as BenefitDto,
					{ id: '2', expirationDate: null } as unknown as BenefitDto,
				];
				const result = component.getExpirationDateMax();
				expect(result).toBeNull();
			});
		});

		test.each([
			[true, false, false, false],
			[false, false, false, false],
			[false, true, false, false],
			[false, false, true, true],
			[false, true, true, true],
		])(
			'should return %s for isEditMode=%s, isReactivating=%s, isViewMode=%s',
			(isEditMode, isReactivating, isViewMode, expected) => {
				component.isEditMode = isEditMode;
				component.isReactivating = isReactivating;
				component.isViewMode = isViewMode;

				expect(component.isReadOnlyMode).toBe(expected);
			},
		);

		it('should close the dialog with shouldDelete=true if user confirms', () => {
			const afterClosed$ = of(true);
			jest.spyOn(dialogService, 'alert').mockReturnValue({
				afterClosed: () => afterClosed$,
			} as any);

			const closeSpy = jest.spyOn(dialogRefStub, 'close');

			component.deleteOffer();

			expect(dialogService.alert).toHaveBeenCalled();
			expect(closeSpy).toHaveBeenCalledWith({ shouldDelete: true });
		});

		describe('initEditForm', () => {
			const testOffer = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'EXPIRED',
				),
				'Benefit Name',
			);
		});

		it('should call initEditForm and setFieldsSpecificToRestrictions when offerId exists', (done) => {
			const restrictionMock = { minAge: 18, maxAge: 30 } as RestrictionsDto;
			const testOffer = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'EXPIRED',
				),
				'Benefit Name',
			);
			testOffer.restrictionRequestDto = restrictionMock;

			component['data'] = { offerToEdit: testOffer };

			jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer').mockReturnValue(of(true));

			const initEditFormSpy = jest.spyOn(component as any, 'initEditForm');
			const setFieldsSpy = jest.spyOn(component as any, 'setFieldsSpecificToRestrictions');

			(component as any).getIsDiscountCodeClaimedForOffer(testOffer);

			setTimeout(() => {
				expect(setFieldsSpy).toHaveBeenCalledWith(restrictionMock);
				expect(initEditFormSpy).toHaveBeenCalledWith(testOffer);
				done();
			}, 0);
		});
		describe('setupValidationOnChange', () => {
			let amountControl: any;

			beforeEach(() => {
				amountControl = component.createOfferForm.get('amount');
			});

			it('should clear validators and set default validators when offerTypeId is membershipFee and benefitsMinAmount is not defined', () => {
				component.selectedOfferTypeId = OfferTypeEnum.membershipFee;
				jest.spyOn(component, 'benefitAmount', 'get').mockReturnValue(null);

				component['setupValidationOnChange']();

				expect(amountControl?.validator).toBeDefined();
			});

			it('should clear validators and set default validators when offerTypeId is not membershipFee', () => {
				component.selectedOfferTypeId = OfferTypeEnum.bogo;
				jest.spyOn(component, 'benefitAmount', 'get').mockReturnValue(10);
				component['setupValidationOnChange']();

				expect(amountControl?.validator).toBeDefined();
			});

			it('should update the validity of the amount control after setting validators', () => {
				component.selectedOfferTypeId = OfferTypeEnum.membershipFee;
				jest.spyOn(component, 'benefitAmount', 'get').mockReturnValue(10);

				const updateValueAndValiditySpy = jest.spyOn(amountControl, 'updateValueAndValidity');

				component['setupValidationOnChange']();

				expect(updateValueAndValiditySpy).toHaveBeenCalled();
			});

			it('should reset the amount control value when offerTypeId is not membershipFee', () => {
				component.selectedOfferTypeId = OfferTypeEnum.bogo;
				jest.spyOn(component, 'benefitAmount', 'get').mockReturnValue(10);

				component['setupValidationOnChange']();

				expect(amountControl?.value).toBe('');
			});
		});
		describe('onValueChangeOnCheckedBenefits', () => {
			it('should set selectedBenefits to an empty array when event is an empty array', () => {
				component.onValueChangeOnCheckedBenefits([]);

				expect(component.selectedBenefits).toEqual([]);
			});

			it('should set selectedBenefits to an array of BenefitDto objects when event is an array of IDs', () => {
				const event = ['benefitId1', 'benefitId2'];
				component.onValueChangeOnCheckedBenefits(event);

				expect(component.selectedBenefits).toEqual([
					{ id: 'benefitId1' } as BenefitDto,
					{ id: 'benefitId2' } as BenefitDto,
				]);
			});

			it('should set selectedBenefits to an array with a single BenefitDto object when event is a single ID', () => {
				const event = 'benefitId1';
				component.onValueChangeOnCheckedBenefits(event);

				expect(component.selectedBenefits).toEqual([{ id: 'benefitId1' } as BenefitDto]);
			});

			it('should set selectedBenefits to an empty array when event is null', () => {
				component.onValueChangeOnCheckedBenefits(null);

				expect(component.selectedBenefits).toEqual([]);
			});

			it('should call setupValidationOnChange after updating selectedBenefits', () => {
				const setupValidationOnChangeSpy = jest.spyOn(component as any, 'setupValidationOnChange');
				const event = ['benefitId1', 'benefitId2'];

				component.onValueChangeOnCheckedBenefits(event);

				expect(setupValidationOnChangeSpy).toHaveBeenCalled();
			});
		});
	});

	describe('reinitializeDialog', () => {
		beforeEach(() => {
			discountServiceMock.isDiscountCodeClaimedForOffer = jest.fn().mockReturnValue(of(false));
			component = setup(null);
		});

		it('should set isViewMode to false and isEditMode to true', () => {
			component.data = {
				offerToView: new OfferInformationDto(
					'1',
					'Title',
					123,
					'CITIZEN',
					'offerType',
					0,
					'validity',
					GenericStatusEnum.ACTIVE,
					'test',
					'supplierId',
					new BenefitDto(
						'Benefit Name',
						'Benefit Description',
						new Date('2023-01-01'),
						new Date('2023-12-31'),
						['id1'],
						100,
						'ACTIVE',
					),
					'Benefit Name',
				),
				offerStatus: GenericStatusEnum.ACTIVE,
			};

			component.reinitializeDialog();

			expect(component.isViewMode).toBe(false);
			expect(component.isEditMode).toBe(true);
		});

		it('should set isReactivating to true when offerStatus is EXPIRED', () => {
			const offerToView = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.EXPIRED,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'EXPIRED',
				),
				'Benefit Name',
			);

			component.data = {
				offerToView,
				offerStatus: GenericStatusEnum.EXPIRED,
			};

			component.reinitializeDialog();

			expect(component.isReactivating).toBe(true);
			expect(component.data.offerToReactivate).toEqual(offerToView);
			expect(component.data.offerToView).toBeUndefined();
		});

		it('should set isReactivating to false when offerStatus is not EXPIRED', () => {
			const offerToView = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'ACTIVE',
				),
				'Benefit Name',
			);

			component.data = {
				offerToView,
				offerStatus: GenericStatusEnum.ACTIVE,
			};

			component.reinitializeDialog();

			expect(component.isReactivating).toBe(false);
			expect(component.data.offerToEdit).toEqual(offerToView);
			expect(component.data.offerToView).toBeUndefined();
		});

		it('should call ngOnInit after reinitializing', () => {
			component.data = {
				offerToView: new OfferInformationDto(
					'1',
					'Title',
					123,
					'CITIZEN',
					'offerType',
					0,
					'validity',
					GenericStatusEnum.ACTIVE,
					'test',
					'supplierId',
					new BenefitDto(
						'Benefit Name',
						'Benefit Description',
						new Date('2023-01-01'),
						new Date('2023-12-31'),
						['id1'],
						100,
						'ACTIVE',
					),
					'Benefit Name',
				),
				offerStatus: GenericStatusEnum.ACTIVE,
			};

			const ngOnInitSpy = jest.spyOn(component, 'ngOnInit');

			component.reinitializeDialog();

			expect(ngOnInitSpy).toHaveBeenCalled();
		});

		it('should handle case when data is undefined', () => {
			component.data = undefined;

			expect(() => component.reinitializeDialog()).not.toThrow();
			expect(component.isViewMode).toBe(false);
			expect(component.isEditMode).toBe(true);
		});

		it('should move offerToView to offerToReactivate and clear offerToView when status is EXPIRED', () => {
			const offerToView = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.EXPIRED,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'EXPIRED',
				),
				'Benefit Name',
			);

			component.data = {
				offerToView,
				offerStatus: GenericStatusEnum.EXPIRED,
			};

			component.reinitializeDialog();

			expect(component.data.offerToReactivate).toBeDefined();
			expect(component.data.offerToReactivate).toEqual(offerToView);
			expect(component.data.offerToView).toBeUndefined();
		});

		it('should move offerToView to offerToEdit and clear offerToView when status is not EXPIRED', () => {
			const offerToView = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'ACTIVE',
				),
				'Benefit Name',
			);

			component.data = {
				offerToView,
				offerStatus: GenericStatusEnum.ACTIVE,
			};

			component.reinitializeDialog();

			expect(component.data.offerToEdit).toBeDefined();
			expect(component.data.offerToEdit).toEqual(offerToView);
			expect(component.data.offerToView).toBeUndefined();
		});

		it('should handle REJECTED status as non-EXPIRED', () => {
			const offerToView = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.REJECTED,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'REJECTED',
				),
				'Benefit Name',
			);

			component.data = {
				offerToView,
				offerStatus: GenericStatusEnum.REJECTED,
			};

			component.reinitializeDialog();

			expect(component.isReactivating).toBe(false);
			expect(component.data.offerToReapply).toEqual(offerToView);
			expect(component.data.offerToView).toBeUndefined();
		});
	});

	describe('initEditForm', () => {
		beforeEach(() => {
			component = setup(null);
		});

		it('should return early if offerToEdit and offerToReactivate are both undefined', () => {
			component.data = {
				offerToEdit: undefined,
				offerToReactivate: undefined,
			};

			const offer = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'ACTIVE',
				),
				'Benefit Name',
			);

			const formBuilderSpy = jest.spyOn(component['formBuilder'], 'group');

			component['initEditForm'](offer);

			expect(component.updatedBenefits).toEqual([offer.benefit]);
			expect(formBuilderSpy).not.toHaveBeenCalled();
		});
	});

	describe('getIsDiscountCodeClaimedForOffer', () => {
		beforeEach(() => {
			component = setup(null);
		});

		it('should return early if offerId is undefined', () => {
			const offerToEdit = {
				id: undefined,
			} as any;

			const isClaimedSpy = jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer');

			component['getIsDiscountCodeClaimedForOffer'](offerToEdit);

			expect(isClaimedSpy).not.toHaveBeenCalled();
		});

		it('should return early if offerToEdit is undefined', () => {
			const isClaimedSpy = jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer');

			component['getIsDiscountCodeClaimedForOffer'](undefined);

			expect(isClaimedSpy).not.toHaveBeenCalled();
		});

		it('should call isDiscountCodeClaimedForOffer with correct offerId', () => {
			const offerToEdit = {
				id: 'offer-id-1',
				restrictionRequestDto: {} as RestrictionsDto,
			} as OfferInformationDto;

			const isClaimedSpy = jest
				.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer')
				.mockReturnValue(of(true));

			component['getIsDiscountCodeClaimedForOffer'](offerToEdit);

			expect(isClaimedSpy).toHaveBeenCalledWith('offer-id-1');
		});

		it('should set isOfferClaimed to true when offer is claimed', (done) => {
			const offerToEdit = {
				id: 'offer-id-1',
				restrictionRequestDto: {} as RestrictionsDto,
			} as OfferInformationDto;

			jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer').mockReturnValue(of(true));

			component['getIsDiscountCodeClaimedForOffer'](offerToEdit);

			setTimeout(() => {
				expect(component.isOfferClaimed).toBe(true);
				done();
			}, 100);
		});

		it('should set isOfferClaimed to false when offer is not claimed', (done) => {
			const offerToEdit = {
				id: 'offer-id-1',
				restrictionRequestDto: {} as RestrictionsDto,
			} as OfferInformationDto;

			jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer').mockReturnValue(of(false));

			component['getIsDiscountCodeClaimedForOffer'](offerToEdit);

			setTimeout(() => {
				expect(component.isOfferClaimed).toBe(false);
				done();
			}, 0);
		});

		it('should set view and edit mode flags correctly', (done) => {
			const offerToEdit = {
				id: 'offer-id-1',
				restrictionRequestDto: {} as RestrictionsDto,
			} as OfferInformationDto;

			component['initForm']();

			jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer').mockReturnValue(of(true));

			component['getIsDiscountCodeClaimedForOffer'](offerToEdit);

			setTimeout(() => {
				expect(component.isViewMode).toBe(false);
				expect(component.isEditMode).toBe(true);
				done();
			}, 0);
		});

		it('should set isReactivating to true when offerToReactivate exists', (done) => {
			const offerToEdit = {
				id: 'offer-id-1',
				restrictionRequestDto: {} as RestrictionsDto,
			} as OfferInformationDto;

			component.data = {
				offerToReactivate: {} as any,
			};

			component['initForm']();

			jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer').mockReturnValue(of(true));

			component['getIsDiscountCodeClaimedForOffer'](offerToEdit);

			setTimeout(() => {
				expect(component.isReactivating).toBe(true);
				done();
			}, 0);
		});

		it('should call setFieldsSpecificToRestrictions with correct restrictions', (done) => {
			const restrictionMock = { minAge: 18, maxAge: 30 } as RestrictionsDto;
			const offerToEdit = {
				id: 'offer-id-1',
				restrictionRequestDto: restrictionMock,
			} as OfferInformationDto;

			component['initForm']();

			jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer').mockReturnValue(of(true));
			const setFieldsSpy = jest.spyOn(component as any, 'setFieldsSpecificToRestrictions');

			component['getIsDiscountCodeClaimedForOffer'](offerToEdit);

			setTimeout(() => {
				expect(setFieldsSpy).toHaveBeenCalledWith(restrictionMock);
				done();
			}, 0);
		});

		it('should call initEditForm with offerToEdit', (done) => {
			const offerToEdit = {
				id: 'offer-id-1',
				restrictionRequestDto: {} as RestrictionsDto,
			} as OfferInformationDto;

			component['initForm']();

			jest.spyOn(component['discountCodeService'], 'isDiscountCodeClaimedForOffer').mockReturnValue(of(true));
			const initEditFormSpy = jest.spyOn(component as any, 'initEditForm');

			component['getIsDiscountCodeClaimedForOffer'](offerToEdit);

			setTimeout(() => {
				expect(initEditFormSpy).toHaveBeenCalledWith(offerToEdit);
				done();
			}, 0);
		});

		it('should open the warning dialog if the form is not dirty and close is called', () => {
			jest.spyOn(component, 'openWarningModal');
			jest.spyOn(component['dialogRef'] as any, 'close');

			component.close();
			expect(component.openWarningModal).not.toHaveBeenCalled();
			expect(component['dialogRef']['close']).toHaveBeenCalled();
		});

		it('should open the warning dialog if the form is marked as dirty and close is called', () => {
			component.createOfferForm.get('title')?.setValue('title');
			component.createOfferForm.get('title')?.markAsDirty();

			jest.spyOn(component, 'openWarningModal');

			component.close();
			expect(component.openWarningModal).toHaveBeenCalled();
		});

		it('should close the dialog if the warning was confirmed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue({
				afterClosed: jest.fn(() => of(true)),
			} as any);

			jest.spyOn(dialogRefStub, 'close');

			component.openWarningModal();

			expect(dialogRefStub.close).toHaveBeenCalledWith(false);
		});
	});

	describe('isNewOffer getter', () => {
		beforeEach(() => {
			component = setup(null);
		});

		it('should return true when all offer data properties are undefined', () => {
			component.data = {
				offerToEdit: undefined,
				offerToReactivate: undefined,
				offerToView: undefined,
			};

			expect(component.isNewOffer).toBe(true);
		});

		it('should return true when data is undefined', () => {
			component.data = undefined;

			expect(component.isNewOffer).toBe(true);
		});

		it('should return false when offerToEdit is defined', () => {
			const offer = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'ACTIVE',
				),
				'Benefit Name',
			);

			component.data = {
				offerToEdit: offer,
				offerToReactivate: undefined,
				offerToView: undefined,
			};

			expect(component.isNewOffer).toBe(false);
		});

		it('should return false when offerToReactivate is defined', () => {
			const offer = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.EXPIRED,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'EXPIRED',
				),
				'Benefit Name',
			);

			component.data = {
				offerToEdit: undefined,
				offerToReactivate: offer,
				offerToView: undefined,
			};

			expect(component.isNewOffer).toBe(false);
		});

		it('should return false when offerToView is defined', () => {
			const offer = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'ACTIVE',
				),
				'Benefit Name',
			);

			component.data = {
				offerToEdit: undefined,
				offerToReactivate: undefined,
				offerToView: offer,
			};

			expect(component.isNewOffer).toBe(false);
		});

		it('should return false when multiple offer properties are defined', () => {
			const offer = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'ACTIVE',
				),
				'Benefit Name',
			);

			component.data = {
				offerToEdit: offer,
				offerToReactivate: offer,
				offerToView: undefined,
			};

			expect(component.isNewOffer).toBe(false);
		});

		it('should return false when all offer properties are defined', () => {
			const offer = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				new BenefitDto(
					'Benefit Name',
					'Benefit Description',
					new Date('2023-01-01'),
					new Date('2023-12-31'),
					['id1'],
					100,
					'ACTIVE',
				),
				'Benefit Name',
			);

			component.data = {
				offerToEdit: offer,
				offerToReactivate: offer,
				offerToView: offer,
			};

			expect(component.isNewOffer).toBe(false);
		});
	});

	describe('initializeBenefits - edit mode with claimed offer', () => {
		beforeEach(() => {
			component = setup(null);
		});

		it('should set updatedBenefits to offerToEdit benefit when in edit mode and offer is claimed', () => {
			const testBenefit = new BenefitDto(
				'Claimed Benefit',
				'Benefit Description',
				new Date('2023-01-01'),
				new Date('2023-12-31'),
				['id1'],
				100,
				'ACTIVE',
			);
			testBenefit.id = 'benefit-id-1';

			const offerToEdit = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				testBenefit,
				'Claimed Benefit',
			);

			component.isEditMode = true;
			component.isOfferClaimed = true;
			component.data = {
				offerToEdit: offerToEdit,
			};

			const allBenefits: BenefitDto[] = [
				testBenefit,
				{
					id: 'benefit-id-2',
					name: 'Another Benefit',
					description: 'Description',
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2023-12-31'),
					citizenGroupIds: [],
					amount: 50,
				},
			];

			component['initializeBenefits'](allBenefits);

			expect(component.updatedBenefits).toEqual([testBenefit]);
			expect(component.updatedBenefits.length).toBe(1);
			expect(component.availableBenefits).toEqual([]);
		});

		it('should not set updatedBenefits when in edit mode but offer is not claimed', () => {
			const testBenefit = new BenefitDto(
				'Unclaimed Benefit',
				'Benefit Description',
				new Date('2023-01-01'),
				new Date('2023-12-31'),
				['id1'],
				100,
				'ACTIVE',
			);

			const offerToEdit = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				testBenefit,
				'Unclaimed Benefit',
			);

			component.isEditMode = true;
			component.isOfferClaimed = false;
			component.data = {
				offerToEdit: offerToEdit,
			};

			const allBenefits: BenefitDto[] = [testBenefit];

			component['initializeBenefits'](allBenefits);

			expect(component.updatedBenefits).toEqual(allBenefits);
			expect(component.availableBenefits).toEqual(allBenefits);
		});

		it('should not set updatedBenefits when offer is claimed but not in edit mode', () => {
			const testBenefit = new BenefitDto(
				'Claimed Benefit',
				'Benefit Description',
				new Date('2023-01-01'),
				new Date('2023-12-31'),
				['id1'],
				100,
				'ACTIVE',
			);

			const offerToEdit = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				testBenefit,
				'Claimed Benefit',
			);

			component.isEditMode = false;
			component.isOfferClaimed = true;
			component.data = {
				offerToEdit: offerToEdit,
			};

			const allBenefits: BenefitDto[] = [testBenefit];

			component['initializeBenefits'](allBenefits);

			expect(component.updatedBenefits).toEqual(allBenefits);
			expect(component.availableBenefits).toEqual(allBenefits);
		});

		it('should not set updatedBenefits when offerToEdit is undefined', () => {
			component.isEditMode = true;
			component.isOfferClaimed = true;
			component.data = {
				offerToEdit: undefined,
			};

			const allBenefits: BenefitDto[] = [
				{
					id: 'benefit-id-1',
					name: 'Benefit 1',
					description: 'Description',
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2023-12-31'),
					citizenGroupIds: [],
					amount: 100,
				},
			];

			component['initializeBenefits'](allBenefits);

			expect(component.updatedBenefits).toEqual(allBenefits);
			expect(component.availableBenefits).toEqual(allBenefits);
		});

		it('should return early and not populate availableBenefits when all conditions are met', () => {
			const testBenefit = new BenefitDto(
				'Claimed Benefit',
				'Benefit Description',
				new Date('2023-01-01'),
				new Date('2023-12-31'),
				['id1'],
				100,
				'ACTIVE',
			);

			const offerToEdit = new OfferInformationDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				0,
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
				testBenefit,
				'Claimed Benefit',
			);

			component.isEditMode = true;
			component.isOfferClaimed = true;
			component.data = {
				offerToEdit: offerToEdit,
			};

			const allBenefits: BenefitDto[] = [
				testBenefit,
				{
					id: 'benefit-id-2',
					name: 'Another Benefit',
					description: 'Description',
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2023-12-31'),
					citizenGroupIds: [],
					amount: 50,
				},
			];

			component['initializeBenefits'](allBenefits);

			expect(component.availableBenefits).toEqual([]);
		});
	});

	describe('deleteOffer', () => {
		beforeEach(() => {
			component = setup(null);
		});

		it('should close the dialog with shouldDelete=true if user confirms', () => {
			const afterClosed$ = of(true);
			jest.spyOn(dialogService, 'alert').mockReturnValue({
				afterClosed: () => afterClosed$,
			} as any);

			const closeSpy = jest.spyOn(dialogRefStub, 'close');

			component.deleteOffer();

			expect(dialogService.alert).toHaveBeenCalled();
			expect(closeSpy).toHaveBeenCalledWith({ shouldDelete: true });
		});

		it('should not close the dialog if user cancels', () => {
			const afterClosed$ = of(false);
			jest.spyOn(dialogService, 'alert').mockReturnValue({
				afterClosed: () => afterClosed$,
			} as any);

			component.deleteOffer();

			expect(dialogService.alert).toHaveBeenCalled();
		});

		it('should not close the dialog if user returns null', () => {
			const afterClosed$ = of(null);
			jest.spyOn(dialogService, 'alert').mockReturnValue({
				afterClosed: () => afterClosed$,
			} as any);

			component.deleteOffer();

			expect(dialogService.alert).toHaveBeenCalled();
		});

		it('should not close the dialog if user returns undefined', () => {
			const afterClosed$ = of(undefined);
			jest.spyOn(dialogService, 'alert').mockReturnValue({
				afterClosed: () => afterClosed$,
			} as any);

			component.deleteOffer();

			expect(dialogService.alert).toHaveBeenCalled();
		});

		it('should call createDeleteDialogConfig to get config', () => {
			const afterClosed$ = of(true);
			jest.spyOn(dialogService, 'alert').mockReturnValue({
				afterClosed: () => afterClosed$,
			} as any);

			const createConfigSpy = jest.spyOn(component as any, 'createDeleteDialogConfig');

			component.deleteOffer();

			expect(createConfigSpy).toHaveBeenCalled();
			expect(dialogService.alert).toHaveBeenCalledWith(CustomDialogComponent, expect.any(Object));
		});
	});

	it('should return early when in view mode', () => {
		component = setup(null);
		component.isViewMode = true;

		const testData: BenefitDto[] = [
			{
				name: 'Benefit 1',
				description: 'Benefit Description',
				startDate: new Date('2023-01-01'),
				expirationDate: new Date('2023-12-31'),
				citizenGroupIds: [],
				amount: 10,
			},
			{
				name: 'Benefit 2',
				description: 'Benefit Description',
				startDate: new Date('2023-01-01'),
				expirationDate: new Date('2023-12-31'),
				citizenGroupIds: [],
				amount: 10,
			},
		];

		component['initializeBenefits'](testData);

		expect(component.availableBenefits).toEqual([]);
		expect(component.updatedBenefits).toEqual([]);
	});

	describe('shouldDisplayRestriction', () => {
		let component: CreateOfferComponent;
		let fixture: ComponentFixture<CreateOfferComponent>;

		beforeEach(() => {
			const dialogServiceMock = {
				message: jest.fn(),
				alert: jest.fn(),
			};

			const offerServiceMock = {
				createOffer: jest.fn().mockReturnValue(of({})),
				getOfferTypes: jest.fn().mockReturnValue(of({})),
				getFullOffer: jest.fn().mockReturnValue(of({})),
				reactivateOffer: jest.fn().mockReturnValue(of({})),
				editOffer: jest.fn().mockReturnValue(of({})),
			};

			const discountServiceMock = {
				isDiscountCodeClaimedForOffer: jest.fn(),
			};

			const benefitServiceMock = {
				getAllBenefits: jest.fn().mockReturnValue(of([])),
			};

			global.ResizeObserver = require('resize-observer-polyfill');

			TestBed.configureTestingModule({
				declarations: [CreateOfferComponent],
				schemas: [NO_ERRORS_SCHEMA],
				imports: [
					WindmillModule,
					CommonModule,
					FormsModule,
					BrowserAnimationsModule,
					ReactiveFormsModule,
					TranslateModule.forRoot(),
					CentricToastrModule.forRoot(),
					HttpClientModule,
					AppModule,
				],
				providers: [
					FormBuilder,
					ToastrService,
					TranslateService,
					{ provide: MatDialogRef, useValue: { close: () => undefined } },
					{ provide: OfferService, useValue: offerServiceMock },
					{ provide: DiscountCodeService, useValue: discountServiceMock },
					{ provide: DialogService, useValue: dialogServiceMock },
					{ provide: BenefitService, useValue: benefitServiceMock },
					{ provide: MAT_DIALOG_DATA, useValue: null },
				],
			}).compileComponents();

			fixture = TestBed.createComponent(CreateOfferComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		});

		describe('when isViewMode is false', () => {
			beforeEach(() => {
				component.isViewMode = false;
			});

			it('should return true for any restriction type when not in view mode', () => {
				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(true);
				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);
			});

			it('should return true regardless of form control values when not in view mode', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(true);
				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);
			});
		});

		describe('when isViewMode is true and restriction is timeSlots', () => {
			beforeEach(() => {
				component.isViewMode = true;
			});

			it('should return true when both timeFrom and timeTo have values', () => {
				component.createOfferForm
					.get(RestrictionFormFields.timeFrom)
					?.setValue(new Date('2024-01-01T10:00:00'));
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(new Date('2024-01-01T18:00:00'));

				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);
			});

			it('should return true when only timeFrom has a value', () => {
				component.createOfferForm
					.get(RestrictionFormFields.timeFrom)
					?.setValue(new Date('2024-01-01T10:00:00'));
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);
			});

			it('should return true when only timeTo has a value', () => {
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(new Date('2024-01-01T18:00:00'));

				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);
			});

			it('should return false when both timeFrom and timeTo are null', () => {
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(false);
			});

			it('should return false when both timeFrom and timeTo are undefined', () => {
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(undefined);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(undefined);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(false);
			});

			it('should return false when both timeFrom and timeTo are empty strings', () => {
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue('');
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue('');

				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(false);
			});
		});

		describe('when isViewMode is true and restriction is frequencyOfUse', () => {
			beforeEach(() => {
				component.isViewMode = true;
			});

			it('should return true when frequencyOfUseValue has a truthy value', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(5);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);
			});

			it('should return true when frequencyOfUseValue is a non-empty string', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue('DAILY');

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);
			});

			it('should return false when frequencyOfUseValue is null', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);
			});

			it('should return false when frequencyOfUseValue is undefined', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(undefined);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);
			});

			it('should return false when frequencyOfUseValue is an empty string', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue('');

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);
			});

			it('should return false when frequencyOfUseValue is zero', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(0);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);
			});

			it('should return false when frequencyOfUseValue is false', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(false);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);
			});
		});

		describe('when isViewMode is true and restriction is a generic restriction field', () => {
			beforeEach(() => {
				component.isViewMode = true;
			});

			it('should return true when the restriction control has a truthy value', () => {
				const restrictionField = 'customRestriction' as any;
				component.createOfferForm.addControl(restrictionField, new FormControl('someValue'));

				expect(component.shouldDisplayRestriction(restrictionField)).toBe(true);
			});

			it('should return false when the restriction control has a falsy value', () => {
				const restrictionField = 'customRestriction' as any;
				component.createOfferForm.addControl(restrictionField, new FormControl(null));

				expect(component.shouldDisplayRestriction(restrictionField)).toBe(false);
			});

			it('should return false when the restriction control does not exist', () => {
				const nonExistentField = 'nonExistentRestriction' as any;

				expect(component.shouldDisplayRestriction(nonExistentField)).toBe(false);
			});

			it('should return true when the restriction control has a numeric value of 1', () => {
				const restrictionField = 'ageRestriction' as any;
				component.createOfferForm.addControl(restrictionField, new FormControl(1));

				expect(component.shouldDisplayRestriction(restrictionField)).toBe(true);
			});

			it('should return true when the restriction control has an empty object as value', () => {
				const restrictionField = 'customRestriction' as any;
				component.createOfferForm.addControl(restrictionField, new FormControl({}));

				expect(component.shouldDisplayRestriction(restrictionField)).toBe(true);
			});
		});

		describe('edge cases and combined scenarios', () => {
			it('should handle switching between view and edit modes', () => {
				component.isViewMode = false;
				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(true);

				component.isViewMode = true;
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);
				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);

				component.isViewMode = false;
				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(true);
			});

			it('should handle timeSlots with special date values', () => {
				component.isViewMode = true;
				const minDate = new Date('1970-01-01T00:00:00');
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(minDate);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);
			});

			it('should correctly evaluate multiple restriction types in sequence', () => {
				component.isViewMode = true;

				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(3);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(new Date());
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);

				expect(component.shouldDisplayRestriction(RestrictionFormFields.frequencyOfUse)).toBe(false);
				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);
			});

			it('should handle rapid isViewMode changes', () => {
				component.isViewMode = false;
				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);

				component.isViewMode = true;
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(false);

				component.isViewMode = false;
				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(true);

				component.isViewMode = true;
				expect(component.shouldDisplayRestriction(RestrictionFormFields.timeSlots)).toBe(false);
			});
		});
	});

	describe('shouldDisplayRestrictionsTitle getter', () => {
		beforeEach(() => {
			component = setup(null);
		});

		describe('when isViewMode is false', () => {
			it('should return true regardless of restriction values', () => {
				component.isViewMode = false;
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when in edit mode', () => {
				component.isViewMode = false;
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(new Date('2024-01-01T18:00:00'));
				component.createOfferForm
					.get(RestrictionFormFields.timeFrom)
					?.setValue(new Date('2024-01-01T10:00:00'));
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(5);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});
		});

		describe('when isViewMode is true', () => {
			beforeEach(() => {
				component.isViewMode = true;
			});

			it('should return true when timeTo has a value', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(new Date('2024-01-01T18:00:00'));
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when timeFrom has a value', () => {
				component.createOfferForm
					.get(RestrictionFormFields.timeFrom)
					?.setValue(new Date('2024-01-01T10:00:00'));
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when frequencyOfUseValue has a value', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(5);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when both timeTo and timeFrom have values', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(new Date('2024-01-01T18:00:00'));
				component.createOfferForm
					.get(RestrictionFormFields.timeFrom)
					?.setValue(new Date('2024-01-01T10:00:00'));
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when all restrictions have values', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(new Date('2024-01-01T18:00:00'));
				component.createOfferForm
					.get(RestrictionFormFields.timeFrom)
					?.setValue(new Date('2024-01-01T10:00:00'));
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(3);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return false when all restrictions are null', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(false);
			});

			it('should return false when all restrictions are undefined', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(undefined);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(undefined);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(undefined);

				expect(component.shouldDisplayRestrictionsTitle).toBe(false);
			});

			it('should return false when all restrictions are empty strings', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue('');
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue('');
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue('');

				expect(component.shouldDisplayRestrictionsTitle).toBe(false);
			});

			it('should return false when all restrictions are zero', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(0);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(0);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(0);

				expect(component.shouldDisplayRestrictionsTitle).toBe(false);
			});

			it('should return false when all restrictions are false', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(false);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(false);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(false);

				expect(component.shouldDisplayRestrictionsTitle).toBe(false);
			});

			it('should return true when frequencyOfUseValue is a non-empty string', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue('DAILY');
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when frequencyOfUseValue is 1', () => {
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(1);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when timeTo is a valid Date object', () => {
				const validDate = new Date();
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(validDate);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when timeFrom is a valid Date object', () => {
				const validDate = new Date();
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(validDate);
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return false when form controls do not exist', () => {
				component.createOfferForm = new FormGroup({});

				expect(component.shouldDisplayRestrictionsTitle).toBe(false);
			});

			it('should return true when timeTo and frequencyOfUseValue have values but timeFrom is null', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(new Date());
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(2);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should return true when timeFrom and frequencyOfUseValue have values but timeTo is null', () => {
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(new Date());
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(2);

				expect(component.shouldDisplayRestrictionsTitle).toBe(true);
			});

			it('should dynamically update when restriction values change', () => {
				component.createOfferForm.get(RestrictionFormFields.timeTo)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.timeFrom)?.setValue(null);
				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);
				expect(component.shouldDisplayRestrictionsTitle).toBe(false);

				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(5);
				expect(component.shouldDisplayRestrictionsTitle).toBe(true);

				component.createOfferForm.get(RestrictionFormFields.frequencyOfUseValue)?.setValue(null);
				expect(component.shouldDisplayRestrictionsTitle).toBe(false);
			});
		});

		describe('isSuspendedOffer getter', () => {
			it.each([
				[GenericStatusEnum.ACTIVE, true, true],
				[GenericStatusEnum.ACTIVE, false, false],
				[GenericStatusEnum.ACTIVE, null, false],
				[GenericStatusEnum.EXPIRED, true, false],
				[GenericStatusEnum.REJECTED, true, false],
				[GenericStatusEnum.PENDING, true, false],
			])(
				'should return %s when offerStatus is %s and offerToSuspend is %s',
				(offerStatus, offerToSuspendDefined, expected) => {
					const offerToSuspend =
						offerToSuspendDefined === null
							? null
							: offerToSuspendDefined
								? new OfferInformationDto(
										'1',
										'Title',
										123,
										'CITIZEN',
										'offerType',
										0,
										'validity',
										offerStatus,
										'test',
										'supplierId',
										new BenefitDto(
											'Benefit Name',
											'Benefit Description',
											new Date('2023-01-01'),
											new Date('2023-12-31'),
											['id1'],
											100,
											'ACTIVE',
										),
										'Benefit Name',
									)
								: undefined;

					component.data =
						offerToSuspendDefined !== undefined
							? { offerToSuspend: offerToSuspend ?? undefined, offerStatus }
							: { offerStatus };

					expect(component.isSuspendedOffer).toBe(expected);
				},
			);

			it.each([undefined, null])('should return false when data is %s', (dataValue) => {
				component.data = dataValue as any;
				expect(component.isSuspendedOffer).toBe(false);
			});

			it('should return true with both ACTIVE status and non-null offerToSuspend object', () => {
				const offerToSuspend = new OfferInformationDto(
					'2',
					'Another Title',
					456,
					'CITIZEN',
					'offerType',
					1,
					'validity',
					GenericStatusEnum.ACTIVE,
					'test',
					'supplierId',
					new BenefitDto(
						'Benefit Name 2',
						'Benefit Description 2',
						new Date('2023-01-01'),
						new Date('2023-12-31'),
						['id2'],
						200,
						'ACTIVE',
					),
					'Benefit Name 2',
				);

				component.data = {
					offerToSuspend,
					offerStatus: GenericStatusEnum.ACTIVE,
				};

				expect(component.isSuspendedOffer).toBe(true);
			});

			it('should return false when offerToSuspend is an empty object', () => {
				component.data = {
					offerToSuspend: {} as any,
					offerStatus: GenericStatusEnum.ACTIVE,
				};

				expect(component.isSuspendedOffer).toBe(true);
			});

			it('should handle data with only offerToSuspend property', () => {
				const offerToSuspend = new OfferInformationDto(
					'1',
					'Title',
					123,
					'CITIZEN',
					'offerType',
					0,
					'validity',
					GenericStatusEnum.ACTIVE,
					'test',
					'supplierId',
					new BenefitDto(
						'Benefit Name',
						'Benefit Description',
						new Date('2023-01-01'),
						new Date('2023-12-31'),
						['id1'],
						100,
						'ACTIVE',
					),
					'Benefit Name',
				);

				component.data = {
					offerToSuspend,
				} as any;

				expect(component.isSuspendedOffer).toBe(false);
			});

			it('should return true when data has other properties along with ACTIVE status and offerToSuspend', () => {
				const offerToSuspend = new OfferInformationDto(
					'1',
					'Title',
					123,
					'CITIZEN',
					'offerType',
					0,
					'validity',
					GenericStatusEnum.ACTIVE,
					'test',
					'supplierId',
					new BenefitDto(
						'Benefit Name',
						'Benefit Description',
						new Date('2023-01-01'),
						new Date('2023-12-31'),
						['id1'],
						100,
						'ACTIVE',
					),
					'Benefit Name',
				);

				const offerToEdit = new OfferInformationDto(
					'2',
					'Edit Title',
					456,
					'CITIZEN',
					'offerType',
					1,
					'validity',
					GenericStatusEnum.ACTIVE,
					'test',
					'supplierId',
					new BenefitDto(
						'Benefit Name',
						'Benefit Description',
						new Date('2023-01-01'),
						new Date('2023-12-31'),
						['id1'],
						100,
						'ACTIVE',
					),
					'Benefit Name',
				);

				component.data = {
					offerToSuspend,
					offerToEdit,
					offerStatus: GenericStatusEnum.ACTIVE,
				};

				expect(component.isSuspendedOffer).toBe(true);
			});
		});
	});
});
