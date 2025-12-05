import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtil } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'frontend-time-slots',
	templateUrl: './time-slots.component.html',
	styleUrls: ['./time-slots.component.scss'],
})
export class TimeSlotsComponent {
	@Input() clickedOutsideFieldTime: boolean;
	@Input() generalForm: FormGroup;

	public validationFunctionErrorMinFieldCompleted = FormUtil.validationFunctionErrorMinFieldCompleted;
	public shouldDisplayDoubleFieldValidityError = FormUtil.shouldDisplayDoubleFieldValidityError;
	public shouldDisplayCompareError = FormUtil.shouldDisplayCompareError;
	public onRestrictionTypeChange = FormUtil.onRestrictionTypeChange;

	constructor(private translateService: TranslateService) {}

	public getErrorMessageForTimeSlots(isCompare: boolean): string {
		if (isCompare) {
			return this.translateService.instant('general.timePicker.timeSlotCompareError');
		}
		return this.translateService.instant('offer.timeSlotFormControlRequired');
	}
}
