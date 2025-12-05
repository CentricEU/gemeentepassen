export class WorkingHoursDto {
	public id?: string;
	public day: number;
	public openTime: string;
	public closeTime: string;
	public isChecked: boolean;

	constructor(day: number, openTime: string, closeTime: string, isChecked: boolean, id?: string) {
		this.closeTime = closeTime;
		this.day = day;
		this.openTime = openTime;
		this.isChecked = isChecked;
		this.id = id;
	}
}
