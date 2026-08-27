import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { CustomDatepickerIntlService } from './custom-date-picker-service';

describe('CustomDatepickerIntlService', () => {
    let service: CustomDatepickerIntlService;
    let translateService: jest.Mocked<TranslateService>;
    let langChangeSubject: Subject<any>;

    beforeEach(() => {
        langChangeSubject = new Subject();

        const translateSpy = {
            instant: jest.fn(),
            onLangChange: langChangeSubject.asObservable(),
        } as any;

        TestBed.configureTestingModule({
            providers: [
                CustomDatepickerIntlService,
                { provide: TranslateService, useValue: translateSpy },
            ],
        });

        translateService = TestBed.inject(TranslateService) as jest.Mocked<TranslateService>;
    });

    it('should be created', () => {
        translateService.instant.mockReturnValue('');
        service = TestBed.inject(CustomDatepickerIntlService);
        expect(service).toBeTruthy();
    });

    it('should set translations on initialization', () => {
        translateService.instant.mockReturnValueOnce('Previous').mockReturnValueOnce('Next');
        service = TestBed.inject(CustomDatepickerIntlService);

        expect(translateService.instant).toHaveBeenCalledWith('general.button.prevMonthLabel');
        expect(translateService.instant).toHaveBeenCalledWith('general.button.nextMonthLabel');
        expect(service.prevMonthLabel).toBe('Previous');
        expect(service.nextMonthLabel).toBe('Next');
    });

    it('should set year translations on initialization', () => {
        translateService.instant
            .mockReturnValueOnce('Prev Month')
            .mockReturnValueOnce('Next Month')
            .mockReturnValueOnce('Prev Year')
            .mockReturnValueOnce('Next Year')
            .mockReturnValueOnce('Next Multi Year')
            .mockReturnValueOnce('Prev Multi Year');
        
        service = TestBed.inject(CustomDatepickerIntlService);

        expect(translateService.instant).toHaveBeenCalledWith('general.button.prevYearLabel');
        expect(translateService.instant).toHaveBeenCalledWith('general.button.nextYearLabel');
        expect(translateService.instant).toHaveBeenCalledWith('general.button.nextMultiYearLabel');
        expect(translateService.instant).toHaveBeenCalledWith('general.button.prevMultiYearLabel');
        expect(service.prevYearLabel).toBe('Prev Year');
        expect(service.nextYearLabel).toBe('Next Year');
        expect(service.nextMultiYearLabel).toBe('Next Multi Year');
        expect(service.prevMultiYearLabel).toBe('Prev Multi Year');
    });

    it('should update all translations when language changes', () => {
        translateService.instant
            .mockReturnValueOnce('Prev Month')
            .mockReturnValueOnce('Next Month')
            .mockReturnValueOnce('Prev Year')
            .mockReturnValueOnce('Next Year')
            .mockReturnValueOnce('Next Multi Year')
            .mockReturnValueOnce('Prev Multi Year')
            .mockReturnValueOnce('Mois Précédent')
            .mockReturnValueOnce('Mois Suivant')
            .mockReturnValueOnce('Année Précédente')
            .mockReturnValueOnce('Année Suivante')
            .mockReturnValueOnce('Multi Années Suivantes')
            .mockReturnValueOnce('Multi Années Précédentes');
        
        service = TestBed.inject(CustomDatepickerIntlService);

        langChangeSubject.next({ lang: 'fr' });

        expect(service.prevMonthLabel).toBe('Mois Précédent');
        expect(service.nextMonthLabel).toBe('Mois Suivant');
        expect(service.prevYearLabel).toBe('Année Précédente');
        expect(service.nextYearLabel).toBe('Année Suivante');
        expect(service.nextMultiYearLabel).toBe('Multi Années Suivantes');
        expect(service.prevMultiYearLabel).toBe('Multi Années Précédentes');
    });

    it('should emit changes when translations are updated', () => {
        translateService.instant.mockReturnValue('');
        service = TestBed.inject(CustomDatepickerIntlService);
        jest.spyOn(service.changes, 'next');

        langChangeSubject.next({ lang: 'en-US' });

        expect(service.changes.next).toHaveBeenCalled();
    });
});