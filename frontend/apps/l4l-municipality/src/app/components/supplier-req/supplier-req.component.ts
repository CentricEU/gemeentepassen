import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import {
	ActionButtonIcons,
	ActionButtons,
	AuthService,
	ColumnDataType,
	PaginatedData,
	SupplierProfileService,
	SupplierStatus,
	SupplierViewDto,
	TableActionButton,
	TableColumn,
	UserInfo,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';

import { GetSuppliersDto } from '../../_models/get-suppliers-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { SupplierEditPopupComponent } from '../supplier-edit-popup/supplier-edit-popup';
import { SupplierReviewPopupComponent } from '../supplier-review-popup/supplier-review-popup.component';
import { Router } from '@angular/router';

@Component({
	selector: 'frontend-supplier-req',
	templateUrl: './supplier-req.component.html',
	standalone: false,
})
export class SupplierReqComponent extends TableBaseComponent implements OnInit {
	@ViewChild('supplierRequestTable') supplierRequestTable: TableComponent<SupplierViewDto>;

	@Output() countSuppliersEvent: EventEmitter<{ count: number; actionType: SupplierStatus }> = new EventEmitter();

	private get isSuperAdmin(): boolean {
		return this.authService.isSuperAdmin;
	}

	private readonly router = inject(Router);
	private readonly dialogService = inject(DialogService);
	private readonly authService = inject(AuthService);
	private readonly supplierService = inject(MunicipalitySupplierService);
	private readonly translateService = inject(TranslateService);
	private readonly supplierProfileService = inject(SupplierProfileService);

	constructor() {
		super();
	}

	public ngOnInit(): void {
		this.initializeColumns();
	}

	public createRequestDto(event: PaginatedData<SupplierViewDto>, tenantId: string): GetSuppliersDto {
		const statuses = [SupplierStatus.PENDING, SupplierStatus.REJECTED, SupplierStatus.CREATED];
		return new GetSuppliersDto(event.currentIndex, event.pageSize, tenantId, statuses.join(','));
	}

	public initializeColumns(): void {
		this.allColumns = [
			new TableColumn('general.status', 'status', 'status', true, true, ColumnDataType.STATUS),
			new TableColumn('general.name', 'name', 'companyName', true, true),
			new TableColumn('general.category', 'category', 'category', true),
			new TableColumn('supplierList.tableColumn.district', 'province', 'province', true),
			new TableColumn('supplierList.tableColumn.manager', 'manager', 'accountManager', true),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	public loadData(event: PaginatedData<SupplierViewDto>): void {
		const tenantId = this.authService.extractSupplierInformation(UserInfo.TenantId);
		if (!tenantId) {
			return;
		}

		const supplierRequestDto = this.createRequestDto(event, tenantId);
		this.supplierService.getPendingSuppliers(supplierRequestDto).subscribe((data) => {
			this.afterDataLoaded(data);
		});
	}

	public afterDataLoaded(data: Array<SupplierViewDto>): void {
		const dataWithActions = data.map((element) => {
			const actionButtons = [
				new TableActionButton(
					ActionButtons.visibilityIcon,
					'actionButtons.viewSupplier',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
			];

			actionButtons.push(
				new TableActionButton(
					ActionButtons.approvalIcon,
					'actionButtons.review',
					element.status !== SupplierStatus.PENDING,
					undefined,
					ActionButtonIcons.link,
				),
			);

			if (this.isSuperAdmin && element.status !== SupplierStatus.APPROVED) {
				actionButtons.push(
					new TableActionButton(
						ActionButtons.adminEdit,
						'actionButtons.adminEdit',
						false,
						undefined,
						ActionButtonIcons.link,
					),
				);
			}

			return {
				...element,
				category: element.category ? this.translateService.instant(element.category) : '-',
				province: element.province ?? '-',
				accountManager: element.accountManager ?? '-',
				actionButtons,
			};
		});

		this.supplierRequestTable.afterDataLoaded(dataWithActions);
	}

	public onActionButtonClicked(action: { actionButton: string; row: SupplierViewDto }): void {
		if (action.actionButton === ActionButtons.approvalIcon) {
			this.openSupplierReviewPopup();
			this.initSupplierProfileData(action.row.id);
		}

		if (action.actionButton === ActionButtons.adminEdit) {
			this.openSupplierEditPopup(action.row.id);
			this.initSupplierProfileData(action.row.id);
		}

		if (action.actionButton === ActionButtons.visibilityIcon) {
			this.router.navigateByUrl(`${'supplier-details'}/${action.row.id}`);
		}
	}

	private openSupplierReviewPopup(): void {
		this.dialogService
			.message(SupplierReviewPopupComponent, {
				id: 'accessible-first-dialog',
				panelClass: 'suppliers-approval',
				width: '80%',
				disableClose: false,
				restoreFocus: true,
				data: {
					mainContent: 'general.success.title',
					secondContent: 'general.success.text',
					acceptButtonType: 'high-emphasis-success',
					acceptButtonText: 'register.continue',
				},
			})
			?.afterClosed()
			.subscribe((response) => {
				if (!response) {
					return;
				}

				if (response.actionType === 'adminEdit') {
					this.openSupplierEditPopup(response.supplierId);
					return;
				}

				if (response.actionType === 'update') {
					this.updateSuppliersLists(response.status);
					return;
				}
			});
	}

	private openSupplierEditPopup(supplierId: string): void {
		this.dialogService
			.message(SupplierEditPopupComponent, {
				id: 'accessible-first-dialog',
				panelClass: 'suppliers-approval',
				width: '80%',
				disableClose: true,
				restoreFocus: true,
				data: {
					mainContent: 'general.success.title',
					secondContent: 'general.success.text',
					acceptButtonType: 'high-emphasis-success',
					acceptButtonText: 'register.continue',
					supplierId: supplierId,
				},
			})
			?.afterClosed()
			.subscribe((response) => {
				if (!response) {
					return;
				}

				this.updateSuppliersLists(response);
			});
	}

	private initSupplierProfileData(supplierId: string): void {
		this.supplierProfileService.getSupplierProfile(supplierId).subscribe((data) => {
			this.supplierProfileService.supplierProfileInformation = data;
		});
	}

	private updateSuppliersLists(actionType: SupplierStatus): void {
		this.updateSuppliersNumber(actionType);
		this.resetPendingRequestsList();
	}

	private updateSuppliersNumber(actionType: SupplierStatus): void {
		const updatedCount = this.dataCount - 1;
		this.countSuppliersEvent.emit({ count: updatedCount, actionType: actionType });
	}

	private resetPendingRequestsList(): void {
		const pageIndex = this.supplierRequestTable.paginatedData.currentIndex;
		const pageSize = this.supplierRequestTable.paginatedData.pageSize;
		this.supplierRequestTable.listLength = this.dataCount;
		this.supplierRequestTable.initializePaginatedDataBasedOnPageSize(pageSize);
		this.supplierRequestTable.paginatedData.currentIndex = pageIndex;
		this.loadData(this.supplierRequestTable.paginatedData);
	}
}
