import { FormControl, FormGroup } from '@angular/forms';

import { IbanMatchesBicValidator } from './iban-bic-match.helper';

describe('IbanMatchesBicValidator', () => {
	function createForm(iban: string | null, bic: string | null) {
		return new FormGroup({
			iban: new FormControl(iban),
			bic: new FormControl(bic),
		});
	}

	it('should return null if iban or bic is missing', () => {
		let form = createForm(null, 'DEUTDEFF');
		expect(IbanMatchesBicValidator(form)).toBeNull();

		form = createForm('DE89370400440532013000', null);
		expect(IbanMatchesBicValidator(form)).toBeNull();

		form = createForm(null, null);
		expect(IbanMatchesBicValidator(form)).toBeNull();
	});

	it('should return null and not set errors if iban and bic bank codes match', () => {
		const iban = 'NL91ABNA0417164300';
		const bic = 'ABNANL2A';
		const form = createForm(iban, bic);

		expect(IbanMatchesBicValidator(form)).toBeNull();
		expect(form.get('bic')?.errors).toBeNull();
	});

	it('should return error and set error on bic if bank codes do not match', () => {
		const iban = 'DEUT1234567890123456';
		const bic = 'TESTDEFF';
		const form = createForm(iban, bic);

		const result = IbanMatchesBicValidator(form);
		expect(result).toEqual({ ibanBicMismatch: true });
		expect(form.get('bic')?.hasError('ibanBicMismatch')).toBe(true);
	});

	it('should remove only ibanBicMismatch error if other errors exist', () => {
		const form = new FormGroup({
			iban: new FormControl('NL91ABNA0417164300'),
			bic: new FormControl('ABNANL2A'),
		});

		const bicControl = form.get('bic');
		bicControl?.setErrors({
			ibanBicMismatch: true,
			required: true,
		});

		const result = IbanMatchesBicValidator(form);

		expect(result).toBeNull();
		expect(bicControl?.hasError('ibanBicMismatch')).toBe(false);
		expect(bicControl?.hasError('required')).toBe(true);
		expect(bicControl?.errors).toEqual({ required: true });
	});
});
