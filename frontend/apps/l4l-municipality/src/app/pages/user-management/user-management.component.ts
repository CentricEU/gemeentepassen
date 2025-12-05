import { Component, OnDestroy, OnInit } from '@angular/core';
import { Breadcrumb, BreadcrumbService, commonRoutingConstants } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, ToastrService } from '@windmill/ng-windmill';

import { CreateUserPopupComponent } from '../../components/create-user-popup/create-user-popup.component';

@Component({
	selector: 'frontend-user-management',
	templateUrl: './user-management.component.html',
	styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit, OnDestroy {
	constructor(
		private breadcrumbService: BreadcrumbService,
		private readonly dialogService: DialogService,
		private translateService: TranslateService,
		private readonly toastrService: ToastrService,
	) {}

	public ngOnInit(): void {
		this.initBreadcrumbs();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public isDataExisting(): boolean {
		//TODO: when the table will be implemented

		return false;
	}

	public openCreateUserDialog(): void {
		this.dialogService
			.message(CreateUserPopupComponent, {
				width: '624px',
				disableClose: true,
			})
			?.afterClosed()
			.subscribe((confirmed) => {
				if (confirmed) {
					this.showToaster();
				}
			});
	}

	private showToaster(): void {
		const toastText = this.translateService.instant('createUser.success');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
	}

	private initBreadcrumbs(): void {
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.userManagement', [commonRoutingConstants.userManagement]),
		];

		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}
}
