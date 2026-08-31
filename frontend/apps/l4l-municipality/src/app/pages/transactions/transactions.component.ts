import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	AuthService,
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	CommonUtil,
	FilterColumnKey,
	FilterCriteria,
	MonthYearEntry,
	PaginatedData,
	SupplierForMapViewDto,
	TableColumn,
	TableFilterColumn,
	TransactionDateDropdown,
	TransactionTableDto,
	UserInfo,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';

import { SepaService } from '../../_services/sepa-service/sepa.service';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { TransactionService } from '../../_services/transactions/transaction.service';

@Component({
	selector: 'frontend-municipality-transactions',
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss'],
	standalone: false,
})
export class MunicipalityTransactionsComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('transactionsTable', { static: false }) transactionsTable: TableComponent<TransactionTableDto>;

	public areTransactionsSelected = false;

	public dateOptions: TransactionDateDropdown[] = [];
	public lastSelectedInterval: TransactionDateDropdown = CommonUtil.currentMonth();
	public allFilterColumns: TableFilterColumn[];
	public tenantSuppliers: SupplierForMapViewDto[] = [];
	public selectedDate: MonthYearEntry;
	public transactionsCount: number;

	private transactionsSupplierFilter: string | undefined;

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
		return (
			this.transactionsTable?.areFiltersApplied() ||
			this.lastSelectedInterval.translationLabel !== CommonUtil.currentMonth().translationLabel
		);
	}

	constructor(
		private breadcrumbService: BreadcrumbService,
		private transactionsService: TransactionService,
		private supplierService: MunicipalitySupplierService,
		private cdr: ChangeDetectorRef,
		private readonly sepaService: SepaService,
		private readonly authService: AuthService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.initBreadcrumbs();
		this.getTenantSuppliers();
		this.initDateOptions();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public clearFilters(): void {
		this.transactionsTable.clearFilters();

		if (this.lastSelectedInterval.translationLabel === CommonUtil.currentMonth().translationLabel) {
			return;
		}

		if (this.transactionsSupplierFilter) {
			this.transactionsSupplierFilter = undefined;
		}

		this.initDateOptions();
		this.onSelectDateRange(CommonUtil.currentMonth());
	}

	public onApplyFilters(filters: FilterCriteria): void {
		this.transactionsSupplierFilter = filters.supplierNameFilter;
		this.countTransactions();
	}

	public manageColumns(): void {
		this.transactionsTable?.manageColumns();
	}

	public generateSEPA(): void {
		if (
			!this.lastSelectedInterval ||
			!this.lastSelectedInterval.startDateInterval ||
			!this.lastSelectedInterval.endDateInterval
		) {
			return;
		}
		this.sepaService
			.generateSepaFile(
				this.lastSelectedInterval.startDateInterval,
				this.lastSelectedInterval.endDateInterval,
				this.transactionsSupplierFilter,
			)
			.subscribe({
				next: (blob: Blob) => {
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = 'sepa.xml';
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				},
			});
	}

	public onSelectDateRange(dateRange: TransactionDateDropdown): void {
		this.lastSelectedInterval = dateRange;
		this.transactionsService
			.countDateIntervalTransactionsByTenant(
				this.lastSelectedInterval.startDateInterval,
				this.lastSelectedInterval.endDateInterval,
				this.transactionsSupplierFilter,
			)
			.subscribe({
				next: (count) => {
					this.transactionsCount = count;
					this.cdr.detectChanges();

					if (count === 0 && this.transactionsTable?.currentDisplayedPage) {
						this.transactionsTable?.afterDataLoaded([]);
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
			.getDateIntervalTransactionsByTenant(
				event.currentIndex,
				event.pageSize,
				this.lastSelectedInterval.startDateInterval,
				this.lastSelectedInterval.endDateInterval,
				this.transactionsSupplierFilter,
			)
			.subscribe((data) => {
				this.transactionsTable?.afterDataLoaded(
					data.map((transaction) => ({
						...transaction,
						transactionBenefit: transaction.benefit,
						passNumber: transaction.passNumber ?? '-',
					})),
				);
			});
	}

	private countTransactions(): void {
		this.transactionsService.countAllTransactionsByTenant().subscribe({
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
			.countDateIntervalTransactionsByTenant(
				this.lastSelectedInterval.startDateInterval,
				this.lastSelectedInterval.endDateInterval,
				this.transactionsSupplierFilter,
			)
			.subscribe({
				next: (count: number) => {
					this.transactionsCount = count;
					this.cdr.detectChanges();

					if (count === 0 && this.transactionsTable?.currentDisplayedPage) {
						this.transactionsTable?.afterDataLoaded([]);
					} else {
						this.transactionsTable?.initializeData();
					}
				},
			});
	}

	private getTenantSuppliers(): void {
		const tenantId = this.authService.extractSupplierInformation(UserInfo.TenantId);
		if (!tenantId) {
			return;
		}
		this.supplierService.getSuppliersForMap(tenantId).subscribe((data) => {
			this.tenantSuppliers = data;
			this.initFilterColumnsData();
			this.countTransactions();
		});
	}

	private initColumns(): void {
		this.allColumns = [
			new TableColumn('transactions.passholderNumber', 'passNumber', 'passNumber', true, true),
			new TableColumn('transactions.citizenName', 'citizenName', 'citizenName', true, false),
			new TableColumn(
				'general.supplier',
				'supplierName',
				'supplierName',
				true,
				false,
				ColumnDataType.DEFAULT,
				false,
			),
			new TableColumn('offer.types.benefit', 'transactionBenefit', 'transactionBenefit', true, false),
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

	private initDateOptions(): void {
		this.selectedDate = new MonthYearEntry('transactions.menuLabel');
		this.dateOptions = CommonUtil.getDateIntervals();
	}

	private initFilterColumnsData(): void {
		const supplierData = this.tenantSuppliers.map((supplier) => ({
			key: supplier.id || '',
			value: supplier.companyName || '',
		}));

		const filterColumnsData = [
			{ key: FilterColumnKey.TRANSACTIONS_PASSHOLDER_NUMBER, data: [] },
			{ key: FilterColumnKey.TRANSACTIONS_CITIZEN_NAME, data: [] },
			{
				key: FilterColumnKey.TRANSACTIONS_SUPPLIER,
				data: supplierData,
				translationKey: 'general.supplier',
			},
			{ key: FilterColumnKey.TRANSACTIONS_BENEFIT, data: [] },
			{ key: FilterColumnKey.TRANSACTIONS_AMOUNT, data: [] },
			{ key: FilterColumnKey.TRANSACTIONS_DATE, data: [] },
			{ key: FilterColumnKey.TRANSACTIONS_TIME, data: [] },
		];

		this.allFilterColumns = filterColumnsData.map(({ key, data, translationKey }) => {
			return new TableFilterColumn(key, data, translationKey || '');
		});
	}
}
