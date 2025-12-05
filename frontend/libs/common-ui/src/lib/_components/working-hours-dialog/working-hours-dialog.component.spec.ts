import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService, WorkingHoursService } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { CommonUiModule } from '../../common-ui.module';
import { WorkingHoursDialogComponent } from './working-hours-dialog.component';

describe('SaveWorkingHoursComponent', () => {
	let dialogRefMock: any;
	let authServiceMock: any;
	let workingHoursServiceMock: any;

	beforeEach(async () => {
		dialogRefMock = {
			close: jest.fn(),
		};
		authServiceMock = {
			extractSupplierInformation: jest.fn().mockReturnValue('supplierId'),
		};
		workingHoursServiceMock = {
			updateWorkingHours: jest.fn(),
			saveWorkingHours: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [WorkingHoursDialogComponent],
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), CommonUiModule],
			providers: [
				FormBuilder,
				{ provide: MatDialogRef, useValue: dialogRefMock },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: WorkingHoursService, useValue: workingHoursServiceMock },
			],
		}).compileComponents();
	});

	function setup(matDialogDataValue: any) {
		TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: matDialogDataValue });
		const fixture = TestBed.createComponent(WorkingHoursDialogComponent);
		const comp = fixture.componentInstance;
		fixture.detectChanges();
		return comp;
	}

	it('should create', () => {
		const component = setup([]);
		expect(component).toBeTruthy();
	});

	it('should call updateWorkingHours if workingHoursData is not empty', () => {
		const component = setup([
			{
				id: '1',
				day: 1,
				openTime: '08:00:00',
				closeTime: '17:00:00',
				isChecked: true,
			},
		]);

		workingHoursServiceMock.updateWorkingHours.mockReturnValue(of(component.workingHoursData));

		component.updateHours();

		expect(workingHoursServiceMock.updateWorkingHours).toHaveBeenCalled();
	});

	it('should close the dialog with current workingHoursData', () => {
		const component = setup([]);
		component.closePopup();
		expect(dialogRefMock.close).toHaveBeenCalledWith(component.workingHoursData);
	});

	it('should update the form when isChecked is true', () => {
		const component = setup([
			{
				id: '1',
				day: 1,
				openTime: '08:00:00',
				closeTime: '17:00:00',
				isChecked: true,
			},
		]);

		const mondayFormGroup = component.workingHoursEdit.workingHoursForm.get('monday') as FormGroup;
		expect(mondayFormGroup.get('isEnabled')?.value).toBeTruthy();
		expect(mondayFormGroup.get('schedule')?.get('start')?.value).not.toBe('');
		expect(mondayFormGroup.get('schedule')?.get('end')?.value).not.toBe('');
	});
});
