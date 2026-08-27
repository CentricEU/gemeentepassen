import { FormControl, FormGroup } from '@angular/forms';

import { CommonUtil } from './common-util';

describe('CommonUtil', () => {
	describe('hasValidValue', () => {
		test.each([
			[null, false],
			[undefined, false],
			['', false],
			['test', true],
			[123, true],
			[{}, true],
			[[], true],
		])('should return %s for %p', (input, expected) => {
			expect(CommonUtil.hasValidValue(input as string)).toBe(expected);
		});
	});

	describe('isEnterOrSpace', () => {
		test.each([
			['Enter', true],
			[' ', true],
			['Space', false],
			['EnterKey', false],
			['Spacebar', false],
			['a', false],
			['1', false],
			[null, false],
			[undefined, false],
		])('should return %s for %p', (input, expected) => {
			expect(CommonUtil.isEnterOrSpace(input as string)).toBe(expected);
		});
	});

	describe('enforceStartDateBeforeExpiration', () => {
		test('should do nothing if startDate or expirationDate controls are missing', () => {
			const form = new FormGroup({
				startDate: new FormControl('2023-01-01'),
			});

			CommonUtil.enforceStartDateBeforeExpiration(form);

			expect(form.get('startDate')?.value).toBe('2023-01-01');
			expect(form.get('expirationDate')).toBeNull();
		});

		test.each([
			{ startDate: '2023-01-02', expirationDate: '2023-01-01', expectedValue: '', expectedTouched: true },
			{
				startDate: '2023-01-01',
				expirationDate: '2023-01-02',
				expectedValue: '2023-01-02',
				expectedTouched: false,
			},
			{
				startDate: '2023-01-01',
				expirationDate: '2023-01-01',
				expectedValue: '2023-01-01',
				expectedTouched: false,
			},
		])(
			'should enforce rule: startDate=$startDate, expirationDate=$expirationDate',
			({ startDate, expirationDate, expectedValue, expectedTouched }) => {
				const form = new FormGroup({
					startDate: new FormControl(startDate),
					expirationDate: new FormControl(expirationDate),
				});

				CommonUtil.enforceStartDateBeforeExpiration(form);

				expect(form.get('expirationDate')?.value).toBe(expectedValue);
				expect(form.get('expirationDate')?.touched).toBe(expectedTouched);
			},
		);
	});

	describe('getFormattedMonthDate', () => {
		const RealDate = Date;

		afterEach(() => {
			global.Date = RealDate;
		});

		it('should format date with both year and monthValue provided', () => {
			const result = CommonUtil.getFormattedMonthDate({ monthLabel: 'label', monthValue: 2, year: 2023 });
			expect(result).toBe('2023-02-01');
		});

		it('should use current year if year is undefined', () => {
			const fakeNow = new Date(2022, 5, 15); // June 15, 2022
			global.Date = class extends RealDate {
				constructor(...args: ConstructorParameters<typeof Date>) {
					if (!args.length) {
						super();
						return fakeNow;
					}
					super(...(args as ConstructorParameters<typeof Date>));
					return this;
				}
				static override now() {
					return fakeNow.getTime();
				}
			} as unknown as typeof Date;

			const result = CommonUtil.getFormattedMonthDate({
				monthLabel: 'label',
				monthValue: 7,
			});
			expect(result).toBe('2022-07-01');
		});

		it('should use current month if monthValue is undefined', () => {
			const fakeNow = new Date(2021, 8, 10); // September 10, 2021
			global.Date = class extends RealDate {
				constructor(...args: ConstructorParameters<typeof Date>) {
					if (!args.length) {
						super();
						return fakeNow;
					}
					super(...(args as ConstructorParameters<typeof Date>));
					return this;
				}
				static override now() {
					return fakeNow.getTime();
				}
			} as unknown as typeof Date;

			const result = CommonUtil.getFormattedMonthDate({
				monthLabel: 'label',
				year: 2021,
			});
			expect(result).toBe('2021-09-01');
		});
	});

	describe('getDateIntervals', () => {
		const RealDate = Date;

		afterEach(() => {
			global.Date = RealDate;
		});

		it('should return an array with 6 TransactionDateDropdown entries', () => {
			const result = CommonUtil.getDateIntervals();
			expect(result).toHaveLength(6);
		});

		it('should return correct date intervals for a given month', () => {
			const fakeNow = new Date(2023, 5, 15); // June 15, 2023
			global.Date = class extends RealDate {
				constructor(...args: ConstructorParameters<typeof Date>) {
					if (!args.length) {
						super();
						return fakeNow;
					}
					super(...(args as ConstructorParameters<typeof Date>));
					return this;
				}
				static override now() {
					return fakeNow.getTime();
				}
			} as unknown as typeof Date;

			const result = CommonUtil.getDateIntervals();

			// This month (June 2023)
			expect(result[0].translationLabel).toBe('transactions.dateInterval.thisMonth');
			expect(result[0].startDateInterval).toEqual('2023-06-01');
			expect(result[0].endDateInterval).toEqual('2023-06-30');

			// Last month (May 2023)
			expect(result[1].translationLabel).toBe('transactions.dateInterval.lastMonth');
			expect(result[1].startDateInterval).toEqual('2023-05-01');
			expect(result[1].endDateInterval).toEqual('2023-05-31');

			// Last three months (April - June 2023)
			expect(result[2].translationLabel).toBe('transactions.dateInterval.lastThreeMonths');
			expect(result[2].startDateInterval).toEqual('2023-04-01');
			expect(result[2].endDateInterval).toEqual('2023-06-30');

			// Last six months (January - June 2023)
			expect(result[3].translationLabel).toBe('transactions.dateInterval.lastSixMonths');
			expect(result[3].startDateInterval).toEqual('2023-01-01');
			expect(result[3].endDateInterval).toEqual('2023-06-30');

			// This year (2023)
			expect(result[4].translationLabel).toBe('transactions.dateInterval.thisYear');
			expect(result[4].startDateInterval).toEqual('2023-01-01');
			expect(result[4].endDateInterval).toEqual('2023-06-30');

			// Custom range
			expect(result[5].translationLabel).toBe('transactions.dateInterval.customRange');
			expect(result[5].startDateInterval).toBeUndefined();
			expect(result[5].endDateInterval).toBeUndefined();
		});
	});

	describe('currentMonth', () => {
		const RealDate = Date;

		afterEach(() => {
			global.Date = RealDate;
		});

		it('should return the current month interval', () => {
			const fakeNow = new Date(2024, 2, 20); // March 20, 2024
			global.Date = class extends RealDate {
				constructor(...args: ConstructorParameters<typeof Date>) {
					if (!args.length) {
						super();
						return fakeNow;
					}
					super(...(args as ConstructorParameters<typeof Date>));
					return this;
				}
				static override now() {
					return fakeNow.getTime();
				}
			} as unknown as typeof Date;

			const result = CommonUtil.currentMonth();

			expect(result.translationLabel).toBe('transactions.dateInterval.thisMonth');
			expect(result.startDateInterval).toEqual('2024-03-01');
			expect(result.endDateInterval).toEqual('2024-03-31');
		});
	});

	describe('formatCurrency', () => {
		it('should format currency with Euro symbol and 2 decimal places', () => {
			expect(CommonUtil.formatCurrency(1234.56, 'en-US')).toMatch(/€1[,.]234\.56/);
			expect(CommonUtil.formatCurrency(0, 'en-US')).toBe('€0.00');
		});

		it('should handle different locales', () => {
			const result = CommonUtil.formatCurrency(1234.56, 'de-DE');
			expect(result).toContain('€');
			expect(result).toMatch(/1[.,]234[.,]56/);
		});

		it('should always show 2 decimal places', () => {
			expect(CommonUtil.formatCurrency(100, 'en-US')).toMatch(/€100\.00/);
			expect(CommonUtil.formatCurrency(99.9, 'en-US')).toMatch(/€99\.90/);
		});
	});
});
