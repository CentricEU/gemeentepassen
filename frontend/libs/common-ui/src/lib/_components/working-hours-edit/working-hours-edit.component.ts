import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckboxData, FormInitializationType, FormUtil, WeekDays, WorkingHoursDto } from '@frontend/common';

@Component({
	selector: 'frontend-working-hours-edit',
	templateUrl: './working-hours-edit.component.html',
	styleUrls: ['./working-hours-edit.component.scss'],
})
export class WorkingHoursEditComponent implements OnInit {
	@Input() public workingHoursData: WorkingHoursDto[];

	public isToggleActive = false;
	public workingHoursForm: FormGroup;
	public daysData: CheckboxData[];
	public days: string[] = Object.values(WeekDays);

	public formatDate = FormUtil.formatDate;
	public createTimeDateFromString = FormUtil.createTimeDateFromString;

	private localStorageData: WorkingHoursDto[] = [];

	constructor(private formBuilder: FormBuilder) {}

	public ngOnInit(): void {
		this.loadInitialData();
		this.subscribeToFormChanges();
	}

	public toggleEnableDays(): void {
		// this is used as we need the initial value of the toggle, because the value will change when isEnabled
		// will change its value from the subscribe to changes
		const currentToggleValue = this.isToggleActive;

		for (const subgroupName in this.workingHoursForm.controls) {
			const subgroup = this.workingHoursForm.get(subgroupName);
			if (subgroup?.get('isEnabled')?.value && !currentToggleValue) {
				continue;
			}
			subgroup?.get('isEnabled')?.setValue(!currentToggleValue);
		}

		this.workingHoursForm.markAsDirty();
	}

	public isFormValid(): boolean {
		const oneMarked = Object.keys(WeekDays).some((day) => {
			const dayFormGroup = this.workingHoursForm.get(day.toLowerCase()) as FormGroup;
			return dayFormGroup.get('isEnabled')?.value;
		});

		return oneMarked && this.workingHoursForm.valid && !this.workingHoursForm.pristine;
	}

	public mapWorkingHours(): WorkingHoursDto[] {
		let dayCount = 0;
		const result = Object.keys(WeekDays).map((day) => {
			const dayFormGroup = this.workingHoursForm.get(day.toLowerCase()) as FormGroup;
			const isEnabled = dayFormGroup.get('isEnabled')?.value;
			const scheduleTimes = this.getScheduleTimes(dayFormGroup, isEnabled);

			if (this.workingHoursData) {
				return new WorkingHoursDto(
					++dayCount,
					scheduleTimes.start,
					scheduleTimes.end,
					isEnabled,
					this.workingHoursData[dayCount - 1]?.id,
				);
			}

			return new WorkingHoursDto(++dayCount, scheduleTimes.start, scheduleTimes.end, isEnabled);
		});

		return result;
	}

	public updateLocalStorage(): void {
		localStorage.setItem('workingHours', JSON.stringify(this.mapWorkingHours()));
	}

	private getFieldValue(enumValue: FormInitializationType, dayNumber: number): WorkingHoursDto {
		switch (enumValue) {
			case FormInitializationType.EMPTY:
				return new WorkingHoursDto(dayNumber, '', '', false);
			case FormInitializationType.LOCAL_STORAGE:
				return this.localStorageData[dayNumber - 1];
			default:
				return new WorkingHoursDto(dayNumber, '', '', false);
		}
	}

	private initLocalStorageData(): void {
		const localStorageFormData = localStorage.getItem('workingHours');

		if (!localStorageFormData) {
			return;
		}

		this.localStorageData = JSON.parse(localStorageFormData);
	}

	private initForm(enumValue: FormInitializationType): void {
		this.workingHoursForm = this.formBuilder.group({
			monday: this.buildSubGroup(this.getFieldValue(enumValue, 1), enumValue),
			tuesday: this.buildSubGroup(this.getFieldValue(enumValue, 2), enumValue),
			wednesday: this.buildSubGroup(this.getFieldValue(enumValue, 3), enumValue),
			thursday: this.buildSubGroup(this.getFieldValue(enumValue, 4), enumValue),
			friday: this.buildSubGroup(this.getFieldValue(enumValue, 5), enumValue),
			saturday: this.buildSubGroup(this.getFieldValue(enumValue, 6), enumValue),
			sunday: this.buildSubGroup(this.getFieldValue(enumValue, 7), enumValue),
		});
	}

	private buildSubGroup(workingHoursData: WorkingHoursDto, enumValue: FormInitializationType): FormGroup {
		const workingHoursFormValidator =
			enumValue === FormInitializationType.LOCAL_STORAGE && workingHoursData?.isChecked
				? Validators.required
				: null;
		return this.formBuilder.group({
			isEnabled: [workingHoursData?.isChecked],
			schedule: this.formBuilder.group({
				start: [
					{
						value: this.createTimeDate(workingHoursData?.openTime, workingHoursData?.isChecked),
						disabled: !workingHoursData?.isChecked,
					},
					workingHoursFormValidator,
				].filter(Boolean),
				end: [
					{
						value: this.createTimeDate(workingHoursData?.closeTime, workingHoursData?.isChecked),
						disabled: !workingHoursData?.isChecked,
					},
					workingHoursFormValidator,
				].filter(Boolean),
			}),
		});
	}

	private subscribeToFormChanges(): void {
		this.workingHoursForm?.valueChanges.subscribe(() => {
			if (!this.workingHoursData) {
				this.updateLocalStorage();
			}
			const shouldToggle = Object.values(WeekDays).every((day) => {
				const dayFormGroup = this.workingHoursForm.get(day.toLocaleLowerCase()) as FormGroup;
				return dayFormGroup.get('isEnabled')?.value;
			});

			if (shouldToggle !== this.isToggleActive) {
				this.isToggleActive = shouldToggle;
			}
		});
	}

	private getScheduleTimes(dayFormGroup: FormGroup, isEnabled: boolean): { start: string; end: string } {
		const defaultHour = '00:00:00';
		const scheduleTimes = { start: defaultHour, end: defaultHour };

		if (isEnabled) {
			const scheduleGroup = dayFormGroup.get('schedule') as FormGroup;
			scheduleTimes.start = this.formatDate(new Date(scheduleGroup.get('start')?.value));
			scheduleTimes.end = this.formatDate(new Date(scheduleGroup.get('end')?.value));
		}

		return scheduleTimes;
	}

	private loadInitialData(): void {
		if (!localStorage.getItem('workingHours') || this.workingHoursData) {
			this.initForm(FormInitializationType.EMPTY);
			return;
		}

		this.initLocalStorageData();
		this.initForm(FormInitializationType.LOCAL_STORAGE);
		this.workingHoursForm.markAsDirty();
	}

	private createTimeDate(timeString: string, isChecked: boolean): Date | string {
		if (!timeString || !isChecked || (isChecked && timeString === 'NaN:NaN:NaN')) {
			return '';
		}

		return this.createTimeDateFromString(timeString);
	}
}
