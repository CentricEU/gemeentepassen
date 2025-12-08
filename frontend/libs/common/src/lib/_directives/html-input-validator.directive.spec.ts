import { FormControl } from '@angular/forms';
import DOMPurify from 'dompurify';

import { RegexUtil } from '../_util/regex-util';
import { HtmlContentValidatorDirective } from './html-input-validator.directive';

jest.mock('dompurify', () => ({
	default: {
		sanitize: jest.fn((value: any) => value),
	},
}));

describe('HtmlContentValidatorDirective', () => {
	let directive: HtmlContentValidatorDirective;

	beforeEach(() => {
		directive = new HtmlContentValidatorDirective();
		(DOMPurify.sanitize as jest.Mock).mockImplementation((value: any) => value);
	});

	const testCases = [
		{ value: '', expected: null, description: 'empty control value' },
		{ value: 'function() { alert("Hello"); }', expected: null, description: 'JavaScript code without HTML' },
		{ value: null, expected: null, description: 'null control value' },
	];

	testCases.forEach((testCase) => {
		it(`should return ${JSON.stringify(testCase.expected)} for ${testCase.description}`, () => {
			const control = new FormControl(testCase.value);
			const result = directive.validate(control);
			expect(result).toEqual(testCase.expected);
		});
	});

	it('should return error object if sanitized HTML is different from original', () => {
		const dangerousHtml = '<script>alert("XSS")</script>';

		(DOMPurify.sanitize as jest.Mock).mockReturnValue('');

		const control = new FormControl(dangerousHtml);
		const result = directive.validate(control);

		expect(result).toEqual({ isHTML: true });
	});

	it('should return null if sanitized HTML is equal to original', () => {
		const safeHtml = '<p>Hello</p>';
		(DOMPurify.sanitize as jest.Mock).mockReturnValue(safeHtml);

		const control = new FormControl(safeHtml);
		const result = directive.validate(control);

		expect(result).toBeNull();
	});

	describe('isValidJavaScript', () => {
		it('should return true for JS input that matches jsPattern', () => {
			jest.spyOn(RegexUtil.jsPattern, 'test').mockReturnValue(true);
			const result = (directive as any).isValidJavaScript('function test() {}');
			expect(result).toBe(true);
		});

		it('should return false for input that does not match jsPattern', () => {
			jest.spyOn(RegexUtil.jsPattern, 'test').mockReturnValue(false);
			const result = (directive as any).isValidJavaScript('just a string');
			expect(result).toBe(false);
		});
	});

	describe('isValidHtml', () => {
		it('should return false if DOMParser throws an error', () => {
			const originalDOMParser = (global as any).DOMParser;

			(global as any).DOMParser = jest.fn(() => ({
				parseFromString: () => {
					throw new Error('Parser error');
				},
			}));

			const result = (directive as any).isValidHtml('<invalid><html>');
			expect(result).toBe(false);

			(global as any).DOMParser = originalDOMParser;
		});
	});
});
