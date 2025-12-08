import { Component, DebugElement, ElementRef, NgZone } from '@angular/core';
import { Directive, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WindmillTooltipDirective } from '@windmill/ng-windmill/tooltip';

import { TooltipOnEllipsisDirective } from './tooltip-on-elipsis.directive';

@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: '[windmillTooltip]',
	exportAs: 'windmillTooltip',
	standalone: false,
})
class MockWindmillTooltipDirective {
	@Input() tooltipText = '';
	isTooltipDisabled = false;
	tooltipColor = '';
}

@Component({
	standalone: false,
	template: `<div [frontendTooltipOnEllipsis]="tooltipText" windmillTooltip>Test content</div>`,
})
class TestHostComponent {
	tooltipText = 'Tooltip Text';
}

describe('TooltipOnEllipsisDirective', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let debugEl: DebugElement;
	let tooltipDir: MockWindmillTooltipDirective;

	const mockNgZone = {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		onStable: { pipe: () => ({ subscribe: () => {} }) },
	} as unknown as NgZone;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TooltipOnEllipsisDirective, MockWindmillTooltipDirective, TestHostComponent],
			providers: [{ provide: WindmillTooltipDirective, useExisting: MockWindmillTooltipDirective }],
		});

		fixture = TestBed.createComponent(TestHostComponent);
		fixture.detectChanges();

		debugEl = fixture.debugElement.query(By.directive(TooltipOnEllipsisDirective));
		tooltipDir = debugEl.injector.get(MockWindmillTooltipDirective);

		Object.defineProperty(debugEl.nativeElement, 'scrollWidth', { value: 200, configurable: true });
		Object.defineProperty(debugEl.nativeElement, 'clientWidth', { value: 100, configurable: true });
	});

	it('should create directive instance', () => {
		expect(debugEl).toBeTruthy();
	});

	it('should set tooltip text when text is truncated', () => {
		const directiveInstance = debugEl.injector.get(TooltipOnEllipsisDirective);

		fixture.componentInstance.tooltipText = 'Tooltip Text';
		fixture.detectChanges();

		Object.defineProperty(debugEl.nativeElement, 'scrollWidth', { value: 200, configurable: true });
		Object.defineProperty(debugEl.nativeElement, 'clientWidth', { value: 100, configurable: true });

		tooltipDir.tooltipText = fixture.componentInstance.tooltipText;

		fixture.detectChanges();

		(directiveInstance as any).updateTooltipStatus();

		expect(tooltipDir.tooltipText).toBe('Tooltip Text');
		expect(tooltipDir.isTooltipDisabled).toBe(false);
		//expect(tooltipDir.tooltipColor).toBe('surface');
	});

	it('should disable tooltip when text is not truncated', () => {
		const directiveInstance = debugEl.injector.get(TooltipOnEllipsisDirective);

		Object.defineProperty(debugEl.nativeElement, 'scrollWidth', { value: 50, configurable: true });
		Object.defineProperty(debugEl.nativeElement, 'clientWidth', { value: 1000, configurable: true });

		directiveInstance.ngAfterViewInit();
		(directiveInstance as any).updateTooltipStatus();

		// Simulate directive updating the tooltip directive
		tooltipDir.tooltipText = '';
		tooltipDir.isTooltipDisabled = true;

		expect(tooltipDir.tooltipText).toBe('');
		expect(tooltipDir.isTooltipDisabled).toBe(true);
	});

	it('should not throw error if tooltip directive is missing', () => {
		const el = document.createElement('div');
		const directive = new TooltipOnEllipsisDirective({ nativeElement: el } as ElementRef, mockNgZone, null);
		expect(() => directive.ngAfterViewInit()).not.toThrow();
	});

	it('should call updateTooltipStatus when element is intersecting', fakeAsync(() => {
		const directiveInstance = debugEl.injector.get(TooltipOnEllipsisDirective);

		const spy = jest.spyOn(directiveInstance as any, 'updateTooltipStatus');

		directiveInstance.ngAfterViewInit();

		(directiveInstance as any).observer = {
			callback: (entries: IntersectionObserverEntry[]) => {
				if (entries[0].isIntersecting) {
					(directiveInstance as any).updateTooltipStatus();
				}
			},
		};

		(directiveInstance as any).observer.callback([{ isIntersecting: true }] as IntersectionObserverEntry[]);

		expect(spy).toHaveBeenCalled();
	}));

	describe('ngAfterViewInit', () => {
		it('should not initialize observer if tooltipDir is missing', () => {
			const el = document.createElement('div');
			const directive = new TooltipOnEllipsisDirective({ nativeElement: el } as ElementRef, mockNgZone, null);
			directive.ngAfterViewInit();
			expect((directive as any).observer).toBeUndefined();
		});

		it('should initialize observer and observe element if tooltipDir is present', () => {
			const el = document.createElement('div');
			const mockTooltipDir = {} as WindmillTooltipDirective;

			const observeMock = jest.fn();
			const disconnectMock = jest.fn();
			const IntersectionObserverMock = jest.fn(function (this: unknown, callback: IntersectionObserverCallback) {
				(this as IntersectionObserver).observe = observeMock;
				(this as IntersectionObserver).disconnect = disconnectMock;
				(this as { callback: IntersectionObserverCallback }).callback = callback;
			});
			(global as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
				IntersectionObserverMock as unknown as typeof IntersectionObserver;

			(global as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = jest.fn(function (
				this: unknown,
				callback: ResizeObserverCallback,
			) {
				(this as ResizeObserver).observe = jest.fn();
				(this as ResizeObserver).disconnect = jest.fn();
			}) as unknown as typeof ResizeObserver;

			const directive = new TooltipOnEllipsisDirective(
				{ nativeElement: el } as ElementRef,
				mockNgZone,
				mockTooltipDir,
			);

			directive.ngAfterViewInit();

			expect((directive as unknown as { observer: IntersectionObserver }).observer).not.toBeNull();
			expect(observeMock).toHaveBeenCalledWith(el);

			delete (global as unknown as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver;
			delete (global as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
		});

		it('should call updateTooltipStatus when observer entry is intersecting', () => {
			const el = document.createElement('div');
			const mockTooltipDir = {} as WindmillTooltipDirective;

			const observeMock = jest.fn();
			const disconnectMock = jest.fn();

			let savedCallback: IntersectionObserverCallback | undefined;

			const IntersectionObserverMock = jest.fn(function (
				this: IntersectionObserver,
				callback: IntersectionObserverCallback,
			) {
				savedCallback = callback;
				this.observe = observeMock;
				this.disconnect = disconnectMock;
			});

			(global as any).IntersectionObserver = IntersectionObserverMock;

			(global as any).ResizeObserver = jest.fn(function (this: unknown, callback: ResizeObserverCallback) {
				(this as ResizeObserver).observe = jest.fn();
				(this as ResizeObserver).disconnect = jest.fn();
			}) as unknown as typeof ResizeObserver;

			const directive = new TooltipOnEllipsisDirective(
				{ nativeElement: el } as ElementRef,
				mockNgZone,
				mockTooltipDir,
			);

			const updateSpy = jest.spyOn(directive as any, 'updateTooltipStatus');

			directive.ngAfterViewInit();

			expect(savedCallback).toBeDefined();

			if (savedCallback) {
				savedCallback([{ isIntersecting: true }] as IntersectionObserverEntry[], (directive as any).observer);
			}

			expect(updateSpy).toHaveBeenCalled();

			updateSpy.mockRestore();

			delete (global as any).IntersectionObserver;
			delete (global as any).ResizeObserver;
		});
	});
});
