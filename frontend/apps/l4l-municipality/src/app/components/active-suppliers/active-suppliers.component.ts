import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
	ActionButtonIcons,
	ActionButtons,
	AuthService,
	ColumnDataType,
	PaginatedData,
	SupplierStatus,
	SupplierViewDto,
	TableActionButton,
	TableColumn,
	UserInfo,
} from '@frontend/common';
import { TableComponent } from '@frontend/common-ui';
import { TableBaseComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';

import { GetSuppliersDto } from '../../_models/get-suppliers-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
@Component({
	selector: 'frontend-active-suppliers',
	templateUrl: './active-suppliers.component.html',
})
export class ActiveSuppliersComponent extends TableBaseComponent implements OnInit {
	@ViewChild('suppliersTable') suppliersTable: TableComponent<SupplierViewDto>;

	constructor(
		private supplierService: MunicipalitySupplierService,
		private authService: AuthService,
		private translateService: TranslateService,
		private router: Router,
	) {
		super();
	}

	public ngOnInit(): void {
		this.initializeComponentData();
	}

	public manageColumns(): void {
		if (this.dataCount > 0) {
			this.suppliersTable.manageColumns();
		}
	}

	public createRequestDto(event: PaginatedData<SupplierViewDto>, tenantId: string): GetSuppliersDto {
		return new GetSuppliersDto(event.currentIndex, event.pageSize, tenantId, SupplierStatus.APPROVED);
	}

	public loadData(event: PaginatedData<SupplierViewDto>): void {
		const tenantId = this.authService.extractSupplierInformation(UserInfo.TenantId);
		if (!tenantId) {
			return;
		}

		const supplierRequestDto = this.createRequestDto(event, tenantId);
		this.supplierService.getSuppliers(supplierRequestDto).subscribe((data) => {
			this.afterDataLoaded(data);
		});
	}

	public initializeColumns(): void {
		this.allColumns = [
			new TableColumn('checkbox', 'checkbox', 'checkbox', true, true, ColumnDataType.DEFAULT, true),
			new TableColumn('general.status', 'status', 'status', true, true, ColumnDataType.STATUS),
			new TableColumn('general.name', 'name', 'companyName', true, true),
			new TableColumn('general.category', 'category', 'category', true),
			new TableColumn('supplierList.tableColumn.district', 'province', 'province', true),
			new TableColumn('supplierList.tableColumn.manager', 'manager', 'accountManager', true),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	public initializeComponentData(): void {
		this.initializeColumns();
		this.suppliersTable?.initializeData();
	}

	public onActionButtonClicked(event: { actionButton: string; row: SupplierViewDto }): void {
		if (event.actionButton === ActionButtonIcons.visibilityIcon) {
			this.router.navigateByUrl(`${'supplier-details'}/${event.row.id}`);
		}
	}

	public afterDataLoaded(data: Array<SupplierViewDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			category: this.translateService.instant(element.category),
			actionButtons: this.actionButtons(),
		}));

		this.suppliersTable.afterDataLoaded(dataWithActions);
	}

	private actionButtons(): TableActionButton[] {
		return [
			new TableActionButton(
				ActionButtons.visibilityIcon,
				'actionButtons.viewSupplier',
				false,
				'',
				ActionButtonIcons.uncontained,
			),
			new TableActionButton(
				ActionButtons.circlePause,
				'actionButtons.suspendSupplier',
				false,
				'',
				ActionButtonIcons.uncontained,
			),
		];
	}
}
