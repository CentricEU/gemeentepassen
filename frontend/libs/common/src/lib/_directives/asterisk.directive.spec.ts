import { Component, DebugElement, ElementRef, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MarkAsteriskDirective } from './asterisk.directive';

@Component({
	standalone: false,
	template: ` <div frontendRequiredInput [isVisible]="false">
		<label>Test<span class="required-asterisk"> *</span></label>
	</div>`,
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
			declarations: [TestComponent, MarkAsteriskDirective],
			imports: [BrowserAnimationsModule],
		});

		fixture = TestBed.createComponent(TestComponent);

		fixture.detectChanges();

		directive = fixture.debugElement.query(By.directive(MarkAsteriskDirective));
		el = directive.injector.get(ElementRef);
	});

	it('should create an instance', () => {
		expect(directive).toBeTruthy();
	});

	describe('when isVisible is true', () => {
		let fixture: ComponentFixture<TestComponent>;

		beforeEach(() => {
			TestBed.resetTestingModule();
			TestBed.configureTestingModule({
				declarations: [TestComponent, MarkAsteriskDirective],
				imports: [BrowserAnimationsModule],
			})
				.overrideComponent(TestComponent, {
					set: {
						template: `<div frontendRequiredInput [isVisible]="true"><label>Test</label></div>`,
					},
				})
				.compileComponents();

			fixture = TestBed.createComponent(TestComponent);
			fixture.detectChanges();
		});

		it('should not add asterisk if isVisible is true', () => {
			const asteriskSpan = fixture.nativeElement.querySelector('.required-asterisk');
			expect(asteriskSpan).toBeNull();
		});
	});
	it('should call Renderer2 methods to create and append asterisk span when needed', () => {
		TestBed.resetTestingModule();

		const mockRenderer: Partial<Renderer2> = {
			createText: jest.fn(() => document.createTextNode(' *')),
			createElement: jest.fn(() => document.createElement('span')),
			addClass: jest.fn(),
			appendChild: jest.fn(),
			parentNode: jest.fn((el) => el),
		};

		const mockEl = document.createElement('div');
		const mockLabel = document.createElement('label');
		mockEl.appendChild(mockLabel);

		TestBed.configureTestingModule({
			providers: [{ provide: Renderer2, useValue: mockRenderer }],
		});

		const directive = new MarkAsteriskDirective(mockRenderer as Renderer2, new ElementRef(mockEl));
		directive.isVisible = false;

		directive.ngOnInit();

		expect(mockRenderer.createText).toHaveBeenCalledWith(' *');
		expect(mockRenderer.createElement).toHaveBeenCalledWith('span');
		expect(mockRenderer.addClass).toHaveBeenCalledWith(expect.anything(), 'required-asterisk');
		expect(mockRenderer.appendChild).toHaveBeenCalledTimes(2);
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
		const spans = el.nativeElement.querySelectorAll('.required-asterisk');
		expect(spans.length).toBe(1);
	});

	it('should return early when isVisible is true', () => {
		const spyRenderer = jest.spyOn(fixture.componentRef.injector.get(Renderer2), 'createText');
		const spyAppendChild = jest.spyOn(fixture.componentRef.injector.get(Renderer2), 'appendChild');

		fixture.componentInstance.isVisible = true;
		fixture.detectChanges();

		expect(spyRenderer).not.toHaveBeenCalled();
		expect(spyAppendChild).not.toHaveBeenCalled();
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
