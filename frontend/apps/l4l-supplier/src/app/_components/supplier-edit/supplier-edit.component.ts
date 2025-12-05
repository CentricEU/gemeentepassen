import { Component, OnDestroy, OnInit } from '@angular/core';
import { Breadcrumb, BreadcrumbService, commonRoutingConstants } from '@frontend/common';

@Component({
	selector: 'frontend-supplier-edit',
	templateUrl: './supplier-edit.component.html',
	styleUrls: ['./supplier-edit.component.scss'],
})
export class SupplierEditComponent implements OnInit, OnDestroy {
	constructor(private breadcrumbService: BreadcrumbService) {}

	public ngOnInit(): void {
		this.initBreadcrumbs();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	private initBreadcrumbs(): void {
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', ['']),
			new Breadcrumb('general.pages.editProfile', [commonRoutingConstants.editProfile]),
		];
		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}
}
