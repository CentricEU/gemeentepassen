import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtil } from '@frontend/common';

@Component({
	selector: 'frontend-time-slots',
	templateUrl: './time-slots.component.html',
	styleUrls: ['./time-slots.component.scss'],
	standalone: false,
})
export class TimeSlotsComponent {
	@Input() clickedOutsideFieldTime: boolean;
	@Input() shouldBeDisplayed = true;
	@Input() generalForm: FormGroup;

	public shouldDisplayCompareError = FormUtil.shouldDisplayCompareTimeError;
	public shouldDisplayRequiredError = FormUtil.shouldDisplayRequiredTimeError;
	public onRestrictionTypeChange = FormUtil.onRestrictionChangeWithBothOrNoneFields;
	public shouldDisplayTimeError = (): boolean => {
		return (
			this.shouldDisplayCompareError(this.generalForm, 'timeFrom', 'timeTo') ||
			this.shouldDisplayRequiredError(this.generalForm, 'timeFrom', 'timeTo')
		);
	};
}
