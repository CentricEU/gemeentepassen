import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { TextAreaCounterResult } from '../_models/text-area-counter-result.model';
import { CommonUtil } from './common-util';
import { RegexUtil } from './regex-util';

export class FormUtil {
	public static nonZeroAmountValidator(control: AbstractControl): ValidationErrors | null {
		return control.value > 0 || control.value === '' ? null : { nonZeroAmount: true };
	}

	public static nonMaxBenefitAmountValidator(controlValue: number, maxAmount: number): ValidationErrors {
		return controlValue <= maxAmount ? {} : { nonMaxBenefitAmount: true };
	}

	public static hasPatternError(form: FormGroup, fieldName: string): boolean {
		const control = form.get(fieldName);
		return control?.hasError('pattern') ?? false;
	}

	public static hasFormControlRequiredErrors(controlName: string, form: FormGroup): boolean {
		const control = form.get(controlName);

		return control?.errors?.['required'];
	}

	public static hasControlRequiredErrorAndTouched(controlName: string, form: FormGroup): boolean {
		const control = form.get(controlName);

		return (
			form &&
			control?.errors?.['required'] &&
			control.touched &&
			(control.value?.length === 0 || control.value === null)
		);
	}

	public static hasControlErrorsAndTouched(controlName: string, form: FormGroup): boolean {
		const control = form.get(controlName);

		return !!(form && control?.errors && control.touched);
	}

	public static validationFunctionErrorMinFieldCompleted(
		firstFieldName: string,
		secondFieldName: string,
		clickedOutside: boolean,
		form: FormGroup,
	): boolean {
		const formControl = form.get(firstFieldName);
		const formControl2 = form.get(secondFieldName);

		if (!formControl || !formControl2) {
			return false;
		}

		const isFirstFieldTouchedWithoutValue = formControl?.touched && !formControl?.value;
		const isSecondFieldTouchedWithoutValue = formControl2?.touched && !formControl2?.value;

		if (clickedOutside && !formControl?.value && !formControl2?.value) {
			return true;
		}

		if (formControl?.value && formControl2?.value && formControl?.value >= formControl2?.value) {
			return true;
		}

		return isFirstFieldTouchedWithoutValue && isSecondFieldTouchedWithoutValue;
	}

	public static validationFunctionError(controlName: string, form: FormGroup): boolean | undefined {
		const formControl = form.get(controlName);

		if (!formControl) {
			return false;
		}

		const isFormInvalid = FormUtil.isInvalidForm(formControl);

		return isFormInvalid;
	}

	public static validationNoSpaceFunctionError(control: AbstractControl): ValidationErrors | null {
		return typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;
	}

	public static genericValidationFunctionError(controlName: string, form: FormGroup): boolean {
		const formControl = form?.get(controlName);

		if (!formControl) {
			return false;
		}

		return formControl.invalid && (formControl.dirty || formControl.touched);
	}

	public static validationFunctionErrorForKVK(form: FormGroup): boolean | undefined {
		const formControl = form.get('kvk');
		const isFormInvalid = FormUtil.isInvalidForm(formControl);
		const lengthValidator = (formControl?.value?.length ?? 0) > 0 && (formControl?.value?.length ?? 0) < 8;

		return lengthValidator || isFormInvalid;
	}

	public static validatePassword(control: AbstractControl) {
		const text = control.value;
		const strongPassword = RegexUtil.passwordRegexPattern;

		return !strongPassword.test(text) ? { validPassword: true } : null;
	}

	public static isInvalidForm(formControl: AbstractControl<any, any> | null): boolean {
		const isInvalidForm = formControl?.invalid && (formControl.dirty || formControl.touched || formControl?.value);

		return isInvalidForm;
	}

	public static validateEmail(isRequired: boolean): ValidatorFn {
		return (control: AbstractControl<any, any>): ValidationErrors | null => {
			const text = control.value;
			const emailRegex = RegexUtil.emailRegexPattern;

			if (!text && isRequired) {
				return null;
			}

			return !emailRegex.test(text) ? { validEmail: true } : null;
		};
	}

	public static validatedZip(control: AbstractControl): { validZip: boolean } | null {
		const text = control.value;
		const zipCodeRegex = RegexUtil.zipCodeRegexPattern;

		return !zipCodeRegex.test(text) ? { validZip: true } : null;
	}

	public static validateTelephone(control: AbstractControl): { validTelephone: boolean } | null {
		const text = control.value;

		if (!text) {
			return null;
		}

		const telephoneRegex = RegexUtil.telephoneRegexPattern;
		return !telephoneRegex.test(text) ? { validTelephone: true } : null;
	}

	public static formControlValidatorNonRequiredFields(controlName: string, form: FormGroup) {
		const formControl = form.get(controlName);

		if (!formControl?.value) {
			return;
		}

		//TODO in the future to create a switch for more cases
		if (controlName === 'email') {
			return formControl?.errors?.['validEmail'];
		}
		return formControl?.errors?.['validTelephone'];
	}

	public static getEmailErrorMessage(form: FormGroup): string {
		const emailFormControl = form.get('email');

		if (emailFormControl?.errors?.['required']) {
			return 'genericFields.email.requiredEmail';
		}
		if (emailFormControl?.errors?.['validEmail']) {
			return 'genericFields.email.validEmail';
		}
		return '';
	}

	public static getConfirmPasswordErrorMessage(form: FormGroup): string {
		if (form.get('confirmPassword')?.errors?.['required']) {
			return 'genericFields.password.confirmPasswordRequired';
		}
		if (form.hasError('fieldsMismatch')) {
			return 'genericFields.password.confirmPasswordMatch';
		}
		return '';
	}

	public static calculateExpirationDate(value: string, isEditable: boolean): Date {
		const expirationDate = new Date(value);

		if (expirationDate < new Date() && !isEditable) {
			expirationDate.setTime(new Date().getTime());
		}

		expirationDate.setDate(expirationDate.getDate() + 1);

		return expirationDate;
	}

	public static clearRestrictionValidatorsAndErrors(
		createOfferForm: FormGroup,
		field: string,
		resetValue = false,
	): void {
		const control = createOfferForm.get(field);
		const valueControl = createOfferForm.get(`${field}Value`);

		if (!control) {
			return;
		}

		control.clearValidators();
		control.setErrors(null);

		if (!resetValue || !valueControl) {
			return;
		}

		valueControl.setValue(null);
		control.setValue(null);

		if (field === 'ageRestriction' && createOfferForm.get('ageRestrictionOtherValue')?.value) {
			FormUtil.resetFormControl('ageRestrictionOtherValue', createOfferForm);
		}
	}

	public static resetFormControl(field: string, form: FormGroup): void {
		const formControl = form.get(field);

		formControl?.reset(null);
	}

	/**
	 * Method to check if 2 fields, which have the logic together, shoud return an error.
	 * The outcome will be false if one of the fields has a value.
	 * Will be false too if the fields are valid and if the users doesn't click outside the field.
	 * If the user clicks outside the input and the input has a value the outcome will also be false.
	 * If the user clicks outisde and both inputs are empty the outcome will be true.
	 */
	public static shouldShowRequiredErrorForEitherFields(
		form: FormGroup,
		firstField: string,
		secondField: string,
		clickedOutsideField: boolean,
	): boolean {
		const isEmpty = (field: string) => {
			const value = form?.get(field)?.value;
			return value === '' || value === null || value === undefined;
		};

		const areBothFieldsEmpty = isEmpty(firstField) && isEmpty(secondField);

		// Only show "required" error if both are empty and not failing the greater-than-zero rule
		return areBothFieldsEmpty && clickedOutsideField;
	}

	/**
	 * Validator to ensure at least one of the two fields is greater than 0.
	 * Returns true if one field is 0 and the other is empty, or if both fields are 0.
	 */
	public static isValidIfAtLeastOneFieldIsZeroOrEmpty(
		form: FormGroup,
		firstField: string,
		secondField: string,
	): boolean {
		const first = form.get(firstField)?.value;
		const second = form.get(secondField)?.value;

		const isEmpty = (val: string | null | undefined) => val === null || val === undefined || val === '';

		// Case 1: both are 0
		if (first === 0 && second === 0) {
			return true;
		}

		// Case 2: one is 0 and the other is empty
		if ((first === 0 && isEmpty(second)) || (second === 0 && isEmpty(first))) {
			return true;
		}

		return false;
	}

	/**
	 * Method to compare two inputs if the first one is lower than the second one.
	 * Errors will be set to the fields if they won't respect the condition.
	 */
	public static shouldDisplayCompareError(
		form: FormGroup,
		firstField: string,
		secondField: string,
		fullField: string,
	): boolean {
		const firstFieldValue = form?.controls[firstField].value;
		const secondFieldValue = form?.controls[secondField].value;
		if (firstFieldValue && secondFieldValue && firstFieldValue >= secondFieldValue) {
			FormUtil.setErrorToFormField(form, fullField);
			return true;
		}

		return false;
	}

	/**
	 * Method to check if we should clear the validators and errors from fields.
	 * @param firstField ex: timeFrom
	 * @param secondField ex: timeTo
	 * @param fullField is the parent of 2 fields ex: timeSlots for timeFrom and timeTo
	 */
	public static onRestrictionTypeChange(
		form: FormGroup,
		firstField: string,
		secondField: string,
		fullField: string,
		value: string | unknown,
	): void {
		const idControl = form.get(fullField);
		const firstFieldValue = form?.controls[firstField].value;
		const secondFieldValue = form?.controls[secondField].value;

		if (!CommonUtil.hasValidValue(value) || idControl?.value === '') {
			return;
		}

		if (firstFieldValue && secondFieldValue && firstFieldValue > secondFieldValue) {
			return;
		}

		if (firstFieldValue || secondFieldValue) {
			FormUtil.clearRestrictionValidatorsAndErrors(form, fullField);
			FormUtil.clearValidatorsRangedFields(form, firstField, secondField);
			return;
		}
	}

	public static setErrorToFormField(form: FormGroup, type: string): void {
		const control = form.get(type);

		control?.setValidators([Validators.required]);
		control?.setErrors({ required: true });
	}

	public static onFieldsCleanValidators(
		form: FormGroup,
		firstField: string,
		secondField: string,
		param: string,
		value: string,
	): void {
		const firstFieldValue = form.controls[firstField].value;
		const secondFieldValue = form.controls[secondField].value;

		if (!value) {
			FormUtil.setErrorToFormField(form, param);
			return;
		}

		if (firstFieldValue && secondFieldValue && firstFieldValue >= secondFieldValue) {
			return;
		}

		if (firstFieldValue && secondFieldValue) {
			FormUtil.clearValidatorsRangedFields(form, firstField, secondField);
			return;
		}
	}

	public static shouldDisplayCompareDoubleFieldError(
		form: FormGroup,
		firstField: string,
		secondField: string,
	): boolean {
		const firstFieldValue = form.controls[firstField].value;
		const secondFieldValue = form.controls[secondField].value;
		if (firstFieldValue && secondFieldValue && firstFieldValue >= secondFieldValue) {
			FormUtil.setErrorToFormField(form, firstField);
			FormUtil.setErrorToFormField(form, secondField);

			return true;
		}

		return false;
	}

	public static clearValidatorsRangedFields(form: FormGroup, firstField: string, secondField: string): void {
		form.get(firstField)?.clearValidators();
		form.get(secondField)?.clearValidators();
		form.get(firstField)?.setErrors(null);
		form.get(secondField)?.setErrors(null);
	}

	public static formatDate(date: Date): string {
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');

		return `${hours}:${minutes}:${seconds}`;
	}

	public static createTimeDateFromString(timeString: string): Date {
		const today = new Date();
		const [hours, minutes, seconds] = timeString.split(':').map((part) => parseInt(part, 10));
		today.setHours(hours, minutes, seconds, 0);

		return today;
	}

	public static getTextAreaCounterData(input: string | number | null, maxLength: number): TextAreaCounterResult {
		const textLength = input ? String(input).length : 0;
		const isValid = textLength <= maxLength;
		const count = isValid ? maxLength - textLength : textLength - maxLength;
		const key = isValid ? 'general.label.charactersLeft' : 'general.label.charactersOverTheLimit';

		return {
			messageKey: key,
			messageCount: count,
			isOverLimit: !isValid,
		};
	}

	public static normalizeDate(date: string): string {
		const normalizedDate = new Date(date);
		normalizedDate.setMinutes(normalizedDate.getMinutes() - normalizedDate.getTimezoneOffset());
		return normalizedDate.toISOString().split('T')[0];
	}

	public static getClientDateTime(): string {
		const now = new Date();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const year = now.getFullYear();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');

		return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
	}

	public static isControlInvalid(controlName: string, form: FormGroup): boolean {
		const control = form.controls[controlName];
		return control?.touched && !control.valid;
	}

	public static hasControlMinMaxErrors(controlName: string, form: FormGroup): boolean {
		return form && (form.get(controlName)?.errors?.['max'] || form.get(controlName)?.errors?.['min']);
	}
}
