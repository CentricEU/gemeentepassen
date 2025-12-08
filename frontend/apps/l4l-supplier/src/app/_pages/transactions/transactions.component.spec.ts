import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	Page,
	PaginatedData,
	TableColumn,
	TransactionTableDto,
} from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { TransactionsComponent } from './transactions.component';

describe('TransactionsComponent', () => {
	let component: TransactionsComponent;
	let fixture: ComponentFixture<TransactionsComponent>;
	let dialogService: DialogService;
	let breadcrumbService: BreadcrumbService;
	let breadcrumbServiceSpy: any;
	let activatedRouteMock: any;

	beforeEach(async () => {
		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			afterClosed: jest.fn(() => of({})),
			alert: jest.fn(),
		};

		activatedRouteMock = {
			paramMap: of({ get: jest.fn() }),
		};

		breadcrumbServiceSpy = {
			setBreadcrumbs: jest.fn(),
			removeBreadcrumbs: jest.fn(),
		};

		global.structuredClone = jest.fn((val) => {
			return JSON.parse(JSON.stringify(val));
		});

		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [TransactionsComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
			providers: [
				TranslateService,
				BreadcrumbService,
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: TableComponent },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(TransactionsComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);
		breadcrumbService = TestBed.inject(BreadcrumbService);
		activatedRouteMock = TestBed.inject(ActivatedRoute);
		component.transactionsTable = new TableComponent<TransactionTableDto>(dialogService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize breadcrumbs on ngOnInit', () => {
		component.ngOnInit();
		expect(breadcrumbServiceSpy.setBreadcrumbs).toHaveBeenCalledWith([
			new Breadcrumb('general.pages.dashboard', ['']),
			new Breadcrumb('general.pages.transactions', [commonRoutingConstants.transactions]),
		]);
	});

	it('should remove breadcrumbs on destroy', () => {
		component.ngOnDestroy();
		expect(breadcrumbServiceSpy.removeBreadcrumbs).toHaveBeenCalled();
	});

	it('should manage columns on calling manageColumns', () => {
		component['dataCount'] = 2;
		component.transactionsTable = new TableComponent<TransactionTableDto>(dialogService);
		const manageColumnsSpy = jest.spyOn(component.transactionsTable, 'manageColumns');
		component.manageColumns();
		expect(manageColumnsSpy).toHaveBeenCalled();
	});

	it('should update areTransactionsSelected based on count', () => {
		component.setAreTransactionsSelected(1);
		expect(component.areTransactionsSelected).toBe(true);

		component.setAreTransactionsSelected(0);
		expect(component.areTransactionsSelected).toBe(false);
	});

	it('should call countTransactions on ngOnInit', () => {
		const countTransactionsSpy = jest.spyOn<any, any>(component, 'countTransactions');
		component.ngOnInit();
		expect(countTransactionsSpy).toHaveBeenCalled();
	});

	it('should not call initColumns if dataCount is not set in initializeTransactionCount', () => {
		const initColumnsSpy = jest.spyOn<any, any>(component, 'initColumns');
		component['dataCount'] = 0;
		component['fetchTransactionCountData']();
		expect(initColumnsSpy).not.toHaveBeenCalled();
	});

	it('should update paginated data and currentDisplayedPage after data is loaded', () => {
		component.transactionsTable = new TableComponent<TransactionTableDto>(dialogService);
		const testData = [
			new TransactionTableDto('2', '0987654321', 'Jane Smith', 500, '2024-12-02', '09:00'),
			new TransactionTableDto('3', '1122334455', 'Alice Johnson', 750, '2024-12-03', '16:45'),
		];

		const pages: Page<TransactionTableDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.transactionsTable.paginatedData = new PaginatedData<TransactionTableDto>(pages, 10, 0);
		component.transactionsTable.afterDataLoaded(testData);

		expect(component.transactionsTable.currentDisplayedPage.length).toEqual(testData.length);
	});

	it('should set areOffersSelected to true if any checkboxes are selected', () => {
		component.setAreTransactionsSelected(5);
		expect(component.areTransactionsSelected).toBeTruthy();
	});

	it('should set areOffersSelected to false if no checkboxes are selected', () => {
		component.setAreTransactionsSelected(0);
		expect(component.areTransactionsSelected).toBeFalsy();
	});

	it('should remove breadcrumbs', () => {
		component.ngOnDestroy();
		expect(breadcrumbService.removeBreadcrumbs).toHaveBeenCalled();
	});

	it('should return true when data exists and filter columns are defined', () => {
		component.transactionsTable = new TableComponent<TransactionTableDto>(dialogService);
		component['dataCount'] = 3;

		const result = component.dataCount;

		expect(result > 0).toEqual(true);
	});

	it('should initialize all columns', () => {
		component['initColumns']();
		expect(component.allColumns.length).toBe(5);
	});

	it('should call offersTable.manageColumns', () => {
		component.transactionsTable = { manageColumns: jest.fn() } as any;
		component.manageColumns();
		expect(component.transactionsTable.manageColumns).toHaveBeenCalled();
	});

	it('should initialize columns correctly', () => {
		component['initColumns']();
		const expectedColumns = [
			new TableColumn('transactions.passholderNumber', 'passNumber', 'passNumber', true, true),
			new TableColumn('transactions.citizenName', 'citizenName', 'citizenName', true, false),
			new TableColumn('general.amount', 'amount', 'amount', true, true, ColumnDataType.CURRENCY),
			new TableColumn('general.date', 'createdDate', 'createdDate', true, false),
			new TableColumn('general.time', 'createdTime', 'createdTime', true, false),
		];

		expect(component.allColumns).toEqual(expectedColumns);
	});

	it('should call countTransactions', () => {
		const countTransactionsSpy = jest.spyOn<any, any>(component, 'countTransactions');
		component.ngOnInit();
		expect(countTransactionsSpy).toHaveBeenCalled();
	});

	it('should call applyFilters', () => {
		const applyFiltersSpy = jest.spyOn<any, any>(component, 'onApplyFilters');
		component.onApplyFilters();
		expect(applyFiltersSpy).toHaveBeenCalled();
	});

	it('should call selectMonth', () => {
		const selectMonthSpy = jest.spyOn<any, any>(component, 'onSelectMonth');
		component.onSelectMonth({ monthLabel: 'january', monthValue: 1, year: 2024 });
		expect(selectMonthSpy).toHaveBeenCalled();
		expect(component.selectedDate.monthLabel).toEqual('january');
		expect(component.selectedDate.monthValue).toEqual(1);
		expect(component.selectedDate.year).toEqual(2024);
	});

	it('should return early if allMonthTransactionsCount is falsy', () => {
		component.allMonthTransactionsCount = 0;

		const getTransactionsSpy = jest.spyOn(component['transactionsService'], 'getTransactions');

		const event = { currentIndex: 0, pageSize: 10 } as PaginatedData<TransactionTableDto>;
		component.loadData(event);

		expect(getTransactionsSpy).not.toHaveBeenCalled();
	});

	it('should return innerEmptyStateTitle', () => {
		const result = component.innerEmptyStateTitle;
		expect(result).toEqual('transactions.noDataCurrentMonth');
	});

	it('should return an array of MonthYearEntry objects', () => {
		const result = component['getMonthKeys'](2024);

		expect(result.length).toEqual(12);
		expect(result[0].monthLabel).toEqual('transactions.months.january');
		expect(result[0].year).toEqual(2024);
		expect(result[11].monthLabel).toEqual('transactions.months.december');
		expect(result[11].year).toEqual(2024);
	});

	it('should return an array of TransactionDateMenu objects', () => {
		const result = component['generatePastYearsData']([2024, 2025]);

		expect(result.length).toEqual(2);
		expect(result[0].year).toEqual(2024);
		expect(result[0].months.length).toEqual(12);
		expect(result[1].year).toEqual(2025);
		expect(result[1].months.length).toEqual(12);
	});

	it('should return an array of TransactionDateMenu objects', () => {
		const result = component['generateCurrentYearData']();

		expect(result.months.length).toEqual(new Date().getMonth() + 1);
	});

	it('should return true if allMonthTransactionsCount is falsy', () => {
		component.allMonthTransactionsCount = 0;

		const result = component.isInnerEmptyStateVisible;
		expect(result).toBeTruthy();
	});

	it('should return false if allMonthTransactionsCount is truthy', () => {
		component.allMonthTransactionsCount = 1;

		const result = component.isInnerEmptyStateVisible;
		expect(result).toBeFalsy();
	});

	it('should call getTransactions and afterDataLoaded if allMonthTransactionsCount is truthy', () => {
		component.allMonthTransactionsCount = 1;

		const getTransactionsSpy = jest
			.spyOn(component['transactionsService'], 'getTransactions')
			.mockReturnValue(of([]));

		if (!component.transactionsTable) {
			component.transactionsTable = { afterDataLoaded: jest.fn() } as any;
		}

		const afterDataLoadedSpy = jest.spyOn(component.transactionsTable, 'afterDataLoaded');

		const event = { currentIndex: 0, pageSize: 10 } as PaginatedData<TransactionTableDto>;
		component.loadData(event);

		expect(getTransactionsSpy).toHaveBeenCalledWith(0, 10, undefined, undefined);

		expect(afterDataLoadedSpy).toHaveBeenCalledWith([]);
	});

	it('should return true if filters are applied', () => {
		component.transactionsTable = { areFiltersApplied: jest.fn().mockReturnValue(true) } as any;
		expect(component.areFiltersApplied).toBe(true);
	});

	it('should return false if filters are not applied', () => {
		component.transactionsTable = { areFiltersApplied: jest.fn().mockReturnValue(false) } as any;
		expect(component.areFiltersApplied).toBe(false);
	});

	it('should call initColumns and fetchTransactionCountData if dataCount is truthy', () => {
		const initColumnsSpy = jest.spyOn<any, any>(component, 'initColumns');
		const fetchTransactionCountDataSpy = jest.spyOn<any, any>(component, 'fetchTransactionCountData');

		component['dataCount'] = 1;
		component['initializeTransactionCount']();

		expect(initColumnsSpy).toHaveBeenCalled();
		expect(fetchTransactionCountDataSpy).toHaveBeenCalled();
	});

	it('should not call initColumns and fetchTransactionCountData if dataCount is falsy', () => {
		const initColumnsSpy = jest.spyOn<any, any>(component, 'initColumns');
		const fetchTransactionCountDataSpy = jest.spyOn<any, any>(component, 'fetchTransactionCountData');

		component['dataCount'] = 0;
		component['initializeTransactionCount']();

		expect(initColumnsSpy).not.toHaveBeenCalled();
		expect(fetchTransactionCountDataSpy).not.toHaveBeenCalled();
	});

	it('should call initializeTransactionCount with the correct data when countTransactions is called', () => {
		const mockData = 5;
		const countAllTransactionsSpy = jest
			.spyOn(component['transactionsService'], 'countAllTransactions')
			.mockReturnValue(of(mockData));
		const initializeTransactionCountSpy = jest.spyOn<any, any>(component, 'initializeTransactionCount');

		component['countTransactions']();

		expect(countAllTransactionsSpy).toHaveBeenCalled();
		expect(initializeTransactionCountSpy).toHaveBeenCalled();
		expect(component['dataCount']).toBe(mockData);
	});

	it('should update state correctly when fetchTransactionCountData is called', () => {
		const mockYears = [2024];
		const mockCurrentMonthCount = 10;

		jest.spyOn(component['transactionsService'], 'getDistinctYearsForTransactions').mockReturnValue(of(mockYears));
		jest.spyOn(component['transactionsService'], 'countCurrentMonthTransactions').mockReturnValue(
			of(mockCurrentMonthCount),
		);

		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

		component['fetchTransactionCountData']();

		expect(component['transactionsService'].getDistinctYearsForTransactions).toHaveBeenCalled();
		expect(component['transactionsService'].countCurrentMonthTransactions).toHaveBeenCalled();
		expect(component.allMonthTransactionsCount).toBe(mockCurrentMonthCount);
		expect(detectChangesSpy).toHaveBeenCalled();
	});

	it('should call afterDataLoaded with an empty array when allMonthTransactionsCount is 0', () => {
		component.allMonthTransactionsCount = 0;

		if (!component.transactionsTable) {
			component.transactionsTable = { afterDataLoaded: jest.fn() } as any;
		}

		component['processTransactionData'](
			{
				currentMonthCount: 0,
				years: [],
			},
			true,
		);

		expect(component.transactionsTable.afterDataLoaded).toHaveBeenCalledWith([]);
	});

	it.each([
		{ count: 0, expected: true },
		{ count: 5, expected: false },
	])('should return $expected when allMonthTransactionsCount is $count', ({ count, expected }) => {
		component.allMonthTransactionsCount = count;
		expect(component.isTransactionCountZero).toBe(expected);
	});
});
