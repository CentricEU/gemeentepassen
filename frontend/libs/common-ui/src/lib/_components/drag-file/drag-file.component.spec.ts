import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileExtension, FileWarning } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { WindmillModule } from '../../windmil.module';
import { DragFileComponent } from './drag-file.component';

describe('DragFileComponent', () => {
	let component: DragFileComponent;
	let fixture: ComponentFixture<DragFileComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), WindmillModule],
			declarations: [DragFileComponent],
			providers: [TranslateService],
		}).compileComponents();

		fixture = TestBed.createComponent(DragFileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have empty uploadedFile initially', () => {
		expect(component.uploadedFile).toBeUndefined();
	});

	it('should return correct fileName', () => {
		const file = new File(['fileContent'], 'test-file.txt', { type: 'text/plain' });
		component.uploadedFile = file;

		expect(component.fileName).toBe('test-file.txt');
	});

	it('should return correct fileSize', () => {
		const file = new File(['fileContent'], 'test-file.txt', { type: 'text/plain' });
		component.uploadedFile = file;

		expect(component.fileSize).toBe(file.size);
	});

	it('should hideWarning ', () => {
		component.fileWarning = FileWarning.TOO_MANY_FILES;
		component.hideWarning();
		expect(component.fileWarning).toBe(null);
	});

	it('should set uploadedFile and emit fileSelected event when getUploadedFiles is called', () => {
		const file = new File(['fileContent'], 'test-file.csv', { type: 'text/csv' });
		const emitSpy = jest.spyOn(component.fileSelected, 'emit');
		component.permittedFormats = [FileExtension.CSV];
		component.getUploadedFiles([file]);

		expect(component.uploadedFile).toBe(file);
		expect(emitSpy).toHaveBeenCalledWith(file);
	});
	it('should throw TOO_MANY_FILES when getUploadedFiles is with too many files', () => {
		const file = new File(['fileContent'], 'test-file.csv', { type: 'text/csv' });
		const file2 = new File(['fileContent'], 'test-file.csv', { type: 'text/csv' });

		const emitSpy = jest.spyOn(component.fileSelected, 'emit');
		component.permittedFormats = [FileExtension.CSV];
		component.getUploadedFiles([file, file2]);

		expect(component.fileWarning).toBe(FileWarning.TOO_MANY_FILES);
		expect(emitSpy).not.toHaveBeenCalled();
	});

	it('should throw WRONG_FORMAT when getUploadedFiles is with wrong format', () => {
		const file = new File(['fileContent'], 'test-file.txt', { type: 'text/txt' });

		const emitSpy = jest.spyOn(component.fileSelected, 'emit');
		component.permittedFormats = [FileExtension.CSV];
		component.getUploadedFiles([file]);

		expect(component.fileWarning).toBe(FileWarning.WRONG_FORMAT);
		expect(emitSpy).not.toHaveBeenCalled();
	});

	it('should do nothing if event.target.files is not present when onFileSelected is called', () => {
		const emitSpy = jest.spyOn(component.fileSelected, 'emit');

		component.getUploadedFiles([]);

		expect(component.uploadedFile).toBe(undefined);
		expect(emitSpy).not.toHaveBeenCalled();
	});

	it('should reset uploadedFile to null and emit fileSelected event when removeFile is called', () => {
		const emitSpy = jest.spyOn(component.fileSelected, 'emit');

		component.removeFile();

		expect(component.uploadedFile).toBeNull();
		expect(emitSpy).toHaveBeenCalledWith(null);
	});

	describe('fileUploadButtonText', () => {
		it('should return when file is not present', () => {
			const text = component.fileUploadButtonText();
			expect(text).toEqual(component['translateService'].instant('general.uploadFile'));
		});

		it('should return when file is present', () => {
			const file = new File(['fileContent'], 'test-file.txt', { type: 'text/plain' });
			component.uploadedFile = file;

			const text = component.fileUploadButtonText();
			expect(text).toEqual(component['translateService'].instant('general.replaceFile'));
		});
	});

	describe('suportedFormats', () => {
		it('should return supported formats when permittedFormats is defined', () => {
			component.permittedFormats = [FileExtension.CSV];
			expect(component.suportedFormats).toBe(FileExtension.CSV);
		});

		it('should return an empty string when permittedFormats is undefined', () => {
			expect(component.suportedFormats).toBeUndefined();
		});
	});

	it('should return fileUploadDescriptionText', () => {
		const text = component.fileUploadDescriptionText();
		expect(text).toEqual(component['translateService'].instant('upload.description'));
	});

	it('should return tooManyFilesErrorMessage', () => {
		const text = component.tooManyFilesErrorMessage();
		expect(text).toEqual(component['translateService'].instant('upload.warningFilesNumber'));
	});

	it('should return FileWarning class from warnings getter', () => {
		expect(component.warnings).toBe(FileWarning);
	});
});
