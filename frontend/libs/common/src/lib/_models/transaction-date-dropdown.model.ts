export class TransactionDateDropdown {
	translationLabel?: string;
	startDateInterval?: string;
	endDateInterval?: string;

	constructor(translationLabel: string, startDateInterval?: string, endDateInterval?: string) {
		this.translationLabel = translationLabel;
		this.startDateInterval = startDateInterval;
		this.endDateInterval = endDateInterval;
	}
}
