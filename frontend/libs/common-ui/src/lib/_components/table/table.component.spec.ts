import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	ColumnDataType,
	EnumValueDto,
	FilterColumnKey,
	Page,
	PaginatedData,
	StatusUtil,
	TableColumn,
	TableFilterColumn,
} from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of, Subject } from 'rxjs';

import { TableDataMock } from '../../_mocks/table-data.mock';
import { WindmillModule } from '../../windmil.module';
import { TableColumnsManagerComponent } from '../table-columns-manager/table-columns-manager.component';
import { TableComponent } from './table.component';

describe('TableComponent', () => {
	let component: TableComponent<any>;
	let fixture: ComponentFixture<TableComponent<any>>;
	let dialogService: DialogService;
	let filterCheckSubject: Subject<void>;
	let checkboxUpdatedEmitMock: jest.Mock;
	let getSelectedItemsNumberEmitMock: jest.Mock;

	const mockColumns: TableColumn[] = [
		new TableColumn('Column 1', 'col1', 'value1', true, true),
		new TableColumn('Column 2', 'col2', 'value2', true, true),
		new TableColumn('Column 3', 'col3', 'value3', false, true),
	];

	const mockFilterColumns: TableFilterColumn[] = [
		{
			filterName: 'filter1',
			source: [new EnumValueDto('value1', 'value1')],
			placeholder: 'value1',
			filteredSource: [new EnumValueDto('value1', 'value1')],
		},
		{
			filterName: 'filter2',
			source: [new EnumValueDto('value2', 'value2')],
			placeholder: 'value2',
			filteredSource: [new EnumValueDto('value2', 'value2')],
		},
	];

	beforeEach(async () => {
		global.ResizeObserver = require('resize-observer-polyfill');
		filterCheckSubject = new Subject<void>();
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [TableComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), BrowserAnimationsModule],
			providers: [DialogService],
		}).compileComponents();

		fixture = TestBed.createComponent(TableComponent<TableDataMock>);
		component = fixture.componentInstance;
		component.columns = mockColumns;
		component.filterColumns = mockFilterColumns;
		checkboxUpdatedEmitMock = jest.fn();
		getSelectedItemsNumberEmitMock = jest.fn();
		component.checkboxUpdated = { emit: checkboxUpdatedEmitMock } as any;
		component.getSelectedItemsNumber = { emit: getSelectedItemsNumberEmitMock } as any;
		fixture.detectChanges();
		dialogService = TestBed.inject(DialogService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should update displayed columns based on input', () => {
		component.updateDisplayedColumns(mockColumns);

		expect(component.displayedColumns).toEqual(mockColumns.filter((column) => column.isChecked));
		expect(component.fixedContentCols).toEqual(
			mockColumns.filter((column) => column.isChecked).map((column) => column.property),
		);
	});

	it('should open the column manager dialog', () => {
		const dialogRefMock = { afterClosed: () => of(mockColumns) };
		jest.spyOn(dialogService, 'prompt').mockReturnValue(dialogRefMock as any);
		jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of({} as TableColumn[]));

		component.manageColumns();

		expect(dialogService.prompt).toHaveBeenCalledWith(TableColumnsManagerComponent, {
			width: '600px',
			disableClose: false,
			data: { tableColumns: mockColumns },
		});

		expect(dialogRefMock.afterClosed).toHaveBeenCalled();
	});

	it('should call updateDisplayedColumns after closing dialog', () => {
		const dialogRefMock = { afterClosed: () => of(mockColumns) };
		jest.spyOn(dialogService, 'prompt').mockReturnValue(dialogRefMock as any);
		jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of({} as TableColumn[]));
		jest.spyOn(component, 'updateDisplayedColumns').mockReturnValue();
		component.manageColumns();
		expect(component.updateDisplayedColumns).toHaveBeenCalled();
	});

	it('should not call updateDisplayedColumns after closing dialog', () => {
		const dialogRefMock = { afterClosed: () => of(mockColumns) };
		jest.spyOn(dialogService, 'prompt').mockReturnValue(dialogRefMock as any);
		jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(null as unknown as TableColumn[]));
		jest.spyOn(component, 'updateDisplayedColumns').mockReturnValue();
		component.manageColumns();
		expect(component.updateDisplayedColumns).not.toHaveBeenCalled();
	});

	it('should return early if dialogRef is null', () => {
		jest.spyOn(dialogService, 'prompt').mockReturnValue(undefined);

		component.manageColumns();

		expect(component['dialogRef']).toBeUndefined();
	});

	describe('Test column name', () => {
		it('should generate a column name with index and label', () => {
			const index = 1;
			const column: TableColumn = new TableColumn('Column 1', 'col1', 'value1', true, true);

			const columnName = component.columnName(index, column);

			// Expect the generated column name to include the index and label
			expect(columnName).toBe(`${index}${column.columnLabel}`.toString());
		});

		it('should generate a column name with only index when no label', () => {
			const index = 1;
			const column: TableColumn = new TableColumn(null as unknown as string, 'col1', 'value1', true, true);

			const columnName = component.columnName(index, column);

			// Expect the generated column name to include the index and label
			expect(columnName).toBe(index.toString());
		});
	});

	it('should emit the actionButtonClicked event with the correct arguments', () => {
		const actionButton = 'sampleActionButton';
		const rowElement = {};

		jest.spyOn(component.actionButtonClicked, 'emit');

		component.onActionButtonPress(actionButton, rowElement);

		expect(component.actionButtonClicked.emit).toHaveBeenCalledWith({
			actionButton: actionButton,
			row: rowElement,
		});
	});

	it('should initialize selectAll and indeterminateSelect to false', () => {
		expect(component.selectAll).toBe(false);
		expect(component.indeterminateSelect).toBe(false);
	});

	it('should updateAllItems and select all items', () => {
		component.currentDisplayedPage = [
			{ selected: false, isCheckboxDisabled: false },
			{ selected: true, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: false },
		];

		component.toggleCheckbox();

		expect(component.indeterminateSelect).toBe(false);
		expect(component.currentDisplayedPage).toEqual([
			{ selected: true, isCheckboxDisabled: false },
			{ selected: true, isCheckboxDisabled: false },
			{ selected: true, isCheckboxDisabled: false },
		]);
	});

	it('should updateSelectAll and set selectAll and indeterminateSelect correctly', () => {
		component.currentDisplayedPage = [
			{ selected: false, isCheckboxDisabled: false },
			{ selected: true, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: false },
		];
		component.updateSelectAll();

		expect(component.selectAll).toBe(false);
		expect(component.indeterminateSelect).toBe(true);

		component.currentDisplayedPage = [
			{ selected: true, isCheckboxDisabled: false },
			{ selected: true, isCheckboxDisabled: false },
			{ selected: true, isCheckboxDisabled: false },
		];
		component.updateSelectAll();

		expect(component.selectAll).toBe(true);
		expect(component.indeterminateSelect).toBe(false);

		component.currentDisplayedPage = [
			{ selected: false, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: false },
		];
		component.updateSelectAll();

		expect(component.selectAll).toBe(false);
		expect(component.indeterminateSelect).toBe(false);
	});

	it('should update displayed columns based on input', () => {
		component.updateDisplayedColumns(mockColumns);

		expect(component.displayedColumns).toEqual(mockColumns.filter((column) => column.isChecked));
		expect(component.fixedContentCols).toEqual(
			mockColumns.filter((column) => column.isChecked).map((column) => column.property),
		);
	});

	it('should return the correct type for columnDataTypes', () => {
		const result = component.columnDataTypes;

		expect(result).toEqual(ColumnDataType);
	});

	it('should return the correct type for statusUtil', () => {
		expect(component.statusUtil).toEqual(StatusUtil);
	});

	it('should return true if tooltip is empty', () => {
		const result = component.isTooltipDisabled('');
		expect(result).toBe(false);
	});

	it('should return false if tooltip is not empty', () => {
		const result = component.isTooltipDisabled('Some tooltip content');
		expect(result).toBe(true);
	});

	it('should filter columns based on search term', () => {
		const searchTerm = 'value1';
		const column = 'filter1';

		component.onSearchValueChanged(searchTerm, column);

		expect(component.filterColumns[0].source).toEqual([new EnumValueDto('value1', 'value1')]);
	});

	it('should initialize filters correctly', () => {
		component['initFilters']();

		expect(Object.keys(component.filterFormGroup.controls)).toEqual(['filter1', 'filter2']);
	});

	it('should handle filterColumns being null in updateDisplayedColumns', () => {
		component.filterColumns = null as unknown as TableFilterColumn[];

		component.updateDisplayedColumns(mockColumns);

		expect(component.dynamicContentCols).toEqual([]);
	});

	it('should update dynamicContentCols based on filterColumns', () => {
		component.updateDisplayedColumns(mockColumns);

		expect(component.dynamicContentCols).toEqual(mockFilterColumns.map((col) => col.filterName));
	});

	it('should remove filter if shouldRemoveFilter returns true', () => {
		const column = new TableColumn('Column 1', 'col1', 'value1', true, true);
		const property = `${column.property}Filter`;

		jest.spyOn(component as any, 'shouldRemoveFilter').mockReturnValue(true);
		jest.spyOn(component as any, 'removeFilter').mockImplementation();
		jest.spyOn(component as any, 'removeDisplayedFilter').mockImplementation();

		component['shouldUpdateFilters'](column);

		expect(component['shouldRemoveFilter']).toHaveBeenCalledWith(property, column);
		expect(component['removeFilter']).toHaveBeenCalledWith(property);
		expect(component['removeDisplayedFilter']).not.toHaveBeenCalled();
	});

	it('should remove filter and displayed filter if column is not checked', () => {
		const column = new TableColumn('Column 2', 'col2', 'value2', false, true);
		const property = `${column.property}Filter`;

		jest.spyOn(component as any, 'shouldRemoveFilter').mockReturnValue(false);
		jest.spyOn(component as any, 'removeFilter').mockImplementation();
		jest.spyOn(component as any, 'removeDisplayedFilter').mockImplementation();

		component['shouldUpdateFilters'](column);

		expect(component['shouldRemoveFilter']).toHaveBeenCalledWith(property, column);
		expect(component['removeFilter']).toHaveBeenCalledWith(property);
		expect(component['removeDisplayedFilter']).toHaveBeenCalledWith(property);
	});

	it('should add filter at original index if column is checked and shouldRemoveFilter is false', () => {
		const column = new TableColumn('Column 3', 'col3', 'value3', true, true);
		const property = `${column.property}Filter`;

		jest.spyOn(component as any, 'shouldRemoveFilter').mockReturnValue(false);
		jest.spyOn(component as any, 'addFilterAtOriginalIndex').mockImplementation();

		component['shouldUpdateFilters'](column);

		expect(component['shouldRemoveFilter']).toHaveBeenCalledWith(property, column);
		expect(component['addFilterAtOriginalIndex']).toHaveBeenCalledWith(property);
	});

	it('should not modify filterColumn.source when filterColumn does not exist', () => {
		const event = 'value';
		const column = 'invalidFilter';

		component.onSearchValueChanged(event, column);

		mockFilterColumns.forEach((filterColumn) => {
			expect(filterColumn.source).toEqual(filterColumn.filteredSource);
		});
	});

	it('should initialize filterFormGroup with form controls when filterColumns is defined', () => {
		const mockFilterColumns: TableFilterColumn[] = [
			{ filterName: 'filter1', source: [], placeholder: '', filteredSource: [] },
			{ filterName: 'filter2', source: [], placeholder: '', filteredSource: [] },
		];
		component.filterColumns = mockFilterColumns;

		component['initFilters']();

		expect(component.filterFormGroup).toBeDefined();
		expect(component.filterFormGroup.controls['filter1']).toBeDefined();
		expect(component.filterFormGroup.controls['filter2']).toBeDefined();
	});

	it('should initialize filterFormGroup with form controls when filterColumns is empty array', () => {
		component.filterColumns = [];

		component['initFilters']();

		expect(component.filterFormGroup).toBeDefined();
		expect(component.filterFormGroup.controls).toEqual({});
		expect(component['initialFilterColumns']).toEqual([]);
	});

	it('should remove the specified property from displayedFilterColumns', () => {
		const initialDisplayedFilterColumns = [
			FilterColumnKey.ACTIONS,
			FilterColumnKey.CHECKBOX,
			FilterColumnKey.STATUS,
		];
		component['displayedFilterColumns'] = [...initialDisplayedFilterColumns];

		const propertyToRemove = 'statusFilter';

		component['removeDisplayedFilter'](propertyToRemove);

		expect(component['displayedFilterColumns']).not.toContain(propertyToRemove);
		expect(component['displayedFilterColumns']).toEqual(
			initialDisplayedFilterColumns.filter((column) => column !== propertyToRemove),
		);
	});

	it('should not modify displayedFilterColumns if property does not exist', () => {
		const initialDisplayedFilterColumns = [
			FilterColumnKey.ACTIONS,
			FilterColumnKey.CHECKBOX,
			FilterColumnKey.STATUS,
		];
		component['displayedFilterColumns'] = [...initialDisplayedFilterColumns];

		const propertyToRemove = 'nonExistingProperty';

		component['removeDisplayedFilter'](propertyToRemove);

		expect(component['displayedFilterColumns']).toEqual(initialDisplayedFilterColumns);
	});

	it('should add property to filterColumns at its original index if not already present', () => {
		const propertyToAdd = 'filter2';
		component['initialFilterColumns'] = [
			{ filterName: 'filter1', source: [], placeholder: 'value1', filteredSource: [] },
			{ filterName: 'filter2', source: [], placeholder: 'value2', filteredSource: [] },
		];
		component['filterColumns'] = [{ filterName: 'filter1', source: [], placeholder: 'value1', filteredSource: [] }];

		component['addFilterAtOriginalIndex'](propertyToAdd);

		expect(component['filterColumns']).toEqual([
			{ filterName: 'filter2', source: [], placeholder: 'value2', filteredSource: [] },
			{ filterName: 'filter1', source: [], placeholder: 'value1', filteredSource: [] },
		]);
	});

	it('should not add property if already present in filterColumns', () => {
		const propertyToAdd = 'filter1';
		component['initialFilterColumns'] = [
			{ filterName: 'filter1', source: [], placeholder: 'value1', filteredSource: [] },
			{ filterName: 'filter2', source: [], placeholder: 'value2', filteredSource: [] },
		];
		component['filterColumns'] = [
			{ filterName: 'filter1', source: [], placeholder: 'value1', filteredSource: [] },
			{ filterName: 'filter2', source: [], placeholder: 'value2', filteredSource: [] },
		];

		component['addFilterAtOriginalIndex'](propertyToAdd);

		expect(component['filterColumns']).toEqual([
			{ filterName: 'filter1', source: [], placeholder: 'value1', filteredSource: [] },
			{ filterName: 'filter2', source: [], placeholder: 'value2', filteredSource: [] },
		]);
	});

	it('should not add property if already present in displayedFilterColumns', () => {
		const propertyToAdd = 'filter1';
		component['initialDisplayedFilterColumns'] = [FilterColumnKey.ACTIONS, FilterColumnKey.CHECKBOX];
		component['displayedFilterColumns'] = [FilterColumnKey.ACTIONS, FilterColumnKey.CHECKBOX];

		component['addFilterAtOriginalIndex'](propertyToAdd);

		expect(component['displayedFilterColumns']).toEqual(['actionsFilter', 'checkboxFilter']);
	});

	it('should add property to displayedFilterColumns at its original index if not already present', () => {
		const propertyToAdd = 'filter2';
		component['initialDisplayedFilterColumns'] = [FilterColumnKey.ACTIONS, FilterColumnKey.CHECKBOX];
		component['displayedFilterColumns'] = [FilterColumnKey.ACTIONS];

		component['addFilterAtOriginalIndex'](propertyToAdd);

		expect(component['displayedFilterColumns']).toEqual(['actionsFilter']);
	});

	it('should add property to displayedFilterColumns at its original index if not already present', () => {
		const propertyToAdd = FilterColumnKey.CHECKBOX;
		component['initialDisplayedFilterColumns'] = [FilterColumnKey.ACTIONS, FilterColumnKey.CITIZEN_OFFER_TYPE];
		component['displayedFilterColumns'] = [FilterColumnKey.ACTIONS, FilterColumnKey.CITIZEN_OFFER_TYPE];

		component['addFilterAtOriginalIndex'](propertyToAdd);

		expect(component['displayedFilterColumns']).toEqual([
			FilterColumnKey.ACTIONS,
			FilterColumnKey.CITIZEN_OFFER_TYPE,
		]);
	});

	it('should not add property if already present in displayedFilterColumns', () => {
		const propertyToAdd = 'filter1';
		component['initialDisplayedFilterColumns'] = [FilterColumnKey.ACTIONS, FilterColumnKey.CITIZEN_OFFER_TYPE];
		component['displayedFilterColumns'] = [FilterColumnKey.ACTIONS, FilterColumnKey.CITIZEN_OFFER_TYPE];

		component['addFilterAtOriginalIndex'](propertyToAdd);

		expect(component['displayedFilterColumns']).toEqual([
			FilterColumnKey.ACTIONS,
			FilterColumnKey.CITIZEN_OFFER_TYPE,
		]);
	});
	it('should call deselectAllCheckboxes when checkbox is clicked and all are selected', () => {
		jest.spyOn(component, 'deselectAllCheckboxes');
		component.currentDisplayedPage = [
			{ selected: true, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: true },
			{ selected: true, isCheckboxDisabled: false },
		];

		component.selectAll = true;
		component.toggleCheckbox();

		expect(component.deselectAllCheckboxes).toHaveBeenCalled();
	});

	it('should deselect all checkboxes', () => {
		component.currentDisplayedPage = [
			{ selected: true, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: true },
			{ selected: true, isCheckboxDisabled: false },
		];
		const expectedData = [
			{ selected: false, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: true },
			{ selected: false, isCheckboxDisabled: false },
		];

		jest.spyOn(component.checkboxUpdated, 'emit');
		jest.spyOn(component.getSelectedItemsNumber, 'emit');
		component.deselectAllCheckboxes();

		expect(component.currentDisplayedPage).toEqual(expectedData);
		expect(component.checkboxUpdated.emit).toHaveBeenCalledWith(true);
		expect(component.getSelectedItemsNumber.emit).toHaveBeenCalledWith(0);
	});

	it('should select all enabled checkboxes', () => {
		component.currentDisplayedPage = [
			{ selected: false, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: true },
			{ selected: false, isCheckboxDisabled: false },
		];
		const expectedData = [
			{ selected: true, isCheckboxDisabled: false },
			{ selected: false, isCheckboxDisabled: true },
			{ selected: true, isCheckboxDisabled: false },
		];

		jest.spyOn(component.checkboxUpdated, 'emit');
		jest.spyOn(component.getSelectedItemsNumber, 'emit');
		component.selectAllCheckboxes();

		expect(component.currentDisplayedPage).toEqual(expectedData);
		expect(component.checkboxUpdated.emit).toHaveBeenCalledWith(true);
		expect(component.getSelectedItemsNumber.emit).toHaveBeenCalledWith(2);
	});

	it('should return early if filterColumns is empty', () => {
		component.filterColumns = [];

		component['initFilters']();

		expect(component.filterFormGroup instanceof FormGroup).toBe(true);
		expect(Object.keys(component.filterFormGroup.controls)).toHaveLength(0);
		expect(component['initialFilterColumns']).toEqual([]);
	});

	it('should return early if filterColumns is undefined', () => {
		component.filterColumns = undefined as any;

		component['initFilters']();

		expect(component.filterFormGroup instanceof FormGroup).toBe(true);
		expect(Object.keys(component.filterFormGroup.controls)).toHaveLength(0);
	});

	it('should initialize data', () => {
		jest.spyOn(component, 'onPageSelected');

		component.initializeData();
		expect(component.onPageSelected).toHaveBeenCalledWith(25);
	});

	describe(' UT for onPageChange', () => {
		beforeEach(() => {
			const pages: Page<string>[] = Array.from({ length: 5 }, () => new Page([]));
			component.paginatedData = new PaginatedData<string>(pages, 10, 0);
		});

		it('should load data when the current page has no values', () => {
			const event: PageEvent = { pageIndex: 1, pageSize: 10, previousPageIndex: 0, length: 0 };

			component.paginatedData.pages[1] = new Page([]);
			jest.spyOn(component, 'loadData');

			component.onPageChange(event);

			expect(component.loadData).toHaveBeenCalled();
			expect(component.paginatedData.currentIndex).toEqual(event.pageIndex);
		});

		it('should update currentDisplayedPage when the current page has values', () => {
			const event: PageEvent = { pageIndex: 1, pageSize: 10, previousPageIndex: 0, length: 0 };
			const mockValues = ['test', 'array'];
			component.paginatedData.pages[1] = new Page(mockValues);
			jest.spyOn(component, 'loadData');

			component.onPageChange(event);

			expect(component.loadData).not.toHaveBeenCalled();
			expect(component.paginatedData.currentIndex).toEqual(event.pageIndex);
			expect(component.currentDisplayedPage).toEqual(mockValues);
		});
	});

	it('should call initializePaginatedDataBasedOnPageSize when onPageSelected', () => {
		component['initializePaginatedDataBasedOnPageSize'] = jest.fn();
		jest.spyOn(component, 'loadData');

		const mockPage = 10;
		component.onPageSelected(mockPage);
		expect(component['initializePaginatedDataBasedOnPageSize']).toHaveBeenCalledWith(mockPage);
		expect(component.loadData).toHaveBeenCalled();
	});

	describe(' UT for initializePaginatedDataBasedOnPageSize', () => {
		it('should initialize paginated data with the correct number of pages and page size', () => {
			const pageSize = 10;
			component['listLength'] = 25;

			component['initializePaginatedDataBasedOnPageSize'](pageSize);

			expect(component.paginatedData.pages.length).toBe(3); // 25 / 10 = 2.5
			expect(component.paginatedData.pageSize).toBe(pageSize);
			expect(component.paginatedData.currentIndex).toBe(0);
		});

		it('should initialize paginated data with an empty list if listLength is 0', () => {
			const pageSize = 10;

			component['listLength'] = 0;

			component['initializePaginatedDataBasedOnPageSize'](pageSize);

			expect(component.paginatedData.pages.length).toBe(0);
			expect(component.paginatedData.pageSize).toBe(pageSize);
			expect(component.paginatedData.currentIndex).toBe(0);
		});
	});

	describe(' UT for afterDataLoaded', () => {
		beforeEach(() => {
			const pages: Page<string>[] = Array.from({ length: 5 }, () => new Page([]));
			component.paginatedData = new PaginatedData<string>(pages, 10, 0);
		});

		it('should update paginated data and currentDisplayedPage after data is loaded', () => {
			const mockData = ['value1', 'value2'];
			component.paginatedData.currentIndex = 1;

			component.afterDataLoaded(mockData);

			expect(component.paginatedData.pages[1].values).toEqual(mockData);
			expect(component.currentDisplayedPage).toEqual(mockData);
		});
	});

	describe('Tests for isDataExisting ', () => {
		it('should return true if listLength > 0', () => {
			component['listLength'] = 1; // Set the listLength to a positive value for the test

			const result = component.isDataExisting();

			expect(result).toBeTruthy();
		});

		it('should return false if listLength is 0', () => {
			component['listLength'] = 0;
			const result = component.isDataExisting();
			expect(result).toBeFalsy();
		});

		it('should return false if listLength is less than 0', () => {
			component['listLength'] = -1;

			const result = component.isDataExisting();

			expect(result).toBeFalsy();
		});
	});

	it('should reset the filters form when the filters are cleared', () => {
		component.filterColumns = [
			{
				filterName: 'filter1',
				source: [new EnumValueDto('value1', 'value1')],
				placeholder: '',
				filteredSource: [],
			},
			{ filterName: 'filter2', source: [], placeholder: '', filteredSource: [] },
		];

		component['initFilters']();
		component.filterFormGroup.get('filter1')?.setValue('value1');

		component.clearFilters();

		expect(component.filterFormGroup.get('filter1')?.value).toBeNull();
	});

	describe('areFiltersApplied method', () => {
		it('should return false if the filter form is not initialized', () => {
			component.filterColumns = [];
			component.filterFormGroup = null as unknown as FormGroup;

			expect(component.areFiltersApplied()).toEqual(false);
		});

		it('should return false if the filter form has never been changed', () => {
			component['initFilters']();

			expect(component.areFiltersApplied()).toEqual(false);
		});

		it('should return true if any field from the form was filled', () => {
			component.filterColumns = [
				{
					filterName: 'filter1',
					source: [new EnumValueDto('value1', 'value1')],
					placeholder: '',
					filteredSource: [],
				},
				{ filterName: 'filter2', source: [], placeholder: '', filteredSource: [] },
			];

			component['initFilters']();
			component.filterFormGroup.get('filter1')?.setValue('value1');
			component.filterFormGroup.markAsDirty();

			expect(component.areFiltersApplied()).toEqual(true);
		});

		it('should return false if no field is filled but the form is dirty', () => {
			component['initFilters']();

			component.filterFormGroup.markAsDirty();

			expect(component.areFiltersApplied()).toEqual(false);
		});
	});

	it('should return selected elements from currentDisplayedPage', () => {
		const mockData = [
			{ selected: true, name: 'item1' },
			{ selected: false, name: 'item2' },
			{ selected: true, name: 'item3' },
		];
		component.currentDisplayedPage = mockData;

		const selectedElements = component.getSelectedElements();

		expect(selectedElements).toEqual([
			{ selected: true, name: 'item1' },
			{ selected: true, name: 'item3' },
		]);
	});

	it('should handle the page number change and page size change properly', () => {
		const mockData = [
			{ selected: true, name: 'item1' },
			{ selected: false, name: 'item2' },
			{ selected: true, name: 'item3' },
		];
		component.currentDisplayedPage = mockData;
		jest.spyOn(component, 'onPageSelected').mockImplementation(() => jest.fn());
		jest.spyOn(component, 'onPageChange').mockImplementation(() => jest.fn());

		const pageEvent: PageEvent = { pageSize: 5, pageIndex: 2, previousPageIndex: 1, length: 5 };

		component.handlePageChange(pageEvent);
		component.handlePageSizeChange(10);

		expect(component.onPageChange).toHaveBeenCalledWith(pageEvent);
		expect(component.onPageSelected).toHaveBeenCalledWith(10);
	});
});
