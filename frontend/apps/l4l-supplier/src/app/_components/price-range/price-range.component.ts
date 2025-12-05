import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtil } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'frontend-price-range',
	templateUrl: './price-range.component.html',
	styleUrls: [],
})
export class PriceRangeComponent {
	@Input() clickedOutsideFieldPrice: boolean;
	@Input() showDecimal: string;
	@Input() createOfferForm: FormGroup;
	@Input() isReadonly: boolean;

	public validationFunctionErrorMinFieldCompleted = FormUtil.validationFunctionErrorMinFieldCompleted;
	public clearRestrictionValidatorsAndErrors = FormUtil.clearRestrictionValidatorsAndErrors;
	public shouldDisplayDoubleFieldValidityError = FormUtil.shouldDisplayDoubleFieldValidityError;
	public shouldDisplayCompareError = FormUtil.shouldDisplayCompareError;
	public onRestrictionTypeChange = FormUtil.onRestrictionTypeChange;

	constructor(private translateService: TranslateService) {}

	public getErrorMessageForPriceRange(isCompare: boolean): string {
		if (isCompare) {
			return this.translateService.instant('offer.priceRangeCompareError');
		}
		return this.translateService.instant('offer.priceRange.error');
	}
}
