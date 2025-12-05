import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { FileExtension } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { of } from 'rxjs';

import { PassholdersService } from '../../_services/passholders.service';
import { AppModule } from '../../app.module';
import { ImportPassholdersComponent } from './import-passholders.component';

describe('ImportPassholdersComponent', () => {
	let component: ImportPassholdersComponent;
	let fixture: ComponentFixture<ImportPassholdersComponent>;
	let passholderServiceSpy: any;

	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };

	beforeEach(async () => {
		passholderServiceSpy = {
			uploadCSV: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [ImportPassholdersComponent],
			imports: [WindmillModule, AppModule],
			providers: [
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: PassholdersService, useValue: passholderServiceSpy },
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

	it('should return false if file is present', () => {
		const file = new File(['fileContent'], 'test-file.csv', { type: 'text/csv' });
		component.onFileSelected(file);
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

	it('should upload the file ', () => {
		jest.spyOn(passholderServiceSpy, 'uploadCSV');
		component.file = new File(['fileContent'], 'test-file.csv', { type: 'text/csv' });
		component.uploadCsv();

		expect(passholderServiceSpy.uploadCSV).toHaveBeenCalledWith(component.file);
	});
});
