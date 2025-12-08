import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const IbanMatchesBicValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
	const ibanControl = form.get('iban');
	const bicControl = form.get('bic');

	const iban = ibanControl?.value;
	const bic = bicControl?.value;

	if (!iban || !bic) {
		return null;
	}

	// Extract the bank code from the IBAN (positions 5–8, 0-based index 4–7) as per IBAN structure:
	// The first 4 letters of the BBAN section (positions 5–8) are the bank identifier.
	const ibanBankCode = iban.substring(4, 8);

	// The BIC must start with the same 4-letter bank code (positions 1–4, 0-based index 0–3).
	const bicBankCode = bic.substring(0, 4);

	if (ibanBankCode !== bicBankCode) {
		bicControl?.setErrors({ ...(bicControl.errors || {}), ibanBicMismatch: true });
		return { ibanBicMismatch: true };
	}

	if (bicControl?.hasError('ibanBicMismatch')) {
		const { ibanBicMismatch: _, ...remainingErrors } = bicControl.errors || {};
		bicControl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
	}

	return null;
};
