import { EventEmitter, Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie';

import { Languages } from '../_enums/language.enum';

@Injectable({
	providedIn: 'root',
})
export class MultilanguageService {
	public translations: string;
	public defLang = Languages.nl;
	public translationsLoadedEventEmitter = new EventEmitter<boolean>();

	constructor(
		private _translateService: TranslateService,
		private _dateAdapter: DateAdapter<unknown>,
		private _cookieService: CookieService,
	) {}

	public setupLanguage(): void {
		this._translateService.addLangs([Languages.en, Languages.nl]);
		this._translateService.setDefaultLang(this.defLang);

		const recordCookie = this._cookieService.get('language');

		if (recordCookie) {
			this.setUsedLanguage(recordCookie);
			return;
		}

		this.setUsedLanguage(this.defLang);
	}

	private setUsedLanguage(lang: string): void {
		this._dateAdapter.setLocale(lang);

		this._translateService.use(lang).subscribe((value) => {
			this.translations = value;
			this.translationsLoadedEventEmitter.emit(true);
		});

		const isLocalhost = window.location.hostname === 'localhost';
		const cookieDomain = isLocalhost ? 'localhost' : '.stadspassen.eu';

		this._cookieService.put('language', lang, {
			domain: cookieDomain,
			path: '/',
			secure: !isLocalhost,
			sameSite: 'lax',
		});
	}
}
