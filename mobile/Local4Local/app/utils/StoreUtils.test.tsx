import { colors } from '../common-style/Palette';
import StoreUtils from './StoreUtils';
import { WorkingHourDto } from './types/workingHourDto';

describe('StoreUtils', () => {
    describe('getStoreStatus', () => {
        test('returns "store.closed" if closingHour is not provided', () => {
            const result = StoreUtils.getStoreStatus(15, '');
            expect(result).toBe('store.closed');
        });

        test('returns "store.closed" if current hour is greater than or equal to closingHour', () => {
            const result = StoreUtils.getStoreStatus(20, '18.5');
            expect(result).toBe('store.closed');
        });

        test('returns "store.open" if current hour is less than closingHour', () => {
            const result = StoreUtils.getStoreStatus(16, '18.5');
            expect(result).toBe('store.open');
        });
    });

    describe('getCurrentWorkingDay', () => {
        const workingHours: WorkingHourDto[] = [
            { id: '1', day: 1, openTime: '08:00', closeTime: '17:00', isChecked: true },
            { id: '2', day: 2, openTime: '08:00', closeTime: '17:00', isChecked: true },
        ];

        test('returns the working hours for the given day of week', () => {
            const result = StoreUtils.getCurrentWorkingDay(workingHours, 1);
            expect(result).toEqual({ id: '1', day: 1, openTime: '08:00', closeTime: '17:00', isChecked: true });
        });

        test('returns undefined if there are no working hours for the given day of week', () => {
            const result = StoreUtils.getCurrentWorkingDay(workingHours, 7);
            expect(result).toBeUndefined();
        });
    });

    describe('getStoreStatusColor', () => {
        test('returns colors.SUCCESS if store is open', () => {
            jest.spyOn(StoreUtils, 'getStoreStatus').mockReturnValue('store.open');
            const result = StoreUtils.getStoreStatusColor(15, '18.5');
            expect(result).toBe(colors.SUCCESS);
        });

        test('returns colors.STATUS_DANGER_500 if store is closed', () => {
            jest.spyOn(StoreUtils, 'getStoreStatus').mockReturnValue('store.closed');
            const result = StoreUtils.getStoreStatusColor(20, '18.5');
            expect(result).toBe(colors.STATUS_DANGER_500);
        });
    });
});
