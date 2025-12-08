import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileExtension, FileWarning } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'frontend-drag-file',
	templateUrl: './drag-file.component.html',
	styleUrls: ['./drag-file.component.scss'],
	standalone: false,
})
export class DragFileComponent {
	@Input() permittedFormats: FileExtension[];

	@Output() fileSelected: EventEmitter<File> = new EventEmitter();

	public uploadedFile: File;
	public fileWarning: FileWarning | null;

	public get suportedFormats(): string {
		return this.permittedFormats?.join();
	}

	public get shouldDisplayWarning(): boolean {
		return !!this.fileWarning;
	}

	public get fileName(): string {
		return this.uploadedFile.name;
	}

	public get warnings(): typeof FileWarning {
		return FileWarning;
	}

	public get fileSize(): number {
		return this.uploadedFile.size;
	}

	constructor(private translateService: TranslateService) {}

	public fileUploadButtonText(): string {
		const translationLabel = this.uploadedFile ? 'general.replaceFile' : 'general.uploadFile';
		return this.translateService.instant(translationLabel);
	}

	public fileUploadDescriptionText(): string {
		const translationLabel = this.uploadedFile ? 'upload.descriptionReplace' : 'upload.description';
		return this.translateService.instant(translationLabel);
	}

	public getUploadedFiles(filesSelected: File[]): void {
		if (filesSelected.length === 0) {
			return;
		}

		if (filesSelected.length > 1) {
			this.fileWarning = FileWarning.TOO_MANY_FILES;
			return;
		}

		this.onFileAdded(filesSelected[0]);
	}

	public removeFile(): void {
		this.uploadedFile = null as unknown as File;
		this.fileSelected.emit(this.uploadedFile);
	}

	public hideWarning(): void {
		this.fileWarning = null;
	}

	private isAcceptedFileExtension(file: File): boolean {
		const fileExtension = file.name.split('.').pop();
		const index = this.suportedFormats.indexOf(fileExtension as string);
		return index >= 0;
	}

	private onFileAdded(file: File): void {
		if (!this.isAcceptedFileExtension(file)) {
			this.fileWarning = FileWarning.WRONG_FORMAT;
			return;
		}

		this.uploadedFile = file;
		this.hideWarning();
		this.fileSelected.emit(this.uploadedFile);
	}
}
