/* eslint-disable prettier/prettier */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CharacterLimitMessageService, FormUtil, TEXT_AREA_MAX_LENGTH } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { CentricUploadAreaModule } from '@windmill/ng-windmill/upload-area';

@Component({
	selector: 'app-additional-information',
	imports: [TranslateModule, CommonModule, WindmillModule, CentricUploadAreaModule],
	templateUrl: './additional-information.component.html',
	styleUrl: './additional-information.component.scss',
})
export class AdditionalInformationComponent implements OnInit {
	@Input() additionalInformationFormGroup!: FormGroup;
	@Output() additionalMessageChanged = new EventEmitter<string>();

	public readonly maxLength = TEXT_AREA_MAX_LENGTH;
	public readonly characterLimitMessageService = inject(CharacterLimitMessageService);

	public validationFunctionError = FormUtil.validationFunctionError;

	public ngOnInit(): void {
		this.characterLimitMessageService.messageCount = this.maxLength;
	}
	
	public onTextareaValueChanged(value: string | number): void {
		const stringValue = String(value);

		this.characterLimitMessageService.onTextareaValueChanged(stringValue, this.maxLength);
		this.additionalMessageChanged.emit(stringValue);
	}

	public onClearAdditionalMessage(): void {
		this.characterLimitMessageService.onClearValue(this.maxLength);
		this.additionalMessageChanged.emit('');
	}
}
