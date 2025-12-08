import { Component } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { NumericInputDirective } from './numerical-input.directive';

@Component({
	standalone: false,
	imports: [ReactiveFormsModule, NumericInputDirective],
	template: `
		<form [formGroup]="form">
			<input frontendNumericalInput formControlName="numericInput" />
		</form>
	`,
})
class TestComponent {
	form = new FormGroup({
		numericInput: new FormControl(''),
	});
}
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
			declarations: [TestComponent, NumericInputDirective],
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

	it('should prevent input if resulting value does not match numerical regex', () => {
		fixture.componentInstance.form.get('numericInput')?.setValue('123');
		fixture.detectChanges();

		const event = new KeyboardEvent('keydown', { key: 'a' });
		const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

		inputElement.dispatchEvent(event);

		expect(preventDefaultSpy).toHaveBeenCalled();
	});
	it('should allow input if resulting value matches numerical regex', () => {
		fixture.componentInstance.form.get('numericInput')?.setValue('123');
		fixture.detectChanges();

		const event = new KeyboardEvent('keydown', { key: '4' });
		const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

		inputElement.dispatchEvent(event);

		expect(preventDefaultSpy).not.toHaveBeenCalled();
	});
});
