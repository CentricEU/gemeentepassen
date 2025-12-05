import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { FormUtil } from '@frontend/common';

@Component({
	selector: 'frontend-time-business-hours',
	templateUrl: './time-business-hours.component.html',
	styleUrls: ['./time-business-hours.component.scss'],
})
export class TimeBusinessHoursComponent implements OnInit {
	@Input() day!: string;

	public hoursForm: FormGroup;
	public schedule: FormGroup;
	public dayUppercase: string;

	public shouldDisplayCompareDoubleFieldError = FormUtil.shouldDisplayCompareDoubleFieldError;
	public setErrorToFormField = FormUtil.setErrorToFormField;
	public onFieldsCleanValidators = FormUtil.onFieldsCleanValidators;

	constructor(private rootFormGroup: FormGroupDirective) {}

	public ngOnInit(): void {
		this.hoursForm = this.rootFormGroup.control.get(this.day) as FormGroup;
		this.schedule = this.hoursForm.get('schedule') as FormGroup;

		this.subscribeToCheckboxChange();
	}

	public displayValidityError(timeFrom: string, timeTo: string): boolean {
		const timeFromValue = this.schedule.get('start');
		const timeToValue = this.schedule.get('end');

		if (this.compareFields(timeFromValue, timeToValue)) {
			return false;
		}
		return this.isControlInvalid(timeFrom) || this.isControlInvalid(timeTo);
	}

	private isControlInvalid(controlName: string): boolean {
		const control = this.schedule.controls[controlName];
		return control.touched && !control.valid;
	}

	public validationFunction(timePickerParam: string): boolean {
		const timeFromValue = this.schedule.get('start');
		const timeToValue = this.schedule.get('end');
		const paramValue = this.schedule.get(timePickerParam);

		return this.compareFields(timeFromValue, timeToValue) || this.validateParam(paramValue);
	}

	private compareFields(primaryValue: AbstractControl | null, secondValue: AbstractControl | null): boolean {
		return primaryValue?.value && secondValue?.value && primaryValue.value >= secondValue.value;
	}

	private subscribeToCheckboxChange(): void {
		this.hoursForm.get('isEnabled')?.valueChanges.subscribe((data) => {
			if (!data) {
				this.hoursForm.get('schedule')?.disable();
				this.hoursForm.get('schedule')?.reset();
				return;
			}
			this.hoursForm.get('schedule')?.enable();
			this.enableAndSetErrors();
		});
	}

	private enableAndSetErrors(): void {
		this.setErrorToFormField(this.schedule, 'start');
		this.setErrorToFormField(this.schedule, 'end');
	}

	private validateParam(paramValue: AbstractControl | null): boolean {
		if (paramValue?.value) {
			return false;
		}
		return FormUtil.isInvalidForm(paramValue);
	}
}
