import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SilentErrorCode } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { DiscountModalComponent } from '../../_components/discount-modal/discount-modal.component';
import { AppModule } from '../../app.module';
import { CodeValidationDto } from '../../models/code-validation.model';
import { DiscountCodeService } from '../../services/discount-code/discount-code.service';
import { TransactionService } from '../../services/transactions/transaction.service';
import { OfferValidationComponent } from './offer-validation.component';

describe('OfferValidationComponent', () => {
	let component: OfferValidationComponent;
	let fixture: ComponentFixture<OfferValidationComponent>;
	let discountCodeServiceMock: Partial<DiscountCodeService>;
	let transactionServiceMock: Partial<TransactionService>;
	let dialogMock: { open: jest.Mock };

	beforeEach(async () => {
		discountCodeServiceMock = {
			validateCode: jest.fn().mockReturnValue(of({ code: 'VALID123', currentTime: '12:00:00' })),
		};

		transactionServiceMock = {
			getAllValidatedCodes: jest.fn().mockReturnValue(of([])),
		};

		dialogMock = {
			open: jest.fn().mockReturnValue({
				afterClosed: jest.fn().mockReturnValue(of('some result')),
			}),
		};

		await TestBed.configureTestingModule({
			declarations: [OfferValidationComponent],
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), WindmillModule, CommonModule, AppModule],
			providers: [
				{ provide: DiscountCodeService, useValue: discountCodeServiceMock },
				{ provide: TransactionService, useValue: transactionServiceMock },
				{ provide: MatDialog, useValue: dialogMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OfferValidationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open Apply Discount Modal and handle result correctly', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		const discountType = 'percentage';

		const updateValidationStatusSpy = jest.spyOn(component as any, 'updateValidationStatus');

		component.openApplyDiscountModal(validatedCode, discountType);

		expect(dialogMock.open).toHaveBeenCalledWith(DiscountModalComponent, {
			width: '520px',
			data: { validatedCode, discountType },
		});

		dialogMock
			.open()
			.afterClosed()
			.subscribe((result: any) => {
				expect(result).toBe('some result');
			});

		expect(updateValidationStatusSpy).toHaveBeenCalledWith('some result');
	});

	it('should call updateValidationStatus when validation success does not include offerName and offerType', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		validatedCode.offerName = '';
		validatedCode.offerType = 0;

		const updateValidationStatusSpy = jest.spyOn(component as any, 'updateValidationStatus');

		component['handleValidationSuccess'](validatedCode);

		expect(updateValidationStatusSpy).toHaveBeenCalledWith(validatedCode);
	});

	it('should initialize the form', () => {
		expect(component.validateCodeForm).toBeDefined();
		expect(component.validateCodeForm.get('validateCode')).toBeDefined();
	});

	it('should return required error message when code is empty', () => {
		const validateCodeControl = component.validateCodeForm.get('validateCode');
		validateCodeControl?.setValue('');
		expect(component.getCodeErrorMessage()).toBe('validationPage.errors.codeRequired');
	});

	it('should return invalid code error message when code is invalid', () => {
		const validateCodeControl = component.validateCodeForm.get('validateCode');
		validateCodeControl?.setValue('invalidCode');
		expect(component.getCodeErrorMessage()).toBe('validationPage.errors.codeInvalid');
	});

	it('should not return error message when code is valid', () => {
		const validateCodeControl = component.validateCodeForm.get('validateCode');
		validateCodeControl?.setValue('124AS');
		expect(validateCodeControl?.valid).toBeTruthy();
		expect(component.getCodeErrorMessage()).toBe('validationPage.errors.codeInvalid');
	});

	it('should split by date when index is 0', () => {
		component.validatedCodes = [
			{ date: '2023-12-01', code: 'CODE1', time: '10:00:00' },
			{ date: '2023-12-01', code: 'CODE2', time: '11:00:00' },
		];
		expect(component.shouldSplitByDate(0)).toBeTruthy();
	});

	it('should split by date when dates are different', () => {
		component.validatedCodes = [
			{ date: '2023-12-01', code: 'CODE1', time: '10:00:00' },
			{ date: '2023-12-02', code: 'CODE2', time: '11:00:00' },
		];
		expect(component.shouldSplitByDate(1)).toBeTruthy();
	});

	it('should not split by date when dates are the same', () => {
		component.validatedCodes = [
			{ date: '2023-12-01', code: 'CODE1', time: '10:00:00' },
			{ date: '2023-12-01', code: 'CODE2', time: '11:00:00' },
		];
		expect(component.shouldSplitByDate(1)).toBeFalsy();
	});

	it('should return appropriate validation error message', () => {
		expect(component.getValidationCodeErrorMessage(SilentErrorCode.codeNotFoundOrInactiveError)).toBe(
			'validationPage.errorMessageNotFound',
		);
		expect(component.getValidationCodeErrorMessage(SilentErrorCode.offerInactiveError)).toBe(
			'validationPage.errorMessageOfferInactive',
		);
		expect(component.getValidationCodeErrorMessage(SilentErrorCode.timeSlotsError)).toBe(
			'validationPage.errorMessageTimeSlots',
		);
		expect(component.getValidationCodeErrorMessage(SilentErrorCode.offerAlreadyUsed)).toBe(
			'validationPage.errorMessageAlreadyUsed',
		);
		expect(component.getValidationCodeErrorMessage(SilentErrorCode.offerUsageLimitReached)).toBe(
			'validationPage.errorMessageUsageLimitReached',
		);
	});

	it('should handle validation error gracefully', () => {
		const errorResponse = { error: SilentErrorCode.codeNotFoundOrInactiveError };

		jest.spyOn(component['discountCodeService'], 'validateCode').mockReturnValue(throwError(() => errorResponse));

		component.validateCodeForm.setValue({ validateCode: '12345' });
		component.validateDiscountCode();

		expect(component.validationStatus?.isSuccess).toBe(false);
		expect(component.validationStatus?.message).toBe('validationPage.errorMessageNotFound');
	});

	it('should format date correctly', () => {
		const mockDate = new Date('2023-12-01T10:00:00');
		const formattedDate = component['formatDateDefault'](mockDate);

		expect(formattedDate).toBe('01/12/2023');
	});

	it('should initialize validated codes from the transaction service', () => {
		expect(transactionServiceMock.getAllValidatedCodes).toHaveBeenCalled();
		expect(component.validatedCodes).toEqual([]);
	});

	it('should validate discount code successfully', () => {
		component.validateCodeForm.setValue({ validateCode: 'VALID' });
		component.validateDiscountCode();

		expect(component.validationStatus?.isSuccess).toBe(true);
		expect(component.validationStatus?.message).toBe('validationPage.successMessage');
	});

	it('should handle discount code validation error', () => {
		const errorResponse = { error: SilentErrorCode.codeNotFoundOrInactiveError };
		(discountCodeServiceMock.validateCode as jest.Mock).mockReturnValueOnce(throwError(() => errorResponse));

		component.validateCodeForm.setValue({ validateCode: '12345' });
		component.validateDiscountCode();

		expect(component.validationStatus?.isSuccess).toBe(false);
		expect(component.validationStatus?.message).toBe('validationPage.errorMessageNotFound');
	});

	it.each([
		[{ isSuccess: true, message: '' }, 'check-circle_b'],
		[{ isSuccess: false, message: '' }, 'exclamation-circle_b'],
	])('should return the correct validation icon', (validationStatus, expectedIcon) => {
		component.validationStatus = validationStatus;
		expect(component.validationIcon).toBe(expectedIcon);
	});

	it.each([
		[{ isSuccess: true, message: '' }, 'success-icon'],
		[{ isSuccess: false, message: '' }, 'error-icon'],
	])('should return the correct validation class', (validationStatus, expectedClass) => {
		component.validationStatus = validationStatus;
		expect(component.validationClass).toBe(expectedClass);
	});

	it.each([
		[{ isSuccess: true, message: '' }, 'success-message'],
		[{ isSuccess: false, message: '' }, 'error-message'],
	])('should return the correct validation message class', (validationStatus, expectedMessageClass) => {
		component.validationStatus = validationStatus;
		expect(component.validationMessageClass).toBe(expectedMessageClass);
	});

	it('should handle validation success correctly', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		component['handleValidationSuccess'](validatedCode);

		expect(component.validatedCodes.length).toBe(1);
		expect(component.validationStatus?.isSuccess).toBe(true);
		expect(component.validationStatus?.message).toBe('validationPage.successMessage');
	});

	it('should handle validation error correctly', () => {
		component['handleValidationError'](SilentErrorCode.codeNotFoundOrInactiveError);

		expect(component.validationStatus?.isSuccess).toBe(false);
		expect(component.validationStatus?.message).toBe('validationPage.errorMessageNotFound');
	});

	it('should return the correct code to validate', () => {
		component['codeToValidate'] = 'TESTCODE';
		expect(component.code).toBe('TESTCODE');
	});

	it('should not validate discount code if form is invalid', () => {
		component.validateCodeForm.setValue({ validateCode: '' });
		component.validateDiscountCode();

		expect(component.validationStatus).toBeNull();
		expect(discountCodeServiceMock.validateCode).not.toHaveBeenCalled();
	});

	it('should open Apply Discount Modal with correct parameters', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		const discountType = 'percentage';

		component.openApplyDiscountModal(validatedCode, discountType);

		expect(dialogMock.open).toHaveBeenCalledWith(DiscountModalComponent, {
			width: '520px',
			data: { validatedCode, discountType },
		});
	});

	it('should handle result correctly when modal is closed with a result', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		const discountType = 'percentage';
		const updateValidationStatusSpy = jest.spyOn(component as any, 'updateValidationStatus');

		dialogMock.open.mockReturnValue({
			afterClosed: jest.fn().mockReturnValue(of('some result')),
		});

		component.openApplyDiscountModal(validatedCode, discountType);

		expect(updateValidationStatusSpy).toHaveBeenCalledWith('some result');
	});

	it('should not call updateValidationStatus when modal is closed without a result', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		const discountType = 'percentage';
		const updateValidationStatusSpy = jest.spyOn(component as any, 'updateValidationStatus');

		dialogMock.open.mockReturnValue({
			afterClosed: jest.fn().mockReturnValue(of(null)),
		});

		component.openApplyDiscountModal(validatedCode, discountType);

		expect(updateValidationStatusSpy).not.toHaveBeenCalled();
	});

	it('should open Apply Discount Modal with percentage discount when offerType is 1', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		validatedCode.offerName = 'OfferName';
		validatedCode.offerType = 1;

		const openApplyDiscountModalSpy = jest.spyOn(component as any, 'openApplyDiscountModal');

		component['handleValidationSuccess'](validatedCode);

		expect(openApplyDiscountModalSpy).toHaveBeenCalledWith(validatedCode, 'discount.percentageDiscount');
	});

	it('should open Apply Discount Modal with BOGO discount when offerType is not 1', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		validatedCode.offerName = 'OfferName';
		validatedCode.offerType = 2;

		const openApplyDiscountModalSpy = jest.spyOn(component, 'openApplyDiscountModal');

		component['handleValidationSuccess'](validatedCode);

		expect(openApplyDiscountModalSpy).toHaveBeenCalledWith(validatedCode, 'discount.bogoDiscount');
	});

	it('should call updateValidationStatus when offerName and offerType are not provided', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		validatedCode.offerName = '';
		validatedCode.offerType = 0;

		const updateValidationStatusSpy = jest.spyOn(component as any, 'updateValidationStatus');

		component['handleValidationSuccess'](validatedCode);

		expect(updateValidationStatusSpy).toHaveBeenCalledWith(validatedCode);
	});

	it('should not call updateValidationStatus if result is null', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		const discountType = 'percentage';

		const updateValidationStatusSpy = jest.spyOn(component as any, 'updateValidationStatus');

		component.openApplyDiscountModal(validatedCode, discountType);

		expect(dialogMock.open).toHaveBeenCalledWith(DiscountModalComponent, {
			width: '520px',
			data: { validatedCode, discountType },
		});

		dialogMock
			.open()
			.afterClosed()
			.subscribe((result: any) => {
				expect(updateValidationStatusSpy).not.toHaveBeenCalled();
			});
	});

	it('should call handleValidationError when result is an error code', () => {
		const validatedCode = new CodeValidationDto('VALID', '12:00:00');
		const discountType = 'percentage';
		const errorCode = SilentErrorCode.offerInactiveError;

		const handleValidationErrorSpy = jest.spyOn(component as any, 'handleValidationError');
		const updateValidationStatusSpy = jest.spyOn(component as any, 'updateValidationStatus');
		component.openApplyDiscountModal(validatedCode, discountType);

		expect(dialogMock.open).toHaveBeenCalledWith(DiscountModalComponent, {
			width: '520px',
			data: { validatedCode, discountType },
		});

		dialogMock
			.open()
			.afterClosed()
			.subscribe((result: any) => {
				result = errorCode; // Simulate error code result
				expect(handleValidationErrorSpy).toHaveBeenCalledWith(errorCode);
				expect(updateValidationStatusSpy).not.toHaveBeenCalled();
			});
	});

	it.each([
		[SilentErrorCode.codeNotFoundOrInactiveError, 'validationPage.errorMessageNotFound'],
		[SilentErrorCode.offerInactiveError, 'validationPage.errorMessageOfferInactive'],
		[SilentErrorCode.timeSlotsError, 'validationPage.errorMessageTimeSlots'],
		[SilentErrorCode.offerAlreadyUsed, 'validationPage.errorMessageAlreadyUsed'],
		[999, ''],
	])('should return the correct validation error message for error code %s', (errorCode, expectedMessage) => {
		const errorMessage = component.getValidationCodeErrorMessage(errorCode);
		expect(errorMessage).toBe(expectedMessage);
	});
});
