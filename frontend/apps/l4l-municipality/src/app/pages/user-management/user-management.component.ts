import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	PaginatedData,
	TableColumn,
	UserService,
	UserTableDto,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { CreateUserPopupComponent } from '../../components/create-user-popup/create-user-popup.component';

@Component({
	selector: 'frontend-user-management',
	templateUrl: './user-management.component.html',
	styleUrls: ['./user-management.component.scss'],
	standalone: false,
})
export class UserManagementComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('usersTable') usersTable: TableComponent<UserTableDto>;

	private readonly breadcrumbService = inject(BreadcrumbService);
	private readonly dialogService = inject(DialogService);
	private readonly translateService = inject(TranslateService);
	private readonly toastrService = inject(ToastrService);
	private readonly userService = inject(UserService);

	public ngOnInit(): void {
		this.countUsers();
		this.initBreadcrumbs();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public isDataExisting(): boolean {
		return this.dataCount > 0;
	}

	public loadData(event: PaginatedData<UserTableDto>): void {
		this.userService.getUsersPaged(event.currentIndex, event.pageSize).subscribe((data) => {
			this.afterDataLoaded(data);
		});
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
					this.countUsers();
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

	private countUsers(): void {
		this.userService.countAdminUsers().subscribe((value) => {
			this.dataCount = value;
			if (this.dataCount === 0) {
				return;
			}
			this.initializeComponentData();
		});
	}

	private initializeComponentData(): void {
		this.initializeColumns();
		this.usersTable?.initializeData();
	}

	private initializeColumns(): void {
		this.allColumns = [
			new TableColumn('general.name', 'fullName', 'fullName', true, false),
			new TableColumn('general.email', 'email', 'email', true, true),
			new TableColumn('general.createdDate', 'createdDate', 'createdDate', true, false, ColumnDataType.DATE),
			//To-DO: Actions can be added here!
			//new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	private afterDataLoaded(data: Array<UserTableDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			actionButtons: [],
		}));

		this.usersTable.afterDataLoaded(dataWithActions);
	}
}
