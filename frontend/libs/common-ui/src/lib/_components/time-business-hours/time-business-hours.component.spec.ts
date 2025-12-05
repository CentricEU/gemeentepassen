import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { CommonUiModule } from '../../common-ui.module';
import { TimeBusinessHoursComponent } from './time-business-hours.component';

describe('TimeBusinessHoursComponent', () => {
	let component: any;
	let fixture: ComponentFixture<TimeBusinessHoursComponent>;
	const formBuilder: FormBuilder = new FormBuilder();

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TimeBusinessHoursComponent],
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), CommonUiModule],
			providers: [{ provide: FormGroupDirective, useValue: { control: formBuilder.group({}) } }],
		}).compileComponents();

		fixture = TestBed.createComponent(TimeBusinessHoursComponent);
		component = fixture.componentInstance;

		const formGroup = formBuilder.group({
			monday: formBuilder.group({
				isEnabled: [false],
				schedule: formBuilder.group({
					start: [''],
					end: [''],
				}),
			}),
		});
		component.rootFormGroup = new FormGroupDirective([], []);
		component.rootFormGroup.form = formGroup;
		component.day = 'monday';
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should handle null controls gracefully', () => {
		const result = component.validationFunction('start');

		expect(result).toBe(false);
	});

	it('should setup forms and subscriptions correctly', () => {
		expect(component.hoursForm).toBeTruthy();
		expect(component.schedule).toBeTruthy();
	});

	it('should return false when time comparison fails', () => {
		component.schedule.get('start').setValue(new Date(2023, 9, 11, 10, 30, 45));
		component.schedule.get('end').setValue(new Date(2023, 9, 11, 10, 30, 45));
		expect(component.displayValidityError('start', 'end')).toBe(false);
	});

	it('should return true when controls are invalid', () => {
		component.schedule.get('start').setValue('');
		component.schedule.get('end').setValue('');
		component.schedule.get('start').markAsTouched();
		component.schedule.get('end').markAsTouched();
		expect(component.displayValidityError('start', 'end')).toBe(true);
	});

	it('should validate specific time picker param', () => {
		component.schedule.get('start').setValue('');
		component.schedule.get('start').markAsTouched();
		expect(component.validationFunction('start')).toBe(true);
	});

	it('should disable and reset the schedule if isEnabled is false', () => {
		const isEnabledControl = component.hoursForm.get('isEnabled');
		isEnabledControl.setValue(false);
		expect(component.schedule.enabled).toBe(false);
	});

	it('should enable the schedule if isEnabled is true', () => {
		const isEnabledControl = component.hoursForm.get('isEnabled');
		isEnabledControl.setValue(true);
		expect(component.schedule.enabled).toBe(true);
	});

	it('should return true if start is earlier than end', () => {
		component.schedule.get('start')?.setValue(new Date(2023, 9, 11, 8, 0, 0));
		component.schedule.get('end')?.setValue(new Date(2023, 9, 11, 9, 0, 0));

		const result = component.validationFunction('start');

		expect(result).toBe(false);
	});
});
