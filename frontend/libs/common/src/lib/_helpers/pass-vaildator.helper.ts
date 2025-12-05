import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PasswordMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
	const password = form.get('password');
	const confirmpassword = form.get('confirmPassword');
	if (password && confirmpassword && password.value != confirmpassword.value) {
		return { fieldsMismatch: true };
	}
	return null;
};

export const ConfirmPasswordValidator: ValidatorFn = (confirmpassword: AbstractControl): ValidationErrors | null => {
	const password = confirmpassword.parent?.get('password');
	if (password && confirmpassword && password.value != confirmpassword.value) {
		return { fieldsMismatch: true };
	}
	return null;
};
