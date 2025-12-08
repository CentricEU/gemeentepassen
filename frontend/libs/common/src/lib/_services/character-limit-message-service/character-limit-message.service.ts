import { Injectable } from '@angular/core';

import { FormUtil } from '../../_util/form.util';

@Injectable({
	providedIn: 'root',
})
export class CharacterLimitMessageService {
	public messageKey = 'general.label.charactersLeft';
	public messageCount = 0;
	public isOverCharacterLimit = false;

	public onTextareaValueChanged(value: number | string, maxLength: number): void {
		this.updateCharacterLimitInfo(value, maxLength);
	}

	public onClearValue(maxLength: number): void {
		this.updateCharacterLimitInfo(null, maxLength);
	}

	public updateCharacterLimitInfo(inputValue: string | number | null, maxLength: number): void {
		const { messageKey, messageCount, isOverLimit } = FormUtil.getTextAreaCounterData(inputValue, maxLength);

		this.messageKey = messageKey;
		this.messageCount = messageCount;
		this.isOverCharacterLimit = isOverLimit;
	}
}
