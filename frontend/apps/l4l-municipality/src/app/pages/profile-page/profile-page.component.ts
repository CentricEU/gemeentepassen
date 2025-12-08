import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	Breadcrumb,
	BreadcrumbService,
	CitizenGroupsService,
	CitizenGroupViewDto,
	ColumnDataType,
	commonRoutingConstants,
	PaginatedData,
	TableColumn,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { CreateCitizenGroupPopupComponent } from '../../components/create-citizen-group-popup/create-citizen-group-popup.component';

@Component({
	selector: 'frontend-profile-page',
	templateUrl: './profile-page.component.html',
	styleUrls: ['./profile-page.component.scss'],
	standalone: false,
})
export class ProfilePageComponent extends TableBaseComponent implements OnInit, OnDestroy {
	private readonly citizenGroupsService = inject(CitizenGroupsService);
	private readonly breadcrumbService = inject(BreadcrumbService);
	private readonly dialogService = inject(DialogService);
	private readonly translateService = inject(TranslateService);
	private readonly toastrService = inject(ToastrService);

	@ViewChild('citizenGroupsTable') citizenGroupsTable: TableComponent<CitizenGroupViewDto>;

	public get isDataExisting(): boolean {
		return this.dataCount > 0;
	}

	public ngOnInit(): void {
		this.getCitizenGroupsCount();
		this.initBreadcrumbs();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public save(): void {
		this.dialogService
			.message(CreateCitizenGroupPopupComponent, {
				width: '824px',
				disableClose: true,
				ariaLabel: this.translateService.instant('citizenGroup.createGroup'),
			})
			?.afterClosed()
			.subscribe((confirmed) => {
				if (!confirmed) {
					return;
				}
				this.showToaster();
			});
	}

	private showToaster(): void {
		const toastText = this.translateService.instant('citizenGroup.createGroupSuccess');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
		this.getCitizenGroupsCount();
	}

	public initializeComponentData(): void {
		this.initializeColumns();
		this.citizenGroupsTable?.initializeData();
	}

	public initializeColumns(): void {
		this.allColumns = [
			new TableColumn('citizenGroup.groupName', 'groupName', 'groupName', true, false),
			new TableColumn(
				'citizenGroup.ageGroup',
				'ageGroup',
				'ageGroup',
				true,
				false,
				ColumnDataType.FROM_CITIZEN_GROUP_AGE_ENUM,
			),
			new TableColumn(
				'citizenGroup.isDependentChildrenIncluded',
				'isDependentChildrenIncluded',
				'isDependentChildrenIncluded',
				true,
				false,
				ColumnDataType.YES_NO,
				false,
			),
			new TableColumn(
				'citizenGroup.threshold',
				'thresholdAmount',
				'thresholdAmount',
				true,
				false,
				ColumnDataType.PERCENTAGE,
			),
			new TableColumn(
				'citizenGroup.calculatedMaxIncome',
				'maxIncome',
				'maxIncome',
				true,
				false,
				ColumnDataType.CURRENCY,
			),
			//new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	public loadData(event: PaginatedData<CitizenGroupViewDto>): void {
		this.citizenGroupsService.getCitizenGroupsPaginated(event.currentIndex, event.pageSize).subscribe((data) => {
			this.afterDataLoaded(data);
		});
	}

	public afterDataLoaded(data: Array<CitizenGroupViewDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			actionButtons: [],
		}));

		this.citizenGroupsTable.afterDataLoaded(dataWithActions);
	}

	private getCitizenGroupsCount(): void {
		this.citizenGroupsService.countCitizenGroups().subscribe((data) => {
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
			new Breadcrumb('general.pages.profile', [commonRoutingConstants.profile]),
		];

		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}
}
