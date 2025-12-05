import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MonthYearEntry } from '../../models/month-year-entry.model';
import { TransactionDateMenu } from '../../models/transaction-date-menu.model';

@Component({
	selector: 'frontend-transactions-date-menu',
	templateUrl: './transactions-date-menu.component.html',
	styleUrls: ['./transactions-date-menu.component.scss'],
})
export class TransactionsDateMenuComponent {
	@Input() selectedDate: MonthYearEntry;
	@Input() menuData: TransactionDateMenu[] = [];

	@Output() selectedMonth: EventEmitter<MonthYearEntry> = new EventEmitter();

	public selectMonth(monthYearEntry: MonthYearEntry): void {
		this.selectedMonth.emit(monthYearEntry);
	}
}
