import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService, WorkingHoursDto, WorkingHoursService } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { WindmillModule } from '../../windmil.module';
import { WorkingHoursDialogComponent } from '../working-hours-dialog/working-hours-dialog.component';
import { WorkingHoursComponent } from './working-hours.component';

describe('WorkingHoursComponent', () => {
	let component: WorkingHoursComponent;
	let fixture: ComponentFixture<WorkingHoursComponent>;
	let dialogServiceMock: any;
	let authServiceMock: any;
	let workingHoursServiceMock: any;

	beforeEach(async () => {
		dialogServiceMock = {
			message: jest.fn(),
		};
		authServiceMock = {
			extractSupplierInformation: jest.fn(),
		};
		workingHoursServiceMock = {
			getWorkingHours: jest.fn().mockReturnValue(of([])),
		};
		await TestBed.configureTestingModule({
			declarations: [WorkingHoursComponent],
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), WindmillModule],
			providers: [
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: WorkingHoursService, useValue: workingHoursServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(WorkingHoursComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open the dialog with correct configuration', () => {
		const mockDialogRef = {
			afterClosed: () => of([]),
		};
		dialogServiceMock.message.mockReturnValue(mockDialogRef);
		component.openSaveScheduleModal();
		expect(dialogServiceMock.message).toHaveBeenCalledWith(WorkingHoursDialogComponent, {
			width: '844px',
			height: '600px',
			closeOnNavigation: false,
			data: component.workingHoursData,
		});
	});

	it('should update workingHoursData when dialog is closed with data', () => {
		const testData = [{ isChecked: true, day: 1, openTime: '09:00', closeTime: '17:00', id: '1' }];
		dialogServiceMock.message.mockReturnValue({
			afterClosed: () => of(testData),
		});
		component.openSaveScheduleModal();
		fixture.detectChanges();
		expect(component.workingHoursData).toEqual(testData);
	});

	it('should not update workingHoursData if data returned is null', () => {
		const initialData = [new WorkingHoursDto(1, '09:00', '17:00', true, 'day1')];
		component.workingHoursData = initialData;

		const mockDialogRef = {
			afterClosed: jest.fn().mockReturnValue(of(null)),
		};
		dialogServiceMock.message.mockReturnValue(mockDialogRef);

		component.openSaveScheduleModal();

		expect(component.workingHoursData).toEqual(initialData);
	});

	it('should return true if all days are unchecked', () => {
		component.workingHoursData = [
			new WorkingHoursDto(1, '00:00', '00:00', false, 'day1'),
			new WorkingHoursDto(2, '00:00', '00:00', false, 'day2'),
			new WorkingHoursDto(3, '00:00', '00:00', false, 'day3'),
		];
		expect(component.isDayDataEmpty()).toBe(true);
	});

	it('should return false if any day is checked', () => {
		component.workingHoursData = [
			new WorkingHoursDto(1, '00:00', '00:00', false, 'day1'),
			new WorkingHoursDto(2, '10:00', '18:00', true, 'day2'),
			new WorkingHoursDto(3, '00:00', '00:00', false, 'day3'),
		];
		expect(component.isDayDataEmpty()).toBe(false);
	});

	it('should not modify workingHoursData if no data is returned', () => {
		workingHoursServiceMock.getWorkingHours.mockReturnValue(of([]));
		component.ngOnInit();
		expect(component.workingHoursData).toHaveLength(0);
	});

	it('should populate workingHoursData if data is returned', () => {
		const mockData = [
			{ day: 1, openTime: '08:00', closeTime: '16:00', isChecked: true, id: '1' },
			{ day: 2, openTime: '09:00', closeTime: '17:00', isChecked: false, id: '2' },
		];

		workingHoursServiceMock.getWorkingHours.mockReturnValue(of(mockData));
		component.ngOnInit();
		fixture.detectChanges();

		expect(component.workingHoursData).toHaveLength(2);
		expect(component.workingHoursData[0]).toBeInstanceOf(WorkingHoursDto);
		expect(component.workingHoursData[0].day).toEqual(1);
	});

	it('should handle dialog service message when returns null', () => {
		dialogServiceMock.message.mockReturnValue(null);

		component.openSaveScheduleModal();

		expect(dialogServiceMock.message).toHaveBeenCalled();
	});
});
