import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { RegexUtil } from '../_util/regex-util';

@Directive({
	selector: '[frontendHtmlContentValidator]',
	providers: [
		{
			provide: NG_VALIDATORS,
			useExisting: HtmlContentValidatorDirective,
			multi: true
		}
	]
})
export class HtmlContentValidatorDirective implements Validator {
	@Input() frontendHtmlContentValidator: string;

	public validate(control: AbstractControl): { [key: string]: any } | null {
		const text = control.value;

		if (!text) {
			return null;
		}

		const isValid = !RegexUtil.htmlContentRegexPattern.test(text);

		return isValid ? null : { isHTML: true };
	}
}
