import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
	BenefitService,
	BenefitTableDto,
	Breadcrumb,
	BreadcrumbService,
	CitizenGroupsService,
	ColumnDataType,
	commonRoutingConstants,
	PaginatedData,
	TableColumn,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { CreateBenefitPopupComponent } from '../../components/create-benefit-popup/create-benefit-popup.component';

@Component({
	selector: 'frontend-benefits',
	templateUrl: './benefits.component.html',
	styleUrl: './benefits.component.scss',
	standalone: false,
})
export class BenefitsComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('benefitsTable') benefitsTable: TableComponent<BenefitTableDto>;

	public showCreateCitizenGroupState = true;

	private readonly breadcrumbService = inject(BreadcrumbService);
	private readonly dialogService = inject(DialogService);
	private readonly translateService = inject(TranslateService);
	private readonly toastrService = inject(ToastrService);
	private readonly citizenGroupsService = inject(CitizenGroupsService);
	private readonly benefitService = inject(BenefitService);
	private readonly router = inject(Router);

	public get isDataExisting(): boolean {
		return this.dataCount > 0;
	}

	public ngOnInit(): void {
		this.initBreadcrumbs();
		this.getCitizenGroupsCount();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public openCreateBenefitModal(): void {
		this.dialogService
			.message(CreateBenefitPopupComponent, {
				width: '824px',
				disableClose: true,
				ariaLabel: this.translateService.instant('benefitsPage.createBenefit'),
			})
			?.afterClosed()
			.subscribe((confirmed) => {
				if (!confirmed) {
					return;
				}
				this.getBenefitsCount();
				this.showToaster();
			});
	}

	public goToProfilePage(): void {
		this.router.navigate([commonRoutingConstants.profile]);
	}

	public loadData(event: PaginatedData<BenefitTableDto>): void {
		this.benefitService.getAllBenefitsPaged(event.currentIndex, event.pageSize).subscribe((data) => {
			this.afterDataLoaded(data);
		});
	}

	private showToaster(): void {
		const toastText = this.translateService.instant('benefitsPage.createBenefitSuccess');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
	}

	private initBreadcrumbs(): void {
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.benefits', [commonRoutingConstants.benefits]),
		];

		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}

	private getCitizenGroupsCount(): void {
		this.citizenGroupsService.countCitizenGroups().subscribe((count) => {
			if (count > 0) {
				this.showCreateCitizenGroupState = false;
				this.getBenefitsCount();
			}
		});
	}

	private getBenefitsCount(): void {
		this.benefitService.countBenefits().subscribe((data) => {
			this.dataCount = data;
			if (this.dataCount === 0) {
				return;
			}
			this.initializeComponentData();
		});
	}

	private initializeComponentData(): void {
		this.initializeColumns();
		this.benefitsTable?.initializeData();
	}

	private initializeColumns(): void {
		this.allColumns = [
			new TableColumn('general.name', 'name', 'name', true, false),
			new TableColumn('general.description', 'description', 'description', true, false),
			new TableColumn(
				'general.citizenGroup',
				'citizenGroupNames',
				'citizenGroupNames',
				true,
				false,
				ColumnDataType.DEFAULT,
			),
			new TableColumn('general.amount', 'amount', 'amount', true, false, ColumnDataType.CURRENCY),
			new TableColumn('benefitsPage.validityPeriod', 'validityPeriod', 'validityPeriod', true, false),
			new TableColumn(
				'benefitsPage.beneficiaries',
				'totalBeneficiaries',
				'totalBeneficiaries',
				true,
				false,
				ColumnDataType.DEFAULT,
			),
			//new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	private afterDataLoaded(data: Array<BenefitTableDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			actionButtons: [],
			citizenGroupNames: (element.citizenGroupsDto ?? []).map((g) => g.groupName).join(', '),
			validityPeriod: this.getValidityPeriod(new Date(element.startDate), new Date(element.expirationDate)),
		}));

		this.benefitsTable.afterDataLoaded(dataWithActions);
	}

	private getValidityPeriod(startDate: Date, expirationDate: Date): string {
		const formatDate = (date: Date) =>
			date
				? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
						.toString()
						.padStart(2, '0')}/${date.getFullYear()}`
				: '';
		return `${formatDate(startDate)} - ${formatDate(expirationDate)}`;
	}
}
