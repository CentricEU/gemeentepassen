import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TimeSlotsComponent } from './time-slots.component';

describe('TimeSlotsComponent', () => {
	let component: TimeSlotsComponent;
	let fixture: ComponentFixture<TimeSlotsComponent>;
	let translateService: TranslateService;

	beforeEach(async () => {
		translateService = {
			instant: jest.fn(),
		} as unknown as TranslateService;

		await TestBed.configureTestingModule({
			declarations: [TimeSlotsComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [TranslateModule.forRoot()],
			providers: [TranslateService],
		}).compileComponents();

		fixture = TestBed.createComponent(TimeSlotsComponent);
		component = fixture.componentInstance;
		component.generalForm = new FormGroup({
			timeFrom: new FormControl(''),
			timeTo: new FormControl(''),
		});
		(component as any).atLeastOneFieldGreaterThanZero = jest.fn().mockReturnValue(true);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return the translated error message for time slot form control required', () => {
		const mockTranslatedMessage = 'offer.timeSlotFormControlRequired';
		jest.spyOn(translateService, 'instant').mockReturnValue(mockTranslatedMessage);

		const errorMessage = component.getErrorMessageForTimeSlots(false);

		expect(errorMessage).toEqual(mockTranslatedMessage);
	});

	it('should return the translated error message for time slot form control required', () => {
		const mockTranslatedMessage = 'general.timePicker.timeSlotCompareError';
		jest.spyOn(translateService, 'instant').mockReturnValue(mockTranslatedMessage);

		const errorMessage = component.getErrorMessageForTimeSlots(true);

		expect(errorMessage).toEqual(mockTranslatedMessage);
	});
});
