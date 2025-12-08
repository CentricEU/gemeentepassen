export class MonthYearEntry {
	public monthLabel: string;
	public monthValue?: number;
	public year?: number;

	constructor(monthLabel: string, monthValue?: number, year?: number) {
		this.monthLabel = monthLabel;
		this.monthValue = monthValue;
		this.year = year;
	}
}
