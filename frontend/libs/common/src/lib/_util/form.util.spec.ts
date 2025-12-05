import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CentricCounterMessages } from '@windmill/ng-windmill';

import { FormUtil } from './form.util';

describe('FormUtil', () => {
	let formGroup: FormGroup;
	let form: FormGroup;
	let formGroupRestrictions: FormGroup;

	class MockTranslateService {
		instant(key: string): string {
			const translations: any = {
				'general.label.charactersLeft': 'Characters left',
				'general.label.charactersOverTheLimit': 'Characters over the limit',
			};
			return translations[key] || key;
		}
	}

	beforeEach(() => {
		formGroup = new FormBuilder().group({
			email: ['', Validators.compose([Validators.required, FormUtil.validateEmail(true)])],
			password: ['', FormUtil.validatePassword],
			confirmPassword: [''],
			kvk: [''],
			telephone: ['', FormUtil.validateTelephone],
			otherField: [''],
		});

		form = new FormGroup({
			firstField: new FormControl(),
			secondField: new FormControl(),
		});

		formGroupRestrictions = new FormGroup({
			ageRestriction: new FormControl(),
			ageRestrictionValue: new FormControl(),
			ageRestrictionOtherValue: new FormControl(),
		});
	});

	it('should clear validators and errors but not reset value when resetValue is false', () => {
		const formRestr = new FormGroup({
			testField: new FormControl('initialValue'),
			testFieldValue: new FormControl('initialValue'),
		});
		formRestr.get('testField')?.setValidators([Validators.required]);
		formRestr.get('testField')?.setErrors({ required: true });

		FormUtil.clearRestrictionValidatorsAndErrors(formRestr, 'testField', false);

		expect(formRestr.get('testFieldValue')?.value).toBe('initialValue');
	});

	it('should return true if both fields are untouched and empty when clicked outside', () => {
		const result = FormUtil.validationFunctionErrorMinFieldCompleted('firstField', 'secondField', true, form);
		expect(result).toBe(true);
	});
	it('should return true if both fields have value and the first value is bigger than the second', () => {
		form.get('firstField')?.setValue(20);
		form.get('secondField')?.setValue(10);
		const result = FormUtil.validationFunctionErrorMinFieldCompleted('firstField', 'secondField', true, form);
		expect(result).toBe(true);
	});
	it('should return true if only one field is touched and empty when clicked outside', () => {
		form.get('firstField')?.markAsTouched();
		const result = FormUtil.validationFunctionErrorMinFieldCompleted('firstField', 'secondField', true, form);
		expect(result).toBe(true);
	});

	it('should return false if both fields are touched and at least one is filled when clicked outside', () => {
		form.get('firstField')?.markAsTouched();
		form.get('firstField')?.setValue('some value');
		const result = FormUtil.validationFunctionErrorMinFieldCompleted('firstField', 'secondField', true, form);
		expect(result).toBe(false);
	});

	it('should check for control with required errors', () => {
		formGroup.get('email')?.setValue('');
		expect(FormUtil.hasFormControlRequiredErrors('email', formGroup)).toBe(true);
	});

	it('should return false if the control does not have a "required" error', () => {
		const controlName = 'password';

		const result = FormUtil.hasFormControlRequiredErrors(controlName, formGroup);

		expect(result).toBe(undefined);
	});

	it('should return false if the control is not found in the form', () => {
		const controlName = 'nonExistentControl';

		const result = FormUtil.hasFormControlRequiredErrors(controlName, formGroup);

		expect(result).toBe(undefined);
	});

	it('should check for control with required errors and being touched', () => {
		formGroup.get('email')?.setValue('');
		formGroup.get('email')?.markAsTouched();
		expect(FormUtil.hasControlRequiredErrorAndTouched('email', formGroup)).toBe(true);
	});

	it('should check for control with non-required errors and non-being touched', () => {
		formGroup.get('email')?.setValue('email@domain.com');
		formGroup.get('email')?.markAsUntouched();
		expect(FormUtil.hasControlRequiredErrorAndTouched('email', formGroup)).toBe(undefined);
	});

	it('should return true if the control has "required" error, is touched, and has a value of null or an empty string', () => {
		const controlName = 'email';
		const control = formGroup.get(controlName);
		control?.setErrors({ required: true });
		control?.markAsTouched();
		control?.setValue(null);

		const result = FormUtil.hasControlRequiredErrorAndTouched(controlName, formGroup);

		expect(result).toBe(true);
	});

	it('should return false if the control has "required" error but is not touched', () => {
		const controlName = 'email';
		const control = formGroup.get(controlName);
		control?.setErrors({ required: true });

		const result = FormUtil.hasControlRequiredErrorAndTouched(controlName, formGroup);

		expect(result).toBe(false);
	});

	it('should return false if the control has "required" error but has a non-empty value', () => {
		const controlName = 'controlName';
		const control = formGroup.get(controlName);
		control?.setErrors({ required: true });
		control?.markAsTouched();
		control?.setValue('someValue');

		const result = FormUtil.hasControlRequiredErrorAndTouched(controlName, formGroup);

		expect(result).toBe(undefined);
	});

	it('should return false if the control does not have "required" error', () => {
		const controlName = 'anotherControl';

		const result = FormUtil.hasControlRequiredErrorAndTouched(controlName, formGroup);

		expect(result).toBe(undefined);
	});

	it('should return false if the control is not found in the form', () => {
		const controlName = 'nonExistentControl';

		const result = FormUtil.hasControlRequiredErrorAndTouched(controlName, formGroup);

		expect(result).toBe(undefined);
	});

	it('should check for control with genericValidationFunctionError', () => {
		formGroup.get('otherField')?.setValue('validValue');
		formGroup.get('otherField')?.markAsTouched();
		expect(FormUtil.genericValidationFunctionError('otherField', formGroup)).toBe(false);
	});

	it('should return false when the form control does not exist on genericValidationFunctionError', () => {
		formGroup.get('random')?.setValue('validValue');
		expect(FormUtil.genericValidationFunctionError('random', formGroup)).toBe(false);
	});

	it('should return false for an invalid form control', () => {
		formGroup.get('kvk')?.setValue('invalid value');
		const result = FormUtil.validationFunctionErrorForKVK(formGroup);
		expect(result).toBe(false);
	});

	it('should return true for a form control with a length less than 8', () => {
		formGroup.get('kvk')?.setValue('1234567');
		const result = FormUtil.validationFunctionErrorForKVK(formGroup);
		expect(result).toBe(true);
	});

	it('should return false for a valid form control', () => {
		formGroup.get('kvk')?.setValue('12345678');
		const result = FormUtil.validationFunctionErrorForKVK(formGroup);
		expect(result).toBe(false);
	});

	it('should return false for an empty form control', () => {
		const result = FormUtil.validationFunctionErrorForKVK(formGroup);
		expect(result).toBe(false);
	});

	it('should return unefined for when kvk formControl does not exist', () => {
		const testformGroup = new FormBuilder().group({
			noKvk: [''],
		});
		const result = FormUtil.validationFunctionErrorForKVK(testformGroup);
		expect(result).toBeUndefined();
	});

	it('should validate password correctly when invalid', () => {
		const passwordControl = formGroup.get('password');
		if (passwordControl) {
			passwordControl.setValue('WeakPwd');
			expect(FormUtil.validatePassword(passwordControl)).toEqual({ validPassword: true });
		} else {
			fail('Password control not found in formGroup');
		}
	});

	it('should validate password correctly when valid', () => {
		const passwordControl = formGroup.get('password');
		if (passwordControl) {
			passwordControl.setValue('StrongPass1@');
			expect(FormUtil.validatePassword(passwordControl)).toBeNull();
		} else {
			fail('Password control not found in formGroup');
		}
	});

	it('should check for invalid form control', () => {
		formGroup.get('email')?.setValue('invalidEmail');
		formGroup.get('email')?.markAsTouched();
		expect(FormUtil.isInvalidForm(formGroup.get('email'))).toBe(true);
	});

	it('should validate email correctly', () => {
		const emailControl = formGroup.get('email');
		if (emailControl) {
			emailControl.setValue('invalidEmail');
			expect(FormUtil.validateEmail(true)(emailControl)).toEqual({ validEmail: true });
		} else {
			fail('email control not found in formGroup');
		}
	});

	it('should validate zip code correctly when wrong', () => {
		const kvkControl = formGroup.get('kvk');
		if (kvkControl) {
			kvkControl.setValue('12345');
			expect(FormUtil.validatedZip(kvkControl)).toEqual({ validZip: true });
		} else {
			fail('kvk control not found in formGroup');
		}
	});

	it('should validate zip code correctly when valid', () => {
		const kvkControl = formGroup.get('kvk');
		if (kvkControl) {
			kvkControl.setValue('1234ab');
			expect(FormUtil.validatedZip(kvkControl)).toBeNull();
		} else {
			fail('kvk control not found in formGroup');
		}
	});

	it('should validate telephone correctly when phone incorect', () => {
		formGroup.get('telephone')?.setValue('12345');

		const telephoneControl = formGroup.get('telephone');
		if (telephoneControl) {
			telephoneControl.setValue('12345');
			expect(FormUtil.validateTelephone(telephoneControl)).toEqual({ validTelephone: true });
		} else {
			fail('telephone control not found in formGroup');
		}
	});

	it('should validate telephone correctly when phone number is corect', () => {
		formGroup.get('telephone')?.setValue('+31123456789');

		const telephoneControl = formGroup.get('telephone');
		if (telephoneControl) {
			telephoneControl.setValue('+31123456789');
			expect(FormUtil.validateTelephone(telephoneControl)).toBeNull();
		} else {
			fail('telephone control not found in formGroup');
		}
	});

	it('should validate non-required fields', () => {
		formGroup.get('telephone')?.setValue('invalidTelephone');
		const telephoneControl = formGroup.get('telephone');
		if (telephoneControl) {
			telephoneControl.setValue('invalidTelephone');
		}

		expect(FormUtil.formControlValidatorNonRequiredFields('telephone', formGroup)).toBe(true);
	});

	it('should validate non-required email', () => {
		formGroup.get('email')?.setValue('invalidEmail');
		const telephoneControl = formGroup.get('email');
		if (telephoneControl) {
			telephoneControl.setValue('invalidEmail');
		}

		expect(FormUtil.formControlValidatorNonRequiredFields('email', formGroup)).toBe(true);
	});

	it('should return when field not preset', () => {
		expect(FormUtil.formControlValidatorNonRequiredFields('notExistingName', formGroup)).toBeUndefined();
	});

	it('should return is field value is null', () => {
		formGroup.get('telephone')?.setValue('invalidTelephone');
		const telephoneControl = formGroup.get('telephone');
		if (telephoneControl) {
			telephoneControl.setValue(null);
		}

		expect(FormUtil.formControlValidatorNonRequiredFields('telephone', formGroup)).toBe(undefined);
	});

	it('should get the email error message', () => {
		formGroup.get('email')?.setErrors({ required: true });
		expect(FormUtil.getEmailErrorMessage(formGroup)).toBe('genericFields.email.requiredEmail');

		formGroup.get('email')?.setErrors({ validEmail: true });
		expect(FormUtil.getEmailErrorMessage(formGroup)).toBe('genericFields.email.validEmail');

		formGroup.get('email')?.setErrors(null);
		expect(FormUtil.getEmailErrorMessage(formGroup)).toBe('');
	});

	it('should return false when control does not exist in the form', () => {
		const controlName = 'nonExistentControl';
		const result = FormUtil.validationFunctionError(controlName, formGroup);
		expect(result).toBe(false);
	});

	it('should return false when form is valid', () => {
		formGroup.get('someControl')?.setErrors(null);
		const controlName = 'someControl';
		const result = FormUtil.validationFunctionError(controlName, formGroup);
		expect(result).toBe(false);
	});

	it('should return true if formControl is invalid', () => {
		const controlName = 'telephone';
		const formControl = formGroup.get(controlName);
		formControl?.setErrors({ someError: true });

		const result = FormUtil.validationFunctionError(controlName, formGroup);

		expect(result).toBe('');
	});

	it('should return false when control is confirmPassword and form has a "fieldsMismatch" error and value', () => {
		formGroup.get('confirmPassword')?.setErrors({ fieldsMismatch: true });
		formGroup.get('confirmPassword')?.setValue('password123');
		formGroup.get('password')?.setValue('password123');
		const controlName = 'confirmPassword';
		const result = FormUtil.validationFunctionError(controlName, formGroup);
		expect(result).toBe(false);
	});

	it('should return an empty string when no errors are present on confirmPassword', () => {
		formGroup.get('confirmPassword')?.setValue('password123');
		formGroup.get('password')?.setValue('password123');
		const errorMessage = FormUtil.getConfirmPasswordErrorMessage(formGroup);
		expect(errorMessage).toBe('');
	});

	it('should return specific message string when confirmPassword not present', () => {
		formGroup.get('confirmPassword')?.setErrors({ required: true });
		const errorMessage = FormUtil.getConfirmPasswordErrorMessage(formGroup);
		expect(errorMessage).toBe('genericFields.password.confirmPasswordRequired');
	});

	it('should return specific message string when confirmPassword fieldsMismatch', () => {
		formGroup?.setErrors({ fieldsMismatch: true });
		const errorMessage = FormUtil.getConfirmPasswordErrorMessage(formGroup);
		expect(errorMessage).toBe('genericFields.password.confirmPasswordMatch');
	});

	it('should return expiration date for future start date', () => {
		const futureStartDate = '2024-02-01';

		const result = FormUtil.calculateExpirationDate(futureStartDate, false);

		expect(result instanceof Date).toBe(true);
		expect(result.getTime()).toBeGreaterThan(new Date().getTime());
	});

	it('should return current date +1 day for past start date', () => {
		const pastStartDate = '2020-01-01';
		const expectedDate = new Date();
		expectedDate.setDate(expectedDate.getDate() + 1);

		const result = FormUtil.calculateExpirationDate(pastStartDate, false);

		expect(result instanceof Date).toBe(true);
		expect(result).toEqual(expectedDate);
	});

	it('should clear validators and errors for a given field', () => {
		const field = 'ageRestriction';
		formGroup.get(field)?.setValidators([Validators.required]);
		formGroup.get(field)?.setValue('Some value');
		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, field);

		expect(formGroup.get(field)?.errors).toBeUndefined();
		expect(formGroup.get(field)?.validator).toBeUndefined();
	});

	it('should reset control values if resetValue is true', () => {
		const field = 'ageRestriction';
		const valueField = `${field}Value`;
		formGroup.get(field)?.setValue('Some value');
		formGroup.get(valueField)?.setValue('Some value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, field, true);

		expect(formGroup.get(field)?.value).toBeUndefined();
		expect(formGroup.get(valueField)?.value).toBeUndefined();
	});

	it('should reset other related fields if field is "ageRestriction"', () => {
		formGroup.get('ageRestrictionOtherValue')?.setValue('Some value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, 'ageRestriction', true);

		expect(formGroup.get('ageRestrictionOtherValue')?.value).toBeUndefined();
	});

	it('should not reset values if resetValue is false', () => {
		const field = 'ageRestriction';
		const valueField = `${field}Value`;
		formGroup.get(field)?.setValue('Some value');
		formGroup.get(valueField)?.setValue('Some value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, field, false);

		expect(formGroup.get(field)?.value).not.toBeNull();
		expect(formGroup.get(valueField)?.value).not.toBeNull();
	});

	it('should reset control and value if field is "ageRestriction" and other value exists', () => {
		const ageRestrictionField = 'ageRestriction';
		const otherValueField = 'ageRestrictionOtherValue';

		formGroup.get(ageRestrictionField)?.setValue('Some value');
		formGroup.get(otherValueField)?.setValue('Other value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, ageRestrictionField, true);

		expect(formGroup.get(ageRestrictionField)?.value).toBeUndefined();
		expect(formGroup.get(otherValueField)?.value).toBeUndefined();
	});

	it('should not reset control if field is "ageRestriction" but other value does not exist', () => {
		const ageRestrictionField = 'ageRestriction';
		const otherValueField = 'ageRestrictionOtherValue';

		formGroup.get(ageRestrictionField)?.setValue('Some value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, ageRestrictionField, true);

		expect(formGroup.get(ageRestrictionField)?.value).toBeUndefined();
		expect(formGroup.get(otherValueField)?.value).toBeUndefined();
	});

	it('should reset form control to null', () => {
		const field = 'ageRestrictionOtherValue';
		formGroup.get(field)?.setValue('Some value');

		FormUtil.resetFormControl(field, formGroup);

		expect(formGroup.get(field)?.value).toBeUndefined();
	});

	it('should reset other value if field is "ageRestriction" and other value exists', () => {
		const ageRestrictionField = 'ageRestriction';
		const otherValueField = 'ageRestrictionOtherValue';

		formGroup.get(ageRestrictionField)?.setValue('Some value');
		formGroup.get(otherValueField)?.setValue('Other value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, ageRestrictionField, true);

		expect(formGroup.get(otherValueField)?.value).toBeUndefined();
	});

	it('should reset form control to null', () => {
		const field = 'ageRestrictionOtherValue';
		formGroup.get(field)?.setValue('Some value');

		FormUtil.resetFormControl(field, formGroup);

		expect(formGroup.get(field)?.value).toBeUndefined();
	});

	it('should reset other value if field is "ageRestriction" and other value exists', () => {
		const ageRestrictionField = 'ageRestriction';
		const otherValueField = 'ageRestrictionOtherValue';

		formGroup.get(ageRestrictionField)?.setValue('Some value');
		formGroup.get(otherValueField)?.setValue('Other value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, ageRestrictionField, true);

		expect(formGroup.get(otherValueField)?.value).toBeUndefined();
	});

	it('should reset other value if field is "ageRestriction" and other value is set', () => {
		const ageRestrictionField = 'ageRestriction';
		const otherValueField = 'ageRestrictionOtherValue';

		formGroup.get(ageRestrictionField)?.setValue('Some value');
		formGroup.get(otherValueField)?.setValue('Other value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, ageRestrictionField, true);

		expect(formGroup.get(otherValueField)?.value).toBeUndefined();
	});

	it('should not reset other value if field is "ageRestriction" but other value is not set', () => {
		const ageRestrictionField = 'ageRestriction';
		const otherValueField = 'ageRestrictionOtherValue';

		formGroup.get(ageRestrictionField)?.setValue('Some value');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, ageRestrictionField, true);

		expect(formGroup.get(otherValueField)?.value).toBeUndefined();
	});

	it('should return false if formControl or formControl2 is null', () => {
		const result1 = FormUtil.validationFunctionErrorMinFieldCompleted(
			'nonExistentField',
			'secondField',
			false,
			formGroup,
		);
		expect(result1).toBe(false);

		const result2 = FormUtil.validationFunctionErrorMinFieldCompleted(
			'firstField',
			'nonExistentField',
			false,
			formGroup,
		);
		expect(result2).toBe(false);
	});

	it('should return false if clicked outside and both fields are empty', () => {
		const result = FormUtil.validationFunctionErrorMinFieldCompleted('firstField', 'secondField', true, formGroup);
		expect(result).toBe(false);
	});

	it('should return false if only one field is touched without value', () => {
		formGroup.get('firstField')?.markAsTouched();
		const result = FormUtil.validationFunctionErrorMinFieldCompleted('firstField', 'secondField', false, formGroup);
		expect(result).toBe(false);
	});

	it('should return false if both fields are touched without value', () => {
		formGroup.get('firstField')?.markAsTouched();
		formGroup.get('secondField')?.markAsTouched();
		const result = FormUtil.validationFunctionErrorMinFieldCompleted('firstField', 'secondField', false, formGroup);
		expect(result).toBe(false);
	});

	it('should clear validators and errors for a control', () => {
		const field = 'ageRestriction';
		const control = formGroup.get(field);
		control?.setValidators([Validators.required]);
		control?.markAsTouched();

		FormUtil.clearRestrictionValidatorsAndErrors(formGroup, field);

		expect(control?.errors).toBeUndefined();
		expect(control?.validator).toBeUndefined();
	});

	it('should reset ageRestrictionOtherValue if field is "ageRestriction" and other value is set', () => {
		const ageRestrictionField = 'ageRestriction';
		const otherValueField = 'ageRestrictionOtherValue';

		formGroupRestrictions.get(ageRestrictionField)?.setValue('Some value');
		formGroupRestrictions.get(otherValueField)?.setValue('78');

		const resetFormControlSpy = jest.spyOn(FormUtil, 'resetFormControl');

		FormUtil.clearRestrictionValidatorsAndErrors(formGroupRestrictions, ageRestrictionField, true);

		expect(resetFormControlSpy).toHaveBeenCalled();
	});

	it('should clear restriction validators and errors for price range if either minPrice or maxPrice has a value', () => {
		const field = 'priceRange';
		const createOfferForm = new FormGroup({
			[field]: new FormControl('someValue'),
			['minPrice']: new FormControl(50),
			['maxPrice']: new FormControl(100),
		});

		FormUtil.clearRestrictionValidatorsAndErrors = jest.fn();

		FormUtil.onRestrictionTypeChange(createOfferForm, 'minPrice', 'maxPrice', field, 'someValue');

		expect(FormUtil.clearRestrictionValidatorsAndErrors).toHaveBeenCalledWith(createOfferForm, field);
	});

	it('should clear restriction validators and errors for price range if either minPrice or maxPrice has a value', () => {
		const field = 'priceRange';
		const createOfferForm = new FormGroup({
			[field]: new FormControl('someValue'),
			['minPrice']: new FormControl(100),
			['maxPrice']: new FormControl(50),
		});

		FormUtil.clearRestrictionValidatorsAndErrors = jest.fn();

		FormUtil.onRestrictionTypeChange(createOfferForm, 'minPrice', 'maxPrice', field, 'someValue');

		expect(FormUtil.clearRestrictionValidatorsAndErrors).not.toHaveBeenCalled();
	});

	it('should set error when firstField value is greater than or equal to secondField', () => {
		const fullField = 'fullField';
		const createOfferForm = new FormGroup({
			[fullField]: new FormControl('someValue'),
			['firstField']: new FormControl(100),
			['secondField']: new FormControl(50),
		});

		const result = FormUtil.shouldDisplayCompareError(createOfferForm, 'firstField', 'secondField', fullField);

		expect(result).toBeTruthy();
		expect(createOfferForm.controls.fullField.errors).toEqual({ required: true });
	});

	it('should not set error when firstField value is less than secondField', () => {
		const fullField = 'fullField';
		const createOfferForm = new FormGroup({
			[fullField]: new FormControl('someValue'),
			['firstField']: new FormControl(3),
			['secondField']: new FormControl(5),
		});

		const result = FormUtil.shouldDisplayCompareError(createOfferForm, 'firstField', 'secondField', fullField);

		expect(result).toBeFalsy();
		expect(createOfferForm.controls.fullField.errors).toBeNull();
	});

	it('should not set error when one of the fields is undefined', () => {
		const fullField = 'fullField';
		const createOfferForm = new FormGroup({
			[fullField]: new FormControl('someValue'),
			['firstField']: new FormControl(undefined),
			['secondField']: new FormControl(5),
		});

		const result = FormUtil.shouldDisplayCompareError(createOfferForm, 'firstField', 'secondField', fullField);

		expect(result).toBeFalsy();
		expect(createOfferForm.controls.fullField.errors).toBeNull();
	});

	it('should return false if at least one field has a value', () => {
		const fullField = 'fullField';
		const createOfferForm = new FormGroup({
			[fullField]: new FormControl('someValue'),
			['firstField']: new FormControl('Some value'),
		});

		const result = FormUtil.shouldDisplayDoubleFieldValidityError(
			createOfferForm,
			'firstField',
			'secondField',
			false,
		);
		expect(result).toBeFalsy();
	});

	it('should return true if fields are valid but clickedOutsideField is true', () => {
		const result = FormUtil.shouldDisplayDoubleFieldValidityError(form, 'firstField', 'secondField', true);
		expect(result).toBeTruthy();
	});

	it('should return false if neither field has a value, both are valid, and clickedOutsideField is false', () => {
		const result = FormUtil.shouldDisplayDoubleFieldValidityError(form, 'firstField', 'secondField', false);
		expect(result).toBeFalsy();
	});

	it('should return early if value is falsy', () => {
		form = new FormGroup({
			firstField: new FormControl(''),
			secondField: new FormControl(''),
			fullField: new FormControl(''),
		});
		const value = null;

		const spy = jest.spyOn(form, 'get');

		FormUtil.onRestrictionTypeChange(form, 'firstField', 'secondField', 'fullField', value);

		expect(spy).toHaveBeenCalledWith('fullField');
		expect(spy).not.toHaveBeenCalledWith('firstField');
		expect(spy).not.toHaveBeenCalledWith('secondField');
	});

	it('should return early if idControl value is an empty string', () => {
		form = new FormGroup({
			firstField: new FormControl(''),
			secondField: new FormControl(''),
			fullField: new FormControl(''),
		});
		form.get('fullField')?.setValue('');
		const value = 'anyValue';
		const spy = jest.spyOn(form, 'get');

		FormUtil.onRestrictionTypeChange(form, 'firstField', 'secondField', 'fullField', value);

		expect(spy).toHaveBeenCalledWith('fullField');
		expect(spy).not.toHaveBeenCalledWith('firstField');
		expect(spy).not.toHaveBeenCalledWith('secondField');
	});

	it('should do nothing if first and second field values are correct and ordered', () => {
		form = new FormGroup({
			firstField: new FormControl(''),
			secondField: new FormControl(''),
		});
		FormUtil.setErrorToFormField(form, 'firstField');
		FormUtil.setErrorToFormField(form, 'secondField');

		FormUtil.onFieldsCleanValidators(form, 'firstField', 'secondField', 'firstField', '');
		expect(form.get('firstField')?.errors).toEqual({ required: true });
	});

	it('should do nothing if first and second field values are correct and ordered', () => {
		form = new FormGroup({
			firstField: new FormControl(1),
			secondField: new FormControl(2),
		});
		FormUtil.setErrorToFormField(form, 'firstField');
		FormUtil.setErrorToFormField(form, 'secondField');

		FormUtil.onFieldsCleanValidators(form, 'firstField', 'secondField', 'firstField', '1');
		expect(form.get('firstField')?.errors).toBeNull();
		expect(form.get('secondField')?.errors).toBeNull();
	});

	it('should not clear validators if first value is bigger than second value ', () => {
		form = new FormGroup({
			firstField: new FormControl(5),
			secondField: new FormControl(2),
		});
		FormUtil.setErrorToFormField(form, 'firstField');
		FormUtil.setErrorToFormField(form, 'secondField');

		FormUtil.onFieldsCleanValidators(form, 'firstField', 'secondField', 'firstField', '5');
		expect(form.get('firstField')?.errors).toEqual({ required: true });
		expect(form.get('secondField')?.errors).toEqual({ required: true });
	});

	it('should return true and set errors if first field is not less than second field', () => {
		form = new FormGroup({
			firstField: new FormControl(10),
			secondField: new FormControl(5),
		});

		const result = FormUtil.shouldDisplayCompareDoubleFieldError(form, 'firstField', 'secondField');

		expect(result).toBe(true);
		expect(form.get('firstField')?.errors).toBeTruthy();
		expect(form.get('secondField')?.errors).toBeTruthy();
	});

	it('should return false if fields are properly ordered', () => {
		form = new FormGroup({
			firstField: new FormControl(3),
			secondField: new FormControl(10),
		});

		const result = FormUtil.shouldDisplayCompareDoubleFieldError(form, 'firstField', 'secondField');

		expect(result).toBe(false);
	});

	it('should handle non-existing fields gracefully', () => {
		FormUtil.clearValidatorsRangedFields(form, 'nonExistingField', 'anotherNonExistingField');

		expect(form.get('nonExistingField')).toBeNull();
		expect(form.get('anotherNonExistingField')).toBeNull();
		expect(form.get('existingField')?.validator).not.toBeNull();
		expect(form.get('anotherExistingField')?.validator).not.toBeNull();
	});

	test.each([
		{ input: new Date('2024-05-29T15:30:45'), expected: '15:30:45' },
		{ input: new Date('2024-05-29T05:07:09'), expected: '05:07:09' },
		{ input: new Date('2024-05-29T00:00:00'), expected: '00:00:00' },
	])('should format the date correctly', ({ input, expected }) => {
		const formattedDate = FormUtil.formatDate(input);
		expect(formattedDate).toBe(expected);
	});

	describe('createTimeDateFromString', () => {
		const testCases = [
			{ timeString: '14:30:15', expectedHours: 14, expectedMinutes: 30, expectedSeconds: 15 },
			{ timeString: '00:00:00', expectedHours: 0, expectedMinutes: 0, expectedSeconds: 0 },
			{ timeString: '7:8:9', expectedHours: 7, expectedMinutes: 8, expectedSeconds: 9 },
			{ timeString: '23:59:59', expectedHours: 23, expectedMinutes: 59, expectedSeconds: 59 },
		];

		it.each(testCases)(
			'should create a Date object with the specified time for $timeString',
			({ timeString, expectedHours, expectedMinutes, expectedSeconds }) => {
				const result = FormUtil.createTimeDateFromString(timeString);

				const today = new Date();
				today.setHours(expectedHours, expectedMinutes, expectedSeconds, 0);

				expect(result.getHours()).toBe(expectedHours);
				expect(result.getMinutes()).toBe(expectedMinutes);
				expect(result.getSeconds()).toBe(expectedSeconds);
				expect(result.getMilliseconds()).toBe(0);

				expect(result.getDate()).toBe(today.getDate());
				expect(result.getMonth()).toBe(today.getMonth());
				expect(result.getFullYear()).toBe(today.getFullYear());
			},
		);
	});

	it('should return the correct counter messages from TranslateService', () => {
		const translateService = new MockTranslateService() as unknown as TranslateService;

		const counterMessages: CentricCounterMessages = FormUtil.getTextAreaCounterMessages(translateService);

		const expectedMessages: CentricCounterMessages = {
			validLengthText: 'Characters left',
			invalidLengthText: 'Characters over the limit',
		};

		expect(counterMessages).toEqual(expectedMessages);
	});

	describe('FormUtil.normalizeDate', () => {
		test.each([
			{ input: '2024-07-25T12:00:00Z', expected: '2024-07-25' },
			{ input: '2024-07-25T15:00:00+03:00', expected: '2024-07-25' },
			{ input: '2024-07-25T07:00:00-05:00', expected: '2024-07-25' },
			{ input: '2024-07-25', expected: '2024-07-25' },
		])('should normalize date for input $input', ({ input, expected }) => {
			const result = FormUtil.normalizeDate(input);
			expect(result).toBe(expected);
		});

		it('should handle dates in different formats', () => {
			const result1 = FormUtil.normalizeDate('2024/07/25');
			const result2 = FormUtil.normalizeDate('07-25-2024');
			expect(result1).toBe('2024-07-25');
			expect(result2).toBe('2024-07-25');
		});
	});

	it('should return true if the control has a pattern error', () => {
		const form = new FormGroup({
			testField: new FormControl('', [Validators.pattern(/^[a-z]+$/)]),
		});
		form.get('testField')?.setValue('123');
		expect(FormUtil.hasPatternError(form, 'testField')).toBe(true);
	});

	it('should return false if the control does not have a pattern error', () => {
		const form = new FormGroup({
			testField: new FormControl('', [Validators.pattern(/^[a-z]+$/)]),
		});
		form.get('testField')?.setValue('abc');
		expect(FormUtil.hasPatternError(form, 'testField')).toBe(false);
	});

	it('should return false if the control does not exist', () => {
		const form = new FormGroup({});
		expect(FormUtil.hasPatternError(form, 'nonExistentField')).toBe(false);
	});

	it('should return null if control value is greater than 0', () => {
		const control = new FormControl(5);
		const result = FormUtil.nonZeroAmountValidator(control);
		expect(result).toBeNull();
	});

	it('should return null if control value is an empty string', () => {
		const control = new FormControl('');
		const result = FormUtil.nonZeroAmountValidator(control);
		expect(result).toBeNull();
	});

	it('should return { nonZeroAmount: true } if control value is 0', () => {
		const control = new FormControl(0);
		const result = FormUtil.nonZeroAmountValidator(control);
		expect(result).toEqual({ nonZeroAmount: true });
	});

	it('should return { nonZeroAmount: true } if control value is less than 0', () => {
		const control = new FormControl(-5);
		const result = FormUtil.nonZeroAmountValidator(control);
		expect(result).toEqual({ nonZeroAmount: true });
	});

	it('returns formatted date time string', () => {
		jest.useFakeTimers().setSystemTime(new Date('2024-02-10T12:34:56'));
		const result = FormUtil.getClientDateTime();
		expect(result).toBe('02/10/2024, 12:34:56');
	});
});
