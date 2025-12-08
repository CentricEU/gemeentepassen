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
});
