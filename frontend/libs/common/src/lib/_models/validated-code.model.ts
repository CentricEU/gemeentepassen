export class ValidatedCode {
	public code: string;
	public date: string;
	public time: string;

	constructor(code: string, date: string, time: string) {
		this.code = code;
		this.date = date;
		this.time = time;
	}
}
