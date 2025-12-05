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
});
