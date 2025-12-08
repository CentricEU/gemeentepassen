export class TextAreaCounterResult {
	messageKey: string;
	messageCount: number;
	isOverLimit: boolean;

	constructor(messageKey: string, messageCount: number, isOverLimit: boolean) {
		this.messageKey = messageKey;
		this.messageCount = messageCount;
		this.isOverLimit = isOverLimit;
	}
}
