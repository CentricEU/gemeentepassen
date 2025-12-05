import { Component } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { NumericInputDirective } from './numerical-input.directive';

@Component({
	template: `<input frontendNumericalInput formControlName="numericInput" />`,
})
class TestComponent {}
class MockClipboardEvent extends Event {
	clipboardData: {
		getData: (format: string) => string;
		setData: (format: string, value: string) => void;
	};

	constructor() {
		super('paste');
		this.clipboardData = {
			getData: (format) => '',
			setData: (format, value) => {
				return;
			},
		};
	}
}

describe('NumericInputDirective', () => {
	let fixture: ComponentFixture<TestComponent>;
	let inputElement: HTMLInputElement;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [NumericInputDirective, TestComponent],
			imports: [FormsModule, ReactiveFormsModule],
			providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
		});

		fixture = TestBed.createComponent(TestComponent);
		fixture.detectChanges();

		const inputDebugElement = fixture.debugElement.query(By.directive(NumericInputDirective));
		if (inputDebugElement) {
			inputElement = inputDebugElement.nativeElement;
		} else {
			throw new Error('Input element not found in the DOM.');
		}
	});

	it('should create an instance', () => {
		expect(inputElement).toBeTruthy();
	});
	it('should allow special keys like Backspace and Arrow keys', () => {
		inputElement.value = '123';
		inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
		expect(inputElement.value).toBe('123');
	});

	it('should prevent pasting non-numerical characters', () => {
		const pasteEvent = new MockClipboardEvent();
		pasteEvent.clipboardData.getData = () => 'abc';
		inputElement.dispatchEvent(pasteEvent);
		expect(inputElement.value).toBe('');
	});
});
