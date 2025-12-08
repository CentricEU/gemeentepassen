import { MonthYearEntry } from './month-year-entry.model';

export class TransactionDateMenu {
	year?: number;
	months: MonthYearEntry[];

	constructor(year: number, months: MonthYearEntry[]) {
		this.year = year;
		this.months = months;
	}
}
