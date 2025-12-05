import { Component, DebugElement, ElementRef, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MarkAsteriskDirective } from './asterisk.directive';

@Component({
	template: `<div frontendRequiredInput [isVisible]="isVisible"></div>`,
})
class TestComponent {
	isVisible = false;
}

describe('MarkAsteriskDirective', () => {
	let fixture: ComponentFixture<TestComponent>;
	let directive: DebugElement;
	let el: ElementRef;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule],
			declarations: [MarkAsteriskDirective, TestComponent],
		});
		fixture = TestBed.createComponent(TestComponent);
		directive = fixture.debugElement.query(By.directive(MarkAsteriskDirective));
		el = directive.injector.get(ElementRef);
	});

	it('should create an instance', () => {
		expect(directive).toBeTruthy();
	});

	it('should not add asterisk if isVisible is true', () => {
		fixture.componentInstance.isVisible = true;
		fixture.detectChanges();

		const asteriskSpan = fixture.nativeElement.querySelector('.required-asterisk');
		expect(asteriskSpan).toBeNull();
	});

	it('should add asterisk if isVisible is false and label does not have asterisk', () => {
		fixture.componentInstance.isVisible = false;
		fixture.detectChanges();

		const asteriskSpan = fixture.nativeElement.querySelector('.required-asterisk');
		expect(asteriskSpan).toBeDefined();
	});

	it('should add an asterisk span if it does not exist', () => {
		const parent = document.createElement('div');
		const label = document.createElement('LABEL');
		parent.appendChild(label);

		const fixture = TestBed.createComponent(TestComponent);
		const directive = fixture.debugElement.query(By.directive(MarkAsteriskDirective));
		const el = directive.injector.get(ElementRef);

		el.nativeElement.appendChild(parent);
		fixture.detectChanges();

		const asteriskSpans = el.nativeElement.querySelectorAll('.required-asterisk');
		expect(asteriskSpans.length).toBe(1);
	});

	it('should not add an additional asterisk span if it already exists', () => {
		const existingAsteriskSpan = document.createElement('span');
		existingAsteriskSpan.className = 'required-asterisk';
		el.nativeElement.appendChild(existingAsteriskSpan);

		fixture.detectChanges();

		expect(el.nativeElement.querySelectorAll('.required-asterisk').length).toBe(1);
	});

	it('should return early when isVisible is true', () => {
		const spyRenderer = jest.spyOn(fixture.componentRef.injector.get(Renderer2), 'createText');
		const spyAppendChild = jest.spyOn(fixture.componentRef.injector.get(Renderer2), 'appendChild');

		fixture.componentInstance.isVisible = true;
		fixture.detectChanges();

		expect(spyRenderer).not.toHaveBeenCalled();
		expect(spyAppendChild).not.toHaveBeenCalled();
	});

	it('should add an asterisk span even if there are other child elements in the label', () => {
		const parent = document.createElement('div');
		const label = document.createElement('LABEL');
		label.textContent = 'Label Text';
		parent.appendChild(label);

		el.nativeElement.appendChild(parent);

		fixture.detectChanges();

		const asteriskSpans = el.nativeElement.querySelectorAll('.required-asterisk');
		expect(asteriskSpans.length).toBe(1);
		expect(label.textContent).toContain('*');
	});

	it('should add an asterisk span to multiple elements with the directive', () => {
		const parent1 = document.createElement('div');
		const label1 = document.createElement('LABEL');
		parent1.appendChild(label1);

		const parent2 = document.createElement('div');
		const label2 = document.createElement('LABEL');
		parent2.appendChild(label2);

		const fixture1 = TestBed.createComponent(TestComponent);
		const fixture2 = TestBed.createComponent(TestComponent);

		const directive1 = fixture1.debugElement.query(By.directive(MarkAsteriskDirective));
		const directive2 = fixture2.debugElement.query(By.directive(MarkAsteriskDirective));

		const el1 = directive1.injector.get(ElementRef);
		const el2 = directive2.injector.get(ElementRef);

		el1.nativeElement.appendChild(parent1);
		el2.nativeElement.appendChild(parent2);

		fixture1.detectChanges();
		fixture2.detectChanges();

		const asteriskSpans1 = el1.nativeElement.querySelectorAll('.required-asterisk');
		const asteriskSpans2 = el2.nativeElement.querySelectorAll('.required-asterisk');

		expect(asteriskSpans1.length).toBe(1);
		expect(asteriskSpans2.length).toBe(1);
	});
});
