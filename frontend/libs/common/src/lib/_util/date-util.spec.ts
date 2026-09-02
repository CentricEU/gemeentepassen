import * as moment from 'moment';
import { DateUtil } from './date-util';

describe('DateUtil', () => {
	describe('toMoment', () => {
		it('should return a moment object when a valid date string is provided', () => {
			const dateStr = '2026-01-15';
			const result = DateUtil.toMoment(dateStr);

			expect(result).not.toBeNull();
			expect(moment.isMoment(result)).toBe(true);
			expect(result?.format('YYYY-MM-DD')).toBe(dateStr);
		});

		it('should return a moment object when a valid Date object is provided', () => {
			const dateObj = new Date('2026-01-15');
			const result = DateUtil.toMoment(dateObj);

			expect(result).not.toBeNull();
			expect(moment.isMoment(result)).toBe(true);
			expect(result?.toDate().toISOString()).toBe(dateObj.toISOString());
		});

		it('should return null when input is null', () => {
			const result = DateUtil.toMoment(null);
			expect(result).toBeNull();
		});

		it('should return null when input is undefined', () => {
			const result = DateUtil.toMoment(undefined);
			expect(result).toBeNull();
		});

		it('should return a moment object when a numeric timestamp is provided', () => {
			const timestamp = 1673779200000; // Corresponds to 2023-01-15
			const result = DateUtil.toMoment(timestamp);

			expect(result).not.toBeNull();
			expect(moment.isMoment(result)).toBe(true);
			expect(result?.valueOf()).toBe(timestamp);
		});
	});
});
