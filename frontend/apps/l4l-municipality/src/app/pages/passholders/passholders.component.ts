import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import {
	ActionButtonIcons,
	ActionButtons,
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	ModalData,
	PaginatedData,
	PassholderViewDto,
	TableActionButton,
	TableColumn,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil, TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, ToastrService } from '@windmill/ng-windmill';

import { PassholdersService } from '../../_services/passholders.service';
import { AssignGrantComponent } from '../../components/assign-grant/assign-grant.component';
import { ImportPassholdersComponent } from '../../components/import-passholders/import-passholders.component';

@Component({
	selector: 'frontend-passholders',
	templateUrl: './passholders.component.html',
	styleUrls: ['./passholders.component.scss'],
})
export class PassholdersComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('passholdersTable') passholdersTable: TableComponent<PassholderViewDto>;

	public isMultipleSelect = false;

	private assignGrantsDialogRef: MatDialogRef<AssignGrantComponent>;

	public get typeOfModal() {
		return AssignGrantComponent;
	}

	public get isDataExisting(): boolean {
		return this.dataCount > 0;
	}

	constructor(
		private dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private passholderService: PassholdersService,
		private readonly toastrService: ToastrService,
		private translateService: TranslateService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.countPassholders();
		this.initBreadcrumbs();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
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
				this.countPassholders();
			});
	}

	public manageColumns(): void {
		this.passholdersTable.manageColumns();
	}

	public loadData(event: PaginatedData<PassholderViewDto>): void {
		this.passholderService.getPassholders(event.currentIndex, event.pageSize).subscribe((data) => {
			this.afterDataLoaded(data);
		});
	}

	public initializeColumns(): void {
		this.allColumns = [
			new TableColumn('checkbox', 'checkbox', 'checkbox', true, true, ColumnDataType.DEFAULT, true),
			new TableColumn('general.name', 'name', 'name', true, false),
			new TableColumn('general.bsn', 'bsn', 'bsn', true, false),
			new TableColumn('general.address', 'address', 'address', true, false),
			new TableColumn('general.residenceCity', 'residenceCity', 'residenceCity', true, false),
			new TableColumn('general.expiringDate', 'expiringDate', 'expiringDate', true, false),
			new TableColumn('general.passNumber', 'passNumber', 'passNumber', true, false),
			new TableColumn('passholders.assignedGrants', 'grants', 'grants', true, true, ColumnDataType.CHIPS),
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

	public assignMultipleGrants(): void {
		this.assignGrantsDialogRef = this.dialogService.prompt(this.typeOfModal, {
			disableClose: false,
			data: {
				chipTitleColumn: 'title',
				parentRecord: this.getSelectedPassholders(),
				isMultipleAssign: true,
			},
		}) as MatDialogRef<AssignGrantComponent>;

		if (!this.assignGrantsDialogRef) {
			return;
		}

		this.assignGrantsDialogRef.afterClosed().subscribe((success) => {
			if (!success) {
				return;
			}

			this.passholdersTable.deselectAllCheckboxes();
			this.loadData(this.passholdersTable.paginatedData);
		});
	}

	private getSelectedPassholders(): PassholderViewDto[] {
		return this.passholdersTable.currentDisplayedPage.filter((item) => item.selected);
	}

	private countPassholders(): void {
		this.passholderService.countPassholders().subscribe((data) => {
			this.dataCount = data;
			if (this.dataCount === 0) {
				return;
			}
			this.initializeComponentData();
		});
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
			'alert',
			'danger',
			'',
			data,
		);

		return { ...CustomDialogConfigUtil.createMessageModal(modal), width: '400px' };
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
					this.countPassholders();
				});
			});
	}
}
