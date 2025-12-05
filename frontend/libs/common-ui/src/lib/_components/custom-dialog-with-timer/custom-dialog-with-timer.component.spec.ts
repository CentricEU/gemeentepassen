import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subscription } from 'rxjs';

import { WindmillModule } from '../../windmil.module';
import { CustomDialogWithTimerComponent } from './custom-dialog-with-timer.component';

describe('CustomDialogWithTimerComponent', () => {
	let component: CustomDialogWithTimerComponent;
	let fixture: ComponentFixture<CustomDialogWithTimerComponent>;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [TranslateModule.forRoot(), WindmillModule, NoopAnimationsModule, HttpClientTestingModule],
			declarations: [CustomDialogWithTimerComponent],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: {} },
				{
					provide: MatDialogRef,
					useValue: dialogRefStub,
				},
				{ provide: 'env', useValue: environmentMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CustomDialogWithTimerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should disable button when remaining time is greater than 0', () => {
		component.remainingTime = 10;
		expect(component.shouldDisableButton()).toBe(true);
	});

	it('should enable button when remaining time is 0', () => {
		component.remainingTime = 0;
		expect(component.shouldDisableButton()).toBe(false);
	});

	it('should unsubscribe from timer on ngOnDestroy', () => {
		component['timerSubscription'] = new Subscription();

		const unsubscribeSpy = jest.spyOn(component['timerSubscription'], 'unsubscribe');

		component.ngOnDestroy();

		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should start the timer and decrement remaining time until it reaches 0', fakeAsync(() => {
		component['startTimer']();
		expect(component.remainingTime).toBe(60);

		for (let i = 0; i < 60; i++) {
			tick(1000);
			expect(component.remainingTime).toBe(60 - i - 2);
		}

		expect(component['timerSubscription'].closed).toBeTruthy();
	}));

	it('should start timer when button is clicked', () => {
		const startTimerSpy = jest.spyOn(CustomDialogWithTimerComponent.prototype as any, 'startTimer');
		const resendConfirmationEmailSpy = jest
			.spyOn(component['confirmationEmailService'], 'resendConfirmationEmail')
			.mockReturnValue(of({}) as any);

		component.buttonClick();

		expect(resendConfirmationEmailSpy).toHaveBeenCalledWith(component.data.optionalText?.email);
		expect(startTimerSpy).toHaveBeenCalled();
	});

	it('should unsubscribe from timer on ngOnDestroy', () => {
		// Arrange
		const unsubscribeSpy = jest.spyOn(component['timerSubscription'], 'unsubscribe').mockImplementation();

		// Act
		component.ngOnDestroy();

		// Assert
		expect(unsubscribeSpy).toHaveBeenCalled();
	});
	it('should disable button when remaining time is greater than 0', () => {
		component.remainingTime = 10;

		const result = component.shouldDisableButton();
		expect(result).toBe(true);
	});

	it('should enable button when remaining time is 0', () => {
		component.remainingTime = 0;

		const result = component.shouldDisableButton();

		expect(result).toBe(false);
	});
});
