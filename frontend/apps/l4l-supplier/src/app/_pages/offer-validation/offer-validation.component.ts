import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormUtil, RegexUtil, SilentErrorCode, ValidatedCode } from '@frontend/common';

import { DiscountModalComponent } from '../../_components/discount-modal/discount-modal.component';
import { CodeValidationDto } from '../../models/code-validation.model';
import { ValidationCodeStatus } from '../../models/validation-code-status.model';
import { DiscountCodeService } from '../../services/discount-code/discount-code.service';
import { TransactionService } from '../../services/transactions/transaction.service';

@Component({
	selector: 'frontend-offer-validation',
	templateUrl: './offer-validation.component.html',
	styleUrls: ['./offer-validation.component.scss'],
	standalone: false,
})
export class OfferValidationComponent implements OnInit {
	public validateCodeForm: FormGroup;
	public validationFunctionError = FormUtil.genericValidationFunctionError;
	public validatedCodes: ValidatedCode[] = [];
	public validationStatus: ValidationCodeStatus | null = null;

	private codeToValidate: string;
	private formBuilder = inject(FormBuilder);
	private discountCodeService = inject(DiscountCodeService);
	private transactionService = inject(TransactionService);
	private readonly dialog = inject(MatDialog);

	public get code(): string {
		return this.codeToValidate;
	}

	public get validationIcon(): string {
		return this.validationStatus?.isSuccess ? 'check-circle_b' : 'exclamation-circle_b';
	}

	public get validationClass(): string {
		return this.validationStatus?.isSuccess ? 'success-icon' : 'error-icon';
	}

	public get validationMessageClass(): string {
		return this.validationStatus?.isSuccess ? 'success-message' : 'error-message';
	}

	public ngOnInit(): void {
		this.initForm();
		this.getAllValidatedCodes();
	}

	public shouldSplitByDate(index: number): boolean {
		return index === 0 || this.validatedCodes[index].date !== this.validatedCodes[index - 1].date;
	}

	public validateDiscountCode(): void {
		if (this.validateCodeForm.invalid) {
			return;
		}

		this.validationStatus = null;
		this.codeToValidate = this.validateCodeForm.get('validateCode')?.value;
		const codeValidation = new CodeValidationDto(this.codeToValidate, FormUtil.getClientDateTime());

		this.validateCodeForm.get('validateCode')?.reset();

		this.discountCodeService.validateCode(codeValidation).subscribe({
			next: (validatedCode) => this.handleValidationSuccess(validatedCode),
			error: (error) => this.handleValidationError(error.error),
		});
	}

	public getValidationCodeErrorMessage(error: number): string {
		switch (error) {
			case SilentErrorCode.codeNotFoundOrInactiveError:
				return 'validationPage.errorMessageNotFound';
			case SilentErrorCode.offerInactiveError:
				return 'validationPage.errorMessageOfferInactive';
			case SilentErrorCode.timeSlotsError:
				return 'validationPage.errorMessageTimeSlots';
			case SilentErrorCode.offerAlreadyUsed:
				return 'validationPage.errorMessageAlreadyUsed';
			case SilentErrorCode.offerUsageLimitReached:
				return 'validationPage.errorMessageUsageLimitReached';
			default:
				return '';
		}
	}

	public getCodeErrorMessage(): string {
		const validateCode = this.validateCodeForm.get('validateCode');
		return validateCode?.hasError('required')
			? 'validationPage.errors.codeRequired'
			: 'validationPage.errors.codeInvalid';
	}

	public openApplyDiscountModal(validatedCode: CodeValidationDto, discountType: string): void {
		const dialogRef = this.dialog.open(DiscountModalComponent, {
			width: '520px',
			data: { validatedCode, discountType },
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (!result) {
				return;
			}

			if (typeof result === 'number' && Object.values(SilentErrorCode).includes(result as SilentErrorCode)) {
				this.handleValidationError(result as number);
				return;
			}

			this.updateValidationStatus(result);
		});
	}

	private initForm(): void {
		this.validateCodeForm = this.formBuilder.group({
			validateCode: ['', [Validators.required, Validators.pattern(RegexUtil.discountCodeRegexPattern)]],
		});
	}

	private getAllValidatedCodes(): void {
		this.transactionService.getAllValidatedCodes().subscribe((validatedCodes) => {
			this.validatedCodes = validatedCodes?.length ? validatedCodes : [];
		});
	}

	private formatDateDefault(date: Date): string {
		return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
	}

	private handleValidationSuccess(validatedCode: CodeValidationDto): void {
		if (validatedCode.offerName && validatedCode.offerType) {
			const discountType =
				validatedCode.offerType === 1 ? 'discount.percentageDiscount' : 'discount.bogoDiscount';
			this.openApplyDiscountModal(validatedCode, discountType);
			return;
		}

		this.updateValidationStatus(validatedCode);
	}

	private updateValidationStatus(validatedCode: CodeValidationDto): void {
		const formattedDate = this.formatDateDefault(new Date());
		this.validatedCodes.unshift(new ValidatedCode(validatedCode.code, formattedDate, validatedCode.currentTime));
		this.validationStatus = new ValidationCodeStatus(true, 'validationPage.successMessage');
	}

	private handleValidationError(error: number): void {
		this.validationStatus = new ValidationCodeStatus(false, this.getValidationCodeErrorMessage(error));
	}
}
