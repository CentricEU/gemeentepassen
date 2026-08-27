import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
	ActionButtonIcons,
	ActionButtons,
	Breadcrumb,
	BreadcrumbService,
	CitizenGroupsService,
	ColumnDataType,
	commonRoutingConstants,
	FilterColumnKey,
	FilterCriteria,
	ModalData,
	PaginatedData,
	PassholderViewDto,
	TableActionButton,
	TableColumn,
	TableFilterColumn,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil, TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { FilterPassholdersRequestDto } from '../../_models/filter-passholders-request-dto.model';
import { PassholdersService } from '../../_services/passholders.service';
import { ImportPassholdersComponent } from '../../components/import-passholders/import-passholders.component';

@Component({
	selector: 'frontend-passholders',
	templateUrl: './passholders.component.html',
	styleUrls: ['./passholders.component.scss'],
	standalone: false,
})
export class PassholdersComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('passholdersTable') passholdersTable: TableComponent<PassholderViewDto>;

	public allFilterColumns: TableFilterColumn[];
	public showCreateCitizenGroupState = true;
	public isMultipleSelect = false;
	public filterDto: FilterPassholdersRequestDto;

	public get isDataExisting(): boolean {
		return this.dataCount > 0;
	}

	public get areFiltersApplied(): boolean {
		return this.passholdersTable?.areFiltersApplied();
	}

	public get paginatedData(): PaginatedData<PassholderViewDto> {
		return this.passholdersTable?.paginatedData;
	}

	private readonly breadcrumbService = inject(BreadcrumbService);
	private readonly dialogService = inject(DialogService);
	private readonly translateService = inject(TranslateService);
	private readonly toastrService = inject(ToastrService);
	private readonly passholderService = inject(PassholdersService);
	private readonly citizenGroupsService = inject(CitizenGroupsService);
	private readonly router = inject(Router);

	constructor() {
		super();
	}

	public ngOnInit(): void {
		this.initFilterColumnsData();
		this.countFilteredPassholders(true);
		this.initBreadcrumbs();
		this.getCitizenGroupsCount();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public shouldDisplayTable(): FilterPassholdersRequestDto | TableFilterColumn[] {
		return (this.isDataExisting && this.allFilterColumns) || this.filterDto;
	}

	public onApplyFilters(filters: FilterCriteria, isFirstFiltering: boolean): void {
		if (isFirstFiltering) {
			this.paginatedData.currentIndex = 0;
			this.passholdersTable.resetPageContent();
		}

		this.passholdersTable.deselectAllCheckboxes();
		this.filterDto = this.createFilterPassholdersRequestDto(filters);

		this.passholderService
			.getFilteredPassholders(this.filterDto, this.paginatedData.currentIndex, this.paginatedData.pageSize)
			.subscribe((data) => {
				this.afterDataLoaded(data);
				this.countFilteredPassholders();
			});
	}

	public clearFilters(): void {
		this.passholdersTable.clearFilters();
	}

	public openPassholdersModal(): void {
		this.dialogService
			.message(ImportPassholdersComponent, {
				width: '524px',
				closeOnNavigation: false,
			})
			?.afterClosed()
			.subscribe((success) => {
				if (!success) {
					return;
				}

				this.passholdersTable?.deselectAllCheckboxes();
				this.countFilteredPassholders(true);
			});
	}

	public manageColumns(): void {
		this.passholdersTable.manageColumns();
	}

	public goToProfilePage(): void {
		this.router.navigate([commonRoutingConstants.profile]);
	}

	public loadData(event: PaginatedData<PassholderViewDto>): void {
		if (this.filterDto) {
			this.onApplyFilters(this.passholdersTable.filterFormGroup.value as FilterCriteria, false);
			return;
		}

		this.passholderService
			.getFilteredPassholders(this.filterDto, event.currentIndex, event.pageSize)
			.subscribe((data) => {
				this.afterDataLoaded(data);
			});
	}

	public initializeColumns(): void {
		this.allColumns = [
			new TableColumn('general.name', 'name', 'name', true, true),
			new TableColumn('general.bsn', 'bsn', 'bsn', true, false),
			new TableColumn('general.address', 'address', 'address', true, false),
			new TableColumn('general.residenceCity', 'residenceCity', 'residenceCity', true, false),
			new TableColumn('general.expiringDate', 'expiringDate', 'expiringDate', true, false, ColumnDataType.DATE),
			new TableColumn('general.passNumber', 'passNumber', 'passNumber', true, true),
			new TableColumn('general.citizenGroup', 'citizenGroupName', 'citizenGroupName', true, false),
			new TableColumn(
				'general.registered',
				'isRegistered',
				'isRegistered',
				true,
				false,
				ColumnDataType.REGISTERED,
			),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	public initializeComponentData(): void {
		this.initializeColumns();
		this.passholdersTable?.initializeData();
	}

	public onActionButtonClicked(event: { actionButton: string; row: PassholderViewDto }): void {
		if (event.actionButton === ActionButtons.trashIcon) {
			this.openDialogDelete(event.row.id);
		}

		if (event.actionButton === ActionButtons.visibilityIcon) {
			this.navigateToPassholderDetails(event.row.id);
		}
	}

	public onGetSelectedItemsNumber(count: number): void {
		this.isMultipleSelect = count > 0;
	}

	public afterDataLoaded(data: Array<PassholderViewDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			actionButtons: [
				new TableActionButton(
					ActionButtons.visibilityIcon,
					'actionButtons.viewPassholder',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
				new TableActionButton(
					ActionButtons.trashIcon,
					'actionButtons.delete',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
			],
		}));

		this.passholdersTable.afterDataLoaded(dataWithActions);
	}

	private countFilteredPassholders(initializeComponentData = false): void {
		const filters = (this.passholdersTable?.filterFormGroup?.value as FilterCriteria) || {
			bsnFilter: '',
			passholderNumberFilter: '',
		};
		const filterDto = this.createFilterPassholdersRequestDto(filters);
		this.passholderService.countFilteredPassholders(filterDto).subscribe((data) => {
			this.dataCount = data;
			if (this.dataCount === 0) {
				this.afterDataLoaded([]);
				return;
			}
			if (initializeComponentData) {
				this.initializeComponentData();
			}
		});
	}

	private createFilterPassholdersRequestDto(filters: FilterCriteria): FilterPassholdersRequestDto {
		const { bsnFilter, passholderNumberFilter } = filters;

		return new FilterPassholdersRequestDto(bsnFilter as string, passholderNumberFilter as string);
	}

	private initBreadcrumbs(): void {
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.passholders', [commonRoutingConstants.passholders]),
		];
		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}

	private createWarningDialogConfig(): MatDialogConfig {
		const data = new WarningDialogData();

		const modal = new ModalData(
			'passholders.delete.title',
			'',
			'passholders.delete.content',
			'general.button.cancel',
			'general.button.delete',
			false,
			'danger',
			'danger',
			'',
			data,
		);

		return { ...CustomDialogConfigUtil.createMessageModal(modal), width: '400px' };
	}

	private navigateToPassholderDetails(passholderId: string): void {
		this.router.navigateByUrl(`${commonRoutingConstants.passholders}/${passholderId}`);
	}

	private openDialogDelete(passholderId: string): void {
		const config = this.createWarningDialogConfig();

		this.dialogService
			.alert(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				if (!data) {
					return;
				}

				this.passholderService.deletePassholder(passholderId).subscribe(() => {
					const toastText = this.translateService.instant('passholders.successDelete');

					this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
					this.passholdersTable.deselectAllCheckboxes();
					this.countFilteredPassholders(true);
				});
			});
	}

	private getCitizenGroupsCount(): void {
		this.citizenGroupsService.countCitizenGroups().subscribe((count) => {
			if (count > 0) {
				this.showCreateCitizenGroupState = false;
			}
		});
	}

	private initFilterColumnsData(): void {
		const filterColumnsData: Array<{
			key: FilterColumnKey;
			data: any[];
			translationKey?: string;
			filterType?: 'text' | 'dropdown';
		}> = [
			{ key: FilterColumnKey.PASSHOLDERS_NAME, data: [] },
			{
				key: FilterColumnKey.PASSHOLDERS_BSN,
				data: [],
				translationKey: 'general.bsn',
				filterType: 'text',
			},
			{ key: FilterColumnKey.PASSHOLDERS_ADDRESS, data: [] },
			{ key: FilterColumnKey.PASSHOLDERS_RESIDENCE_CITY, data: [] },
			{ key: FilterColumnKey.PASSHOLDERS_EXPIRING_DATE, data: [] },
			{
				key: FilterColumnKey.PASSHOLDERS_NUMBER,
				data: [],
				translationKey: 'general.passNumber',
				filterType: 'text',
			},
			{ key: FilterColumnKey.PASSHOLDERS_CITIZEN_GROUP, data: [] },
			{ key: FilterColumnKey.PASSHOLDERS_REGISTERED, data: [] },
			{ key: FilterColumnKey.ACTIONS, data: [] },
		];

		this.allFilterColumns = filterColumnsData.map(({ key, data, translationKey, filterType }) => {
			return new TableFilterColumn(key, data, translationKey || '', filterType);
		});
	}
}
