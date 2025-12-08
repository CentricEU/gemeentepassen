import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CitizenGroupsService, FileExtension } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { of } from 'rxjs';

import { PassholdersService } from '../../_services/passholders.service';
import { AppModule } from '../../app.module';
import { ImportPassholdersComponent } from './import-passholders.component';

describe('ImportPassholdersComponent', () => {
	let component: ImportPassholdersComponent;
	let fixture: ComponentFixture<ImportPassholdersComponent>;
	let passholderServiceSpy: any;
	let citizenGroupsServiceMock: any;

	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };

	beforeEach(async () => {
		passholderServiceSpy = {
			uploadCSV: jest.fn(),
		};

		citizenGroupsServiceMock = {
			getCitizenGroups: jest.fn().mockReturnValue(of([{ id: '1', groupName: 'Group1' }])),
		};

		await TestBed.configureTestingModule({
			declarations: [ImportPassholdersComponent],
			imports: [WindmillModule, AppModule],
			providers: [
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: PassholdersService, useValue: passholderServiceSpy },
				{ provide: CitizenGroupsService, useValue: citizenGroupsServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ImportPassholdersComponent);
		component = fixture.componentInstance;
		passholderServiceSpy.uploadCSV.mockReturnValue(of({}));

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return true if file is not present', () => {
		expect(component.isImportDisabled).toBeTruthy();
	});

	it('should return false if file is present and citizenGroup is selected', () => {
		const file = new File(['fileContent'], 'test-file.csv', { type: 'text/csv' });
		component.onFileSelected(file);

		component.importPassholdersForm.get('citizenGroup')?.setValue('test-group');

		expect(component.isImportDisabled).toBeFalsy();
	});

	it('should return accepted formats', () => {
		expect(component.acceptedFormats).toEqual([FileExtension.CSV]);
	});

	it('should close the dialog when close method is called', () => {
		jest.spyOn(dialogRefStub, 'close');

		component.close();

		expect(dialogRefStub.close).toHaveBeenCalled();
	});

	it('should set the file property when onFileSelected method is called', () => {
		const file = new File(['fileContent'], 'test-file.csv', { type: 'text/csv' });

		component.onFileSelected(file);

		expect(component.file).toBe(file);
	});

	it('should upload the file', () => {
		jest.spyOn(passholderServiceSpy, 'uploadCSV');
		component.file = new File(['fileContent'], 'test-file.csv', { type: 'text/csv' });

		component.importPassholdersForm.get('citizenGroup')?.setValue('test-group');

		component.uploadCsv();

		expect(passholderServiceSpy.uploadCSV).toHaveBeenCalledWith(component.file, 'test-group');
	});

	describe('initForm', () => {
		it('should initialize form with citizenGroup control and required validator', () => {
			(component as any).initForm();
			const citizenGroupControl = component.importPassholdersForm.get('citizenGroup');
			expect(citizenGroupControl).toBeTruthy();
			expect(citizenGroupControl?.validator).toBeTruthy();
		});

		it('should add additional controls when citizenGroupData exists', () => {
			component.citizenGroupData = [
				{ formControl: 'formControlCitizenGroup-Test' } as any,
				{ formControl: 'formControlCitizenGroup-Another' } as any,
			];

			(component as any).initForm();

			expect(component.importPassholdersForm.contains('formControlCitizenGroup-Test')).toBeTruthy();
			expect(component.importPassholdersForm.contains('formControlCitizenGroup-Another')).toBeTruthy();
		});

		it('should not add extra controls when citizenGroupData is undefined', () => {
			component.citizenGroupData = [];

			(component as any).initForm();

			expect(Object.keys(component.importPassholdersForm.controls)).toEqual(['citizenGroup']);
		});
	});

	it('should call loadInitialData inside ngOnInit', () => {
		const spy = jest.spyOn(component as any, 'loadInitialData');

		(component as any).initForm();
		component.ngOnInit();

		expect(spy).toHaveBeenCalled();
	});

	it('should populate citizenGroupData after ngOnInit', () => {
		citizenGroupsServiceMock.getCitizenGroups.mockReturnValue(of([{ id: '1', groupName: 'Group1' }]));

		(component as any).initForm();
		component.ngOnInit();
		fixture.detectChanges();

		expect(component.citizenGroupData.length).toBe(1);
		expect(component.importPassholdersForm.get('citizenGroup')?.value).toBe('1');
	});

	describe('isImportDisabled', () => {
		beforeEach(() => {
			(component as any).initForm(); // Ensure form is initialized
		});

		it.each([
			['should return true when no file and no citizenGroup selected', undefined, undefined, true],
			[
				'should return true when file exists but citizenGroup is empty',
				new File(['fileContent'], 'test.csv', { type: 'text/csv' }),
				undefined,
				true,
			],
			['should return true when citizenGroup is selected but no file', undefined, 'group1', true],
			[
				'should return false when both file and citizenGroup are present',
				new File(['fileContent'], 'test.csv', { type: 'text/csv' }),
				'group1',
				false,
			],
		])('%s', (_description, file, citizenGroup, expected) => {
			if (file) component.file = file;
			if (citizenGroup) component.importPassholdersForm.get('citizenGroup')?.setValue(citizenGroup);

			expect(component.isImportDisabled).toBe(expected);
		});
	});
});
