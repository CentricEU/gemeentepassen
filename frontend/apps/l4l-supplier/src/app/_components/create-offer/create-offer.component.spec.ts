import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FrequencyOfUse, GrantDto, GrantHolder, GrantService, OfferDto, RestrictionsDto } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CentricToastrModule, DialogService, ToastrService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { CreateOfferFormFields } from '../../enums/create-offer-form-field.enum';
import { OfferTypeEnum } from '../../enums/offer-type.enum';
import { RestrictionFormFields } from '../../enums/restriction.enum';
import { OfferType } from '../../models/offer-type.model';
import { OfferTypeVisibility } from '../../models/offer-type-visibility.model';
import { OfferService } from '../../services/offer-service/offer.service';
import { CreateOfferComponent } from './create-offer.component';

describe('CreateOfferComponent', () => {
	let component: CreateOfferComponent;
	let fixture: ComponentFixture<CreateOfferComponent>;
	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };

	let offerServiceMock: any;
	let translateService: TranslateService;
	let toastrService: ToastrService;
	let dialogService: DialogService;
	let formBuilder: FormBuilder;
	let grantServiceMock: any;

	const offerToReactivate: OfferDto = {
		id: '29',
		title: 'title',
		description: 'description',
		amount: 12,
		citizenOfferType: 'CITIZEN_WITH_PASS',
		offerTypeId: 1,
		startDate: new Date('2023-01-01'),
		expirationDate: new Date('2030-01-01'),
	};

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		const dialogServiceMock = {
			message: jest.fn(),
		};

		offerServiceMock = {
			createOffer: jest.fn().mockReturnValue(of({})),
			getOfferTypes: jest.fn().mockReturnValue(of({})),
			getFullOffer: jest.fn().mockReturnValue(of({ offerToReactivate })),
			reactivateOffer: jest.fn().mockReturnValue(of({})),
		};

		grantServiceMock = {
			getAllGrants: jest.fn().mockReturnValue(of([])),
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
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provice: GrantService, useValue: grantServiceMock },
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

			it('should return translated validity error message for title', () => {
				jest.spyOn(translateService, 'instant').mockReturnValue('validity error message');
				const errorMessage = component.getErrorMessageFormInputs(CreateOfferFormFields.title);
				expect(errorMessage).toBe('validity error message');
				expect(translateService.instant).toHaveBeenCalledWith('offer.formRequired.titleFormControlRequired');
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
			it('should have hideAmount set to false when selectedOfferTypeId is percentage', fakeAsync(() => {
				component.selectedOfferTypeId = OfferTypeEnum.percentage;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					expect(component.hideAmount).toEqual(false);
				});
			}));

			it('should have hideAmount set to true when selectedOfferTypeId is bogo', fakeAsync(() => {
				component.selectedOfferTypeId = OfferTypeEnum.bogo;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					expect(component.hideAmount).toEqual(true);
				});
			}));

			it('should have hideAmount set to false when selectedOfferTypeId is credit', fakeAsync(() => {
				component.selectedOfferTypeId = OfferTypeEnum.credit;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					expect(component.hideAmount).toEqual(false);
				});
			}));
		});

		describe('Tests for getAmountPlaceholder method', () => {
			it('should return percentage placeholder when selectedOfferTypeId is percentage', () => {
				const value = OfferTypeEnum.percentage;
				const translation = 'translated credit';

				jest.spyOn(translateService, 'instant').mockReturnValue(translation);
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).toHaveBeenCalledWith('offer.amountPercentagePlaceholder');
				expect(result).toBe(translation);
			});

			it('should return percentage placeholder when selectedOfferTypeId is credit', () => {
				const value = OfferTypeEnum.credit;
				const translation = 'translated credit';

				jest.spyOn(translateService, 'instant').mockReturnValue(translation);
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).toHaveBeenCalledWith('offer.amountCreditPlaceholder');
				expect(result).toBe(translation);
			});

			it('should return empty placeholder when selectedOfferTypeId is bogo', () => {
				const value = OfferTypeEnum.bogo;

				jest.spyOn(translateService, 'instant').mockReturnValue('translated credit');
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).not.toHaveBeenCalled();
				expect(result).toBe('');
			});

			it('should return empty placeholder when selectedOfferTypeId is null', () => {
				const value = null;

				jest.spyOn(translateService, 'instant').mockReturnValue('translated credit');
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).not.toHaveBeenCalled();
				expect(result).toBe('');
			});

			it('should return empty placeholder when selectedOfferTypeId is null', () => {
				const value = 999;

				jest.spyOn(translateService, 'instant').mockReturnValue('translated credit');
				const result = component.getAmountPlaceholder(value);
				expect(translateService.instant).not.toHaveBeenCalled();
				expect(result).toBe('');
			});
		});

		describe('Tests for showPrefix method', () => {
			it('should return "€ " when selectedOfferTypeId is credit', () => {
				component.selectedOfferTypeId = OfferTypeEnum.credit;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.showPrefix;
					expect(result).toBe('€ ');
				});
			});

			it('should return an empty string for other offer types', () => {
				component.selectedOfferTypeId = OfferTypeEnum.percentage;

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
			it('should return "%" when selectedOfferTypeId is percentage', () => {
				component.selectedOfferTypeId = OfferTypeEnum.percentage;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.showPrefix;
					expect(result).toBe('%');
				});
			});

			it('should return an empty string for other offer types', () => {
				component.selectedOfferTypeId = OfferTypeEnum.credit;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.showPrefix;
					expect(result).toBe('');
				});
			});

			describe('Tests for showDecimal method', () => {
				it('should return "percent" when selectedOfferTypeId is percentage', () => {
					component.selectedOfferTypeId = OfferTypeEnum.percentage;

					fixture.whenStable().then(() => {
						fixture.detectChanges();
						const result = component.showPrefix;
						expect(result).toBe('percent');
					});
				});

				it('should return "separator.2" when selectedOfferTypeId is credit', () => {
					component.selectedOfferTypeId = OfferTypeEnum.credit;

					fixture.whenStable().then(() => {
						fixture.detectChanges();
						const result = component.showPrefix;
						expect(result).toBe('separator.2');
					});
				});
			});

			describe('Tests for onValueChangeOnOfferTypes method', () => {

				it('should update selectedOfferTypeId, reset form values, and enable/disable form controls correctly for percentage offer type', () => {
					component.selectedOfferTypeId = OfferTypeEnum.credit;

					component.onValueChangeOnOfferTypes(OfferTypeEnum.percentage);

					expect(component.selectedOfferTypeId).toBe(OfferTypeEnum.percentage);

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

			describe('Tests for onValueChangeOnCheckedGrants method', () => {
				it('should add item to selectedGrants if not already present', () => {
					component.selectedGrants = ['grant1', 'grant2'];

					component.onValueChangeOnCheckedGrants('grant3');

					expect(component.selectedGrants).toEqual(['grant1', 'grant2', 'grant3']);
				});

				it('should remove item from selectedGrants if already present', () => {
					component.selectedGrants = ['grant1', 'grant2', 'grant3'];

					component.onValueChangeOnCheckedGrants('grant2');

					expect(component.selectedGrants).toEqual(['grant1', 'grant3']);
				});
			});

			describe('Tests for resetFormValue method', () => {
				it('should reset form control value to the provided value', () => {
					component.createOfferForm.get(CreateOfferFormFields.amount)?.setValue('initialValue');

					component['resetFormValue'](CreateOfferFormFields.amount, 'newValue');

					expect(component.createOfferForm.get(CreateOfferFormFields.amount)?.value).toBe('newValue');
				});

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

			describe('Tests for onSearchOnGrants method', () => {
				it('should include all available grants when search event is empty', () => {
					component.availableGrants = [
						{
							title: 'Grant1',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant2',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant3',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
					];

					component.onSearchOnGrants('');

					expect(component.updatedGrants).toEqual([
						{
							title: 'Grant1',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant2',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant3',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
					]);
				});

				it('should filter available grants based on the provided search event', () => {
					component.availableGrants = [
						{
							title: 'Grant1',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant2',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant3',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
					];

					component.onSearchOnGrants('Grant2');

					expect(component.updatedGrants).toEqual([
						{
							title: 'Grant2',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
					]);
				});

				it('should filter available grants based on the provided search event (case-insensitive)', () => {
					component.availableGrants = [
						{
							title: 'Grant1',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant2',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant3',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
					];

					component.onSearchOnGrants('grant2');

					expect(component.updatedGrants).toEqual([
						{
							title: 'Grant2',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
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
						grantsIds: '',
						startDate: new Date('2023-01-01'),
						expirationDate: new Date('2022-12-31'),
						frequencyOfUse: 'Frequency of use',
						frequencyOfUseValue: 'Frequency of use value',
						timeSlots: 'Time slots',
						ageRestriction: 'Age restriction',
						ageRestrictionValue: 'Age restriction value',
						ageRestrictionOtherValue: 'Age restriction other value',
						priceRange: 'Eligible price range',
						minPrice: 70,
						maxPrice: 90,
						timeTo: '',
						timeFrom: '',
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
						grantsIds: '',
						startDate: new Date('2023-01-01'),
						expirationDate: new Date('2022-12-31'),
						frequencyOfUse: 'Frequency of use',
						frequencyOfUseValue: 'Frequency of use value',
						timeSlots: 'Time slots',
						ageRestriction: 'Age restriction',
						ageRestrictionValue: 'Age restriction value',
						ageRestrictionOtherValue: 'Age restriction other value',
						priceRange: 'Eligible price range',
						minPrice: 70,
						maxPrice: 90,
						timeTo: '',
						timeFrom: '',
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

			describe('Tests for initializeGrants method', () => {
				it('should initialize availableGrants and updatedGrants with the provided data', () => {
					const testData: GrantDto[] = [
						{
							title: 'Grant1',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant2',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
						{
							title: 'Grant3',
							description: 'Description',
							amount: 20,
							createFor: GrantHolder.PASS_CHILD,
							startDate: new Date('2023-12-06'),
							expirationDate: new Date('2023-12-31'),
							selected: false,
							isCheckboxDisabled: false,
						},
					];

					component['initializeGrants'](testData);

					expect(component.availableGrants).toEqual(testData);
					expect(component.updatedGrants).toEqual(testData);
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

				describe('Tests for getOfferTypeAndGrants method', () => {
					it('should call initializeOfferTypes and initializeGrants with correct data', fakeAsync(() => {
						const offerTypesData: OfferTypeVisibility[] = [
							{ offerTypeId: 1, offerTypeLabel: 'Type1', visible: true },
							{ offerTypeId: 2, offerTypeLabel: 'Type2', visible: true },
						];

						const grantsData: GrantDto[] = [
							{
								title: 'Grant1',
								description: 'Description',
								amount: 20,
								createFor: GrantHolder.PASS_CHILD,
								startDate: new Date('2023-12-06'),
								expirationDate: new Date('2023-12-31'),
								selected: false,
								isCheckboxDisabled: false,
							},
						];

						jest.spyOn(component as any, 'getRequestsObservable').mockReturnValue(
							of([offerTypesData, grantsData]),
						);

						const spyInitializeOfferTypes = jest.spyOn(component as any, 'initializeOfferTypes');
						const spyInitializeGrants = jest.spyOn(component as any, 'initializeGrants');

						(component as any).getOfferTypeAndGrants();

						tick();

						expect(spyInitializeOfferTypes).toHaveBeenCalledWith(offerTypesData);
						expect(spyInitializeGrants).toHaveBeenCalledWith(grantsData);
					}));

					it('should call initializeOfferTypes and initializeGrants with empty  data', fakeAsync(() => {
						const offerTypesData = null;

						const grantsData = null;

						jest.spyOn(component as any, 'getRequestsObservable').mockReturnValue(
							of([offerTypesData, grantsData]),
						);

						const spyInitializeOfferTypes = jest.spyOn(component as any, 'initializeOfferTypes');
						const spyInitializeGrants = jest.spyOn(component as any, 'initializeGrants');

						(component as any).getOfferTypeAndGrants();

						tick();

						expect(spyInitializeOfferTypes).toHaveBeenCalledWith(offerTypesData);
						expect(spyInitializeGrants).toHaveBeenCalledWith(grantsData);
					}));

					it('should handle null data during initialization', fakeAsync(() => {
						jest.spyOn(component as any, 'initializeOfferTypes');
						jest.spyOn(component as any, 'initializeGrants');

						jest.spyOn(component as any, 'getRequestsObservable').mockReturnValue(of(null));

						component['getOfferTypeAndGrants']();
						tick();

						expect(component['initializeOfferTypes']).not.toHaveBeenCalled();
						expect(component['initializeGrants']).not.toHaveBeenCalled();
					}));
				});
			});
		});

		describe('Tests for maxLength method', () => {
			it('should return 14 when selectedOfferTypeId is credit', () => {
				component.selectedOfferTypeId = OfferTypeEnum.credit;

				fixture.whenStable().then(() => {
					fixture.detectChanges();
					const result = component.maxLength;
					expect(result).toBe(14);
				});
			});

			it('should return Number.MAX_SAFE_INTEGER when selectedOfferTypeId is percentage', () => {
				component.selectedOfferTypeId = OfferTypeEnum.percentage;

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

		it('should return "€ " for showPrefix when selectedOfferTypeId is credit', () => {
			component.selectedOfferTypeId = OfferTypeEnum.credit;
			expect(component.showPrefix).toBe('€ ');
		});

		it('should return an empty string for showPrefix when selectedOfferTypeId is not credit', () => {
			component.selectedOfferTypeId = OfferTypeEnum.percentage;
			expect(component.showPrefix).toBe('');
		});

		it('should return "%" for showSuffix when selectedOfferTypeId is percentage', () => {
			component.selectedOfferTypeId = OfferTypeEnum.percentage;
			expect(component.showSuffix).toBe('%');
		});

		it('should return an empty string for showSuffix when selectedOfferTypeId is not percentage', () => {
			component.selectedOfferTypeId = OfferTypeEnum.credit;
			expect(component.showSuffix).toBe('');
		});

		it('should return "percent" for showDecimal when selectedOfferTypeId is percentage', () => {
			component.selectedOfferTypeId = OfferTypeEnum.percentage;
			expect(component.showDecimal).toBe('percent');
		});

		it('should return "separator.2" for showDecimal when selectedOfferTypeId is not percentage', () => {
			component.selectedOfferTypeId = OfferTypeEnum.credit;
			expect(component.showDecimal).toBe('separator.2');
		});

		it('should return 14 for maxLength when selectedOfferTypeId is credit', () => {
			component.selectedOfferTypeId = OfferTypeEnum.credit;
			expect(component.maxLength).toBe(14);
		});

		it('should return Number.MAX_SAFE_INTEGER for maxLength when selectedOfferTypeId is not credit', () => {
			component.selectedOfferTypeId = OfferTypeEnum.percentage;
			expect(component.maxLength).toBe(Number.MAX_SAFE_INTEGER);
		});

		describe('Tests for displayPopupForOfferWithGrant method', () => {
			it('should display popup for offer with grant', () => {
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				jest.spyOn(component, 'close').mockImplementation(() => {});
				jest.spyOn(translateService, 'instant');
				jest.spyOn(toastrService, 'success');
				jest.spyOn(dialogService, 'message');

				component.createOfferForm.setValue({
					title: 'Title',
					description: 'Description',
					amount: '123',
					citizenOfferType: 'offer.citizenWithPass',
					offerTypeId: OfferTypeEnum.credit,
					grantsIds: '',
					startDate: new Date('2023-01-01'),
					expirationDate: new Date('2022-12-31'),
					frequencyOfUse: 'Frequency of use',
					frequencyOfUseValue: 'Frequency of use value',
					timeSlots: 'Time slots',
					ageRestriction: 'Age restriction',
					ageRestrictionValue: 'Age restriction value',
					ageRestrictionOtherValue: 'Age restriction other value',
					priceRange: 'Eligible price range',
					minPrice: 70,
					maxPrice: 90,
					timeTo: '',
					timeFrom: '',
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
			[null, null],
			[{}, null],
			[{}, null],
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

		it('should map restrictions correctly', () => {
			component.createOfferForm = {
				get: jest.fn().mockImplementation((key: string) => {
					const controlValues: { [key: string]: string } = {
						type1Value: 'SINGLE_USE',
						type2Value: 'WEEKLY',
						type3Value: 'Invalid Value',
					};
					return { value: controlValues[key] };
				}),
			} as any;

			component.restrictionsData = [
				{
					formControl: 'type1',
					label: 'label1',
					id: 'id1',
					dataTestId: 'data1',
				},
				{
					formControl: 'type2',
					label: 'label1',
					id: 'id1',
					dataTestId: 'data1',
				},
			];

			const result = component['mapRestrictionsValues']();

			expect(result).toBeDefined();
			expect(result?.['type1']).toEqual('SINGLE_USE');
			expect(result?.['type2']).toEqual('WEEKLY');
			expect(result?.['type3']).toBeUndefined();
		});

		it('should handle ageRestrictionOtherValue correctly', () => {
			const createOfferFormMock = {
				get: jest.fn().mockImplementation((key: string) => {
					const controlValues: { [key: string]: string } = {
						ageRestrictionValue: '18',
						ageRestrictionOtherValue: 'otherValue',
					};
					return { value: controlValues[key] };
				}),
			} as any;
			component.createOfferForm = createOfferFormMock;

			component.restrictionsData = [
				{
					formControl: 'ageRestriction',
					label: 'label1',
					id: 'id1',
					dataTestId: 'data1',
				},
			];

			const result = component['mapRestrictionsValues']();

			expect(result).toEqual({ ageRestriction: '18' });
		});

		it('should map form values to RestrictionsDto correctly', () => {
			const formGroup: FormGroup = new FormGroup({
				frequencyOfUseValue: new FormControl(FrequencyOfUse.WEEKLY),
				ageRestrictionValue: new FormControl(23),
			});

			component.createOfferForm = formGroup;

			component.restrictionsData = [
				{
					formControl: 'frequencyOfUse',
					label: 'frequencyOfUse',
					id: 'id1',
					dataTestId: 'data1',
				},
				{
					formControl: 'ageRestriction',
					label: 'ageRestriction',
					id: 'id2',
					dataTestId: 'data2',
				},
			];

			const result: RestrictionsDto | undefined = component['mapRestrictionsValues']();

			const expectedRestrictionsDto: RestrictionsDto = new RestrictionsDto();
			expectedRestrictionsDto.frequencyOfUse = FrequencyOfUse.WEEKLY;
			expectedRestrictionsDto.ageRestriction = 23;

			expect(result).toEqual(expectedRestrictionsDto);
		});

		it('should return undefined when no form values are present', () => {
			component.createOfferForm = new FormGroup({
				frequencyOfUseValue: new FormControl(null),
				ageRestrictionValue: new FormControl(null),
				ageRestrictionOtherValue: new FormControl(null),
			});

			component.restrictionsData = [
				{
					formControl: 'frequencyOfUse',
					label: 'label1',
					id: 'id1',
					dataTestId: 'data1',
				},
				{
					formControl: 'ageRestriction',
					label: 'label1',
					id: 'id1',
					dataTestId: 'data1',
				},
				{
					formControl: 'ageRestrictionOther',
					label: 'label1',
					id: 'id1',
					dataTestId: 'data1',
				},
			];

			const result = component['mapRestrictionsValues']();

			expect(result).toBeUndefined();
		});

		it('should return undefined if no restrictions are set', () => {
			component.restrictionsData = [];

			const result = component['mapRestrictionsValues']();

			expect(result).toBeUndefined();
		});

		it('should map restrictions values correctly', () => {
			const restrictionsData = [
				{
					formControl: 'ageRestriction',
					label: 'label1',
					id: 'id1',
					dataTestId: 'data1',
				},
			];

			const createOfferForm = formBuilder.group({
				ageRestrictionValue: '18',
				ageRestrictionOtherValue: '21',
			});

			component.restrictionsData = restrictionsData;
			component.createOfferForm = createOfferForm;

			const result = component['mapRestrictionsValues']();

			expect(result).toBeDefined();
			expect(result?.ageRestriction).toBe('18');
		});

		it('should map age restriction other value correctly', () => {
			const restrictionsData = [
				{
					formControl: 'ageRestriction',
					label: 'label1',
					id: 'id1',
					dataTestId: 'data1',
				},
			];

			const createOfferForm = formBuilder.group({
				ageRestrictionValue: 'offer.ageRestriction.other',
				ageRestrictionOtherValue: '21',
			});

			component.restrictionsData = restrictionsData;
			component.createOfferForm = createOfferForm;

			const result = component['mapRestrictionsValues']();

			expect(result).toBeDefined();
			expect(result?.ageRestriction).toBe('21');
		});

		it('should set clickedOutsideField to true if shouldHideRestrictionField returns false', () => {
			jest.spyOn(component, 'shouldHideRestrictionField').mockReturnValue(false);
			component.onClick();
			expect(component.clickedOutsideFieldPrice).toBe(true);
		});

		it('should not set clickedOutsideField if shouldHideRestrictionField returns true', () => {
			jest.spyOn(component, 'shouldHideRestrictionField').mockReturnValue(true);
			component.onClick();
			expect(component.clickedOutsideFieldPrice).toBeFalsy();
		});

		it('should set error to form field when timeTo and timeFrom values are missing', () => {
			const value = 'some value';
			component['setErrorToFormField'] = jest.fn();

			component.createOfferForm = new FormGroup({
				timeTo: new FormControl(''),
				timeFrom: new FormControl(''),
			});

			component['manageTimeSlotsRestriction'](value);

			expect(component['setErrorToFormField']).toHaveBeenCalledWith(RestrictionFormFields.timeSlots);
		});

		it('should not set error to form field when timeTo and timeFrom values are present', () => {
			const value = 'some value';
			component['setErrorToFormField'] = jest.fn();
			component.createOfferForm = new FormGroup({
				timeTo: new FormControl('10:00'),
				timeFrom: new FormControl('09:00'),
			});

			component['manageTimeSlotsRestriction'](value);

			expect(component['setErrorToFormField']).not.toHaveBeenCalled();
		});

		it('should set error to form field when maxPrice and minPrice values are missing', () => {
			const value = 'some value';
			component.createOfferForm = new FormGroup({
				maxPrice: new FormControl(''),
				minPrice: new FormControl(''),
			});

			component['setErrorToFormField'] = jest.fn();

			component['managePriceRangeRestriction'](value);

			expect(component['setErrorToFormField']).toHaveBeenCalledWith(RestrictionFormFields.priceRange);
		});

		it('should not set error to form field when maxPrice and minPrice values are present', () => {
			const value = 'some value';
			component.createOfferForm = new FormGroup({
				maxPrice: new FormControl('100'),
				minPrice: new FormControl('50'),
			});

			component['setErrorToFormField'] = jest.fn();

			component['managePriceRangeRestriction'](value);

			expect(component['setErrorToFormField']).not.toHaveBeenCalled();
		});

		test.each([
			[
				'should map time slots when both timeFrom and timeTo values are present',
				'09:00',
				'10:00',
				{
					timeFrom: '2024-07-26T12:00:00.000Z',
					timeTo: '2024-07-26T12:00:00.000Z',
				},
			],
			['should not map time slots when both timeFrom and timeTo values are missing', '', '', undefined],
			['should not map price range when both minPrice and maxPrice values are missing', '', '', undefined],
		])('%s', (_, timeFromValue, timeToValue, expected) => {
			const mockToUtcTime: (date: Date) => Date = (date) => {
				return new Date(Date.UTC(2024, 6, 26, 12, 0, 0));
			};

			jest.spyOn(component as any, 'toUtcTime').mockImplementation(mockToUtcTime as any);

			component.createOfferForm = new FormGroup({
				timeFrom: new FormControl(timeFromValue),
				timeTo: new FormControl(timeToValue),
			});

			const result = component['mapRestrictionsValues']();

			expect(result).toEqual(expected);
		});

		it('should map price range when both minPrice and maxPrice values are present', () => {
			component.createOfferForm = new FormGroup({
				minPrice: new FormControl('50'),
				maxPrice: new FormControl('100'),
			});

			const result = component['mapRestrictionsValues']();

			expect(result?.minPrice).toEqual('50');
			expect(result?.maxPrice).toEqual('100');
		});

		it.each([
			['frequencyOfUse', false, true, 'SINGLE_USE'],
			['someOtherType', false, true, ''],
			['frequencyOfUse', true, true, ''],
		])('should set frequencyOfUseControl value correctly', (type, isHidden, isDefaultSelected, expectedValue) => {
			const frequencyOfUseControl = formBuilder.control(isDefaultSelected ? '' : 'Some value');
			const spy = jest.spyOn(component, 'shouldHideRestrictionField').mockReturnValue(isHidden);
			component.createOfferForm = formBuilder.group({
				frequencyOfUseValue: frequencyOfUseControl,
			});

			component['manageRadioButtonOption'](type, 'someValue', 'someValueControl');

			expect(frequencyOfUseControl.value).toBe(expectedValue);
			expect(spy).toHaveBeenCalled();

			spy.mockRestore();
		});

		it.each([
			['ageRestriction', false, true, 18],
			['someOtherType', false, true, ''],
			['ageRestriction', true, true, ''],
		])('should set ageRestrictionControl value correctly', (type, isHidden, isDefaultSelected, expectedValue) => {
			const ageRestrictionControl = formBuilder.control(isDefaultSelected ? '' : 'Some value');
			const spy = jest.spyOn(component, 'shouldHideRestrictionField').mockReturnValue(isHidden);
			component.createOfferForm = formBuilder.group({
				ageRestrictionValue: ageRestrictionControl,
			});

			component['manageRadioButtonOption'](type, 'someValue', 'someValueControl');

			expect(ageRestrictionControl.value).toBe(expectedValue);
			expect(spy).toHaveBeenCalled();

			spy.mockRestore();
		});

		it('should set error if value is provided but valueControl is empty or isOtherValueSelected is true', () => {
			const setErrorSpy = jest.spyOn(component as any, 'setErrorToFormField');

			component['manageRadioButtonOption']('type', 'value', '');

			expect(setErrorSpy).toHaveBeenCalledWith('type');
		});

		it('should not attempt reactivation if an offer is being created', () => {
			jest.spyOn(component, 'reactivateOffer');
			jest.spyOn(offerServiceMock, 'reactivateOffer');

			component.reactivateOffer();

			expect(offerServiceMock.reactivateOffer).not.toHaveBeenCalled();
		});

		it('should not attempt to GET an offer if there is no offerId provided', () => {
			jest.spyOn(offerServiceMock, 'getFullOffer');

			component['initReactivateOffer']();

			expect(offerServiceMock.getFullOffer).not.toHaveBeenCalled();
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
			expect(result).toBe(expectedDate);
		});
	});

	describe('reactivate offer process', () => {
		beforeEach(() => {
			component = setup({ offerToReactivate: '29' });
		});

		it('should call initReactivateOffer when an offer id is provided', () => {
			jest.spyOn(component as any, 'initReactivateOffer');

			component.ngOnInit();

			expect(component['initReactivateOffer']).toHaveBeenCalled();
		});

		it('should call reactivateOffer if the dialog confirm button is pressed when reactivating an offer', fakeAsync(() => {
			tick();
			fixture.detectChanges();

			jest.spyOn(component, 'reactivateOffer');

			component.createOfferForm.controls['startDate'].setValue(new Date('2023-01-01'));
			component.createOfferForm.controls['expirationDate'].setValue(new Date('2025-12-31'));

			component.confirmDialog();

			expect(component.reactivateOffer).toHaveBeenCalled();

			flush();
		}));

		it('should take the GrantDtos of the offer and return their ids', () => {
			jest.spyOn(component as any, 'getAcceptedGrantsIds');

			const grants: GrantDto[] = [
				{
					id: '29',
					title: 'Grant1',
					description: 'Description',
					amount: 20,
					createFor: GrantHolder.PASS_CHILD,
					startDate: new Date('2023-12-06'),
					expirationDate: new Date('2023-12-31'),
					selected: false,
					isCheckboxDisabled: false,
				},
				{
					id: '12',
					title: 'Grant2',
					description: 'Description',
					amount: 20,
					createFor: GrantHolder.PASS_CHILD,
					startDate: new Date('2023-12-06'),
					expirationDate: new Date('2023-12-31'),
					selected: false,
					isCheckboxDisabled: false,
				},
				{
					id: '11',
					title: 'Grant3',
					description: 'Description',
					amount: 20,
					createFor: GrantHolder.PASS_CHILD,
					startDate: new Date('2023-12-06'),
					expirationDate: new Date('2023-12-31'),
					selected: false,
					isCheckboxDisabled: false,
				},
			];

			const expectedGrantIds = ['29', '12', '11'];

			component['getAcceptedGrantsIds'](grants);

			expect(component['getAcceptedGrantsIds']).toHaveReturnedWith(expectedGrantIds);
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

				expect(component.shouldDisplayReactivationAlert).toHaveReturnedWith(true);
			});

			it('should not display alert when an offer is being reactivated but it has already been dismissed', () => {
				jest.spyOn(component, 'shouldDisplayReactivationAlert');
				component.alertDismissed = true;
				component.shouldDisplayReactivationAlert();

				expect(component.shouldDisplayReactivationAlert).toHaveReturnedWith(false);
			});
		});

		describe('after reactivating', () => {
			it('should display approval popup for offer with grants', () => {
				component.shouldDisplayApprovalMessage = true;
				jest.spyOn(translateService, 'instant');
				jest.spyOn(toastrService, 'success');
				jest.spyOn(component as any, 'displayPopupForOfferWithGrant');

				component['onOfferReactivated']();

				expect(component['displayPopupForOfferWithGrant']).toHaveBeenCalled();
				expect(translateService.instant).not.toHaveBeenCalled();
				expect(toastrService.success).not.toHaveBeenCalled();
			});

			it('should display approval toaster for offers without grants', () => {
				component.shouldDisplayApprovalMessage = false;
				jest.spyOn(translateService, 'instant');
				jest.spyOn(toastrService, 'success');
				jest.spyOn(component as any, 'displayPopupForOfferWithGrant');

				component['onOfferReactivated']();

				expect(component['displayPopupForOfferWithGrant']).not.toHaveBeenCalled();
				expect(translateService.instant).toHaveBeenCalled();
				expect(toastrService.success).toHaveBeenCalled();
			});
		});

		it('should mark the form as invalid if it has not been created yet', () => {
			jest.spyOn(component as any, 'isControlInvalid');
			component.createOfferForm = null as any;

			component['isControlInvalid']('test');

			expect(component['isControlInvalid']).toHaveReturnedWith(true);
		});

		it('should not do anything if the form has not been created yet and restriction values change', () => {
			jest.spyOn(component as any, 'onRestrictionValueChanges');
			component.createOfferForm = null as any;

			component['onRestrictionValueChanges']();

			expect(component['onRestrictionValueChanges']).toHaveReturnedWith(undefined);
		});

		it('should set the proper fields for restrictions', () => {
			jest.spyOn(component as any, 'setFieldsSpecificToRestrictions');

			const restrictions: RestrictionsDto = {
				ageRestriction: 18,
				minPrice: 5,
				maxPrice: 10,
			};

			const expectedRestrictionValue = {
				frequencyOfUse: false,
				priceRange: true,
				timeSlots: false,
				ageRestriction: true,
				offerCombinations: false,
				residenceRestriction: false,
			};

			component['setFieldsSpecificToRestrictions'](restrictions);

			expect(component['selectedRestrictionValue']).toEqual(expectedRestrictionValue);
		});
	});

	test('should convert Date to ISO string when time is provided', () => {
		const mockToUtcTime: (date: Date) => Date = (date) => {
			return new Date(Date.UTC(2024, 6, 26, 12, 0, 0));
		};

		const timeFrom = '2024-07-26T12:00:00.000Z';
		const timeTo = '2024-07-26T12:00:00.000Z';

		jest.spyOn(component as any, 'convertTimeToCompatibleDate').mockImplementation(mockToUtcTime as any);

		component.createOfferForm = new FormGroup({
			timeFrom: new FormControl(timeFrom),
			timeTo: new FormControl(timeTo),
		});

		const result = component['convertTimeToCompatibleDate']();

		expect(result).toEqual(new Date(Date.UTC(2024, 6, 26, 12, 0, 0)));
	});

	test('should return null when time is not provided', () => {
		const mockToUtcTime: (date: Date) => Date | null = (date) => {
			return null;
		};

		const timeFrom = '2024-07-26T12:00:00.000Z';
		const timeTo = '2024-07-26T12:00:00.000Z';

		jest.spyOn(component as any, 'convertTimeToCompatibleDate').mockImplementation(mockToUtcTime as any);

		component.createOfferForm = new FormGroup({
			timeFrom: new FormControl(timeFrom),
			timeTo: new FormControl(timeTo),
		});

		const result = component['convertTimeToCompatibleDate']();

		expect(result).toEqual(null);
	});

	describe('toUtcTime', () => {
		it('should convert a given date to UTC time', () => {
			const localDate = new Date('2024-07-29T10:00:00');
			const utcDate = component['toUtcTime'](localDate);

			const expectedUtcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

			expect(utcDate.getTime()).toBe(expectedUtcDate.getTime());
		});
	});

	describe('convertTimeToCompatibleDate', () => {
		it('should return null if no date is provided', () => {
			const isoString = component['convertTimeToCompatibleDate'](undefined);

			expect(isoString).toBeNull();
		});

		it('should return free entry placeholder when offerType is freeEntry', () => {
			const offerType = OfferTypeEnum.freeEntry;
			const translation = 'translated free entry';

			jest.spyOn(translateService, 'instant').mockReturnValue(translation);
			const result = component.getAmountPlaceholder(offerType);
			expect(translateService.instant).toHaveBeenCalledWith('offer.amountFreeEntryPlaceholder');
			expect(result).toBe(translation);
		});
	});

	describe('onTypeChange method', () => {
		beforeEach(() => {
			component = setup(null);
		});
	
		it('should reset the offerTypeId form value', () => {
			jest.spyOn(component as any, 'resetFormValue');
	
			component.onTypeChange();
	
			expect(component["resetFormValue"]).toHaveBeenCalledWith(CreateOfferFormFields.offerTypeId);
		});
	
		it('should reset the amount form value to an empty string', () => {
			jest.spyOn(component as any, 'resetFormValue');
	
			component.onTypeChange();
	
			expect(component["resetFormValue"]).toHaveBeenCalledWith(CreateOfferFormFields.amount, '');
		});
	
		it('should set selectedOfferTypeId to null', () => {
			component.selectedOfferTypeId = OfferTypeEnum.credit;
			component.onTypeChange();
	
			expect(component.selectedOfferTypeId).toBeNull();
		});
	
		it('should update the updatedSource with visible dropdown items', () => {
			component.dropdownSource = [
				{ offerTypeId: 1, offerTypeLabel: 'Type1', visible: true },
				{ offerTypeId: 2, offerTypeLabel: 'Type2', visible: false },
				{ offerTypeId: 3, offerTypeLabel: 'Type3', visible: true }
			];
	
			component.onTypeChange();
	
			expect(component.updatedSource).toEqual([
				{ offerTypeId: 1, offerTypeLabel: 'Type1', visible: true },
				{ offerTypeId: 3, offerTypeLabel: 'Type3', visible: true }
			]);
		});
	});
	
});
