import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FormUtil } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { AgeRestrictionComponent } from './age-restriction.component';

describe('AgeRestrictionComponent', () => {
	let component: AgeRestrictionComponent;
	let fixture: ComponentFixture<AgeRestrictionComponent>;
	let formBuilder: FormBuilder;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AgeRestrictionComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [TranslateModule.forRoot()],
			providers: [FormBuilder],
		}).compileComponents();

		fixture = TestBed.createComponent(AgeRestrictionComponent);
		component = fixture.componentInstance;
		component.createOfferForm = new FormGroup({
			ageRestriction: new FormControl(''),
			ageRestrictionOtherValue: new FormControl(''),
		});

		formBuilder = TestBed.inject(FormBuilder);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it.each([
		['offer.ageRestriction.other', 'offer.ageRestriction.other'],
		['offer.ageRestriction.aboveEighteen', 18],
		['some.other.translation', 21],
	])('should return correct value for translation: %s', (translationKey, expected) => {
		const result = component.mapToAgeRestriction(translationKey);
		expect(result).toBe(expected);
	});

	it('should return the correct age based on the input value', () => {
		const testCases: [string, number][] = [
			['offer.ageRestriction.aboveEighteen', 18],
			['offer.ageRestriction.aboveTwentyTwo', 21],
		];

		testCases.forEach(([inputValue, expectedOutput]) => {
			const result = component.mapToAgeRestriction(inputValue);
			expect(result).toEqual(expectedOutput);
		});
	});

	it('should call onValueChanged', () => {
		jest.spyOn(component, 'checkOtherFieldState');
		component.onValueChanged('someValue');
		expect(component.checkOtherFieldState).toHaveBeenCalledWith('someValue');
	});

	it('should call getAgeRestrictionData', () => {
		const result = component.getAgeRestrictionData();
		expect(result).toEqual([
			'offer.ageRestriction.aboveEighteen',
			'offer.ageRestriction.aboveTwentyOne',
			'offer.ageRestriction.other',
		]);
	});

	it('should call onRestrictionTypeChange', () => {
		component.onRestrictionTypeChange('ageRestriction', 'someValue');
		expect(component.isOtherValueSelected).toBeFalsy();
	});

	it('should call checkOtherFieldState', () => {
		const setErrorSpy = jest.spyOn(component as any, 'setErrorToFormField');

		component.checkOtherFieldState('');

		expect(setErrorSpy).toHaveBeenCalledWith('ageRestrictionValue');
	});

	it('should set error to form field', () => {
		const mockForm = new FormGroup({
			ageRestrictionValue: new FormControl('Test', []),
		});

		component.createOfferForm = mockForm;
		component['setErrorToFormField']('ageRestrictionValue');

		const ageRestrictionValueControl = component.createOfferForm.get('ageRestrictionValue');

		expect(ageRestrictionValueControl).toBeTruthy();
		expect(ageRestrictionValueControl?.errors).toEqual({ required: true });
	});

	it('should handle restriction type change', () => {
		const mockForm = new FormGroup({
			ageRestrictionValue: new FormControl('', []),
		});
		component.createOfferForm = mockForm;

		component.onRestrictionTypeChange('ageRestriction', 'other');
		expect(component.isOtherValueSelected).toBeFalsy();

		component.createOfferForm.get('ageRestrictionOtherValue')?.setValue('some value');
		component.onRestrictionTypeChange('ageRestriction', '');
		expect(component.createOfferForm.get('ageRestrictionOtherValue')?.value).toBeFalsy();
		expect(component.isOtherValueSelected).toBeFalsy();

		component.onRestrictionTypeChange('ageRestriction', '');
		expect(component.isOtherValueSelected).toBeFalsy();

		component.onRestrictionTypeChange('ageRestriction', 'some value');
		expect(component.isOtherValueSelected).toBeFalsy();
		expect(component.createOfferForm.get('ageRestrictionOtherValue')?.value).toBeFalsy();
	});

	it('should set isOtherValueSelected to true if value is "other"', () => {
		const mockForm = new FormGroup({
			ageRestrictionValue: new FormControl('', []),
		});
		component.createOfferForm = mockForm;

		component.onRestrictionTypeChange('ageRestriction', 'offer.ageRestriction.other');
		expect(component.isOtherValueSelected).toBeTruthy();
	});

	it('should reset ageRestrictionOtherValue control when it has a value', () => {
		const mockForm = new FormGroup({
			ageRestrictionOtherValue: new FormControl('some value', []),
		});
		component.createOfferForm = mockForm;

		const resetFormControlSpy = jest.spyOn(FormUtil, 'resetFormControl');

		component.onRestrictionTypeChange('ageRestriction', 'some value');

		expect(resetFormControlSpy).toHaveBeenCalledWith('ageRestrictionOtherValue', component.createOfferForm);

		resetFormControlSpy.mockRestore();
	});

	it('should return early if control value is null', () => {
		const mockForm = new FormGroup({
			ageRestrictionValue: new FormControl(null, []),
		});
		component.createOfferForm = mockForm;

		const setValidatorsSpy = jest.spyOn<any, any>(mockForm.get('ageRestrictionValue'), 'setValidators');
		const setErrorsSpy = jest.spyOn<any, any>(mockForm.get('ageRestrictionValue'), 'setErrors');

		component['setErrorToFormField']('ageRestrictionValue');

		expect(setValidatorsSpy).not.toHaveBeenCalled();
		expect(setErrorsSpy).not.toHaveBeenCalled();

		setValidatorsSpy.mockRestore();
		setErrorsSpy.mockRestore();
	});

	it('should not check entry if form is readonly', () => {
		component.isReadonly = true;

		jest.spyOn(component, 'shouldCheckEntry');

		component.shouldCheckEntry('offer.ageRestriction.aboveTwentyOne');

		expect(component.shouldCheckEntry).toHaveReturnedWith(false);
	});

	describe('shouldDisplayOtherAgeField', () => {
		it('should return true if isOtherValueSelected is true', () => {
			component.isOtherValueSelected = true;

			jest.spyOn(component, 'shouldDisplayOtherAgeField');

			component.shouldDisplayOtherAgeField();

			expect(component.shouldDisplayOtherAgeField).toHaveReturnedWith(true);
		});

		it('should return false if there is no age in the "Other" field', () => {
			jest.spyOn(component, 'shouldDisplayOtherAgeField');

			component.shouldDisplayOtherAgeField();

			expect(component.shouldDisplayOtherAgeField).toHaveReturnedWith(false);
		});
	});
});
