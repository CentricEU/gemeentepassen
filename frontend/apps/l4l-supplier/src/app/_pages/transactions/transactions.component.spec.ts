/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	PaginatedData,
	TableColumn,
	TransactionTableDto,
} from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
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
			declarations: [TransactionsComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
			providers: [
				TranslateService,
				BreadcrumbService,
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: ElementRef, useValue: { nativeElement: document.createElement('div') } },

				{ provide: TableComponent },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(TransactionsComponent);
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

	it('should call countTransactions on ngOnInit', () => {
		const countTransactionsSpy = jest.spyOn<any, any>(component, 'countTransactions');
		component.ngOnInit();
		expect(countTransactionsSpy).toHaveBeenCalled();
	});

	it('should set innerEmptyStateTitle correctly', () => {
		expect(component.innerEmptyStateTitle).toBe('transactions.noDataCurrentInterval');
	});

	it('should reflect isTransactionCountZero and isInnerEmptyStateVisible based on transactionsCount', () => {
		component.transactionsCount = 0;
		expect(component.isTransactionCountZero).toBe(true);
		expect(component.isInnerEmptyStateVisible).toBe(true);

		component.transactionsCount = 5;
		expect(component.isTransactionCountZero).toBe(false);
		expect(component.isInnerEmptyStateVisible).toBe(false);
	});

	it('should return true/false from areFiltersApplied depending on table state', () => {
		component.transactionsTable = { areFiltersApplied: jest.fn().mockReturnValue(true) } as any;
		expect(component.areFiltersApplied).toBe(true);

		component.transactionsTable = { areFiltersApplied: jest.fn().mockReturnValue(false) } as any;
		expect(component.areFiltersApplied).toBe(false);
	});

	it('onSelectDateRange should initialize data when count > 0', () => {
		component.transactionsTable = { initializeData: jest.fn() } as any;
		const initializeDataSpy = jest.spyOn(component.transactionsTable, 'initializeData');
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactions').mockReturnValue(of(3));

		const dateRange = { startDateInterval: new Date(), endDateInterval: new Date() } as any;
		component.onSelectDateRange(dateRange);

		expect(component.transactionsCount).toBe(3);
		expect(detectChangesSpy).toHaveBeenCalled();
		expect(initializeDataSpy).toHaveBeenCalled();
	});
	it('onSelectDateRange should call afterDataLoaded([]) when count === 0 and currentDisplayedPage exists', () => {
		component.transactionsTable = {
			currentDisplayedPage: [],
			afterDataLoaded: jest.fn(),
			initializeData: jest.fn(),
		} as any;
		const afterDataLoadedSpy = jest.spyOn(component.transactionsTable, 'afterDataLoaded');
		const initializeDataSpy = jest.spyOn(component.transactionsTable, 'initializeData');
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactions').mockReturnValue(of(0));

		const dateRange = { startDateInterval: new Date(), endDateInterval: new Date() } as any;
		component.onSelectDateRange(dateRange);

		expect(component.transactionsCount).toBe(0);
		expect(detectChangesSpy).toHaveBeenCalled();
		expect(afterDataLoadedSpy).toHaveBeenCalledWith([]);
		expect(initializeDataSpy).not.toHaveBeenCalled();
	});

	it('loadData should return early when transactionsCount is falsy', () => {
		component.transactionsCount = 0;

		const getTxSpy = jest.spyOn(component['transactionsService'], 'getDateIntervalTransactions');

		const event = { currentIndex: 0, pageSize: 10 } as PaginatedData<TransactionTableDto>;
		component.loadData(event);

		expect(getTxSpy).not.toHaveBeenCalled();
	});
	it('loadData should initialize table and load data when transactionsCount is truthy', () => {
		component.transactionsCount = 2;
		component.transactionsTable = {
			initializeData: jest.fn(),
			afterDataLoaded: jest.fn(),
			currentDisplayedPage: undefined,
		} as any;
		const afterDataLoadedSpy = jest.spyOn(component.transactionsTable, 'afterDataLoaded');

		jest.spyOn(component['transactionsService'], 'getDateIntervalTransactions').mockReturnValue(
			of([{ id: '1' } as unknown as TransactionTableDto]),
		);

		const event = { currentIndex: 1, pageSize: 5 } as PaginatedData<TransactionTableDto>;
		component.loadData(event);

		expect(afterDataLoadedSpy).toHaveBeenCalledWith([
			{ passNumber: '-', id: '1' } as unknown as TransactionTableDto,
		]);
	});

	it('initializeTransactionCount should setup columns and call countTransactionsByDateInterval', () => {
		const initColumnsSpy = jest.spyOn<any, any>(component, 'initColumns');
		const countIntervalSpy = jest.spyOn<any, any>(component, 'countTransactionsByDateInterval');

		component['initializeTransactionCount']();

		expect(initColumnsSpy).toHaveBeenCalled();
		expect(countIntervalSpy).toHaveBeenCalled();
	});

	it('countTransactions should set dataCount and call initializeTransactionCount', () => {
		const mockCount = 7;
		const serviceSpy = jest
			.spyOn(component['transactionsService'], 'countAllTransactions')
			.mockReturnValue(of(mockCount));
		const initSpy = jest.spyOn<any, any>(component, 'initializeTransactionCount');

		component['countTransactions']();

		expect(serviceSpy).toHaveBeenCalled();
		expect(component['dataCount']).toBe(mockCount);
		expect(initSpy).toHaveBeenCalled();
	});

	it('countTransactionsByDateInterval should set transactionsCount and initialize table', () => {
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');
		component.transactionsTable = { initializeData: jest.fn() } as any;
		const initializeDataSpy = jest.spyOn(component.transactionsTable, 'initializeData');

		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactions').mockReturnValue(of(11));

		component['countTransactionsByDateInterval']();

		expect(component.transactionsCount).toBe(11);
		expect(detectChangesSpy).toHaveBeenCalled();
		expect(initializeDataSpy).toHaveBeenCalled();
	});
	it('initColumns should set up correct table columns', () => {
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

	it('onSelectDateRange should not call initializeData when transactionsTable is undefined', () => {
		component.transactionsTable = undefined as any;
		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactions').mockReturnValue(of(1));

		const dateRange = { startDateInterval: new Date(), endDateInterval: new Date() } as any;
		component.onSelectDateRange(dateRange);

		expect(component.transactionsCount).toBe(1);
	});

	it('loadData should not initialize table when currentDisplayedPage already exists', () => {
		component.transactionsCount = 3;
		component.transactionsTable = {
			initializeData: jest.fn(),
			afterDataLoaded: jest.fn(),
			currentDisplayedPage: [],
		} as any;

		jest.spyOn(component['transactionsService'], 'getDateIntervalTransactions').mockReturnValue(
			of([{ id: '2' } as unknown as TransactionTableDto]),
		);

		const event = { currentIndex: 0, pageSize: 10 } as PaginatedData<TransactionTableDto>;
		component.loadData(event);

		expect(component.transactionsTable.initializeData).not.toHaveBeenCalled();
		expect(component.transactionsTable.afterDataLoaded).toHaveBeenCalledWith([
			{ passNumber: '-', id: '2' } as unknown as TransactionTableDto,
		]);
	});

	it('areFiltersApplied should be undefined when transactionsTable is null', () => {
		component.transactionsTable = null as any;
		expect(component.areFiltersApplied).toBeUndefined();
	});

	it('areFiltersApplied should be undefined when transactionsTable is undefined', () => {
		component.transactionsTable = undefined as any;
		expect(component.areFiltersApplied).toBeUndefined();
	});

	it('manageColumns should not throw when transactionsTable is null', () => {
		component.transactionsTable = null as any;
		expect(() => component.manageColumns()).not.toThrow();
	});

	it('onSelectDateRange should not throw and should not call initializeData when transactionsTable is null', () => {
		component.transactionsTable = null as any;
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactions').mockReturnValue(of(4));

		const dateRange = { startDateInterval: new Date(), endDateInterval: new Date() } as any;

		expect(() => component.onSelectDateRange(dateRange)).not.toThrow();

		expect(component.transactionsCount).toBe(4);
		expect(detectChangesSpy).toHaveBeenCalled();
	});

	it('onSelectDateRange should not throw and should not call afterDataLoaded when transactionsTable is null and count is 0', () => {
		component.transactionsTable = null as any;
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactions').mockReturnValue(of(0));

		const dateRange = { startDateInterval: new Date(), endDateInterval: new Date() } as any;

		expect(() => component.onSelectDateRange(dateRange)).not.toThrow();

		expect(component.transactionsCount).toBe(0);
		expect(detectChangesSpy).toHaveBeenCalled();
	});

	it('countTransactionsByDateInterval should not throw and should not call initializeData when transactionsTable is null', () => {
		component.transactionsTable = null as any;
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactions').mockReturnValue(of(8));

		expect(() => component['countTransactionsByDateInterval']()).not.toThrow();

		expect(component.transactionsCount).toBe(8);
		expect(detectChangesSpy).toHaveBeenCalled();
	});

	it('countTransactionsByDateInterval should update transactionsCount and call initializeData when table exists', () => {
		component.transactionsTable = { initializeData: jest.fn() } as any;
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');
		const initializeDataSpy = jest.spyOn(component.transactionsTable, 'initializeData');

		jest.spyOn(component['transactionsService'], 'countDateIntervalTransactions').mockReturnValue(of(13));

		component['countTransactionsByDateInterval']();

		expect(component.transactionsCount).toBe(13);
		expect(detectChangesSpy).toHaveBeenCalled();
		expect(initializeDataSpy).toHaveBeenCalled();
	});
});
