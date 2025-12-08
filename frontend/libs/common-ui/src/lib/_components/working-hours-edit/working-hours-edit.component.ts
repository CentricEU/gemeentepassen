import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CheckboxData, FormInitializationType, FormUtil, WeekDays, WorkingHoursDto } from '@frontend/common';

@Component({
	selector: 'frontend-working-hours-edit',
	templateUrl: './working-hours-edit.component.html',
	styleUrls: ['./working-hours-edit.component.scss'],
	standalone: false,
})
export class WorkingHoursEditComponent implements OnInit, AfterViewChecked {
	@Input() public workingHoursData: WorkingHoursDto[];

	public isToggleActive = false;
	public workingHoursForm: FormGroup;
	public daysData: CheckboxData[];
	public days: string[] = Object.values(WeekDays);
	public firstSelectedDay: string | null;

	public formatDate = FormUtil.formatDate;
	public createTimeDateFromString = FormUtil.createTimeDateFromString;

	private localStorageData: WorkingHoursDto[] = [];
	public canCopyToAll = false;

	constructor(
		private formBuilder: FormBuilder,
		private cdr: ChangeDetectorRef,
	) {}

	public ngAfterViewChecked(): void {
		this.cdr.detectChanges();
	}

	public ngOnInit(): void {
		this.loadInitialData();
		this.subscribeToFormChanges();
	}

	public areTimesFilled(dayFormGroup: AbstractControl): boolean {
		const scheduleGroup = (dayFormGroup as FormGroup).get('schedule') as FormGroup;
		const startControl = scheduleGroup.get('start');
		const endControl = scheduleGroup.get('end');

		return !!startControl?.value && !!endControl?.value && startControl.valid && endControl.valid;
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

	public getIsEnabledControl(day: string): FormControl {
		return this.workingHoursForm.get(day)?.get('isEnabled') as FormControl;
	}

	public isFormValid(): boolean {
		const hasEnabledDay = this.days.some((day) => this.getIsEnabledControl(day).value);
		this.cdr.detectChanges();

		const areEnabledDaysValid = this.days.every((day) => {
			const dayGroup = this.getDayFormGroup(day);
			return !this.getIsEnabledControl(day).value || dayGroup.valid;
		});

		const isFormDirtyOrStored = !this.workingHoursForm.pristine || !!localStorage.getItem('workingHours');

		return hasEnabledDay && areEnabledDaysValid && isFormDirtyOrStored;
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

	public getDayFormGroup(day: string): FormGroup {
		return this.workingHoursForm.get(day.toLowerCase()) as FormGroup;
	}

	public copyToAll(sourceDayFormGroup: FormGroup): void {
		const scheduleGroup = sourceDayFormGroup.get('schedule') as FormGroup;
		const fromTime = scheduleGroup.get('start')?.value;
		const toTime = scheduleGroup.get('end')?.value;

		this.days.forEach((day) => {
			const dayFormGroup = this.getDayFormGroup(day);
			const isEnabled = dayFormGroup.get('isEnabled')?.value;
			if (isEnabled && dayFormGroup !== sourceDayFormGroup) {
				const schedule = dayFormGroup.get('schedule') as FormGroup;
				schedule.get('start')?.setValue(fromTime);
				schedule.get('end')?.setValue(toTime);
				schedule.get('start')?.markAsDirty();
				schedule.get('end')?.markAsDirty();
			}
		});

		this.workingHoursForm.markAsDirty();
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
			monday: this.buildSubGroup(this.getFieldValue(enumValue, 1)),
			tuesday: this.buildSubGroup(this.getFieldValue(enumValue, 2)),
			wednesday: this.buildSubGroup(this.getFieldValue(enumValue, 3)),
			thursday: this.buildSubGroup(this.getFieldValue(enumValue, 4)),
			friday: this.buildSubGroup(this.getFieldValue(enumValue, 5)),
			saturday: this.buildSubGroup(this.getFieldValue(enumValue, 6)),
			sunday: this.buildSubGroup(this.getFieldValue(enumValue, 7)),
		});
	}

	private buildSubGroup(workingHoursData: WorkingHoursDto): FormGroup {
		const isChecked = !!workingHoursData?.isChecked;
		const validators = isChecked ? [Validators.required] : [];

		return this.formBuilder.group({
			isEnabled: [isChecked],
			schedule: this.formBuilder.group({
				start: [
					{ value: this.createTimeDate(workingHoursData?.openTime, isChecked) || '', disabled: !isChecked },
					validators,
				],
				end: [
					{ value: this.createTimeDate(workingHoursData?.closeTime, isChecked) || '', disabled: !isChecked },
					validators,
				],
			}),
		});
	}

	private subscribeToFormChanges(): void {
		this.days.forEach((day) => {
			const dayFormGroup = this.workingHoursForm.get(day.toLowerCase()) as FormGroup;

			dayFormGroup.get('isEnabled')?.valueChanges.subscribe((isChecked: boolean) => {
				this.toggleScheduleControls(dayFormGroup.get('schedule') as FormGroup, isChecked);
				this.workingHoursForm.updateValueAndValidity({ emitEvent: false });
			});
		});

		this.workingHoursForm.statusChanges.subscribe(() => {
			if (!this.workingHoursData) {
				this.updateLocalStorage();
			}
			this.updateToggleState();
			this.calculateFirstSelectedDay();
			this.updateCanCopyState();
		});
	}

	private updateCanCopyState(): void {
		if (this.firstSelectedDay) {
			this.canCopyToAll = this.areTimesFilled(this.getDayFormGroup(this.firstSelectedDay));
		}
	}

	private toggleScheduleControls(schedule: FormGroup, isChecked: boolean): void {
		['start', 'end'].forEach((controlName) => {
			const control = schedule.get(controlName);
			if (isChecked) {
				control?.enable({ emitEvent: false });
				control?.setValidators(Validators.required);
			} else {
				control?.reset('', { emitEvent: false });
				control?.clearValidators();
			}
			control?.updateValueAndValidity({ emitEvent: false });
		});
	}

	private updateToggleState(): void {
		const shouldToggle = this.days.every(
			(day) => this.workingHoursForm.get(day.toLowerCase())?.get('isEnabled')?.value,
		);
		if (shouldToggle !== this.isToggleActive) {
			this.isToggleActive = shouldToggle;
		}
	}
	private getScheduleTimes(dayFormGroup: FormGroup, isEnabled: boolean): { start: string; end: string } {
		const defaultHour = '00:00:00';
		const scheduleTimes = { start: defaultHour, end: defaultHour };

		if (isEnabled) {
			const scheduleGroup = dayFormGroup.get('schedule') as FormGroup;
			const startValue = scheduleGroup.get('start')?.value;
			const endValue = scheduleGroup.get('end')?.value;

			scheduleTimes.start = startValue ? this.formatDate(new Date(startValue)) : '';
			scheduleTimes.end = endValue ? this.formatDate(new Date(endValue)) : '';
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

	private calculateFirstSelectedDay(): void {
		for (const day of this.days) {
			const control = this.workingHoursForm.get(day.toLowerCase());
			if (control?.get('isEnabled')?.value) {
				this.firstSelectedDay = day;
				return;
			}
		}
		this.firstSelectedDay = null;
	}
}
