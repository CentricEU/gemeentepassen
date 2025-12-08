import { AfterViewInit, Directive, ElementRef, Host, Input, NgZone, OnDestroy, Optional } from '@angular/core';
import { WindmillTooltipDirective } from '@windmill/ng-windmill/tooltip';

@Directive({
	selector: '[frontendTooltipOnEllipsis]',
	standalone: false,
})
export class TooltipOnEllipsisDirective implements AfterViewInit, OnDestroy {
	@Input('frontendTooltipOnEllipsis') tooltipText = '';

	private intersectionObserver: IntersectionObserver | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private mutationObserver: MutationObserver | null = null;

	constructor(
		private el: ElementRef<HTMLElement>,
		private ngZone: NgZone,
		@Optional() @Host() private tooltipDir: WindmillTooltipDirective | null,
	) {}

	public ngAfterViewInit(): void {
		if (!this.tooltipDir) return;

		this.ngZone.onStable.pipe().subscribe(() => this.updateTooltipStatus());

		this.intersectionObserver = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					this.updateTooltipStatus();
				}
			},
			{ threshold: 0.1 },
		);
		this.intersectionObserver.observe(this.el.nativeElement);

		this.resizeObserver = new ResizeObserver(() => this.updateTooltipStatus());
		this.resizeObserver.observe(this.el.nativeElement);

		this.mutationObserver = new MutationObserver(() => this.updateTooltipStatus());
		this.mutationObserver.observe(this.el.nativeElement, {
			characterData: true,
			childList: true,
			subtree: true,
		});
	}

	public ngOnDestroy(): void {
		this.intersectionObserver?.disconnect();
		this.resizeObserver?.disconnect();
		this.mutationObserver?.disconnect();
	}
	private updateTooltipStatus(): void {
		if (!this.tooltipDir) return;

		const element = this.el.nativeElement;

		const truncated = element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

		this.tooltipDir.tooltipText = truncated ? this.tooltipText : '';
		this.tooltipDir.isTooltipDisabled = !truncated;
		this.tooltipDir.tooltipColor = 'surface';
	}
}
