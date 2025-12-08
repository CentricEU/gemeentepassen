import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

import { AppType } from '../_enums/app-type.enum';
import { Languages } from '../_enums/language.enum';

@Injectable({
	providedIn: 'root',
})
export class MultilanguageService {
	public translations: string;
	public defLang = Languages.nl;
	public translationsLoadedEventEmitter = new EventEmitter<boolean>();

	constructor(
		private translateService: TranslateService,
		private dateAdapter: DateAdapter<unknown>,
		private cookieService: CookieService,
		@Inject(DOCUMENT) private document: Document,
	) {}

	public setupLanguage(appType: AppType): void {
		this.translateService.addLangs([Languages.en, Languages.nl]);

		const recordCookie = this.cookieService.get(`language_${appType.toLowerCase()}`) as Languages;

		if (recordCookie) {
			this.setDocumentLang(recordCookie);
			this.setUsedLanguage(recordCookie, appType);
			return;
		}

		this.translateService.setDefaultLang(this.defLang);
		this.setDocumentLang(this.defLang);
		this.setUsedLanguage(this.defLang, appType);
	}

	public setUsedLanguage(lang: Languages, appType: AppType): void {
		this.dateAdapter.setLocale(lang);

		this.translateService.use(lang).subscribe((value) => {
			this.translations = value;
			this.translationsLoadedEventEmitter.emit(true);
		});

		const isLocalhost = window.location.hostname === 'localhost';
		const cookieDomain = isLocalhost ? 'localhost' : '.gemeentepassen.eu';

		this.cookieService.set(`language_${appType.toLowerCase()}`, lang, {
			domain: cookieDomain,
			path: '/',
			secure: !isLocalhost,
			sameSite: 'Lax',
		});
	}

	private setDocumentLang(lang: Languages): void {
		this.document.documentElement.lang = lang.split('-')[0];
	}
}
