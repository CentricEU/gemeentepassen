import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import {
	CitizenGroupsService,
	MAX_FILE_SIZE_UPLOAD,
	REQUIRED_DOCUMENTS_LIST,
	RequiredDocuments,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@windmill/ng-windmill/toastr';
import { CentricUploadAreaModule, UploadAreaComponent } from '@windmill/ng-windmill/upload-area';

@Component({
	selector: 'app-citizen-documents-needed',
	imports: [TranslateModule, CommonModule, WindmillModule, CentricUploadAreaModule, UploadAreaComponent],
	templateUrl: './citizen-documents-needed.component.html',
	styleUrl: './citizen-documents-needed.component.scss',
})
export class CitizenDocumentsNeededComponent implements OnInit {
	@Input() files: File[] = [];
	@Output() filesUploadedChanged = new EventEmitter<File[]>();

	public requiredDocuments = REQUIRED_DOCUMENTS_LIST;

	private readonly translateService = inject(TranslateService);
	private readonly toastrService = inject(ToastrService);
	private readonly citizensGroupService = inject(CitizenGroupsService);

	private acceptedFileTypes = ['text/plain', '/pdf', '.document', '/msword'];

	public ngOnInit(): void {
		this.initDocumentsToUpload();
	}

	public onFilesUploaded(files: File[] | FileList, shouldConcat = false): void {
		const newAddedFiles = this.filterFiles(files);

		if (newAddedFiles.length === 0 && !shouldConcat) {
			this.files = [];
			return;
		}

		shouldConcat ? (this.files = this.files.concat(newAddedFiles)) : (this.files = newAddedFiles);
		this.filesUploadedChanged.emit(this.files);
	}

	public onFilesDuplicated(event: File): void {
		const errorMessage = this.translateService.instant('citizenDocumentsUpload.fileUploadFailDuplicated', {
			fileName: event.name,
		});
		this.showErrorToaster(errorMessage);
	}

	public removeFile(index: number): void {
		this.files.splice(index, 1);
	}

	private initDocumentsToUpload(): void {
		this.citizensGroupService.getRequiredDocumentsForCitizenGroup().subscribe((documents: RequiredDocuments[]) => {
			this.requiredDocuments = this.requiredDocuments.filter((doc) =>
				documents.includes(doc.value as RequiredDocuments),
			);
		});
	}

	private filterFiles(files: File[] | FileList): File[] {
		const errorMessages: string[] = [];

		const acceptedFiles: File[] = Array.from(files).filter((file) => {
			if (!this.acceptedFileTypes.some((aft) => file.type.endsWith(aft))) {
				errorMessages.push(
					this.translateService.instant('citizenDocumentsUpload.fileUploadFailUnsupportedFormat'),
				);
				return false;
			}
			if (file.size > MAX_FILE_SIZE_UPLOAD) {
				errorMessages.push(
					this.translateService.instant('citizenDocumentsUpload.fileUploadFailExceedMaximumSize'),
				);
				return false;
			}
			return true;
		});

		if (errorMessages.length) {
			this.showErrorMessage(errorMessages);
		}

		return acceptedFiles;
	}

	private showErrorMessage(errorMessages: string[]): void {
		const errorMessage = [...new Set(errorMessages)].join('\n');
		this.showErrorToaster(errorMessage);
	}

	private showErrorToaster(errorMessage: string): void {
		this.toastrService.error(`<p>${errorMessage}</p>`, '', {
			toastBackground: 'toast-light',
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
	}
}
