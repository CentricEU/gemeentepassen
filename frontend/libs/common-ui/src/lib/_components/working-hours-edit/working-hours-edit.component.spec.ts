import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
			imports: [
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				CommonUiModule,
				NoopAnimationsModule,
				HttpClientTestingModule,
			],
			providers: [FormBuilder],
		}).compileComponents();

		fixture = TestBed.createComponent(WorkingHoursEditComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
		fixture.detectChanges();
	});

	afterEach(() => {
		fixture.destroy();
		localStorage.clear();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return an array with just one checked day if mapWorkingHours is called', () => {
		const monday = component.workingHoursForm.get('monday');
		monday?.get('isEnabled')?.setValue(true);

		const startDate = new Date();
		startDate.setHours(1, 0, 0, 0);
		const endDate = new Date();
		endDate.setHours(3, 0, 0, 0);
		monday?.get('schedule')?.setValue({ start: startDate, end: endDate });
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

	it('should return false if form is pristine even if a day is enabled', async () => {
		TestBed.inject(NgZone).run(() => {
			component.workingHoursForm.get('monday.isEnabled')?.setValue(true);
		});

		await fixture.whenStable();
		fixture.detectChanges();

		const result = component.isFormValid();
		expect(result).toBe(false);
	});

	it('should return false when isEnabled control is missing', async () => {
		(component.workingHoursForm.get('monday') as FormGroup).setControl('isEnabled', new FormControl(null));

		const result = component.isFormValid();
		expect(result).toBe(false);
	});

	it('should return false if no day is enabled', async () => {
		component.workingHoursForm.get('monday.isEnabled')?.setValue(false);
		component.workingHoursForm.get('tuesday.isEnabled')?.setValue(false);

		fixture.detectChanges();
		await fixture.whenStable();
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

	it('should return empty string if timeString is invalid or unchecked in createTimeDate', () => {
		expect(component['createTimeDate']('', true)).toBe('');
		expect(component['createTimeDate']('NaN:NaN:NaN', true)).toBe('');
		expect(component['createTimeDate']('12:00:00', false)).toBe('');
	});

	it('should convert valid timeString if checked in createTimeDate', () => {
		const result = component['createTimeDate']('12:34:56', true);
		expect(result).toEqual(expect.any(Date));
	});

	it('should load local storage data if exists and no input data is provided', () => {
		const data = [
			new WorkingHoursDto(1, '08:00:00', '10:00:00', true),
			new WorkingHoursDto(2, '', '', false),
			new WorkingHoursDto(3, '', '', false),
			new WorkingHoursDto(4, '', '', false),
			new WorkingHoursDto(5, '', '', false),
			new WorkingHoursDto(6, '', '', false),
			new WorkingHoursDto(7, '', '', false),
		];
		localStorage.setItem('workingHours', JSON.stringify(data));

		component['loadInitialData']();
		expect(component['localStorageData']).toEqual(data);
		expect(component.workingHoursForm.dirty).toBe(true);
	});

	it('should return value from local storage when enum is LOCAL_STORAGE', () => {
		const dto = new WorkingHoursDto(1, '10:00:00', '12:00:00', true);
		component['localStorageData'] = [dto, new WorkingHoursDto(2, '', '', false)];

		const result = component['getFieldValue'](FormInitializationType.LOCAL_STORAGE, 1);
		expect(result).toEqual(dto);
	});

	it('should return default empty dto if enum is EMPTY or unknown', () => {
		expect(component['getFieldValue'](FormInitializationType.EMPTY, 3)).toEqual(
			new WorkingHoursDto(3, '', '', false),
		);

		expect(component['getFieldValue'](999 as any, 4)).toEqual(new WorkingHoursDto(4, '', '', false));
	});

	it('should copy schedule times to all enabled days except source', () => {
		const form = component.workingHoursForm;
		const monday = form.get('monday') as FormGroup;
		const tuesday = form.get('tuesday') as FormGroup;

		monday.get('isEnabled')?.setValue(true);
		tuesday.get('isEnabled')?.setValue(true);

		const mondaySchedule = monday.get('schedule') as FormGroup;
		mondaySchedule.get('start')?.setValue('08:00');
		mondaySchedule.get('end')?.setValue('10:00');

		component.copyToAll(monday);

		const tuesdaySchedule = tuesday.get('schedule') as FormGroup;
		expect(tuesdaySchedule.get('start')?.value).toBe('08:00');
		expect(tuesdaySchedule.get('end')?.value).toBe('10:00');
	});

	// ─── populateForm ──────────────────────────────────────────────────────────

	describe('populateForm', () => {
		it('should NOT modify the form for a day where isChecked is false', () => {
			// Arrange
			const data = [new WorkingHoursDto(1, '08:00:00', '17:00:00', false)];

			// Act
			component.populateForm(data);

			// Assert
			const mondayEnabled = component.workingHoursForm.get('monday')?.get('isEnabled')?.value;
			expect(mondayEnabled).toBe(false);
		});

		it('should set isEnabled and schedule start/end for a day where isChecked is true', () => {
			// Arrange
			const data = [new WorkingHoursDto(1, '09:00:00', '18:00:00', true, 'some-id')];

			// Act
			component.populateForm(data);

			// Assert
			const mondayGroup = component.workingHoursForm.get('monday') as FormGroup;
			expect(mondayGroup.get('isEnabled')?.value).toBe(true);
			expect(mondayGroup.get('schedule')?.get('start')?.value).toBeTruthy();
			expect(mondayGroup.get('schedule')?.get('end')?.value).toBeTruthy();
		});

		it('should update the WorkingHoursDto entry in the array for a checked day', () => {
			// Arrange
			const data = [new WorkingHoursDto(1, '10:00:00', '16:00:00', true, 'test-id')];

			// Act
			component.populateForm(data);

			// Assert
			expect(data[0]).toBeInstanceOf(WorkingHoursDto);
			expect(data[0].id).toBe('test-id');
			expect(data[0].isChecked).toBe(true);
		});

		it('should skip entries with undefined savedDay without throwing', () => {
			// Arrange - empty array means all slots resolve to undefined
			const data: WorkingHoursDto[] = [];

			// Act & Assert
			expect(() => component.populateForm(data)).not.toThrow();
		});
	});

	// ─── mapWorkingHours with workingHoursData ─────────────────────────────────

	describe('mapWorkingHours with workingHoursData set', () => {
		it('should include the ids from workingHoursData when it is provided', () => {
			// Arrange
			component.workingHoursData = [
				new WorkingHoursDto(1, '08:00:00', '17:00:00', true, 'id-1'),
				new WorkingHoursDto(2, '', '', false, 'id-2'),
				new WorkingHoursDto(3, '', '', false, 'id-3'),
				new WorkingHoursDto(4, '', '', false, 'id-4'),
				new WorkingHoursDto(5, '', '', false, 'id-5'),
				new WorkingHoursDto(6, '', '', false, 'id-6'),
				new WorkingHoursDto(7, '', '', false, 'id-7'),
			];

			const mondayGroup = component.workingHoursForm.get('monday') as FormGroup;
			mondayGroup.get('isEnabled')?.setValue(true);
			const startDate = new Date();
			startDate.setHours(8, 0, 0, 0);
			const endDate = new Date();
			endDate.setHours(17, 0, 0, 0);
			mondayGroup.get('schedule')?.setValue({ start: startDate, end: endDate });

			// Act
			const result = component.mapWorkingHours();

			// Assert
			expect(result[0].id).toBe('id-1');
			expect(result[1].id).toBe('id-2');
		});
	});
});
