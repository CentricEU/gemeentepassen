import { customEmailPatternRule, confirmPasswordMatchRule, customPasswordPatternRule } from './formRules';

describe('Validation Rules', () => {
  describe('customEmailPatternRule', () => {
    it('should return validation object if condition is true', () => {
      const condition = true;
      const messageText = 'Invalid email';
      const validationRule = customEmailPatternRule(condition, messageText);
      
      expect(validationRule).toEqual({
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
          message: messageText
        }
      });
    });

    it('should return an empty object if condition is false', () => {
      const condition = false;
      const messageText = 'Invalid email';
      const validationRule = customEmailPatternRule(condition, messageText);
      
      expect(validationRule).toEqual({});
    });
  });

  describe('confirmPasswordMatchRule', () => {
    it('should return validation object if condition is true', () => {
      const condition = true;
      const fieldNameToMatch = 'password';
      const messageText = 'Passwords do not match';
      const validationRule = confirmPasswordMatchRule(condition, fieldNameToMatch, messageText);
      
      expect(validationRule).toEqual({
        validate: expect.any(Function)
      });

      const validateFunction = validationRule.validate;

      if(!validateFunction){
        return;
      }
      const validValue = 'password';
      const allValues = { password: 'password' };
      expect(validateFunction(validValue, allValues)).toBe(true);
      const invalidValue = 'invalidPassword';
      expect(validateFunction(invalidValue, allValues)).toBe(messageText);
    });

    it('should return an empty object if condition is false', () => {
      const condition = false;
      const fieldNameToMatch = 'password';
      const messageText = 'Passwords do not match';
      const validationRule = confirmPasswordMatchRule(condition, fieldNameToMatch, messageText);
      
      expect(validationRule).toEqual({});
    });
  });

  describe('customPasswordPatternRule', () => {
    it('should return validation object if condition is true', () => {
      const condition = true;
      const messageText = 'Invalid password';
      const validationRule = customPasswordPatternRule(condition, messageText);
      
      expect(validationRule).toEqual({
        pattern: {
          value: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/,
          message: messageText
        }
      });
    });

    it('should return an empty object if condition is false', () => {
      const condition = false;
      const messageText = 'Invalid password';
      const validationRule = customPasswordPatternRule(condition, messageText);
      
      expect(validationRule).toEqual({});
    });
  });
});
