import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import {
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	PaginatedData,
	TableColumn,
	TableFilterColumn,
	TransactionTableDto,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, ToastrService } from '@windmill/ng-windmill';
import { forkJoin, of } from 'rxjs';

import { GenerateInvoiceComponent } from '../../_components/generate-invoice/generate-invoice.component';
import { MonthYearEntry } from '../../models/month-year-entry.model';
import { TransactionData } from '../../models/transaction-data.model';
import { TransactionDateMenu } from '../../models/transaction-date-menu.model';
import { TransactionService } from '../../services/transactions/transaction.service';

@Component({
	selector: 'frontend-transactions',
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('transactionsTable', { static: false }) transactionsTable: TableComponent<TransactionTableDto>;

	public areTransactionsSelected = false;

	public menuData: TransactionDateMenu[] = [];
	public yearMenus: MatMenu[] = [];

	//To be implemented
	public allFilterColumns: TableFilterColumn[];

	public selectedDate: MonthYearEntry;
	public allMonthTransactionsCount: number;

	public get innerEmptyStateTitle(): string {
		return 'transactions.noDataCurrentMonth';
	}

	public get isTransactionCountZero(): boolean {
		return this.allMonthTransactionsCount === 0;
	}

	public get isInnerEmptyStateVisible(): boolean {
		return !this.allMonthTransactionsCount;
	}

	public get areFiltersApplied(): boolean {
		return this.transactionsTable?.areFiltersApplied();
	}

	constructor(
		private breadcrumbService: BreadcrumbService,
		private transactionsService: TransactionService,
		private cdr: ChangeDetectorRef,
		private readonly dialogService: DialogService,
		private translateService: TranslateService,
		private readonly toastrService: ToastrService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.initBreadcrumbs();
		this.countTransactions();
		this.selectedDate = new MonthYearEntry('transactions.menuLabel');
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public onApplyFilters(): void {
		console.log('Method not implemented');
	}

	public clearFilters(): void {
		this.transactionsTable?.clearFilters();
	}

	public manageColumns(): void {
		this.transactionsTable?.manageColumns();
	}

	public openGenerateInvoice(): void {
		this.dialogService
			.message(GenerateInvoiceComponent, {
				width: '520px',
				disableClose: false,
				restoreFocus: true,
				data: this.selectedDate,
			})
			?.afterClosed()
			.subscribe((generated) => {
				if (!generated) {
					return;
				}

				this.showToaster();
			});
	}

	public onSelectMonth(monthYearEntry: MonthYearEntry): void {
		this.selectedDate = monthYearEntry;
		this.fetchTransactionCountData(false);
	}

	public setAreTransactionsSelected(count: number): void {
		this.areTransactionsSelected = !!count;
	}

	public loadData(event: PaginatedData<TransactionTableDto>): void {
		if (!this.allMonthTransactionsCount) {
			return;
		}

		this.transactionsService
			.getTransactions(event.currentIndex, event.pageSize, this.selectedDate?.monthValue, this.selectedDate.year)
			.subscribe((data) => {
				this.transactionsTable?.afterDataLoaded(data);
			});
	}

	private generatePastYearsData(years: number[]): TransactionDateMenu[] {
		return years.map((year) => ({
			year,
			months: this.getMonthKeys(year),
		}));
	}

	private generateCurrentYearData(): TransactionDateMenu {
		const date = new Date();
		const currentYear = date.getFullYear();
		const currentMonth = date.getMonth();

		const currentYearMonths = this.getMonthKeys(currentYear)
			.slice(0, currentMonth + 1)
			.reverse();

		return { months: currentYearMonths };
	}

	private getMonthKeys(year: number): MonthYearEntry[] {
		const months = [
			'transactions.months.january',
			'transactions.months.february',
			'transactions.months.march',
			'transactions.months.april',
			'transactions.months.may',
			'transactions.months.june',
			'transactions.months.july',
			'transactions.months.august',
			'transactions.months.september',
			'transactions.months.october',
			'transactions.months.november',
			'transactions.months.december',
		];

		return months.map((key, index) => new MonthYearEntry(key, index + 1, year));
	}

	private countTransactions(): void {
		this.transactionsService.countAllTransactions().subscribe({
			next: (data) => {
				this.dataCount = data;
				this.initializeTransactionCount();
			},
		});
	}

	private initializeTransactionCount(): void {
		if (!this.dataCount) {
			return;
		}

		this.initColumns();
		this.fetchTransactionCountData();
	}

	private fetchTransactionCountData(loadYears = true): void {
		forkJoin({
			years: loadYears ? this.transactionsService.getDistinctYearsForTransactions() : of([]),
			currentMonthCount: this.transactionsService.countCurrentMonthTransactions(this.selectedDate),
		}).subscribe({
			next: (transactionData) => {
				this.processTransactionData(transactionData, loadYears);
			},
		});
	}

	private processTransactionData(transactionData: TransactionData, loadYears: boolean): void {
		if (loadYears) {
			this.menuData = [this.generateCurrentYearData(), ...this.generatePastYearsData(transactionData.years)];
		}

		this.allMonthTransactionsCount = transactionData.currentMonthCount;

		if (this.allMonthTransactionsCount === 0) {
			this.transactionsTable?.afterDataLoaded([]);
			return;
		}

		this.cdr.detectChanges();
		this.transactionsTable?.initializeData();
	}

	private initColumns(): void {
		this.allColumns = [
			new TableColumn('checkbox', 'checkbox', 'checkbox', true, true, ColumnDataType.DEFAULT, true),
			new TableColumn('transactions.passholderNumber', 'passNumber', 'passNumber', true, true),
			new TableColumn('transactions.citizenName', 'citizenName', 'citizenName', true, false),
			new TableColumn('general.amount', 'amount', 'amount', true, true),
			new TableColumn('general.date', 'createdDate', 'createdDate', true, false),
			new TableColumn('general.time', 'createdTime', 'createdTime', true, false),
		];
	}

	private initBreadcrumbs(): void {
		this.breadcrumbService.setBreadcrumbs([
			new Breadcrumb('general.pages.dashboard', ['']),
			new Breadcrumb('general.pages.transactions', [commonRoutingConstants.transactions]),
		]);
	}

	private showToaster(): void {
		const toastText = this.translateService.instant('transactions.generateInvoice.success');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
	}
}
