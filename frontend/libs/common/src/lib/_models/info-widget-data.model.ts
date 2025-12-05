export class InfoWidgetData {
	public title: string;
	public value: string | number;
	public icon: string;

	constructor(data: InfoWidgetData) {
		this.title = data.title;
		this.value = data.value;
		this.icon = data.icon;
	}
}
