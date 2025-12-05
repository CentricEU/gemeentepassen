import { Component, Input } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormUtil } from '@frontend/common';

import { RestrictionFormFields } from '../../enums/restriction.enum';

@Component({
	selector: 'frontend-age-restriction',
	templateUrl: './age-restriction.component.html',
	styleUrls: ['./age-restriction.component.scss'],
})
export class AgeRestrictionComponent {
	@Input() showDecimal: string;
	@Input() createOfferForm: FormGroup;
	@Input() isReadonly: boolean;

	public clearRestrictionValidatorsAndErrors = FormUtil.clearRestrictionValidatorsAndErrors;
	public isOtherValueSelected = false;

	public shouldDisplayOtherAgeField(): boolean {
		if (this.isOtherValueSelected) {
			return true;
		}

		const age = this.createOfferForm.get('ageRestrictionOtherValue')?.value;

		return !!(age && age !== 18 && age !== 21);
	}

	public getAgeRestrictionData(): string[] {
		return [
			'offer.ageRestriction.aboveEighteen',
			'offer.ageRestriction.aboveTwentyOne',
			'offer.ageRestriction.other',
		];
	}

	public shouldCheckEntry(type: string): boolean {
		if (type === 'offer.ageRestriction.other' && this.shouldDisplayOtherAgeField()) {
			return true;
		}

		if (this.isReadonly) {
			return false;
		}

		return type === 'offer.ageRestriction.aboveEighteen';
	}

	public onValueChanged(event: number | string): void {
		this.checkOtherFieldState(event);
	}

	public onRestrictionTypeChange(field: string, value: string | unknown): void {
		const idControl = this.createOfferForm.get(field);

		if (!value || idControl?.value === '') {
			return;
		}

		if (value === 'offer.ageRestriction.other') {
			this.isOtherValueSelected = true;
			return;
		}

		if (this.createOfferForm.get('ageRestrictionOtherValue')?.value) {
			FormUtil.resetFormControl('ageRestrictionOtherValue', this.createOfferForm);
		}

		this.clearRestrictionValidatorsAndErrors(this.createOfferForm, field);
		this.isOtherValueSelected = false;
	}

	public checkOtherFieldState(otherFieldValue: string | number): void {
		if (otherFieldValue !== '') {
			this.clearRestrictionValidatorsAndErrors(this.createOfferForm, RestrictionFormFields.ageRestriction);
			return;
		}

		this.setErrorToFormField(RestrictionFormFields.ageRestrictionValue);
	}

	public mapToAgeRestriction(value: string): number | string {
		switch (value) {
			case 'offer.ageRestriction.other':
				return value;
			case 'offer.ageRestriction.aboveEighteen':
				return 18;
			default:
				return 21;
		}
	}

	private setErrorToFormField(type: string): void {
		const control = this.createOfferForm.get(type);

		if (!control?.value) {
			return;
		}

		control?.setValidators([Validators.required]);
		control?.setErrors({ required: true });
	}
}
