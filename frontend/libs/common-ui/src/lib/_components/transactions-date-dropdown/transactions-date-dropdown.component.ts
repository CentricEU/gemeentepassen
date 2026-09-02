import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { CommonUtil, FormUtil, TransactionDateDropdown } from '@frontend/common';

@Component({
	selector: 'frontend-transactions-date-dropdown',
	templateUrl: './transactions-date-dropdown.component.html',
	styleUrls: ['./transactions-date-dropdown.component.scss'],
	standalone: false,
})
export class TransactionsDateDropdownComponent implements OnChanges, OnInit {
	@Input() dateOptions: TransactionDateDropdown[] = [];
	@Input() lastSelectedInterval: TransactionDateDropdown;
	@Output() selectedDateRange: EventEmitter<TransactionDateDropdown> = new EventEmitter();

	@ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

	public selectedDate: TransactionDateDropdown;
	public showCustomDateRange = false;
	public isEditable = true;
	public rangeForm: FormGroup;
	public validationFunctionError = FormUtil.validationFunctionError;
	private customDateRangeText = '';

	get today(): Date {
		return new Date();
	}

	constructor(private formBuilder: FormBuilder) {
		this.rangeForm = this.formBuilder.group({
			startDate: ['', Validators.required],
			expirationDate: [new Date(), Validators.required],
		});
	}

	public ngOnInit(): void {
		this.rangeForm.valueChanges.subscribe((value) => {
			if (value.startDate && value.expirationDate) {
				const startDate = FormUtil.normalizeDateToLocale(value.startDate);
				const endDate = FormUtil.normalizeDateToLocale(value.expirationDate);
				this.customDateRangeText = `${startDate} - ${endDate}`;
			} else {
				this.customDateRangeText = '';
			}
		});
	}

	public ngOnChanges(): void {
		if (this.lastSelectedInterval) {
			this.selectedDate = this.lastSelectedInterval;

			if (this.lastSelectedInterval.translationLabel !== 'transactions.dateInterval.customRange') {
				this.customDateRangeText = '';
			}
		}
	}

	public isClearButtonDisabled(): boolean {
		return !this.rangeForm.get('startDate')?.value && !this.rangeForm.get('expirationDate')?.value;
	}

	public expirationDateInit(date: string, isEditable: boolean): Date {
		if (!date) {
			return new Date();
		}
		const adjustedDate = new Date(date);
		adjustedDate.setDate(adjustedDate.getDate() - 1);
		date = adjustedDate.toISOString();
		return FormUtil.calculateExpirationDate(date, isEditable);
	}

	public getTranslationLabel(value: TransactionDateDropdown, fromDropdown: boolean): string {
		if (this.customDateRangeText && !fromDropdown) {
			return this.customDateRangeText;
		}
		return value?.translationLabel ? value.translationLabel : '';
	}

	public applyCustomDateRange(): void {
		if (this.rangeForm.valid) {
			const startDate = this.rangeForm.get('startDate')?.value;
			const expirationDate = this.rangeForm.get('expirationDate')?.value;

			if (!startDate || !expirationDate) {
				return;
			}

			const customDateRange: TransactionDateDropdown = {
				translationLabel: 'transactions.dateInterval.customRange',
				startDateInterval: FormUtil.normalizeDate(startDate),
				endDateInterval: FormUtil.normalizeDate(expirationDate),
			};

			this.selectedDate = customDateRange;
			this.selectedDateRange.emit(customDateRange);
			this.hideDropdown();
		}
	}

	public onMenuClosed(): void {
		if (this.lastSelectedInterval?.translationLabel === 'transactions.dateInterval.customRange') {
			this.customDateRangeText = `${FormUtil.normalizeDateToLocale(this.lastSelectedInterval.startDateInterval ?? '')} - ${FormUtil.normalizeDateToLocale(this.lastSelectedInterval.endDateInterval ?? '')}`;
		} else {
			this.customDateRangeText = this.lastSelectedInterval?.translationLabel || '';
		}

		this.hideDropdown();
	}

	public selectDateRange(dateRangeEntry: TransactionDateDropdown, event: Event): void {
		this.showCustomDateRange = dateRangeEntry.translationLabel === 'transactions.dateInterval.customRange';

		const dropdownElement = (event.target as HTMLElement).closest('.custom-dropdown');
		if (this.showCustomDateRange) {
			this.rangeForm.reset();
			if (dropdownElement) {
				dropdownElement.classList.add('custom-date-range');
				this.updateModalPosition();
			}

			event.stopPropagation();
		} else {
			this.selectedDateRange.emit(dateRangeEntry);
			this.customDateRangeText = '';
			this.rangeForm.reset();
			if (dropdownElement) {
				dropdownElement.classList.remove('custom-date-range');
			}
		}
		this.selectedDate = dateRangeEntry;
	}

	public onStartDateChange(): void {
		CommonUtil.enforceStartDateBeforeExpiration(this.rangeForm);
	}

	private hideDropdown(): void {
		this.showCustomDateRange = false;
		const dropdownElement = document.querySelector('.custom-dropdown');
		if (dropdownElement) {
			dropdownElement.classList.remove('custom-date-range');
		}
	}

	private updateModalPosition(): void {
		setTimeout(() => {
			const overlayElement = document.querySelector(
				'.cdk-overlay-connected-position-bounding-box',
			) as HTMLElement;
			if (overlayElement) {
				overlayElement.style.right = '33px';
				overlayElement.style.left = 'unset';
				overlayElement.style.width = 'unset';
			}
		});
	}
}
