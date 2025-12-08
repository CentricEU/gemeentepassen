/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CitizenGroupsService, MAX_FILE_SIZE_UPLOAD, RequiredDocuments } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TOAST_CONFIG, ToastrService } from '@windmill/ng-windmill/toastr';
import { of } from 'rxjs';

import { TooltipOnEllipsisDirective } from '../../shared/directives/tooltip-on-elipsis/tooltip-on-elipsis.directive';
import { CitizenDocumentsNeededComponent } from './citizen-documents-needed.component';

describe('CitizenDocumentsNeededComponent', () => {
	let component: CitizenDocumentsNeededComponent;
	let fixture: ComponentFixture<CitizenDocumentsNeededComponent>;

	let citizenGroupServiceMock: jest.Mocked<CitizenGroupsService>;
	let toastrServiceMock: { error: jest.Mock };

	beforeEach(async () => {
		global.IntersectionObserver = class {
			observe = jest.fn();
			unobserve = jest.fn();
			disconnect = jest.fn();
		} as any;

		citizenGroupServiceMock = {
			getRequiredDocumentsForCitizenGroup: jest.fn(() => of([])),
		} as any;

		toastrServiceMock = { error: jest.fn() };

		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			imports: [
				CitizenDocumentsNeededComponent,
				TranslateModule.forRoot(),
				TooltipOnEllipsisDirective,
				NoopAnimationsModule,
			],
			providers: [
				{ provide: CitizenGroupsService, useValue: citizenGroupServiceMock },
				{ provide: ToastrService, useValue: toastrServiceMock },
				TranslateService,
				{ provide: TOAST_CONFIG, useValue: {} },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CitizenDocumentsNeededComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit filesUploadedChanged with filtered files', () => {
		const file = new File(['test'], 'test.txt', { type: 'text/plain' });
		const emitSpy = jest.spyOn(component.filesUploadedChanged, 'emit');
		jest.spyOn(component as any, 'filterFiles').mockReturnValue([file]);
		component.onFilesUploaded([file]);
		expect(emitSpy).toHaveBeenCalledWith([file]);
	});

	it('should clear files if no new files and shouldConcat is false', () => {
		const emitSpy = jest.spyOn(component.filesUploadedChanged, 'emit');
		jest.spyOn(component as any, 'filterFiles').mockReturnValue([]);
		component.files = [new File(['test'], 'test.txt', { type: 'text/plain' })];
		component.onFilesUploaded([], false);
		expect(component.files).toEqual([]);
		expect(emitSpy).not.toHaveBeenCalled();
	});

	it('should concat files if shouldConcat is true', () => {
		const file1 = new File(['test'], 'test1.txt', { type: 'text/plain' });
		const file2 = new File(['test'], 'test2.txt', { type: 'text/plain' });
		jest.spyOn(component as any, 'filterFiles').mockReturnValue([file2]);
		component.files = [file1];
		const emitSpy = jest.spyOn(component.filesUploadedChanged, 'emit');
		component.onFilesUploaded([file2], true);
		expect(component.files).toEqual([file1, file2]);
		expect(emitSpy).toHaveBeenCalledWith([file1, file2]);
	});

	it('should remove file at given index', () => {
		const file1 = new File(['test'], 'test1.txt', { type: 'text/plain' });
		const file2 = new File(['test'], 'test2.txt', { type: 'text/plain' });
		component.files = [file1, file2];
		component.removeFile(0);
		expect(component.files).toEqual([file2]);
	});

	it('should filter requiredDocuments on initDocumentsToUpload', () => {
		const requiredDocs = [RequiredDocuments.PROOF_OF_IDENTITY, RequiredDocuments.ASSETS];
		citizenGroupServiceMock.getRequiredDocumentsForCitizenGroup.mockReturnValue(of(requiredDocs));
		component['initDocumentsToUpload']();
		fixture.detectChanges();
		expect(component.requiredDocuments.every((doc) => requiredDocs.includes(doc.value as RequiredDocuments))).toBe(
			true,
		);
	});

	it('should filterFiles and return accepted files', () => {
		const file = new File(['test'], 'test.txt', { type: 'text/plain' });
		const result = component['filterFiles']([file]);
		expect(result).toEqual([file]);
	});

	it('should show toaster when duplicate file uploaded', () => {
		const toastrSpy = jest.spyOn((component as any).toastrService, 'error');
		const translateSpy = jest
			.spyOn((component as any).translateService, 'instant')
			.mockReturnValue('Duplicate error');
		const fakeFile = new File(['abc'], 'dup.txt', { type: 'text/plain' });

		component.onFilesDuplicated(fakeFile);

		expect(translateSpy).toHaveBeenCalledWith('citizenDocumentsUpload.fileUploadFailDuplicated', {
			fileName: fakeFile.name,
		});
		expect(toastrSpy).toHaveBeenCalled();
	});

	it('should filterFiles reject unsupported type and show error', () => {
		const badFile = new File(['abc'], 'bad.xyz', { type: 'application/xyz' });
		const toastrSpy = jest.spyOn((component as any).toastrService, 'error');
		jest.spyOn((component as any).translateService, 'instant').mockReturnValue('Unsupported format');

		const result = (component as any).filterFiles([badFile]);

		expect(result).toEqual([]);
		expect(toastrSpy).toHaveBeenCalled();
	});

	it('should filterFiles reject file exceeding max size', () => {
		const bigFile = new File(['a'.repeat(MAX_FILE_SIZE_UPLOAD + 1)], 'big.txt', { type: 'text/plain' });
		const toastrSpy = jest.spyOn((component as any).toastrService, 'error');
		jest.spyOn((component as any).translateService, 'instant').mockReturnValue('Too big');

		const result = (component as any).filterFiles([bigFile]);

		expect(result).toEqual([]);
		expect(toastrSpy).toHaveBeenCalled();
	});

	it('should call toastrService.error with correct parameters', () => {
		component['showErrorToaster']('My error');

		expect(toastrServiceMock.error).toHaveBeenCalledWith(
			'<p>My error</p>',
			'',
			expect.objectContaining({
				toastBackground: 'toast-light',
				enableHtml: true,
				progressBar: true,
				tapToDismiss: true,
				timeOut: 8000,
				extendedTimeOut: 8000,
			}),
		);
	});

	it('should remove only selected file when multiple exist', () => {
		const file1 = new File(['1'], 'f1.txt', { type: 'text/plain' });
		const file2 = new File(['2'], 'f2.txt', { type: 'text/plain' });
		const file3 = new File(['3'], 'f3.txt', { type: 'text/plain' });

		component.files = [file1, file2, file3];
		component.removeFile(1);

		expect(component.files).toEqual([file1, file3]);
	});
});
