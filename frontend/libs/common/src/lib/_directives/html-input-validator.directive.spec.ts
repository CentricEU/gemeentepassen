import { HtmlContentValidatorDirective } from './html-input-validator.directive';
import { FormControl } from '@angular/forms';

describe('HtmlContentValidatorDirective', () => {
	let directive: HtmlContentValidatorDirective;

	beforeEach(() => {
		directive = new HtmlContentValidatorDirective();
	});

	const testCases = [
		{ value: '', expected: null, description: 'empty control value' },
		{
			value: '<p>Test</p>',
			expected: { isHTML: true },
			description: 'HTML content with validator on'
		},
		{ value: 'Test', expected: null, description: 'non-HTML content with validator on' }
	];

	testCases.forEach((testCase) => {
		it(`should return ${JSON.stringify(testCase.expected)} for ${testCase.description}`, () => {
			const control = new FormControl(testCase.value);
			const result = directive.validate(control);
			expect(result).toEqual(testCase.expected);
		});
	});
});
