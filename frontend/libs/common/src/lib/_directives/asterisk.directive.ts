import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
	selector: '[frontendRequiredInput]',
	standalone: false,
})
export class MarkAsteriskDirective implements OnInit {
	@Input() isVisible = false;

	constructor(
		private renderer: Renderer2,
		private el: ElementRef,
	) {}

	public ngOnInit(): void {
		if (this.isVisible) {
			return;
		}

		const parent = this.renderer.parentNode(this.el.nativeElement);
		const label = parent.getElementsByTagName('LABEL')[0];

		if (label && !parent.getElementsByClassName('required-asterisk').length) {
			const asterisk = this.renderer.createText(' *');
			const asteriskSpan = this.renderer.createElement('span');
			this.renderer.addClass(asteriskSpan, 'required-asterisk');
			this.renderer.appendChild(asteriskSpan, asterisk);
			this.renderer.appendChild(label, asteriskSpan);
		}
	}
}
