import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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
import { DialogService } from '@windmill/ng-windmill';

import { GetSuppliersDto } from '../../_models/get-suppliers-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { SupplierReviewPopupComponent } from '../supplier-review-popup/supplier-review-popup.component';

@Component({
	selector: 'frontend-supplier-req',
	templateUrl: './supplier-req.component.html',
})
export class SupplierReqComponent extends TableBaseComponent implements OnInit {
	@ViewChild('supplierRequestTable') supplierRequestTable: TableComponent<SupplierViewDto>;

	@Output() countSuppliersEvent: EventEmitter<{ count: number; actionType: SupplierStatus }> = new EventEmitter();

	constructor(
		private dialogService: DialogService,
		private supplierService: MunicipalitySupplierService,
		private authService: AuthService,
		private translateService: TranslateService,
		private supplierProfileService: SupplierProfileService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.initializeColumns();
	}

	public createRequestDto(event: PaginatedData<SupplierViewDto>, tenantId: string): GetSuppliersDto {
		const statuses = [SupplierStatus.PENDING, SupplierStatus.REJECTED];
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
		const dataWithActions = data.map((element) => ({
			...element,
			category: this.translateService.instant(element.category),
			actionButtons: [
				new TableActionButton(
					ActionButtons.approvalIcon,
					'actionButtons.review',
					element.status !== SupplierStatus.PENDING,
					'actionButtons.review',
					ActionButtonIcons.link,
				),
			],
		}));

		this.supplierRequestTable.afterDataLoaded(dataWithActions);
	}

	public onActionButtonClicked(action: { actionButton: string; row: SupplierViewDto }): void {
		if (action.actionButton === ActionButtons.approvalIcon) {
			this.openSupplierReviewPopup();
			this.initSupplierProfileData(action.row.id);
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
					acceptButtonType: 'button-success',
					acceptButtonText: 'register.continue',
				},
			})
			?.afterClosed()
			.subscribe((response) => {
				if (response) {
					this.updateSuppliersLists(response);
					return;
				}

				this.loadData(this.supplierRequestTable.paginatedData);
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
