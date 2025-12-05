import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
	ActionButtonIcons,
	ActionButtons,
	Breadcrumb,
	BreadcrumbService,
	ColumnDataType,
	commonRoutingConstants,
	DropdownDataFilterDto,
	EnumValueDto,
	FilterColumnKey,
	FilterCriteria,
	GenericStatusEnum,
	GrantDto,
	GrantService,
	ModalData,
	OfferTableDto,
	PaginatedData,
	TableActionButton,
	TableColumn,
	TableFilterColumn,
	WarningDialogData,
} from '@frontend/common';
import {
	ChipRemainingDialogComponent,
	CustomDialogComponent,
	CustomDialogConfigUtil,
	TableBaseComponent,
	TableComponent,
} from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, ToastrService } from '@windmill/ng-windmill';
import { forkJoin, Observable } from 'rxjs';

import { CreateOfferComponent } from '../../_components/create-offer/create-offer.component';
import { DeleteOffersDto } from '../../models/delete-offers-dto.model';
import { FilterOfferRequestDto } from '../../models/filter-offer-request-dto.model';
import { OfferRejectionReasonDto } from '../../models/offer-rejection-reason-dto.model';
import { OfferType } from '../../models/offer-type.model';
import { DropdownDataService } from '../../services/dropdown-data/dropdown-data.service';
import { OfferService } from '../../services/offer-service/offer.service';

@Component({
	selector: 'frontend-offers',
	templateUrl: './offers.component.html',
	styleUrls: ['./offers.component.scss'],
})
export class OffersComponent extends TableBaseComponent implements OnInit, OnDestroy {
	@ViewChild('offersTable') offersTable: TableComponent<OfferTableDto>;

	public allFilterColumns: TableFilterColumn[];
	public availableGrants: EnumValueDto[] = [];
	public dropdownsData: DropdownDataFilterDto;
	public areOffersSelected = false;
	public filterDto: FilterOfferRequestDto;

	public get isDataExisting(): boolean {
		return this.dataCount > 0;
	}

	public get typeOfModal() {
		return ChipRemainingDialogComponent;
	}

	public get paginatedData(): PaginatedData<OfferTableDto> {
		return this.offersTable?.paginatedData;
	}

	public get areFiltersApplied(): boolean {
		return this.offersTable?.areFiltersApplied();
	}

	constructor(
		private dialogService: DialogService,
		private breadcrumbService: BreadcrumbService,
		private offerService: OfferService,
		private toastrService: ToastrService,
		private translateService: TranslateService,
		private dropdownDataService: DropdownDataService,
		private grantService: GrantService,
		private route: ActivatedRoute,
	) {
		super();
	}

	public ngOnInit(): void {
		this.initOfferTypeAndGrants();
		this.shouldOpenOffersPopup();
		this.countOffers();
		this.initBreadcrumbs();
		this.subscribeToRouteParam();
	}

	public ngOnDestroy(): void {
		this.offerService.shouldOpenOfferPopup = false;
		this.breadcrumbService.removeBreadcrumbs();
	}

	public shouldDisplayTable(): FilterOfferRequestDto | TableFilterColumn[] {
		return (this.isDataExisting && this.allFilterColumns) || this.filterDto;
	}

	public onApplyFilters(filters: FilterCriteria, isFirstFiltering: boolean): void {
		if (this.offerService.offerStatusFilter) {
			return;
		}

		if (isFirstFiltering) {
			this.paginatedData.currentIndex = 0;
		}

		this.offersTable.deselectAllCheckboxes();
		this.filterDto = this.createFilterOfferRequestDto(filters);

		this.offerService
			.getFilteredOffers(this.filterDto, this.paginatedData.currentIndex, this.paginatedData.pageSize)
			.subscribe((data) => {
				this.afterDataLoaded(data);
				this.countFilteredOffers();
			});
	}

	public clearFilters(): void {
		this.offersTable.clearFilters();
	}

	public openCreateOfferModal(): void {
		this.dialogService
			.message(CreateOfferComponent, {
				width: '70%',
				closeOnNavigation: false,
			})
			?.afterClosed()
			.subscribe((data) => {
				if (!data) {
					return;
				}

				this.countOffers();
				this.offersTable?.deselectAllCheckboxes();
			});
	}

	public initializeColumns(): void {
		this.allColumns = [
			new TableColumn('checkbox', 'checkbox', 'checkbox', true, true, ColumnDataType.DEFAULT, true),
			new TableColumn('general.status', 'status', 'status', true, true, ColumnDataType.STATUS),
			new TableColumn('offer.title', 'title', 'title', true, true),
			new TableColumn(
				'offer.targetAudience',
				'citizenOfferType',
				'citizenOfferType',
				true,
				false,
				ColumnDataType.TRANSLATION,
			),
			new TableColumn('offer.typeOfOffer', 'offerType', 'offerType', true, false, ColumnDataType.TRANSLATION),
			new TableColumn('general.acceptedGrants', 'grants', 'grants', true, false, ColumnDataType.CHIPS),
			new TableColumn('offer.validity', 'validity', 'validity', true, false),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	public manageColumns(): void {
		this.offersTable.manageColumns();
	}

	public initializeComponentData(): void {
		this.initializeColumns();
		this.offersTable?.initializeData();
	}

	public setAreOffersSelected(count: number): void {
		this.areOffersSelected = count > 0;
	}

	public onActionButtonClicked(action: { actionButton: string; row: OfferTableDto }): void {
		switch (action.actionButton) {
			case ActionButtons.trashIcon:
				this.openDeleteDialog(action.row.id, action.row.title);
				break;
			case ActionButtons.circlePlay:
				this.openReactivateOfferModal(action.row.id);
				break;
			default:
				return;
		}
	}

	public loadData(event: PaginatedData<OfferTableDto>): void {
		if (this.offerService.offerStatusFilter) {
			this.initStatusFiltering();
			return;
		}

		if (this.filterDto) {
			this.onApplyFilters(this.offersTable.filterFormGroup.value as FilterCriteria, false);
			return;
		}

		this.offerService.getOffers(event.currentIndex, event.pageSize).subscribe((data) => {
			this.afterDataLoaded(data);
		});
	}

	private initStatusFiltering(): void {
		this.filterDto = this.createFilterOfferRequestDto({
			statusFilter: this.offerService.offerStatusFilter,
		} as FilterCriteria);

		const sources = {
			filteredOffersCount: this.offerService.countFilteredOffers(this.filterDto),
			filteredOffers: this.offerService.getFilteredOffers(this.filterDto, 0, 25),
		};

		forkJoin(sources).subscribe({
			next: (result) => {
				this.dataCount = result.filteredOffersCount;
				this.afterDataLoaded(result.filteredOffers);
				this.offersTable.filterFormGroup.markAsDirty();
				this.offersTable.filterFormGroup
					.get(FilterColumnKey.STATUS)
					?.setValue(this.offerService.offerStatusFilter);
				this.offerService.offerStatusFilter = null;
			},
		});
	}

	public afterDataLoaded(data: Array<OfferTableDto>): void {
		const dataWithActions = data.map((element) => ({
			...element,
			isCheckboxDisabled: element.status === GenericStatusEnum.ACTIVE,
			citizenOfferType: 'offer.citizenWithPass',
			actionButtons: this.createActionButtons(element.status),
		}));

		this.offersTable.afterDataLoaded(dataWithActions);
	}

	public openDeleteDialog(offerId?: string, offerTitle?: string): void {
		const config = this.createDeleteDialogConfig(offerId, offerTitle);

		this.dialogService
			.alert(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				if (!data) {
					return;
				}

				this.deleteOffersAndRefresh(offerId);
			});
	}

	private subscribeToRouteParam(): void {
		this.route.paramMap.subscribe((params: ParamMap) => {
			const offerId = params.get('offerId');

			if (!offerId) {
				return;
			}

			this.displayOfferRejectedNotice(offerId);
		});
	}

	private displayOfferRejectedNotice(offerId: string): void {
		this.offerService.getOfferRejectionReason(offerId).subscribe((data: OfferRejectionReasonDto) => {
			const config = this.createOfferRejectedModal(data);

			this.dialogService
				.message(CustomDialogComponent, config)
				?.afterClosed()
				.subscribe((data) => {
					if (!data) {
						return;
					}

					this.applyAgain();
				});
		});
	}

	private applyAgain(): void {
		//TODO: reapply after rejection
	}

	private createOfferRejectedModal(rejectionData: OfferRejectionReasonDto): MatDialogConfig {
		const modal = new ModalData(
			'generalRejection.modal.header',
			'generalRejection.modal.title',
			'rejectOffer.modal.description',
			'general.button.cancel',
			'general.button.applyAgain',
			false,
			'success',
			'theme',
			'rejected.svg',
			{
				reason: rejectionData.reason,
				comments: '',
				tenantName: '',
				email: '',
				offerName: rejectionData.offerTitle,
			},
		);

		return CustomDialogConfigUtil.createMessageModal(modal);
	}

	private createFilterOfferRequestDto(filters: FilterCriteria): FilterOfferRequestDto {
		const { statusFilter, offerTypeFilter, grantsFilter } = filters;

		return new FilterOfferRequestDto(
			statusFilter as GenericStatusEnum,
			offerTypeFilter as number,
			grantsFilter as string,
		);
	}

	private getRequestsObservable(): Observable<(GrantDto[] | DropdownDataFilterDto | EnumValueDto[] | null)[]> {
		const requests = [this.dropdownDataService.getAllDropdownsData(), this.grantService.getAllGrants(false)];

		return forkJoin(requests);
	}

	private initOfferTypeAndGrants(): void {
		this.getRequestsObservable().subscribe((data) => {
			if (!data) {
				return;
			}

			this.dropdownsData = data[0] as DropdownDataFilterDto;

			this.dropdownsData.offerTypes = this.convertOfferTypeToEnumValueDto(this.dropdownsData.offerTypes).map(
				(offerType) => ({
					...offerType,
					value: this.translateService.instant(offerType.value),
				}),
			);

			this.dropdownsData.statuses = this.dropdownsData.statuses.map((status) => ({
				...status,
				value: this.translateService.instant(status.value),
			}));

			this.initializeGrants(data[1] as GrantDto[]);
			this.initFilterColumnsData();
		});
	}

	private initializeGrants(data: GrantDto[]): void {
		if (!Array.isArray(data)) {
			return;
		}

		this.availableGrants = this.convertGrantsToEnumValueDto(data);
	}

	private convertGrantsToEnumValueDto(grants: GrantDto[]): EnumValueDto[] {
		return grants.map((grant) => {
			const id = grant.id || '';
			const title = grant.title || '';
			return new EnumValueDto(id, title);
		});
	}

	private convertOfferTypeToEnumValueDto(offerTypes: OfferType[]): EnumValueDto[] {
		return offerTypes.map((offerType) => new EnumValueDto(offerType.offerTypeId, offerType.offerTypeLabel));
	}

	private countOffers(): void {
		this.offerService.countOffers().subscribe((data) => {
			this.dataCount = data;
			if (this.dataCount === 0) {
				return;
			}
			this.initializeComponentData();
		});
	}

	private countFilteredOffers(): void {
		const filterDto = this.createFilterOfferRequestDto(this.offersTable.filterFormGroup.value as FilterCriteria);
		this.offerService.countFilteredOffers(filterDto).subscribe((data) => {
			this.dataCount = data;
		});
	}

	private shouldOpenOffersPopup(): void {
		if (this.offerService.shouldOpenOfferPopup) {
			this.openCreateOfferModal();
		}
	}

	private deleteOffersAndRefresh(offerId?: string) {
		const offersToDelete = offerId ? [offerId] : this.getSelectedOffersIds();

		this.offerService.deleteOffers(new DeleteOffersDto(offersToDelete)).subscribe(() => {
			this.countOffers();
			this.displaySuccessfullyDeletedToaster(!offerId);
		});

		this.offersTable.deselectAllCheckboxes();
	}

	private createDeleteDialogConfig(offerId?: string, offerTitle?: string): MatDialogConfig {
		const data = new WarningDialogData();

		const title = offerId ? 'offer.delete.titleSingular' : 'offer.delete.titlePlural';
		const secondaryContent = offerId
			? this.translateService.instant('offer.delete.descriptionSingular', { offerTitle })
			: 'offer.delete.descriptionPlural';

		const modal = new ModalData(
			title,
			'',
			secondaryContent,
			'general.button.cancel',
			'general.button.delete',
			false,
			'alert',
			'danger',
			'',
			data,
		);

		return { ...CustomDialogConfigUtil.createMessageModal(modal), width: '400px' };
	}

	private getSelectedOffersIds(): string[] {
		return this.offersTable.currentDisplayedPage
			.filter((offer) => offer.selected)
			.map((offer) => offer.id) as string[];
	}

	private displaySuccessfullyDeletedToaster(multiple: boolean) {
		const toasterMessage = this.translateService.instant(
			multiple ? 'offer.delete.toasterPlural' : 'offer.delete.toasterSingular',
		);

		this.toastrService.success(`<p>${toasterMessage}</p>`, '', {
			toastBackground: 'toast-light',
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
	}

	private openReactivateOfferModal(offerId?: string): void {
		this.dialogService
			.message(CreateOfferComponent, {
				width: '70%',
				closeOnNavigation: false,
				data: {
					offerToReactivate: offerId,
				},
			})
			?.afterClosed()
			.subscribe(() => {
				this.countOffers();
			});
	}

	private createActionButtons(status: GenericStatusEnum): TableActionButton[] {
		const actionButtons = [
			new TableActionButton(
				ActionButtons.visibilityIcon,
				'actionButtons.details',
				false,
				'',
				ActionButtonIcons.uncontained,
			),
		];

		if (status === GenericStatusEnum.ACTIVE) {
			actionButtons.push(
				new TableActionButton(
					ActionButtons.circlePause,
					'actionButtons.suspend',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
			);
		} else {
			actionButtons.push(
				new TableActionButton(
					ActionButtons.trashIcon,
					'actionButtons.delete',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
			);
		}

		if (status === GenericStatusEnum.EXPIRED) {
			actionButtons.push(
				new TableActionButton(
					ActionButtons.circlePlay,
					'actionButtons.reactivate',
					false,
					'',
					ActionButtonIcons.uncontained,
				),
			);
		}

		return actionButtons;
	}

	private initBreadcrumbs(): void {
		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', ['']),
			new Breadcrumb('general.pages.offers', [commonRoutingConstants.offers]),
		];
		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}

	private initFilterColumnsData(): void {
		const filterColumnsData = [
			{ key: FilterColumnKey.CHECKBOX, data: [] },
			{ key: FilterColumnKey.STATUS, data: this.dropdownsData.statuses, translationKey: 'general.status' },
			{ key: FilterColumnKey.TITLE, data: [] },
			{ key: FilterColumnKey.CITIZEN_OFFER_TYPE, data: [] },
			{
				key: FilterColumnKey.OFFER_TYPE,
				data: this.dropdownsData.offerTypes,
				translationKey: 'offer.typeOfOffer',
			},
			{ key: FilterColumnKey.GRANTS, data: this.availableGrants, translationKey: 'general.acceptedGrants' },
			{ key: FilterColumnKey.VALIDITY, data: [] },
			{ key: FilterColumnKey.ACTIONS, data: [] },
		];

		this.allFilterColumns = filterColumnsData.map(({ key, data, translationKey }) => {
			return new TableFilterColumn(key, data, translationKey || '');
		});
	}
}
