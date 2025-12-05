import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PriceRangeComponent } from './price-range.component';

describe('PriceRangeComponent', () => {
	let component: PriceRangeComponent;
	let fixture: ComponentFixture<PriceRangeComponent>;
	let translateService: TranslateService;

	beforeEach(async () => {
		translateService = {
			instant: jest.fn(),
		} as unknown as TranslateService;

		await TestBed.configureTestingModule({
			declarations: [PriceRangeComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [TranslateModule.forRoot()],
			providers: [TranslateService],
		}).compileComponents();

		fixture = TestBed.createComponent(PriceRangeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return the translated error message for time slot form control required', () => {
		const mockTranslatedMessage = 'offer.priceRange.error';
		jest.spyOn(translateService, 'instant').mockReturnValue(mockTranslatedMessage);

		const errorMessage = component.getErrorMessageForPriceRange(false);

		expect(errorMessage).toEqual(mockTranslatedMessage);
	});

	it('should return the translated error message for time slot form control required', () => {
		const mockTranslatedMessage = 'offer.priceRangeCompareError';
		jest.spyOn(translateService, 'instant').mockReturnValue(mockTranslatedMessage);

		const errorMessage = component.getErrorMessageForPriceRange(true);

		expect(errorMessage).toEqual(mockTranslatedMessage);
	});
});
