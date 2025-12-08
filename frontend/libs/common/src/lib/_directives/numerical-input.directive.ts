import { Directive, HostListener, Self } from '@angular/core';
import { FormControlName } from '@angular/forms';

import { RegexUtil } from '../_util/regex-util';

@Directive({
	selector: '[frontendNumericalInput]',
	standalone: false,
})
export class NumericInputDirective {
	private regex = RegexUtil.numericalRegexPattern;

	private specialKeys: Array<string> = [
		'Backspace',
		'Delete',
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Tab',
	];

	constructor(@Self() private el: FormControlName) {}

	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		const isCopyPaste = (event.ctrlKey || event.metaKey) && ['c', 'v'].includes(event.key.toLowerCase());

		if (this.specialKeys.indexOf(event.key) !== -1) {
			return;
		}
		const current: string = this.el.value.toString();
		const next: string = current.concat(event.key);
		if (next && !isCopyPaste && !String(next).match(this.regex)) {
			event.preventDefault();
		}
	}

	@HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
		const clipboardData = event.clipboardData || (window as any).clipboardData;
		const pastedText = clipboardData.getData('text');
		const onlyDigits = RegexUtil.onlyDigitsRegexPattern;

		if (!onlyDigits.test(pastedText)) {
			event.preventDefault();
		}
	}
}
