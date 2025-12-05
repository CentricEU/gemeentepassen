import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormUtil, ModalData, RegexUtil, WarningDialogData } from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import * as moment from 'moment';

import { DueDate } from '../../models/due-date.model';
import { GenerateInvoiceDto } from '../../models/generate-invoice-dto.model';
import { MonthYearEntry } from '../../models/month-year-entry.model';
import { InvoiceService } from '../../services/invoice-service/invoice.service';

@Component({
	selector: 'frontend-generate-invoice',
	templateUrl: './generate-invoice.component.html'
})
export class GenerateInvoiceComponent implements OnInit {
	public generateInvoiceForm: FormGroup;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	public updatedDueDateSource: DueDate[] = [];

	//This will be modified in the future when we will know more about the due date
	private dueDateSource = [
		new DueDate('1', this.translateService.instant('transactions.generateInvoice.days.7days')),
		new DueDate('2', this.translateService.instant('transactions.generateInvoice.days.14days')),
		new DueDate('3', this.translateService.instant('transactions.generateInvoice.days.30days'))
	];
	private monthLabel: string;
	private year: number;

	constructor(
		private readonly dialogRef: MatDialogRef<GenerateInvoiceComponent>,
		private readonly formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: MonthYearEntry,
		private readonly dialogService: DialogService,
		private readonly translateService: TranslateService,
		private readonly invoiceService: InvoiceService
	) {}

	public ngOnInit(): void {
		this.initMonthYear();
		this.initForm();
		this.backdropClickClose();
	}

	public close(): void {
		if (!this.generateInvoiceForm.dirty) {
			this.dialogRef.close(false);
			return;
		}

		this.openWarningModal();
	}

	public isFormValid(): boolean {
		return this.generateInvoiceForm.valid && !this.generateInvoiceForm.pristine;
	}

	public getInvoiceNumberErrorMessage(): string {
		if (this.generateInvoiceForm.get('invoiceNumber')?.hasError('required')) {
			return 'transactions.generateInvoice.invoiceNumberRequired';
		}

		return 'transactions.generateInvoice.invoiceNumberInvalid';
	}

	public generateInvoice(): void {
		const generateInvoiceFormValues = this.generateInvoiceForm.value;
		const foundItem = this.dueDateSource.find((item) => item.id === generateInvoiceFormValues.dueDate);
		const days = foundItem ? Number(foundItem.name.split(' ')[0]) : 0;
		const generateInvoiceDto = new GenerateInvoiceDto(
			generateInvoiceFormValues.invoiceNumber,
			generateInvoiceFormValues.month,
			FormUtil.normalizeDate(generateInvoiceFormValues.issueDate),
			days
		);

		this.invoiceService.generateInvoice(generateInvoiceDto).subscribe((response) => {
			this.downloadInvoice(response, generateInvoiceFormValues.invoiceNumber);
			this.dialogRef.close(true);
		});
	}

	public onSearchValueChanged(event: string): void {
		this.updatedDueDateSource = !event
			? this.dueDateSource
			: this.dueDateSource.filter((item) => item.name.toLowerCase().includes(event.trim().toLowerCase()));
	}

	private downloadInvoice(response: Blob, invoiceNumber: string): void {
		const blob = new Blob([response], { type: 'application/pdf' });
		const url = window.URL.createObjectURL(blob);
		const anchor = Object.assign(document.createElement('a'), {
			href: url,
			download: `invoice_${invoiceNumber}.pdf`
		});
		anchor.click();
		window.URL.revokeObjectURL(url);
	}

	private initForm(): void {
		this.updatedDueDateSource = this.dueDateSource;

		this.generateInvoiceForm = this.formBuilder.group({
			invoiceNumber: ['', [Validators.required, Validators.pattern(RegexUtil.invoiceNumberRegexPattern)]],
			month: [this.getMonthYear(), [Validators.required]],
			issueDate: [moment(), [Validators.required]],
			dueDate: ['', [Validators.required]]
		});
	}

	private initMonthYear(): void {
		if (!this.data?.year) {
			this.monthLabel =
				'transactions.months.' + new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();
			this.year = new Date().getFullYear();
			return;
		}

		this.monthLabel = this.data.monthLabel;
		this.year = this.data.year;
	}

	private openWarningModal(): void {
		const data = new WarningDialogData();

		this.dialogService
			.message(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						'transactions.generateInvoice.leaveWarning',
						'general.button.stay',
						'general.button.cancel',
						false,
						'warning',
						'dark-grey',
						'',
						data
					)
				),
				width: '400px'
			})
			?.afterClosed()
			.subscribe((result) => {
				if (result) {
					this.dialogRef.close(false);
				}
			});
	}

	private getMonthYear(): string {
		return this.translateService.instant(this.monthLabel) + ' ' + this.year;
	}

	private backdropClickClose(): void {
		this.dialogRef.backdropClick().subscribe(() => {
			this.close();
		});
	}
}
