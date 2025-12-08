import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormUtil } from '@frontend/common';
import { CommonUtil } from '@frontend/common';

import { CodeValidationDto } from '../../models/code-validation.model';
import { DiscountCodeService } from '../../services/discount-code/discount-code.service';

@Component({
	selector: 'frontend-discount-modal',
	templateUrl: './discount-modal.component.html',
	styleUrls: [],
	standalone: false,
})
export class DiscountModalComponent implements OnInit {
	public validationFunctionError = FormUtil.validationFunctionError;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;

	public discountForm: FormGroup;

	public get offerName(): string {
		return this.data.validatedCode?.offerName || '';
	}

	public get offerType(): string {
		return this.data.discountType || '';
	}

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly dialogRef: MatDialogRef<DiscountModalComponent>,
		private discountCodeService: DiscountCodeService,
		@Inject(MAT_DIALOG_DATA) public data: { validatedCode: CodeValidationDto; discountType: string },
	) {}

	public ngOnInit(): void {
		this.initForm();
	}

	public hasNonZeroAmountError(): boolean {
		const amount = this.discountForm.get('amount');
		return !!amount && amount.hasError('nonZeroAmount') && CommonUtil.hasValidValue(amount.value);
	}

	public applyDiscount(): void {
		const amount = this.discountForm.get('amount')?.value;
		const codeValidation = {
			code: this.data.validatedCode?.code,
			currentTime: FormUtil.getClientDateTime(),
			amount,
		};

		this.discountCodeService.validateCode(codeValidation).subscribe({
			next: (result) => {
				this.close(result);
			},
			error: (err) => {
				this.close(err.error);
			},
		});
	}

	public isFormInvalid(): boolean {
		return this.discountForm?.invalid;
	}

	public close(success?: CodeValidationDto): void {
		this.dialogRef.close(success);
	}

	private initForm(): void {
		this.discountForm = this.formBuilder.group({
			amount: ['', [Validators.required, FormUtil.nonZeroAmountValidator]],
		});
	}
}
