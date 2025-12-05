import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { ConfirmPasswordValidator, PasswordMatchValidator } from './pass-vaildator.helper';
describe('Validators', () => {
	let confirmPasswordControl: AbstractControl;
	let parentForm: AbstractControl;

	describe('PasswordMatchValidator', () => {
		it('should return null if passwords match', () => {
			const formGroup = new FormControl();
			formGroup.setValue({ password: 'password', confirmPassword: 'password' });
			const result = PasswordMatchValidator(formGroup);
			expect(result).toBeNull();
		});

		it('should return fieldsMismatch error if passwords do not match', () => {
			parentForm = new FormGroup({
				password: new FormControl('password', [Validators.required]),
				confirmPassword: new FormControl('password123', [Validators.required, ConfirmPasswordValidator]),
			});
			const result = PasswordMatchValidator(parentForm);
			expect(result).toEqual({ fieldsMismatch: true });
		});
	});

	describe('ConfirmPasswordValidator', () => {
		beforeEach(() => {
			parentForm = new FormGroup({
				password: new FormControl('password', [Validators.required]),
				confirmPassword: new FormControl('password', [Validators.required, ConfirmPasswordValidator]),
			});
		});

		it('should return null if passwords match', () => {
			confirmPasswordControl = parentForm.get('confirmPassword') as FormControl;
			const result = ConfirmPasswordValidator(confirmPasswordControl);
			expect(result).toBeNull();
		});

		it('should return fieldsMismatch error if passwords do not match', () => {
			parentForm = new FormGroup({
				password: new FormControl('password123', [Validators.required]),
				confirmPassword: new FormControl('password', [Validators.required, ConfirmPasswordValidator]),
			});
			confirmPasswordControl = parentForm.get('confirmPassword') as FormControl;
			const result = ConfirmPasswordValidator(confirmPasswordControl);
			expect(result).toEqual({ fieldsMismatch: true });
		});
	});
});
