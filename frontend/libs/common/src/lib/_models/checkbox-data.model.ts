export class CheckboxData {
	public formControl: string;
	public label: string;
	public id: string;
	public dataTestId: string;

	constructor(formControl: string, label: string, id: string, dataTestId: string) {
		this.formControl = formControl;
		this.label = label;
		this.id = id;
		this.dataTestId = dataTestId;
	}
}
