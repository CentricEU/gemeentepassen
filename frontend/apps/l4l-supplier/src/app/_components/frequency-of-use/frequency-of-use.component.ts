import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtil, FrequencyOfUse } from '@frontend/common';

@Component({
	selector: 'frontend-frequency-of-use',
	templateUrl: './frequency-of-use.component.html',
	styleUrls: [],
	standalone: false,
})
export class FrequencyOfUseComponent {
	@Input() createOfferForm: FormGroup;
	@Input() shouldBeDisplayed = true;
	@Input() isReadonly: boolean;

	public clearRestrictionValidatorsAndErrors = FormUtil.clearRestrictionValidatorsAndErrors;

	public getFrequencyOfUseData(): string[] {
		return [
			'offer.frequencyOfUse.singleUse',
			'offer.frequencyOfUse.daily',
			'offer.frequencyOfUse.weekly',
			'offer.frequencyOfUse.monthly',
			'offer.frequencyOfUse.yearly',
		];
	}

	public mapToFrequencyOfUseEnum(value: string): FrequencyOfUse {
		switch (value) {
			case 'offer.frequencyOfUse.singleUse':
				return FrequencyOfUse.SINGLE_USE;
			case 'offer.frequencyOfUse.daily':
				return FrequencyOfUse.DAILY;
			case 'offer.frequencyOfUse.weekly':
				return FrequencyOfUse.WEEKLY;
			case 'offer.frequencyOfUse.monthly':
				return FrequencyOfUse.MONTHLY;
			case 'offer.frequencyOfUse.yearly':
				return FrequencyOfUse.YEARLY;
			default:
				return FrequencyOfUse.UNSPECIFIED;
		}
	}

	public onRestrictionTypeChange(field: string, value: FrequencyOfUse): void {
		const control = this.createOfferForm.get('frequencyOfUseValue');

		if (!control) {
			return;
		}

		if (control.value === value) {
			control.setValue(null);
			control.markAsDirty();
			control.markAsTouched();
			return;
		}

		this.clearRestrictionValidatorsAndErrors(this.createOfferForm, field);
	}
}
