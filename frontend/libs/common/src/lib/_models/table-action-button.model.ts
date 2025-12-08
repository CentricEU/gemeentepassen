export class TableActionButton {
	public name: string;
	public tooltipTranslationLabel: string;
	public buttonType: string;
	public isDisabled = false;
	public text: string;
	public specificClass: string;

	constructor(
		name: string,
		tooltipTranslationLabel = '',
		isDisabled = false,
		text = '',
		buttonType = 'uncontained-theme',
		specificClass = '',
	) {
		this.name = name;
		this.tooltipTranslationLabel = tooltipTranslationLabel;
		this.isDisabled = isDisabled;
		this.text = text;
		this.specificClass = specificClass;
		this.buttonType = buttonType;
	}
}
