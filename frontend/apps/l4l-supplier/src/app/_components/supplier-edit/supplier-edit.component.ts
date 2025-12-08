import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	AuthService,
	Breadcrumb,
	BreadcrumbService,
	commonRoutingConstants,
	RejectSupplierDto,
	SupplierRejectionService,
	SupplierStatus,
	UserInfo,
} from '@frontend/common';

import { SupplierService } from '../../services/supplier-service/supplier.service';

type RejectionDetail = {
	label: string;
	value: string;
};

@Component({
	selector: 'frontend-supplier-edit',
	templateUrl: './supplier-edit.component.html',
	styleUrls: ['./supplier-edit.component.scss'],
	standalone: false,
})
export class SupplierEditComponent implements OnInit, OnDestroy {
	public isRejectedStatus = false;

	private supplierRejectionInformation: RejectSupplierDto;
	private supplierId: string;

	public get rejectionDetailsList(): RejectionDetail[] {
		return [
			{
				label: 'rejectSupplier.reasonPlaceholder',
				value: this.supplierRejectionInformation?.reason,
			},
			{
				label: 'rejectSupplier.commentPlaceholder',
				value: this.supplierRejectionInformation?.comments || '-',
			},
		];
	}

	constructor(
		private readonly breadcrumbService: BreadcrumbService,
		private readonly supplierRejectionService: SupplierRejectionService,
		private readonly authService: AuthService,
		private readonly supplierService: SupplierService,
	) {}

	public ngOnInit(): void {
		this.initBreadcrumbs();
		this.initSupplierId();
		this.initSupplierInformation();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public initSupplierId(): void {
		this.supplierId = this.authService.extractSupplierInformation(UserInfo.SupplierId) as string;
	}

	private initSupplierInformation(): void {
		this.supplierService.getSupplierById(this.supplierId).subscribe((supplier) => {
			if (supplier.status === SupplierStatus.REJECTED) {
				this.isRejectedStatus = true;
				this.initRejectionInformation();
			}
		});
	}

	private initRejectionInformation(): void {
		this.supplierRejectionService.getSupplierRejectionInformation(this.supplierId).subscribe((rejectionInfo) => {
			this.supplierRejectionInformation = rejectionInfo;
			this.supplierRejectionInformation.reason = rejectionInfo.reasonLabel;
		});
	}

	private initBreadcrumbs(): void {
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', ['']),
			new Breadcrumb('general.pages.editProfile', [commonRoutingConstants.editProfile]),
		];
		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}
}
