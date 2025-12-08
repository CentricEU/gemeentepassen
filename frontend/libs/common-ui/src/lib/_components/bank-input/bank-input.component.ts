import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtil } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'frontend-bank-input',
	templateUrl: './bank-input.component.html',
	styleUrls: ['./bank-input.component.scss'],
	standalone: false,
})
export class BankInputComponent {
	@Input() formGroup!: FormGroup;
	@Input() isReadonly = false;
	@Input() isSetupProfileDialog = false;

	public get ariaDescribedbyIbanId(): string {
		return this.formGroup.controls['iban'].errors ? 'iban-error' : '';
	}

	public get ariaDescribedbyBicId(): string {
		return this.formGroup.controls['bic'].errors ? 'bic-error' : '';
	}

	constructor(private translateService: TranslateService) {}

	public validateIban = (): boolean | undefined => {
		return FormUtil.validationFunctionError('iban', this.formGroup);
	};

	public validateBic = (): boolean | undefined => {
		return FormUtil.validationFunctionError('bic', this.formGroup);
	};

	public getErrorMessageForBankInputs(value: string): string | null {
		const control = this.formGroup.get(value);

		if (!control || !control.errors) {
			return null;
		}

		const { required, pattern, iban, ibanBicMismatch } = control.errors;

		if (required) {
			return this.translateService.instant(`genericFields.${value}.${value}FormControlRequired`);
		}

		if (pattern || iban) {
			return this.translateService.instant(`genericFields.${value}.${value}Invalid`);
		}

		if (ibanBicMismatch) {
			return this.translateService.instant(`genericFields.${value}.mismatchedBicIban`);
		}

		return null;
	}
}
