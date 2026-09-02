import * as moment from 'moment';

export class DateUtil {
	public static toMoment(date: any): moment.Moment | null {
		return date ? moment(date) : null;
	}
}
