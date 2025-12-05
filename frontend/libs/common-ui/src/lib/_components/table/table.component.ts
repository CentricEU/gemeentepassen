import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
	ColumnDataType,
	FilterColumnKey,
	FilterCriteria,
	GenericTableData,
	GrantDto,
	Page,
	PaginatedData,
	StatusUtil,
	TableColumn,
	TableFilterColumn,
} from '@frontend/common';
import { DialogService, PageEvent } from '@windmill/ng-windmill';

import { TableColumnsManagerComponent } from '../table-columns-manager/table-columns-manager.component';

@Component({
	selector: 'frontend-table',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss'],
})
export class TableComponent<T extends GenericTableData> implements OnInit {
	@Input() showHeader: boolean;
	@Input() showFooter: boolean;
	@Input() columns: TableColumn[] = [];
	@Input() filterColumns: TableFilterColumn[] = [];
	@Input() public typeOfT: any;
	@Input() public columnWithChips = '';
	@Input() hasCheckbox = false;
	@Input() shouldDisplayButtonForChips = true;
	@Input() hasFilters = false;
	@Input() innerEmptyState = false;
	@Input() innerEmptyStateTitle: string;
	@Input() listLength: number;

	@Output() public actionButtonClicked: EventEmitter<{ actionButton: string; row: T }> = new EventEmitter();

	@Output() public checkboxUpdated: EventEmitter<boolean> = new EventEmitter();

	@Output() public getSelectedItemsNumber = new EventEmitter<number>();
	@Output() public applyFilters = new EventEmitter<FilterCriteria>();
	@Output() public loadDataEvent = new EventEmitter<PaginatedData<T>>();

	public selectAll = false;
	public indeterminateSelect = false;

	public allColumns: TableColumn[] = [];
	public displayedColumns: TableColumn[] = [];

	public filterFormGroup: FormGroup;

	public dynamicContentCols: string[];
	public fixedContentCols: string[] = [];

	public paginatedData: PaginatedData<T>;
	public currentDisplayedPage: Array<T>;

	private displayedFilterColumns = [FilterColumnKey.STATUS, FilterColumnKey.OFFER_TYPE, FilterColumnKey.GRANTS];

	private initialDisplayedFilterColumns = this.displayedFilterColumns;
	private initialFilterColumns: TableFilterColumn[] = [];
	private dialogRef: MatDialogRef<unknown> | undefined;

	public get statusUtil(): typeof StatusUtil {
		return StatusUtil;
	}

	public get columnDataTypes(): typeof ColumnDataType {
		return ColumnDataType;
	}

	public get hasData(): boolean {
		return this.currentDisplayedPage?.length > 0;
	}

	constructor(protected readonly dialogService: DialogService) {}

	public ngOnInit(): void {
		this.initFilters();
		this.updateDisplayedColumns(this.columns);

		this.filterFormGroup.valueChanges.subscribe(() => {
			this.applyFilters.emit(this.filterFormGroup.value);
		});

		this.initializeData();
	}

	public onSearchValueChanged(event: string, column: string): void {
		const filterColumn = this.filterColumns.find((col) => col.filterName === column);
		if (!filterColumn) {
			return;
		}

		const searchTerm = event?.trim().toLowerCase() ?? '';

		filterColumn.source = searchTerm
			? filterColumn.source.filter(({ value }) => value.toLowerCase().includes(searchTerm))
			: filterColumn.filteredSource;
	}

	public isGrantDtoArray(source: GrantDto): boolean {
		return Array.isArray(source) && source.length > 0 && source[0] instanceof GrantDto;
	}

	public isFilterCriteria(col: FilterColumnKey | string): boolean {
		return this.initialDisplayedFilterColumns.includes(col as FilterColumnKey);
	}

	public isTooltipDisabled(text: string): boolean {
		return !!text;
	}

	public updateDisplayedColumns(columnsArray: TableColumn[]): void {
		this.allColumns = columnsArray;
		this.displayedColumns = this.allColumns.filter((column) => column.isChecked);
		this.fixedContentCols = [];
		columnsArray.map((element) => this.shouldUpdateFilters(element));
		this.displayedColumns.forEach((item) => {
			this.fixedContentCols.push(item['property']);
			if (!this.filterColumns) {
				this.dynamicContentCols = [];
				return;
			}
			this.dynamicContentCols = this.filterColumns.map((col) => col.filterName);
		});
	}

	public columnName(index: number, column: TableColumn): string {
		const columnName = column['columnLabel'] ? column['columnLabel'] : '';
		return String(index) + String(columnName);
	}

	public manageColumns(): void {
		this.openDialog();
	}

	public onActionButtonPress(actionButton: string, rowElement: any): void {
		this.actionButtonClicked.emit({ actionButton: actionButton, row: rowElement });
	}

	public deselectAllCheckboxes(): void {
		this.indeterminateSelect = false;
		this.selectAll = false;

		this.currentDisplayedPage.filter((item) => !item.isCheckboxDisabled).map((item) => (item.selected = false));

		this.checkboxUpdated.emit(true);
		this.getSelectedItemsNumber.emit(0);
	}

	public selectAllCheckboxes(): void {
		let countSelected = 0;

		this.currentDisplayedPage
			.filter((item) => !item.isCheckboxDisabled)
			.forEach((item) => {
				item.selected = true;
				countSelected++;
			});

		const areAllSelected = countSelected === this.currentDisplayedPage.length;
		this.selectAll = true;
		this.indeterminateSelect = !areAllSelected;

		this.checkboxUpdated.emit(true);
		this.getSelectedItemsNumber.emit(countSelected);
	}

	public toggleCheckbox(): void {
		if (!this.selectAll) {
			this.selectAllCheckboxes();
			return;
		}

		this.deselectAllCheckboxes();
	}

	public updateSelectAll(): void {
		const numberSelectedItems = this.currentDisplayedPage.filter((item) => item.selected).length;
		const enabledItemsCount = this.currentDisplayedPage.filter((item) => !item.isCheckboxDisabled).length;
		if (enabledItemsCount === numberSelectedItems) {
			this.selectAll = true;
			this.indeterminateSelect = false;
		} else if (numberSelectedItems > 0) {
			this.selectAll = false;
			this.indeterminateSelect = true;
		} else {
			this.selectAll = false;
			this.indeterminateSelect = false;
		}
		this.checkboxUpdated.emit(true);
		this.getSelectedItemsNumber.emit(numberSelectedItems);
	}

	public handlePageChange(event: PageEvent): void {
		this.deselectAllCheckboxes();
		this.onPageChange(event);
	}

	public handlePageSizeChange(newPageSize: number): void {
		this.deselectAllCheckboxes();
		this.onPageSelected(newPageSize);
	}

	public onPageChange(event: PageEvent): void {
		this.paginatedData.currentIndex = event.pageIndex;

		if (this.paginatedData.pages[this.paginatedData.currentIndex].values.length === 0) {
			this.loadData();
			return;
		}

		this.currentDisplayedPage = this.paginatedData.pages[this.paginatedData.currentIndex].values;
	}

	public isDataExisting(): boolean {
		return this.listLength > 0;
	}

	public onPageSelected(event: number): void {
		this.initializePaginatedDataBasedOnPageSize(event);
		this.loadData();
	}

	public loadData(): void {
		this.loadDataEvent.emit(this.paginatedData);
	}

	public initializeData(): void {
		const initialPageSize = 25;
		this.onPageSelected(initialPageSize);
	}

	public initializePaginatedDataBasedOnPageSize(pageSize: number): void {
		const pagesNumber = Math.ceil(this.listLength / pageSize);
		const pages: Page<T>[] = Array.from({ length: pagesNumber }, () => new Page([]));

		this.paginatedData = new PaginatedData<T>(pages, pageSize, 0);
	}

	public afterDataLoaded(dataWithActions: T[]): void {
		this.paginatedData.pages[this.paginatedData.currentIndex].values = dataWithActions;
		this.currentDisplayedPage = this.paginatedData.pages[this.paginatedData.currentIndex].values;
	}

	public getSelectedElements(): T[] {
		return this.currentDisplayedPage.filter((data) => data.selected);
	}

	public clearFilters(): void {
		this.filterFormGroup.reset();
	}

	public areFiltersApplied(): boolean {
		if (!this.filterColumns || !this.filterFormGroup) {
			return false;
		}

		if (!this.filterFormGroup.dirty) {
			return false;
		}

		return this.filterColumns.some((column) => this.filterFormGroup.get(column.filterName)?.value);
	}

	private openDialog(): void {
		const currentColumns = this.allColumns.map((column) => {
			return new TableColumn(
				column.columnLabel,
				column.property,
				column.value,
				column.isChecked,
				column.isDefault,
				column.columnDataType,
				column.isFixed,
			);
		});

		this.dialogRef = this.dialogService.prompt(TableColumnsManagerComponent, {
			width: '600px',
			disableClose: false,
			data: { tableColumns: currentColumns },
		});

		if (!this.dialogRef) {
			return;
		}

		this.dialogRef.afterClosed().subscribe((result: TableColumn[]) => {
			if (!result) {
				return;
			}
			this.updateDisplayedColumns(result);
		});
	}

	private initFilters(): void {
		this.filterFormGroup = new FormGroup({});

		if (!this.filterColumns) {
			return;
		}

		this.filterColumns.forEach((column) => {
			this.filterFormGroup.addControl(column.filterName, new FormControl());
		});

		this.initialFilterColumns = this.filterColumns;
	}

	private shouldUpdateFilters(element: TableColumn): void {
		const property = `${element.property}Filter`;

		if (this.shouldRemoveFilter(property, element)) {
			this.removeFilter(property);
			return;
		}

		if (!element.isChecked) {
			this.removeDisplayedFilter(property);
			this.removeFilter(property);
			return;
		}

		this.addFilterAtOriginalIndex(property);
	}

	private shouldRemoveFilter(property: string, element: TableColumn): boolean {
		return !this.isFilterCriteria(property) && !element.isChecked;
	}

	private removeFilter(property: string): void {
		this.filterColumns = this.filterColumns?.filter((column) => column.filterName !== property);
	}

	private removeDisplayedFilter(property: string): void {
		this.displayedFilterColumns = this.displayedFilterColumns.filter((column) => column !== property);
	}

	private addFilterAtOriginalIndex(property: string): void {
		const initialIndex = this.initialFilterColumns.findIndex((col) => col.filterName === property);
		const currentIndex = this.displayedColumns.findIndex((col) => col.property + 'Filter' === property);

		if (initialIndex !== -1 && !this.filterColumns.some((col) => col.filterName === property)) {
			this.filterColumns.splice(currentIndex, 0, this.initialFilterColumns[initialIndex]);
		}

		const displayedIndex = this.initialDisplayedFilterColumns.indexOf(property as FilterColumnKey);
		if (displayedIndex !== -1 && !this.displayedFilterColumns.includes(property as FilterColumnKey)) {
			this.displayedFilterColumns.splice(displayedIndex, 0, property as FilterColumnKey);
		}
	}
}
