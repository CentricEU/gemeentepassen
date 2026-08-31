import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	CommonUtil,
	MonthYearEntry,
	PaginatedData,
	TableColumn,
	TableFilterColumn,
	TransactionDateDropdown,
	TransactionTableDto,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';

import { TransactionService } from '../../services/transactions/transaction.service';

@Component({
	selector: 'frontend-transactions',
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss'],
	standalone: false,
})
export class TransactionsComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('transactionsTable', { static: false }) transactionsTable: TableComponent<TransactionTableDto>;

	public areTransactionsSelected = false;

	public dateOptions: TransactionDateDropdown[] = [];
	public lastSelectedInterval: TransactionDateDropdown = CommonUtil.currentMonth();
	public allFilterColumns: TableFilterColumn[];

	public selectedDate: MonthYearEntry;
	public transactionsCount: number;

	public get innerEmptyStateTitle(): string {
		return 'transactions.noDataCurrentInterval';
	}

	public get isTransactionCountZero(): boolean {
		return this.transactionsCount === 0;
	}

	public get isInnerEmptyStateVisible(): boolean {
		return !this.transactionsCount;
	}

	public get areFiltersApplied(): boolean {
		return this.transactionsTable?.areFiltersApplied();
	}

	constructor(
		private breadcrumbService: BreadcrumbService,
		private transactionsService: TransactionService,
		private cdr: ChangeDetectorRef,
	) {
		super();
	}

	public ngOnInit(): void {
		this.initBreadcrumbs();
		this.countTransactions();
		this.selectedDate = new MonthYearEntry('transactions.menuLabel');
		this.dateOptions = CommonUtil.getDateIntervals();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public manageColumns(): void {
		this.transactionsTable?.manageColumns();
	}

	public onSelectDateRange(dateRange: TransactionDateDropdown): void {
		this.lastSelectedInterval = dateRange;

		this.transactionsService
			.countDateIntervalTransactions(
				this.lastSelectedInterval.startDateInterval,
				this.lastSelectedInterval.endDateInterval,
			)
			.subscribe({
				next: (count) => {
					this.transactionsCount = count;
					this.cdr.detectChanges();
					if (count === 0 && this.transactionsTable?.currentDisplayedPage) {
						this.transactionsTable.afterDataLoaded([]);
					} else {
						this.transactionsTable?.initializeData();
					}
				},
			});
	}

	public loadData(event: PaginatedData<TransactionTableDto>): void {
		if (!this.transactionsCount) {
			return;
		}

		this.transactionsService
			.getDateIntervalTransactions(
				event.currentIndex,
				event.pageSize,
				this.lastSelectedInterval.startDateInterval,
				this.lastSelectedInterval.endDateInterval,
			)
			.subscribe((data) => {
				this.transactionsTable?.afterDataLoaded(
					data.map((transaction) => ({
						...transaction,
						passNumber: transaction.passNumber ?? '-',
					})),
				);
			});
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
		this.initColumns();
		this.countTransactionsByDateInterval();
	}

	private countTransactionsByDateInterval(): void {
		this.transactionsService
			.countDateIntervalTransactions(
				this.lastSelectedInterval.startDateInterval,
				this.lastSelectedInterval.endDateInterval,
			)
			.subscribe({
				next: (data) => {
					this.transactionsCount = data;

					this.cdr.detectChanges();
					this.transactionsTable?.initializeData();
				},
			});
	}

	private initColumns(): void {
		this.allColumns = [
			new TableColumn('transactions.passholderNumber', 'passNumber', 'passNumber', true, true),
			new TableColumn('transactions.citizenName', 'citizenName', 'citizenName', true, false),
			new TableColumn('general.amount', 'amount', 'amount', true, true, ColumnDataType.CURRENCY),
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
}
