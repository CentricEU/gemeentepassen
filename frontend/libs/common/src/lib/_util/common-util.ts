import { FormGroup } from '@angular/forms';

import { MonthYearEntry } from '../_models/month-year-entry.model';

export class CommonUtil {
	public static hasValidValue(value: string | unknown): boolean {
		return value != null && value !== '' && value !== 'undefined';
	}

	public static isEnterOrSpace(key: string): boolean {
		return key === 'Enter' || key === ' ';
	}

	/**
	 * Formats a numeric value into a currency string with 2 decimal places.
	 * Always prefixes the value with the Euro (€) symbol and applies
	 * locale-specific formatting rules based on the provided language code.
	 * **/
	public static formatCurrency(value: number, language: string): string {
		return `€${Number(value).toLocaleString(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}

	public static enforceStartDateBeforeExpiration(form: FormGroup): void {
		const startDateControl = form.get('startDate');
		const expirationDateControl = form.get('expirationDate');

		if (!startDateControl || !expirationDateControl) {
			return;
		}

		const startDate = new Date(startDateControl.value).getTime();
		const expirationDate = new Date(expirationDateControl.value).getTime();

		if (startDate > expirationDate) {
			expirationDateControl.setValue('');
			expirationDateControl.markAsTouched();
		}
	}

	public static getFormattedMonthDate(monthYear: MonthYearEntry): string {
		const now = new Date();
		const y = monthYear.year ?? now.getFullYear();
		// monthValue is 1-based (e.g. Jan = 1), but JavaScript Date needs 0-based (Jan = 0),
		// so we subtract 1. If monthValue is missing, we take the current month (also converted to 1-based) first.
		const m = (monthYear.monthValue ?? now.getMonth() + 1) - 1;

		const date = new Date(y, m);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
	}
}
