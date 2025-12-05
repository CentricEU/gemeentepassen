import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormInitializationType, WorkingHoursDto } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { CommonUiModule } from '../../common-ui.module';
import { WorkingHoursEditComponent } from './working-hours-edit.component';

describe('WorkingHoursEditComponent', () => {
	let component: WorkingHoursEditComponent;
	let fixture: ComponentFixture<WorkingHoursEditComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [WorkingHoursEditComponent],
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), CommonUiModule],
			providers: [FormBuilder],
		}).compileComponents();

		fixture = TestBed.createComponent(WorkingHoursEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return an array with just one checked day if mapWorkingHours is called', () => {
		const monday = component.workingHoursForm.get('monday');
		monday?.get('isEnabled')?.setValue(true);

		monday
			?.get('schedule')
			?.setValue({ start: 'Wed May 29 2024 01:00:00 GMT+0200', end: 'Wed May 29 2024 03:00:00 GMT+0200' });
		const result = component.mapWorkingHours();

		const expectedResult = [
			new WorkingHoursDto(1, '01:00:00', '03:00:00', true, undefined),
			new WorkingHoursDto(2, '00:00:00', '00:00:00', false, undefined),
			new WorkingHoursDto(3, '00:00:00', '00:00:00', false, undefined),
			new WorkingHoursDto(4, '00:00:00', '00:00:00', false, undefined),
			new WorkingHoursDto(5, '00:00:00', '00:00:00', false, undefined),
			new WorkingHoursDto(6, '00:00:00', '00:00:00', false, undefined),
			new WorkingHoursDto(7, '00:00:00', '00:00:00', false, undefined),
		];

		expect(expectedResult).toEqual(result);
	});

	it('should return false if form is pristine even if a day is enabled', () => {
		component.workingHoursForm.get('monday.isEnabled')?.setValue(true);

		const result = component.isFormValid();
		expect(result).toBe(false);
	});

	it('should return false when isEnabled control is missing', () => {
		(component.workingHoursForm.get('monday') as FormGroup).removeControl('isEnabled');

		const result = component.isFormValid();
		expect(result).toBe(false);
	});

	it('should return false if no day is enabled', () => {
		component.workingHoursForm.get('monday.isEnabled')?.setValue(false);
		component.workingHoursForm.get('tuesday.isEnabled')?.setValue(false);

		const result = component.isFormValid();
		expect(result).toBe(false);
	});

	it('should toggle all day enabled states', () => {
		component.toggleEnableDays();
		Object.keys(component.workingHoursForm.controls).forEach((day) => {
			const isEnabled = component.workingHoursForm.get(day)?.get('isEnabled')?.value;
			expect(isEnabled).toBe(true);
		});

		component.toggleEnableDays();
		Object.keys(component.workingHoursForm.controls).forEach((day) => {
			const isEnabled = component.workingHoursForm.get(day)?.get('isEnabled')?.value;
			expect(isEnabled).toBe(false);
		});
	});

	it('should toggle all day enabled states with already one enabled', () => {
		component.workingHoursForm.get('monday')?.get('isEnabled')?.setValue(true);

		component.toggleEnableDays();
		Object.keys(component.workingHoursForm.controls).forEach((day) => {
			const isEnabled = component.workingHoursForm.get(day)?.get('isEnabled')?.value;
			expect(isEnabled).toBe(true);
		});
	});

	it('should return default when getFieldValue', () => {
		jest.clearAllMocks();
		localStorage.clear();

		const result = component['getFieldValue'](FormInitializationType.DATABASE, 1);
		expect(result).toEqual(new WorkingHoursDto(1, '', '', false));
	});

	it('localStorageData should be empty when no local storage', () => {
		jest.clearAllMocks();
		localStorage.clear();
		localStorage.setItem('workingHours', '');
		component['initLocalStorageData']();
		expect(component['localStorageData']).toEqual([]);
	});
});
