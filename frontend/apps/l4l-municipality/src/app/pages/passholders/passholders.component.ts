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
	ModalData,
	PaginatedData,
	PassholderViewDto,
	TableActionButton,
	TableColumn,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil, TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';

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

	public showCreateCitizenGroupState = true;
	public isMultipleSelect = false;

	public get isDataExisting(): boolean {
		return this.dataCount > 0;
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
		this.countPassholders();
		this.initBreadcrumbs();
		this.getCitizenGroupsCount();
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

	public goToProfilePage(): void {
		this.router.navigate([commonRoutingConstants.profile]);
	}

	public loadData(event: PaginatedData<PassholderViewDto>): void {
		this.passholderService.getPassholders(event.currentIndex, event.pageSize).subscribe((data) => {
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
	}

	public onGetSelectedItemsNumber(count: number): void {
		this.isMultipleSelect = count > 0;
	}

	public afterDataLoaded(data: Array<PassholderViewDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			actionButtons: [
				// new TableActionButton(
				// 	ActionButtons.visibilityIcon,
				// 	'actionButtons.viewPassholder',
				// 	false,
				// 	'',
				// 	ActionButtonIcons.uncontained,
				// ),
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
			'danger',
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

	private getCitizenGroupsCount(): void {
		this.citizenGroupsService.countCitizenGroups().subscribe((count) => {
			if (count > 0) {
				this.showCreateCitizenGroupState = false;
			}
		});
	}
}
