import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	ActionButtonIcons,
	ActionButtons,
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	GrantDto,
	GrantHolder,
	GrantService,
	PaginatedData,
	TableActionButton,
	TableColumn,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';

import { CreateGrantComponent } from '../../../components/create-grant/create-grant/create-grant.component';

@Component({
	selector: 'frontend-grants',
	templateUrl: './grants.component.html',
	styleUrls: ['./grants.component.scss'],
})
export class GrantsComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('grantsTable') grantsTable: TableComponent<GrantDto>;

	public typeOfHolder = ['grants.cardHolder', 'grants.childrenHolder'];

	public get isDataExisting(): boolean {
		return this.dataCount > 0;
	}

	constructor(
		private dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private grantService: GrantService,
		private datePipe: DatePipe,
		private translateService: TranslateService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.getGrantsCount();
		this.initBreadcrumbs();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public openModal(grant?: GrantDto): void {
		this.dialogService
			.message(CreateGrantComponent, {
				width: '55%',
				closeOnNavigation: false,
				disableClose: true,
				data: grant,
			})
			?.afterClosed()
			.subscribe((success) => {
				if (!success) {
					return;
				}

				this.grantsTable?.deselectAllCheckboxes();
				this.getGrantsCount();
			});
	}

	public loadData(event: PaginatedData<GrantDto>): void {
		this.grantService.getGrantsPaginated(event.currentIndex, event.pageSize).subscribe((data) => {
			data.forEach((grant) => {
				grant.beneficiaries = this.translateService.instant(this.beneficiary(grant.createFor));
				grant.validity = this.getFormattedDateRange(grant.startDate, grant.expirationDate);
				grant.tableAmount = '€ ' + grant.amount;
			});

			this.afterDataLoaded(data);
		});
	}

	public onActionButtonClicked(event: { actionButton: string; row: GrantDto }): void {
		// For the moment will be an if, in the future we will change to switch
		if (event.actionButton === ActionButtons.editIcon) {
			this.openModal(event.row);
		}
	}

	public initializeColumns(): void {
		this.allColumns = [
			new TableColumn('checkbox', 'checkbox', 'checkbox', true, true, ColumnDataType.DEFAULT, true),
			new TableColumn('general.name', 'title', 'title', true, false),
			new TableColumn('general.description', 'description', 'description', true, false),
			new TableColumn('general.amount', 'tableAmount', 'tableAmount', true, false),
			new TableColumn(
				'grants.beneficiaries',
				'beneficiaries',
				'beneficiaries',
				true,
				false,
				ColumnDataType.TRANSLATION,
				false,
			),
			new TableColumn('grants.nrBeneficiaries', 'nrBeneficiaries', 'nrBeneficiaries', true, false),
			new TableColumn('grants.validity', 'validity', 'validity', true, false),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	public initializeComponentData(): void {
		this.initializeColumns();
		this.grantsTable?.initializeData();
	}

	public afterDataLoaded(data: Array<GrantDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			actionButtons: [
				new TableActionButton(
					ActionButtons.editIcon,
					'actionButtons.editGrant',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
				new TableActionButton(
					ActionButtons.visibilityIcon,
					'actionButtons.viewGrant',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
				new TableActionButton(
					ActionButtons.trashIcon,
					'actionButtons.delete',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
			],
		}));

		this.grantsTable.afterDataLoaded(dataWithActions);
	}

	private getGrantsCount(): void {
		this.grantService.countGrants().subscribe((data) => {
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
			new Breadcrumb('general.pages.grants', [commonRoutingConstants.grants]),
		];
		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}

	private getFormattedDateRange(startDate: Date, endDate: Date): string {
		return `${this.datePipe.transform(startDate, 'dd-MM-yyyy')} - ${this.datePipe.transform(
			endDate,
			'dd-MM-yyyy',
		)}`;
	}

	private beneficiary(grantHolder: GrantHolder): string {
		return grantHolder === GrantHolder.PASS_OWNER ? this.typeOfHolder[0] : this.typeOfHolder[1];
	}
}
