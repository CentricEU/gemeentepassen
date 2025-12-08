import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import DOMPurify from 'dompurify';

import { RegexUtil } from '../_util/regex-util';

@Directive({
	selector: '[frontendHtmlContentValidator]',
	providers: [
		{
			provide: NG_VALIDATORS,
			useExisting: HtmlContentValidatorDirective,
			multi: true,
		},
	],
	standalone: false,
})
export class HtmlContentValidatorDirective implements Validator {
	@Input() frontendHtmlContentValidator: string;

	public validate(control: AbstractControl): { [key: string]: any } | null {
		const text = control.value;

		if (!text || (!this.isValidHtml(text) && !this.isValidJavaScript(text))) {
			return null;
		}

		const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });

		const sanitizedTextWithEscapes = sanitizedText
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");

		const isValid = sanitizedTextWithEscapes === text;

		return isValid ? null : { isHTML: true };
	}

	private isValidHtml(text: string): boolean {
		try {
			const doc = new DOMParser().parseFromString(text, 'text/html');
			return doc.body.innerHTML === text;
		} catch (e) {
			return false;
		}
	}

	private isValidJavaScript(text: string): boolean {
		return RegexUtil.jsPattern.test(text);
	}
}
