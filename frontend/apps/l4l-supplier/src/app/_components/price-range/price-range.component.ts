import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtil } from '@frontend/common';

@Component({
	selector: 'frontend-price-range',
	templateUrl: './price-range.component.html',
	styleUrls: [],
	standalone: false,
})
export class PriceRangeComponent {
	@Input() clickedOutsideFieldPrice: boolean;
	@Input() showDecimal: string;
	@Input() createOfferForm: FormGroup;
	@Input() isReadonly: boolean;

	public validationFunctionErrorMinFieldCompleted = FormUtil.validationFunctionErrorMinFieldCompleted;
	public clearRestrictionValidatorsAndErrors = FormUtil.clearRestrictionValidatorsAndErrors;
	public shouldShowRequiredErrorForEitherFields = FormUtil.shouldShowRequiredErrorForEitherFields;
	public isValidIfAtLeastOneFieldIsZeroOrEmpty = FormUtil.isValidIfAtLeastOneFieldIsZeroOrEmpty;
	public shouldDisplayCompareError = FormUtil.shouldDisplayCompareError;
	public onRestrictionTypeChange = FormUtil.onRestrictionTypeChange;

	public errorMessages = {
		VALIDITY_ERROR: 'offer.priceRange.error',
		GREATER_THAN_ZERO: 'offer.priceRange.greaterThanZero',
		COMPARISON_ERROR: 'offer.priceRangeCompareError',
	};
}
