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

	describe('dutchBicRegexPattern', () => {
		it.each([
			['valid Dutch BIC (8 characters)', 'ABNANL2A', true],
			['valid Dutch BIC (11 characters)', 'ABNANL2AXXX', true],
			['non-NL BIC (invalid)', 'DEUTDEFF', false],
			['lowercase BIC (invalid)', 'abnanl2a', false],
			['too short BIC (invalid)', 'ABNANL', false],
			['BIC with special characters (invalid)', 'ABNA!L2AXXX', false],
		])('should %s', (_, bic, expected) => {
			expect(RegexUtil.dutchBicRegexPattern.test(bic)).toBe(expected);
		});
	});

	describe('dutchIbanRegexPattern', () => {
		it.each([
			['valid Dutch IBAN', 'NL91ABNA0417164300', true],
			['invalid country code', 'DE91ABNA0417164300', false],
			['too short IBAN', 'NL91ABNA0417', false],
			['non-uppercase characters', 'nl91abna0417164300', false],
			['IBAN with spaces (invalid)', 'NL91 ABNA 0417 1643 00', false],
		])('should %s', (_, iban, expected) => {
			expect(RegexUtil.dutchIbanRegexPattern.test(iban)).toBe(expected);
		});
	});
});
