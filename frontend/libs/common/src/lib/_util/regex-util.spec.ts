import { RegexUtil } from './regex-util';

describe('RegexUtil', () => {
	it('should match only digits', () => {
		const input = '12345';
		expect(RegexUtil.onlyDigitsRegexPattern.test(input)).toBe(true);
	});

	it('should not match only digits with letters', () => {
		const input = '123abc';
		expect(RegexUtil.onlyDigitsRegexPattern.test(input)).toBe(false);
	});

	it('should not match letters', () => {
		const validInput = '123';
		const invalidInput = 'abc';

		expect(RegexUtil.numericalRegexPattern.test(validInput)).toBe(true);
		expect(RegexUtil.numericalRegexPattern.test(invalidInput)).toBe(false);
	});

	it('should match password pattern', () => {
		const validPassword = 'Passw0rd!';
		const invalidPassword = 'password123';

		expect(RegexUtil.passwordRegexPattern.test(validPassword)).toBe(true);
		expect(RegexUtil.passwordRegexPattern.test(invalidPassword)).toBe(false);
	});

	it('should match email pattern', () => {
		const validEmail = 'user@example.com';
		const invalidEmail = 'invalid-email';

		expect(RegexUtil.emailRegexPattern.test(validEmail)).toBe(true);
		expect(RegexUtil.emailRegexPattern.test(invalidEmail)).toBe(false);
	});

	it('should match zip code pattern', () => {
		const validZipCode = '1234 AB';
		const invalidZipCode = 'invalid';

		expect(RegexUtil.zipCodeRegexPattern.test(validZipCode)).toBe(true);
		expect(RegexUtil.zipCodeRegexPattern.test(invalidZipCode)).toBe(false);
	});

	it('should match telephone pattern', () => {
		const validTelephone = '+31612345678';
		const invalidTelephone = '12345678';

		expect(RegexUtil.telephoneRegexPattern.test(validTelephone)).toBe(true);
		expect(RegexUtil.telephoneRegexPattern.test(invalidTelephone)).toBe(false);
	});
});
