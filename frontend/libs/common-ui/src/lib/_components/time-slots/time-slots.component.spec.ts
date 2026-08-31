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

	describe('shouldDisplayTimeError', () => {
		it('should return true when shouldDisplayCompareError returns true', () => {
			component.shouldDisplayCompareError = jest.fn().mockReturnValue(true);
			component.shouldDisplayRequiredError = jest.fn().mockReturnValue(false);
			expect(component.shouldDisplayTimeError()).toBe(true);
		});

		it('should return true when shouldDisplayRequiredError returns true', () => {
			component.shouldDisplayCompareError = jest.fn().mockReturnValue(false);
			component.shouldDisplayRequiredError = jest.fn().mockReturnValue(true);
			expect(component.shouldDisplayTimeError()).toBe(true);
		});

		it('should return false when both return false', () => {
			component.shouldDisplayCompareError = jest.fn().mockReturnValue(false);
			component.shouldDisplayRequiredError = jest.fn().mockReturnValue(false);
			expect(component.shouldDisplayTimeError()).toBe(false);
		});
	});
});
