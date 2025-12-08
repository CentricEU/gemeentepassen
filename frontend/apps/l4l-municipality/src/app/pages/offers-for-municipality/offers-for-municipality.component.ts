import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	ActionButtonIcons,
	ActionButtons,
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	GenericStatusEnum,
	OfferTableDto,
	PaginatedData,
	SupplierProfileService,
	TableActionButton,
	TableColumn,
} from '@frontend/common';
import { ChipRemainingDialogComponent, TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { iif } from 'rxjs';

import { OfferApprovalPopupComponent } from '../../components/offer-approval-popup/offer-approval-popup.component';
import { PendingOffersService } from '../../pending-offers.service';

@Component({
	selector: 'frontend-offers-for-municipality',
	templateUrl: './offers-for-municipality.component.html',
	styleUrls: ['./offers-for-municipality.component.scss'],
	standalone: false,
})
export class OffersForMuniciaplityComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('offersMunicipalityTable') offersMunicipalityTable: TableComponent<OfferTableDto>;

	@Input() public supplierId?: string;

	public get typeOfModal() {
		return ChipRemainingDialogComponent;
	}

	public get isSupplierAvailable(): boolean {
		return !!this.supplierId;
	}

	public get isDataExisting(): boolean {
		return this.dataCount > 0;
	}

	constructor(
		private readonly dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private offerService: PendingOffersService,
		private supplierProfileService: SupplierProfileService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.countOffers();
		this.initBreadcrumbs();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public initializeColumns(): void {
		this.allColumns = this.supplierId
			? []
			: [new TableColumn('general.supplier', 'supplierName', 'supplierName', true, true)];
		this.allColumns = [
			...this.allColumns,
			new TableColumn('general.status', 'status', 'status', true, true, ColumnDataType.STATUS),
			new TableColumn('offer.title', 'title', 'title', true, true),
			new TableColumn('general.acceptedBenefit', 'benefit', 'benefit', true, false, ColumnDataType.CHIPS),
			new TableColumn('genericFields.validity.label', 'validity', 'validity', true, false),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	public initializeComponentData(): void {
		this.initializeColumns();
		this.offersMunicipalityTable?.initializeData();
	}

	public onActionButtonClicked(event: { actionButton: string; row: OfferTableDto }): void {
		if (event.actionButton === ActionButtons.approvalIcon) {
			this.openOfferWithBenefitApprovalPopup(event.row);
			this.initSupplierProfileData(event.row.supplierId);
		}
	}

	public loadData(event: PaginatedData<OfferTableDto>): void {
		const selectRequestForCount = iif(
			() => !this.supplierId,
			this.offerService.getPendingOffers(event.currentIndex, event.pageSize),
			this.offerService.getPendingOffersBySupplier(event.currentIndex, event.pageSize, this.supplierId as string),
		);

		selectRequestForCount.subscribe((value) => this.afterDataLoaded(value));
	}

	public afterDataLoaded(data: Array<OfferTableDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			actionButtons: this.computeActionButtons(element),
		}));

		this.offersMunicipalityTable.afterDataLoaded(dataWithActions);
	}

	private computeActionButtons(offer: OfferTableDto): TableActionButton[] {
		const commonActionButton = new TableActionButton(
			ActionButtons.approvalIcon,
			'actionButtons.review',
			false,
			'actionButtons.review',
			ActionButtonIcons.link,
		);

		switch (offer.status) {
			case GenericStatusEnum.PENDING:
				return [commonActionButton];
			case GenericStatusEnum.ACTIVE:
			case GenericStatusEnum.EXPIRED:
				commonActionButton.isDisabled = true;
				return [commonActionButton];
			default:
				return [new TableActionButton('', '', false, 'actionButtons.rejected', 'danger uncontained-theme')];
		}
	}

	private initBreadcrumbs(): void {
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.pendingOffers', [commonRoutingConstants.offers]),
		];
		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}

	private initSupplierProfileData(supplierId: string): void {
		this.supplierProfileService.getSupplierProfile(supplierId).subscribe((data) => {
			this.supplierProfileService.supplierProfileInformation = data;
		});
	}

	private openOfferWithBenefitApprovalPopup(data: OfferTableDto): void {
		this.dialogService
			.message(OfferApprovalPopupComponent, {
				id: 'accessible-first-dialog',
				panelClass: 'offer-approval',
				width: '80%',
				disableClose: true,
				data: {
					offer: data,
					mainContent: 'general.success.title',
					secondContent: 'general.success.text',
					acceptButtonType: 'high-emphasis-success',
					acceptButtonText: 'register.continue',
				},
			})
			?.afterClosed()
			.subscribe((response: any) => {
				if (!response) {
					return;
				}

				this.countOffers();
			});
	}

	private countOffers(): void {
		const selectRequestForCount = iif(
			() => !this.supplierId,
			this.offerService.countPendingOffers(),
			this.offerService.countPendingOffersBySupplier(this.supplierId as string),
		);

		selectRequestForCount.subscribe((value) => this.setListLength(value));
	}

	private setListLength(data: number): void {
		this.dataCount = data;
		if (this.dataCount === 0) {
			return;
		}
		this.initializeComponentData();
	}
}
