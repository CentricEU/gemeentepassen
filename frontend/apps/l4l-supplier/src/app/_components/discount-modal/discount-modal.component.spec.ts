import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WindmillModule } from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { CodeValidationDto } from '../../models/code-validation.model';
import { DiscountCodeService } from '../../services/discount-code/discount-code.service';
import { DiscountModalComponent } from './discount-modal.component';

describe('DiscountModalComponent', () => {
	let component: DiscountModalComponent;
	let fixture: ComponentFixture<DiscountModalComponent>;

	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };
	let dialogService: DialogService;
	let discountCodeService: DiscountCodeService;

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		const mockDialogData = {};

		const discountCodeServiceMock = {
			validateCode: jest.fn(),
		};

		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			afterClosed: jest.fn(() => of({})),
		};

		await TestBed.configureTestingModule({
			imports: [WindmillModule, AppModule],
			declarations: [DiscountModalComponent],
			providers: [
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: MAT_DIALOG_DATA, useValue: mockDialogData },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: DiscountCodeService, useValue: discountCodeServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DiscountModalComponent);
		component = fixture.componentInstance;

		discountCodeService = TestBed.inject(DiscountCodeService);
		dialogService = TestBed.inject(DialogService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close the dialog when close method is called', () => {
		jest.spyOn(dialogRefStub, 'close');

		component.close();

		expect(dialogRefStub.close).toHaveBeenCalled();
	});

	it('should initialize the form on ngOnInit', () => {
		component.ngOnInit();
		expect(component.discountForm).toBeDefined();
		expect(component.discountForm.get('amount')).toBeTruthy();
	});

	it('should return true if form is invalid', () => {
		component.discountForm.get('amount')?.setValue('');
		expect(component.isFormInvalid()).toBe(true);
	});

	it('should return false if form is valid', () => {
		component.discountForm.get('amount')?.setValue(100);
		expect(component.isFormInvalid()).toBe(false);
	});

	it('should call validateCode and close the dialog with the result when applyDiscount is called', () => {
		const mockCodeValidationResult: CodeValidationDto = {
			code: 'ABC123',
			offerName: 'Discount',
			amount: 10,
			currentTime: '2021-09-01T00:00:00Z',
		};
		const mockValidatedCode = { code: 'ABC123', offerName: 'Discount', currentTime: '2021-09-01T00:00:00Z' };

		component.data = {
			validatedCode: mockValidatedCode,
			discountType: 'Percentage',
		};

		component.discountForm.get('amount')?.setValue(100);

		jest.spyOn(discountCodeService, 'validateCode').mockReturnValue(of(mockCodeValidationResult));
		const closeSpy = jest.spyOn(component, 'close');

		component.applyDiscount();

		expect(discountCodeService.validateCode).toHaveBeenCalledWith({
			code: mockValidatedCode.code,
			currentTime: expect.any(String),
			amount: 100,
		});
		expect(closeSpy).toHaveBeenCalledWith(mockCodeValidationResult);
	});

	const testCases = [
		{ errors: { nonZeroAmount: true }, value: 10, expected: false },
		{ errors: null, value: 10, expected: false },
		{ errors: { nonZeroAmount: true }, value: null, expected: false },
	];

	testCases.forEach(({ errors, value, expected }) => {
		it(`should return ${expected} if amount has errors: ${JSON.stringify(errors)} and value: ${value}`, () => {
			const amountControl = component.discountForm.get('amount');
			amountControl?.setErrors(errors);
			amountControl?.setValue(value);

			expect(component.hasNonZeroAmountError()).toBe(expected);
		});
	});
});
