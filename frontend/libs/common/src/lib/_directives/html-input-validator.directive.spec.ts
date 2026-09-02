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

	it('should return error object for input matching jsPattern', () => {
		const control = new FormControl('<script>alert("XSS")</script>');
		const result = directive.validate(control);
		expect(result).toEqual({ isHTML: true });
	});
});
