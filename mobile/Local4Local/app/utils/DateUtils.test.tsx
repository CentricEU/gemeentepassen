import DateUtils from './DateUtils';

describe('DateUtils', () => {
    test('convertDateFormat converts "2024-16-02" to "02/16/2024"', () => {
        const result = DateUtils.convertDateFormat("2024-16-02");
        expect(result).toBe("02/16/2024");
    });

    test('isDateBeforeToday returns true for a date before today', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(DateUtils.isDateBeforeToday(yesterday)).toBe(true);
    });

    test('isDateBeforeToday returns false for today', () => {
        const today = new Date();
        expect(DateUtils.isDateBeforeToday(today)).toBe(false);
    });

    test('isDateBeforeWeek returns true for a date before the start of this week', () => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        expect(DateUtils.isDateBeforeWeek(lastWeek)).toBe(true);
    });

    test('isDateBeforeMonth returns true for a date before the start of this month', () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        expect(DateUtils.isDateBeforeMonth(lastMonth)).toBe(true);
    });

    test('isDateBeforeYear returns true for a date before the start of this year', () => {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        expect(DateUtils.isDateBeforeYear(lastYear)).toBe(true);
    });

    test('getDayString returns correct string for each day', () => {
        expect(DateUtils.getDayString(1)).toBe('generic.weekDays.monday');
        expect(DateUtils.getDayString(2)).toBe('generic.weekDays.tuesday');
        expect(DateUtils.getDayString(3)).toBe('generic.weekDays.wednesday');
        expect(DateUtils.getDayString(4)).toBe('generic.weekDays.thursday');
        expect(DateUtils.getDayString(5)).toBe('generic.weekDays.friday');
        expect(DateUtils.getDayString(6)).toBe('generic.weekDays.saturday');
        expect(DateUtils.getDayString(7)).toBe('generic.weekDays.sunday');
    });

    test('checkUserTimezone returns true if the timezone matches', () => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        expect(DateUtils.checkUserTimezone(timezone)).toBe(true);
    });

    test('isToday returns true if the given date is today', () => {
        const today = new Date();
        expect(DateUtils.isToday(today)).toBe(true);
    });

    test('isToday returns false if the given date is not today', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(DateUtils.isToday(yesterday)).toBe(false);
    });

    describe('isTimeBetweenSlots', () => {
        beforeAll(() => {
            jest.useFakeTimers();
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        test('returns true if the current time is between the given slots', () => {
            jest.setSystemTime(new Date('2024-07-12T10:30:00'));
            expect(DateUtils.isTimeBetweenSlots('10:00', '11:00')).toBe(true);
        });

        test('returns false if the current time is before the start time', () => {
            jest.setSystemTime(new Date('2024-07-12T09:30:00'));
            expect(DateUtils.isTimeBetweenSlots('10:00', '11:00')).toBe(false);
        });

        test('returns false if the current time is after the end time', () => {
            jest.setSystemTime(new Date('2024-07-12T11:30:00'));
            expect(DateUtils.isTimeBetweenSlots('10:00', '11:00')).toBe(false);
        });

        test('returns true if the current time is exactly at the start time', () => {
            jest.setSystemTime(new Date('2024-07-12T10:00:00'));
            expect(DateUtils.isTimeBetweenSlots('10:00', '11:00')).toBe(true);
        });

        test('returns true if the current time is exactly at the end time', () => {
            jest.setSystemTime(new Date('2024-07-12T11:00:00'));
            expect(DateUtils.isTimeBetweenSlots('10:00', '11:00')).toBe(true);
        });


    });

    describe("getCurrentDay function", () => {
        it("should return the current date in YYYY-MM-DD format", () => {
            jest.useFakeTimers().setSystemTime(new Date("2025-03-12T10:00:00Z"));
    
            const result = DateUtils.getCurrentDay();
    
            expect(result).toBe("2025-03-12");
    
            jest.useRealTimers();
        });
    });
});
