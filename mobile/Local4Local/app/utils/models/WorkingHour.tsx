export class WorkingHour {
	public id: string;
	public day: number;
	public openTime: string;
	public closeTime: string;
	public isChecked: boolean;

	constructor(id: string, day: number, openTime: string, closeTime: string, isChecked: boolean) {
		this.id = id;
		this.day = day;
		this.openTime = openTime;
		this.closeTime = closeTime;
		this.isChecked = isChecked;
	}
}
