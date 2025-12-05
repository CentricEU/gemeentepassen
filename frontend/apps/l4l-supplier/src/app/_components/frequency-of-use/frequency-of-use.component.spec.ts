import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { FrequencyOfUse } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FrequencyOfUseComponent } from './frequency-of-use.component';

describe('FrequencyOfUseComponent', () => {
	let component: FrequencyOfUseComponent;
	let fixture: ComponentFixture<FrequencyOfUseComponent>;
	let translateService: TranslateService;
	let translateServiceMock: { instant: jest.Mock };

	beforeEach(async () => {
		translateServiceMock = {
			instant: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [FrequencyOfUseComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [TranslateModule.forRoot()],
			providers: [TranslateService],
		}).compileComponents();

		fixture = TestBed.createComponent(FrequencyOfUseComponent);
		translateService = TestBed.inject(TranslateService);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	test.each([
		[undefined, '', false],
		['someValue', '', false],
		['someValue', 'notEmpty', true],
	])('should handle case where value: "%s" and idControl value: "%s"', (value, idControlValue, shouldCallClear) => {
		const field = 'yourField';
		const formGroup = new FormGroup({
			[field]: new FormControl(idControlValue),
		});
		component.createOfferForm = formGroup;

		const clearRestrictionValidatorsAndErrorsMock = jest.spyOn(component, 'clearRestrictionValidatorsAndErrors');

		component.onRestrictionTypeChange(field, value);

		if (shouldCallClear) {
			expect(clearRestrictionValidatorsAndErrorsMock).toHaveBeenCalledWith(component.createOfferForm, field);
		} else {
			expect(clearRestrictionValidatorsAndErrorsMock).not.toHaveBeenCalled();
		}
	});

	test.each([
		['offer.frequencyOfUse.singleUse', FrequencyOfUse.SINGLE_USE],
		['offer.frequencyOfUse.daily', FrequencyOfUse.DAILY],
		['offer.frequencyOfUse.weekly', FrequencyOfUse.WEEKLY],
		['offer.frequencyOfUse.monthly', FrequencyOfUse.MONTHLY],
		['offer.frequencyOfUse.yearly', FrequencyOfUse.YEARLY],
	])('should return correct FrequencyOfUse enum for value %s', (value, expected) => {
		translateServiceMock.instant.mockReturnValueOnce(value);
		const result = component.mapToFrequencyOfUseEnum(value);
		expect(result).toBe(expected);
	});

	it('should return FrequencyOfUse.UNSPECIFIED for unknown value', () => {
		translateServiceMock.instant.mockReturnValueOnce('unknown_value');
		const result = component.mapToFrequencyOfUseEnum('unknown_value');
		expect(result).toBe(FrequencyOfUse.UNSPECIFIED);
	});

	it('should not check first entry if form is readonly', () => {
		jest.spyOn(component, 'shouldCheckFirst');
		component.isReadonly = true;

		component.shouldCheckFirst('entry');

		expect(component.shouldCheckFirst).toHaveReturnedWith(false);
	});
});
