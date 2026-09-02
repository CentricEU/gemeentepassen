/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
	Breadcrumb,
	BreadcrumbService,
	commonRoutingConstants,
	CommonUtil,
	FilterCriteria,
	PaginatedData,
	SupplierForMapViewDto,
	TransactionDateDropdown,
	TransactionTableDto,
} from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { MunicipalityTransactionsComponent } from './transactions.component';

describe('MunicipalityTransactionsComponent', () => {
	let component: MunicipalityTransactionsComponent;
	let fixture: ComponentFixture<MunicipalityTransactionsComponent>;
	let dialogService: DialogService;
	let breadcrumbService: BreadcrumbService;
	let breadcrumbServiceSpy: any;
	let activatedRouteMock: any;
	let elementRef: ElementRef;

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
			declarations: [MunicipalityTransactionsComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
			providers: [
				BreadcrumbService,
				{ provide: ElementRef, useValue: { nativeElement: document.createElement('div') } },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: TableComponent },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MunicipalityTransactionsComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);
		breadcrumbService = TestBed.inject(BreadcrumbService);
		activatedRouteMock = TestBed.inject(ActivatedRoute);
		elementRef = TestBed.inject(ElementRef);

		component.transactionsTable = new TableComponent<TransactionTableDto>(dialogService, elementRef);
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
		component.transactionsTable = new TableComponent<TransactionTableDto>(dialogService, elementRef);
		const manageColumnsSpy = jest.spyOn(component.transactionsTable, 'manageColumns');
		component.manageColumns();
		expect(manageColumnsSpy).toHaveBeenCalled();
	});

	it('should call getTenantSuppliers on ngOnInit', () => {
		const getTenantSuppliersSpy = jest.spyOn<any, any>(component, 'getTenantSuppliers');
		component.ngOnInit();
		expect(getTenantSuppliersSpy).toHaveBeenCalled();
	});
	it('should call countTransactionsByDateInterval on initializeTransactionCount', () => {
		const countTransactionsByDateIntervalSpy = jest.spyOn<any, any>(component, 'countTransactionsByDateInterval');
		component['initializeTransactionCount']();
		expect(countTransactionsByDateIntervalSpy).toHaveBeenCalled();
	});

	it('should update transactionsCount and call initializeData on countTransactionsByDateInterval', () => {
		const mockCount = 15;
		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactionsByTenant').mockReturnValue(
			of(mockCount),
		);
		component.transactionsTable = { initializeData: jest.fn() } as any;
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

		component['countTransactionsByDateInterval']();

		expect(component['transactionsService'].countDateIntervalTransactionsByTenant).toHaveBeenCalled();
		expect(component.transactionsCount).toBe(mockCount);
		expect(detectChangesSpy).toHaveBeenCalled();
		expect(component.transactionsTable.initializeData).toHaveBeenCalled();
	});

	it('should set supplierNameFilter and call countTransactions on onApplyFilters', () => {
		const filters: FilterCriteria = { supplierNameFilter: 'supplier-123' };
		const countTransactionsSpy = jest.spyOn<any, any>(component, 'countTransactions');

		component.onApplyFilters(filters);

		expect(component['transactionsSupplierFilter']).toBe('supplier-123');
		expect(countTransactionsSpy).toHaveBeenCalled();
	});

	it('should update transactionsCount and call initializeData on onSelectDateRange when count > 0', () => {
		const mockDateRange: TransactionDateDropdown = {
			startDateInterval: '2024-01-01',
			endDateInterval: '2024-01-31',
		} as any;
		const mockCount = 10;
		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactionsByTenant').mockReturnValue(
			of(mockCount),
		);
		component.transactionsTable = { initializeData: jest.fn() } as any;
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

		component.onSelectDateRange(mockDateRange);

		expect(component.lastSelectedInterval).toBe(mockDateRange);
		expect(component.transactionsCount).toBe(mockCount);
		expect(detectChangesSpy).toHaveBeenCalled();
		expect(component.transactionsTable.initializeData).toHaveBeenCalled();
	});

	it('should call afterDataLoaded with empty array when count is 0 on onSelectDateRange', () => {
		const mockDateRange: TransactionDateDropdown = {
			startDateInterval: '2024-01-01',
			endDateInterval: '2024-01-31',
		} as any;
		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactionsByTenant').mockReturnValue(of(0));
		component.transactionsTable = { afterDataLoaded: jest.fn(), currentDisplayedPage: [] } as any;

		component.onSelectDateRange(mockDateRange);

		expect(component.transactionsTable.afterDataLoaded).toHaveBeenCalledWith([]);
	});

	it('should load data correctly when transactionsCount > 0', () => {
		component.transactionsCount = 10;
		const mockData = [new TransactionTableDto('1', '12345', 'John Doe', 100, '2024-12-01', '10:00')];
		const mockEvent = { currentIndex: 0, pageSize: 10 } as PaginatedData<TransactionTableDto>;

		jest.spyOn(component['transactionsService'], 'getDateIntervalTransactionsByTenant').mockReturnValue(
			of(mockData) as any,
		);
		component.transactionsTable = { afterDataLoaded: jest.fn(), initializeData: jest.fn() } as any;

		component.loadData(mockEvent);

		expect(component['transactionsService'].getDateIntervalTransactionsByTenant).toHaveBeenCalledWith(
			0,
			10,
			component.lastSelectedInterval.startDateInterval,
			component.lastSelectedInterval.endDateInterval,
			component['transactionsSupplierFilter'],
		);
		expect(component.transactionsTable.afterDataLoaded).toHaveBeenCalledWith(mockData);
	});

	it('should return early when transactionsCount is 0 in loadData', () => {
		component.transactionsCount = 0;
		const mockEvent = { currentIndex: 0, pageSize: 10 } as PaginatedData<TransactionTableDto>;
		const getTransactionsSpy = jest.spyOn(component['transactionsService'], 'getDateIntervalTransactionsByTenant');

		component.loadData(mockEvent);

		expect(getTransactionsSpy).not.toHaveBeenCalled();
	});

	it('should initialize filter columns data correctly', () => {
		component.tenantSuppliers = [
			{ id: '1', companyName: 'Supplier A' } as SupplierForMapViewDto,
			{ id: '2', companyName: 'Supplier B' } as SupplierForMapViewDto,
		];

		component['initFilterColumnsData']();

		expect(component.allFilterColumns).toBeDefined();
		expect(component.allFilterColumns.length).toBe(7);
	});

	it('should initialize filter columns data correctly when tenantSuppliers are invalid', () => {
		component.tenantSuppliers = [
			{ id: undefined as any, companyName: undefined as any } as SupplierForMapViewDto,
			{ id: '2', companyName: 'Supplier B' } as SupplierForMapViewDto,
		];

		component['initFilterColumnsData']();

		expect(component.allFilterColumns).toBeDefined();
		expect(component.allFilterColumns.length).toBe(7);
	});

	it('should not call getSuppliersForMap if tenantId is falsy', () => {
		jest.spyOn(component['authService'], 'extractSupplierInformation').mockReturnValue(undefined);
		const getSuppliersSpy = jest.spyOn(component['supplierService'], 'getSuppliersForMap');

		component['getTenantSuppliers']();

		expect(getSuppliersSpy).not.toHaveBeenCalled();
	});

	it('should call getSuppliersForMap and countTransactions when tenantId exists', () => {
		const mockTenantId = 'tenant-123';
		const mockSuppliers = [{ id: '1', companyName: 'Supplier A' } as SupplierForMapViewDto];

		jest.spyOn(component['authService'], 'extractSupplierInformation').mockReturnValue(mockTenantId);
		jest.spyOn(component['supplierService'], 'getSuppliersForMap').mockReturnValue(of(mockSuppliers));
		const countTransactionsSpy = jest.spyOn<any, any>(component, 'countTransactions');

		component['getTenantSuppliers']();

		expect(component['supplierService'].getSuppliersForMap).toHaveBeenCalledWith(mockTenantId);
		expect(component.tenantSuppliers).toEqual(mockSuppliers);
		expect(countTransactionsSpy).toHaveBeenCalled();
	});

	it('should initialize selectedDate and dateOptions on ngOnInit', () => {
		const getDateIntervalsSpy = jest.spyOn(CommonUtil, 'getDateIntervals').mockReturnValue([]);

		component.ngOnInit();

		expect(component.selectedDate).toBeDefined();
		expect(component.selectedDate.monthLabel).toBe('transactions.menuLabel');
		expect(getDateIntervalsSpy).toHaveBeenCalled();
	});

	it('innerEmptyStateTitle should return correct translation key', () => {
		expect(component.innerEmptyStateTitle).toBe('transactions.noDataCurrentInterval');
	});

	it.each([
		{ count: 0, expected: true },
		{ count: 5, expected: false },
	])('isTransactionCountZero should be $expected when transactionsCount is $count', ({ count, expected }) => {
		component.transactionsCount = count;
		expect(component.isTransactionCountZero).toBe(expected);
	});

	it.each([
		{ count: 0, expected: true },
		{ count: undefined as any, expected: true },
		{ count: 3, expected: false },
	])('isInnerEmptyStateVisible should be $expected when transactionsCount is $count', ({ count, expected }) => {
		component.transactionsCount = count;
		expect(component.isInnerEmptyStateVisible).toBe(expected);
	});

	it('areFiltersApplied should return true when transactionsTable.areFiltersApplied returns true', () => {
		component.transactionsTable = { areFiltersApplied: jest.fn().mockReturnValue(true) } as any;
		expect(component.areFiltersApplied).toBe(true);
	});

	it('areFiltersApplied should return false when transactionsTable.areFiltersApplied returns false', () => {
		component.transactionsTable = { areFiltersApplied: jest.fn().mockReturnValue(false) } as any;
		expect(component.areFiltersApplied).toBe(false);
	});

	it('areFiltersApplied should be undefined when transactionsTable is undefined', () => {
		component.transactionsTable = undefined as any;
		expect(component.areFiltersApplied).toBe(false);
	});

	it('should set dataCount and call initializeTransactionCount on countTransactions success', () => {
		const mockCount = 7;
		const initializeTransactionCountSpy = jest.spyOn<any, any>(component, 'initializeTransactionCount');
		jest.spyOn(component['transactionsService'], 'countAllTransactionsByTenant').mockReturnValue(of(mockCount));

		component['countTransactions']();

		expect(component['transactionsService'].countAllTransactionsByTenant).toHaveBeenCalled();
		expect(component['dataCount']).toBe(mockCount);
		expect(initializeTransactionCountSpy).toHaveBeenCalled();
	});

	it('should handle multiple successive calls to countTransactions and update dataCount each time', () => {
		const counts = [1, 3, 10];
		const initializeTransactionCountSpy = jest.spyOn<any, any>(component, 'initializeTransactionCount');

		const countSpy = jest
			.spyOn(component['transactionsService'], 'countAllTransactionsByTenant')
			.mockReturnValueOnce(of(counts[0]))
			.mockReturnValueOnce(of(counts[1]))
			.mockReturnValueOnce(of(counts[2]));

		component['countTransactions']();
		expect(component['dataCount']).toBe(counts[0]);
		expect(initializeTransactionCountSpy).toHaveBeenCalledTimes(1);

		component['countTransactions']();
		expect(component['dataCount']).toBe(counts[1]);
		expect(initializeTransactionCountSpy).toHaveBeenCalledTimes(2);

		component['countTransactions']();
		expect(component['dataCount']).toBe(counts[2]);
		expect(initializeTransactionCountSpy).toHaveBeenCalledTimes(3);

		expect(countSpy).toHaveBeenCalledTimes(3);
	});

	describe('generateSEPA', () => {
		let sepaServiceMock: any;
		let createObjectURLSpy: jest.SpyInstance;
		let revokeObjectURLSpy: jest.SpyInstance;
		let appendChildSpy: jest.SpyInstance;
		let removeChildSpy: jest.SpyInstance;
		let clickSpy: jest.SpyInstance;

		beforeEach(() => {
			sepaServiceMock = {
				generateSepaFile: jest.fn().mockReturnValue(of(new Blob(['test'], { type: 'text/xml' }))),
			};
			(component as any).sepaService = sepaServiceMock;

			if (!window.URL) {
				(window as any).URL = {};
			}
			if (!window.URL.createObjectURL) {
				window.URL.createObjectURL = jest.fn();
			}
			if (!window.URL.revokeObjectURL) {
				window.URL.revokeObjectURL = jest.fn();
			}

			createObjectURLSpy = jest.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url');
			revokeObjectURLSpy = jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation();
			appendChildSpy = jest.spyOn(document.body, 'appendChild');
			removeChildSpy = jest.spyOn(document.body, 'removeChild');
			clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();

			component.selectedDate = { monthLabel: 'label', monthValue: 2, year: 2024 };
		});

		afterEach(() => {
			createObjectURLSpy.mockRestore();
			revokeObjectURLSpy.mockRestore();
			appendChildSpy.mockRestore();
			removeChildSpy.mockRestore();
			clickSpy.mockRestore();
		});

		it('should call sepaService.generateSepaFile with formatted date and trigger download', () => {
			component.lastSelectedInterval = {
				startDateInterval: '2024-02-01',
				endDateInterval: '2024-02-29',
			} as any;

			component['transactionsSupplierFilter'] = undefined as any;

			component.generateSEPA();

			expect(sepaServiceMock.generateSepaFile).toHaveBeenCalledWith('2024-02-01', '2024-02-29', undefined);
			expect(createObjectURLSpy).toHaveBeenCalled();
			expect(appendChildSpy).toHaveBeenCalled();
			expect(clickSpy).toHaveBeenCalled();
			expect(removeChildSpy).toHaveBeenCalled();
			expect(revokeObjectURLSpy).toHaveBeenCalled();
		});

		it('should call sepaService.generateSepaFile with formatted date and trigger download when lastSelectedInterval is null', () => {
			component.lastSelectedInterval = null as any;

			component['transactionsSupplierFilter'] = undefined as any;

			component.generateSEPA();

			expect(sepaServiceMock.generateSepaFile).not.toHaveBeenCalled();
		});
	});

	it('should NOT call offersTable.manageColumns', () => {
		component.transactionsTable = null as any;
		expect(() => component.manageColumns()).not.toThrow();
		expect(component.transactionsTable).toBeNull();
	});

	it('clearFilters should call clearFilters on transactionsTable', () => {
		component.transactionsTable = { clearFilters: jest.fn() } as any;
		const clearFiltersSpy = jest.spyOn(component.transactionsTable, 'clearFilters');

		component.lastSelectedInterval = {
			startDateInterval: new Date('2024-01-01'),
			endDateInterval: new Date('2024-01-31'),
		} as any;

		component.clearFilters();

		expect(clearFiltersSpy).toHaveBeenCalled();
	});

	it('clearFilters should reset lastSelectedInterval and call onSelectDateRange when interval is not current month', () => {
		component.transactionsTable = { clearFilters: jest.fn() } as any;
		const onSelectDateRangeSpy = jest.spyOn(component, 'onSelectDateRange');

		component.lastSelectedInterval = {
			startDateInterval: new Date('2023-12-01'),
			endDateInterval: new Date('2023-12-31'),
		} as any;

		component.clearFilters();

		expect(component.lastSelectedInterval).toEqual(CommonUtil.currentMonth());
		expect(onSelectDateRangeSpy).toHaveBeenCalledWith(CommonUtil.currentMonth());
	});

	it('clearFilters should reset transactionsSupplierFilter when it exists', () => {
		component.transactionsTable = { clearFilters: jest.fn() } as any;
		jest.spyOn(component, 'onSelectDateRange');

		component['transactionsSupplierFilter'] = 'supplier-123';
		component.lastSelectedInterval = {
			startDateInterval: new Date('2023-12-01'),
			endDateInterval: new Date('2023-12-31'),
			translationLabel: 'some.old.label',
		} as any;

		component.clearFilters();

		expect(component['transactionsSupplierFilter']).toBeUndefined();
	});

	it('clearFilters should return early when lastSelectedInterval equals current month', () => {
		component.transactionsTable = { clearFilters: jest.fn() } as any;
		const clearFiltersSpy = jest.spyOn(component.transactionsTable, 'clearFilters');
		const onSelectDateRangeSpy = jest.spyOn(component, 'onSelectDateRange');

		component.lastSelectedInterval = CommonUtil.currentMonth();

		component.clearFilters();

		expect(clearFiltersSpy).toHaveBeenCalled();
		expect(onSelectDateRangeSpy).not.toHaveBeenCalled();
	});
	describe('countTransactionsByDateInterval', () => {
		it('should update transactionsCount and call detectChanges and initializeData when count > 0', () => {
			const mockCount = 5;
			jest.spyOn(component['transactionsService'], 'countDateIntervalTransactionsByTenant').mockReturnValue(
				of(mockCount),
			);
			component.transactionsTable = { initializeData: jest.fn() } as any;
			const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

			component['countTransactionsByDateInterval']();

			expect(component['transactionsService'].countDateIntervalTransactionsByTenant).toHaveBeenCalledWith(
				component.lastSelectedInterval.startDateInterval,
				component.lastSelectedInterval.endDateInterval,
				component['transactionsSupplierFilter'],
			);
			expect(component.transactionsCount).toBe(mockCount);
			expect(detectChangesSpy).toHaveBeenCalled();
			expect(component.transactionsTable.initializeData).toHaveBeenCalled();
		});

		it('should call afterDataLoaded with empty array when count is 0 and currentDisplayedPage exists', () => {
			jest.spyOn(component['transactionsService'], 'countDateIntervalTransactionsByTenant').mockReturnValue(
				of(0),
			);
			component.transactionsTable = {
				currentDisplayedPage: [],
				afterDataLoaded: jest.fn(),
				initializeData: jest.fn(),
			} as any;
			const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

			component['countTransactionsByDateInterval']();

			expect(component.transactionsCount).toBe(0);
			expect(detectChangesSpy).toHaveBeenCalled();
			expect(component.transactionsTable.afterDataLoaded).toHaveBeenCalledWith([]);
			expect(component.transactionsTable.initializeData).not.toHaveBeenCalled();
		});

		it('should call initializeData when count is 0 and currentDisplayedPage is falsy', () => {
			jest.spyOn(component['transactionsService'], 'countDateIntervalTransactionsByTenant').mockReturnValue(
				of(0),
			);
			component.transactionsTable = {
				currentDisplayedPage: null,
				afterDataLoaded: jest.fn(),
				initializeData: jest.fn(),
			} as any;
			const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

			component['countTransactionsByDateInterval']();

			expect(component.transactionsCount).toBe(0);
			expect(detectChangesSpy).toHaveBeenCalled();
			expect(component.transactionsTable.initializeData).toHaveBeenCalled();
			expect(component.transactionsTable.afterDataLoaded).not.toHaveBeenCalled();
		});
	});
});
