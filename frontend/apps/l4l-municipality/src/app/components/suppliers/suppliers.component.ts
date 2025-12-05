import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import {
	AuthService,
	Breadcrumb,
	BreadcrumbService,
	commonRoutingConstants,
	SupplierStatus,
	UserInfo,
} from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, ToastrService } from '@windmill/ng-windmill';

import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { ActiveSuppliersComponent } from '../active-suppliers/active-suppliers.component';
import { InvitationsComponent } from '../invitations/invitations.component';
import { InviteSuppliersComponent } from '../invite-suppliers/invite-suppliers.component';

@Component({
	selector: 'frontend-suppliers',
	templateUrl: './suppliers.component.html',
	styleUrls: ['./suppliers.component.scss'],
})
export class SuppliersListComponent implements OnInit, OnDestroy {
	@ViewChild('activeSuppliers') activeSuppliers: ActiveSuppliersComponent;
	@ViewChild('invitations') invitations: InvitationsComponent;

	public suppliersCount: number;
	public requestsCount: number;
	public invitationsCount: number;

	public tabIndex = 0;

	constructor(
		private readonly toastrService: ToastrService,
		private municipalitySupplierService: MunicipalitySupplierService,
		private translateService: TranslateService,
		private breadcrumbService: BreadcrumbService,
		private authService: AuthService,
		private readonly dialogService: DialogService,
	) {}

	public ngOnInit(): void {
		this.countSuppliers();
		this.getInvitationsCount();
		this.initBreadcrumbs();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public get noDataTitle(): string {
		switch (this.tabIndex) {
			case 0:
				return 'supplierList.welcome';
			case 1:
				return 'supplierRequests.noRequests';
			case 2:
				return 'invitations.welcome';
			default:
				return 'supplierList.welcome';
		}
	}

	public get noDataDescription(): string {
		switch (this.tabIndex) {
			case 0:
				return 'supplierList.noData';
			case 1:
				return 'supplierRequests.noData';
			case 2:
				return 'invitations.noData';
			default:
				return 'supplierList.noData';
		}
	}

	public shouldDisplaySuppliersTable = (): boolean => this.suppliersCount > 0;

	public shouldDisplayRequestsTable = (): boolean => this.requestsCount > 0;

	public shouldDisplayManageColumns = (): boolean => this.tabIndex === 0;

	public shouldDisplayInviteSuppliers = (): boolean => {
		return this.tabIndex === 2 && this.shouldDisplayInvitationsTable();
	};

	public shouldDisplayInvitationsTable = (): boolean => this.invitationsCount > 0;

	public isFullSize(): boolean {
		return (
			(this.tabIndex === 0 && !this.shouldDisplaySuppliersTable()) ||
			(this.tabIndex === 1 && !this.shouldDisplayRequestsTable()) ||
			(this.tabIndex === 2 && !this.shouldDisplayInvitationsTable())
		);
	}

	public tabChanged(event: MatTabChangeEvent): void {
		this.tabIndex = event.index;
	}

	public manageColumns(): void {
		this.activeSuppliers.manageColumns();
	}

	public updateSuppliersNumber(data: number, actionType: SupplierStatus): void {
		this.requestsCount = data;
		this.suppliersCount++;
		this.displaySuccessToaster(
			actionType === SupplierStatus.APPROVED ? 'suppliersApproval.successfulApproval' : 'rejectSupplier.success',
		);
		this.activeSuppliers.initializeComponentData();
	}

	public openInviteSuppliersModal(): void {
		this.dialogService
			.message(InviteSuppliersComponent, {
				width: '736px',
				height: '664px',
				closeOnNavigation: false,
				disableClose: true,
			})
			?.afterClosed()
			.subscribe((response) => {
				if (!response) {
					return;
				}

				this.displaySuccessToaster('inviteSuppliers.sentSuccessfully');
				this.getInvitationsCount();
			});
	}

	public getInvitationsCount(): void {
		this.municipalitySupplierService.getInvitationsCount().subscribe((data: number) => {
			this.invitationsCount = data;
		});
	}

	private displaySuccessToaster(message: string): void {
		const toasterMessage = this.translateService.instant(message);

		this.toastrService.success(`<p>${toasterMessage}</p>`, '', {
			toastBackground: 'toast-light',
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
	}

	private countSuppliers(): void {
		const tenantId = this.authService.extractSupplierInformation(UserInfo.TenantId);

		if (!tenantId) {
			return;
		}

		const statusApproved = [SupplierStatus.APPROVED];
		this.municipalitySupplierService.countSuppliers(tenantId, statusApproved).subscribe((data) => {
			this.suppliersCount = data;
		});

		const statuses = [SupplierStatus.PENDING, SupplierStatus.REJECTED];

		this.municipalitySupplierService.countSuppliers(tenantId, statuses).subscribe((data) => {
			this.requestsCount = data;
		});
	}

	private initBreadcrumbs(): void {
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.suppliers', [commonRoutingConstants.suppliers]),
		];
		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}
}
