export default class DateUtils {

	/**
	 * Converts a date's format from using dash to forward slash
	 * @example:
	 * "2024-16-02" => "02/16/2024"
	 * @param dashedDate
	 */
	static convertDateFormat = (dashedDate: string) => {
		const dateArray = dashedDate.toString().split('-');
		dateArray.reverse();
		return dateArray.join('/');
	}

	static isDateBeforeToday = (date: Date) => {
		const today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		return new Date(date) < new Date(today);
	}

	static isDateBeforeWeek = (date: Date) => {
		const today = new Date();
		const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
		return date < startOfWeek;
	}

	static isDateBeforeMonth = (date: Date) => {
		const today = new Date();
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		return date < startOfMonth;
	}

	static isDateBeforeYear = (date: Date) => {
		const today = new Date();
		const startOfYear = new Date(today.getFullYear(), 0, 1);
		return date < startOfYear;
	}

	static isTimeBetweenSlots = (startTime: string, endTime: string): boolean => {
		const currentTime = new Date();
		const currentHour = currentTime.getHours();
		const currentMinute = currentTime.getMinutes();

		const [startHour, startMinute] = startTime.split(':').map(Number);
		const [endHour, endMinute] = endTime.split(':').map(Number);

		const currentTimeValue = currentHour * 60 + currentMinute;
		const startTimeValue = startHour * 60 + startMinute;
		const endTimeValue = endHour * 60 + endMinute;

		return currentTimeValue >= startTimeValue && currentTimeValue <= endTimeValue;
	}

	static getDayString = (day: number): string => {
		switch (day) {
			case 1:
				return 'generic.weekDays.monday';
			case 2:
				return 'generic.weekDays.tuesday';
			case 3:
				return 'generic.weekDays.wednesday';
			case 4:
				return 'generic.weekDays.thursday';
			case 5:
				return 'generic.weekDays.friday';
			case 6:
				return 'generic.weekDays.saturday';
			case 7:
				return 'generic.weekDays.sunday';
			default:
				return '';
		}
	}

	static checkUserTimezone(expectedTimezone: string): boolean {
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return timeZone == expectedTimezone;
	}

	static isToday(date: Date): boolean {
		const todayDateString = new Date().toDateString();
		 return todayDateString === date.toDateString(); 
	}

	static getCurrentDay(): string {
		const now = new Date();
		return now.toISOString().split("T")[0];
	};
}
