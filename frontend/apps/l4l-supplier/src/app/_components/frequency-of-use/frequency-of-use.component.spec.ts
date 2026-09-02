import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { FrequencyOfUse } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FrequencyOfUseComponent } from './frequency-of-use.component';

describe('FrequencyOfUseComponent', () => {
	let component: FrequencyOfUseComponent;
	let fixture: ComponentFixture<FrequencyOfUseComponent>;
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
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	test.each([
		[undefined, '', false],
		['someValue', '', false],
	])('should handle case where value: "%s" and idControl value: "%s"', (value, idControlValue, shouldCallClear) => {
		const field = 'yourField';
		const formGroup = new FormGroup({
			[field]: new FormControl(idControlValue),
		});
		component.createOfferForm = formGroup;

		const clearRestrictionValidatorsAndErrorsMock = jest.spyOn(component, 'clearRestrictionValidatorsAndErrors');

		component.onRestrictionTypeChange(field, FrequencyOfUse.DAILY);

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

	describe('onRestrictionTypeChange', () => {
		it('should return if frequencyOfUseValue control does not exist', () => {
			component.createOfferForm = new FormGroup({});

			const spy = jest.spyOn(component, 'clearRestrictionValidatorsAndErrors');

			component.onRestrictionTypeChange('someField', FrequencyOfUse.DAILY);

			expect(spy).not.toHaveBeenCalled();
		});

		it('should reset control value and mark dirty/touched if same value is selected', () => {
			const control = new FormControl(FrequencyOfUse.DAILY);
			component.createOfferForm = new FormGroup({
				frequencyOfUseValue: control,
			});

			const spy = jest.spyOn(component, 'clearRestrictionValidatorsAndErrors');

			component.onRestrictionTypeChange('someField', FrequencyOfUse.DAILY);

			expect(control.value).toBeNull();
			expect(control.dirty).toBe(true);
			expect(control.touched).toBe(true);
			expect(spy).not.toHaveBeenCalled();
		});

		it('should call clearRestrictionValidatorsAndErrors when value is different', () => {
			const control = new FormControl(FrequencyOfUse.WEEKLY);
			component.createOfferForm = new FormGroup({
				frequencyOfUseValue: control,
			});

			const spy = jest.spyOn(component, 'clearRestrictionValidatorsAndErrors');

			component.onRestrictionTypeChange('someField', FrequencyOfUse.DAILY);

			expect(spy).toHaveBeenCalledWith(component.createOfferForm, 'someField');
		});
	});
});
