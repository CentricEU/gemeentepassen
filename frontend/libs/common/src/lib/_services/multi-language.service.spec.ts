import { TestBed } from '@angular/core/testing';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

import { AppType } from '../_enums/app-type.enum';
import { Languages } from '../_enums/language.enum';
import { MultilanguageService } from './multi-language.service';

describe('MultilanguageService', () => {
	let service: MultilanguageService;
	let translateService: TranslateService;
	let cookieService: CookieService;
	beforeEach(() => {
		const translateServiceStub = () => ({
			addLangs: () => ({}),
			setDefaultLang: () => ({}),
			use: () => ({
				subscribe: (f: () => void) => f(),
			}),
		});

		const cookieServiceStub = () => ({
			get: (key: string) => {
				if (key === 'language') return 'en-US';
				return '';
			},

			set: () => ({}),
		});

		TestBed.configureTestingModule({
			providers: [
				MultilanguageService,
				{ provide: TranslateService, useFactory: translateServiceStub },
				{ provide: CookieService, useFactory: cookieServiceStub },
				DateAdapter,
			],
		});
		service = TestBed.inject(MultilanguageService);
		translateService = TestBed.inject(TranslateService);
		cookieService = TestBed.inject(CookieService);

		jest.spyOn(translateService, 'addLangs');
		jest.spyOn(translateService, 'setDefaultLang');
	});

	it('can load instance', () => {
		expect(service).toBeTruthy();
	});

	it('defLang has default value', () => {
		expect(service.defLang).toEqual('nl-NL');
	});

	it('should set up the default language if no stored language is available', () => {
		jest.spyOn(cookieService, 'get').mockReturnValue('');
		const setUsedLanguageSpy = jest.spyOn(service as any, 'setUsedLanguage');

		service.setupLanguage(AppType.citizen);

		expect(translateService.addLangs).toHaveBeenCalledWith([Languages.en, Languages.nl]);
		expect(translateService.setDefaultLang).toHaveBeenCalledWith(Languages.nl);
		expect(setUsedLanguageSpy).toHaveBeenCalledWith(Languages.nl, AppType.citizen);
	});

	it('should set up the default language and use the stored language if available', () => {
		const storedLanguage = Languages.en;
		cookieService.set('language', storedLanguage);
		service.setupLanguage(AppType.municipality);

		expect(translateService.addLangs).toHaveBeenCalledWith([Languages.en, Languages.nl]);
		// The default language should not be set again if a stored language is present
		expect(translateService.setDefaultLang).toHaveBeenCalledWith(Languages.nl);
	});

	describe('setupLanguage', () => {
		it('makes expected calls', () => {
			jest.spyOn(translateService, 'addLangs');
			jest.spyOn(translateService, 'setDefaultLang');
			service.setupLanguage(AppType.citizen);

			expect(translateService.addLangs).toHaveBeenCalled();
		});
	});
	describe('MultilanguageService setupLanguage', () => {
		let service: MultilanguageService;
		let translateService: TranslateService;
		let dateAdapter: DateAdapter<unknown>;
		let cookieService: CookieService;
		let mockDocument: Document;

		beforeEach(() => {
			mockDocument = {
				documentElement: { lang: '' } as any,
			} as Document;

			translateService = {
				addLangs: jest.fn(),
				setDefaultLang: jest.fn(),
				use: jest.fn().mockReturnValue({ subscribe: (fn: any) => fn('translations') }),
			} as any;

			dateAdapter = { setLocale: jest.fn() } as any;

			cookieService = {
				get: jest.fn(),
				set: jest.fn(),
			} as any;

			service = new MultilanguageService(translateService, dateAdapter, cookieService, mockDocument);
		});

		it('should use stored language from cookie if available', () => {
			(cookieService.get as jest.Mock).mockReturnValue('en-US');
			const setDocumentLangSpy = jest.spyOn<any, any>(service as any, 'setDocumentLang');
			const setUsedLanguageSpy = jest.spyOn(service, 'setUsedLanguage');

			service.setupLanguage(AppType.citizen);

			expect(translateService.addLangs).toHaveBeenCalledWith([Languages.en, Languages.nl]);
			expect(cookieService.get).toHaveBeenCalledWith('language_citizen');
			expect(setDocumentLangSpy).toHaveBeenCalledWith('en-US');
			expect(setUsedLanguageSpy).toHaveBeenCalledWith('en-US', AppType.citizen);
			expect(translateService.setDefaultLang).not.toHaveBeenCalled();
		});

		it('should use default language if no cookie is present', () => {
			(cookieService.get as jest.Mock).mockReturnValue('');
			const setDocumentLangSpy = jest.spyOn<any, any>(service as any, 'setDocumentLang');
			const setUsedLanguageSpy = jest.spyOn(service, 'setUsedLanguage');

			service.setupLanguage(AppType.municipality);

			expect(translateService.addLangs).toHaveBeenCalledWith([Languages.en, Languages.nl]);
			expect(translateService.setDefaultLang).toHaveBeenCalledWith(Languages.nl);
			expect(setDocumentLangSpy).toHaveBeenCalledWith(Languages.nl);
			expect(setUsedLanguageSpy).toHaveBeenCalledWith(Languages.nl, AppType.municipality);
		});

		it('should call setDocumentLang and setUsedLanguage with correct params for different appTypes', () => {
			(cookieService.get as jest.Mock).mockReturnValue('');
			const setDocumentLangSpy = jest.spyOn<any, any>(service as any, 'setDocumentLang');
			const setUsedLanguageSpy = jest.spyOn(service, 'setUsedLanguage');

			service.setupLanguage(AppType.citizen);
			expect(setDocumentLangSpy).toHaveBeenCalledWith(Languages.nl);
			expect(setUsedLanguageSpy).toHaveBeenCalledWith(Languages.nl, AppType.citizen);

			service.setupLanguage(AppType.municipality);
			expect(setDocumentLangSpy).toHaveBeenCalledWith(Languages.nl);
			expect(setUsedLanguageSpy).toHaveBeenCalledWith(Languages.nl, AppType.municipality);
		});
	});

	describe('setDocumentLang', () => {
		let service: MultilanguageService;
		let mockDocument: Document;

		beforeEach(() => {
			mockDocument = {
				documentElement: { lang: '' } as any,
			} as Document;

			const translateServiceStub = {
				addLangs: jest.fn(),
				setDefaultLang: jest.fn(),
				use: jest.fn().mockReturnValue({ subscribe: (fn: any) => fn('translations') }),
			} as any;

			const dateAdapterStub = { setLocale: jest.fn() } as any;
			const cookieServiceStub = { get: jest.fn(), set: jest.fn() } as any;

			service = new MultilanguageService(translateServiceStub, dateAdapterStub, cookieServiceStub, mockDocument);
		});

		it.each([
			{ input: Languages.nl, expected: 'nl' },
			{ input: Languages.en, expected: 'en' },
			{ input: 'fr-FR' as Languages, expected: 'fr' },
			{ input: 'de-DE' as Languages, expected: 'de' },
			{ input: 'es-ES' as Languages, expected: 'es' },
			{ input: 'it-IT' as Languages, expected: 'it' },
			{ input: 'pt-PT' as Languages, expected: 'pt' },
			{ input: 'en-US' as Languages, expected: 'en' },
			{ input: 'nl-BE' as Languages, expected: 'nl' },
		])('should set documentElement.lang to "$expected" for "$input"', ({ input, expected }) => {
			service['setDocumentLang'](input);
			expect(mockDocument.documentElement.lang).toBe(expected);
		});
	});
});
