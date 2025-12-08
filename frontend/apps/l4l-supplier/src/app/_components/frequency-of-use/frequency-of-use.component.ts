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

	public shouldCheckFirst(type: string): boolean {
		if (this.isReadonly) {
			return false;
		}

		return type === 'offer.frequencyOfUse.singleUse';
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

	public onRestrictionTypeChange(field: string, value: string | unknown): void {
		const idControl = this.createOfferForm.get(field);

		if (!value || idControl?.value === '') {
			return;
		}

		this.clearRestrictionValidatorsAndErrors(this.createOfferForm, field);
	}
}
