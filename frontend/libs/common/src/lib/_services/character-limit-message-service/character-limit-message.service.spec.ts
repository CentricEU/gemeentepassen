import { TestBed } from '@angular/core/testing';

import { CharacterLimitMessageService } from './character-limit-message.service';

describe('CharacterLimitMessageService', () => {
	let service: CharacterLimitMessageService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CharacterLimitMessageService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should set messageKey to charactersLeft when within limit', () => {
		service.updateCharacterLimitInfo('short text', 20);

		expect(service.messageKey).toBe('general.label.charactersLeft');
		expect(service.messageCount).toBe(20 - 'short text'.length);
		expect(service.isOverCharacterLimit).toBe(false);
	});

	it('should set messageKey to charactersOverTheLimit when over the limit', () => {
		service.updateCharacterLimitInfo('this is a very long message', 10);

		expect(service.messageKey).toBe('general.label.charactersOverTheLimit');
		expect(service.messageCount).toBe('this is a very long message'.length - 10);
		expect(service.isOverCharacterLimit).toBe(true);
	});

	it('should handle null input as empty string', () => {
		service.updateCharacterLimitInfo(null, 5);

		expect(service.messageKey).toBe('general.label.charactersLeft');
		expect(service.messageCount).toBe(5);
		expect(service.isOverCharacterLimit).toBe(false);
	});

	it('should update correctly when onTextareaValueChanged is called with input under limit', () => {
		service.onTextareaValueChanged('abc', 10);

		expect(service.messageKey).toBe('general.label.charactersLeft');
		expect(service.messageCount).toBe(7); // 10 - 3
		expect(service.isOverCharacterLimit).toBe(false);
	});

	it('should update correctly when onTextareaValueChanged is called with input over limit', () => {
		service.onTextareaValueChanged('exceeds limit', 5);

		expect(service.messageKey).toBe('general.label.charactersOverTheLimit');
		expect(service.messageCount).toBe('exceeds limit'.length - 5);
		expect(service.isOverCharacterLimit).toBe(true);
	});

	it('should update correctly when onClearValue is called', () => {
		service.onClearValue(12);

		expect(service.messageKey).toBe('general.label.charactersLeft');
		expect(service.messageCount).toBe(12);
		expect(service.isOverCharacterLimit).toBe(false);
	});
});
