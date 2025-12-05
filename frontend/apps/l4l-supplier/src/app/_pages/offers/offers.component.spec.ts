import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
	ActionButtons,
	BreadcrumbService,
	ColumnDataType,
	FilterColumnKey,
	FilterCriteria,
	GenericStatusEnum,
	GrantDto,
	GrantHolder,
	OfferTableDto,
	Page,
	PaginatedData,
	TableColumn,
	TableFilterColumn,
} from '@frontend/common';
import {
	ChipRemainingDialogComponent,
	CustomDialogComponent,
	TableComponent,
	WindmillModule,
} from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { CreateOfferComponent } from '../../_components/create-offer/create-offer.component';
import { AppModule } from '../../app.module';
import { DeleteOffersDto } from '../../models/delete-offers-dto.model';
import { FilterOfferRequestDto } from '../../models/filter-offer-request-dto.model';
import { OfferRejectionReasonDto } from '../../models/offer-rejection-reason-dto.model';
import { OfferType } from '../../models/offer-type.model';
import { DropdownDataService } from '../../services/dropdown-data/dropdown-data.service';
import { OfferService } from '../../services/offer-service/offer.service';
import { OffersComponent } from './offers.component';

describe('OffersComponent', () => {
	let component: OffersComponent;
	let fixture: ComponentFixture<OffersComponent>;
	let dialogService: DialogService;
	let offerService: OfferService;
	let offerServiceSpy: any;
	let translateService: TranslateService;
	let breadcrumbService: BreadcrumbService;
	let dropdownDataServiceSpy: any;
	let formBuilder: FormBuilder;
	let mockGrants: GrantDto[];
	let mockOfferRejectionReason: OfferRejectionReasonDto;
	let breadcrumbServiceSpy: any;
	let activatedRouteMock: any;

	beforeEach(async () => {
		const mockFormGroup = new FormGroup({
			checkboxFilter: new FormControl(''),
			titleFilter: new FormControl(''),
			statusFilter: new FormControl(GenericStatusEnum.ACTIVE),
			citizenOfferTypeFilter: new FormControl('CITIZEN_WITH_PASS'),
			offerTypeFilter: new FormControl(0),
			grantsFilter: new FormControl('id'),
			validityFilter: new FormControl(''),
			actionsFilter: new FormControl(''),
		});

		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			afterClosed: jest.fn(() => of({})),
			alert: jest.fn(),
		};

		activatedRouteMock = {
			paramMap: of({ get: jest.fn() }),
		};

		offerServiceSpy = {
			getOffers: jest.fn(),
			countOffers: jest.fn(),
			deleteOffers: jest.fn(),
			getGrants: jest.fn(),
			getFilteredOffers: jest.fn(),
			countFilteredOffers: jest.fn().mockReturnValue(of(10)),
			getOfferRejectionReason: jest.fn(),
		};

		dropdownDataServiceSpy = {
			getAllDropdownsData: jest.fn(),
		};

		breadcrumbServiceSpy = {
			setBreadcrumbs: jest.fn(),
			removeBreadcrumbs: jest.fn(),
		};

		mockOfferRejectionReason = new OfferRejectionReasonDto('offerId', 'rejected title', 'reason');

		mockGrants = [
			new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date()),
			new GrantDto('id2', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date()),
		];

		global.structuredClone = jest.fn((val) => {
			return JSON.parse(JSON.stringify(val));
		});

		await TestBed.configureTestingModule({
			declarations: [OffersComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
			providers: [
				OfferService,
				TranslateService,
				DropdownDataService,
				BreadcrumbService,
				FormBuilder,
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: OfferService, useValue: offerServiceSpy },
				{ provide: DropdownDataService, useValue: dropdownDataServiceSpy },
				{ provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{
					provide: TableComponent,
					useValue: {
						filterFormGroup: new FormGroup({
							checkboxFilter: new FormControl(''),
							titleFilter: new FormControl(''),
							statusFilter: new FormControl(GenericStatusEnum.ACTIVE),
							citizenOfferTypeFilter: new FormControl('CITIZEN_WITH_PASS'),
							offerTypeFilter: new FormControl(0),
							grantsFilter: new FormControl('id'),
							validityFilter: new FormControl(''),
							actionsFilter: new FormControl(''),
						}),
					},
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OffersComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);
		offerService = TestBed.inject(OfferService);
		translateService = TestBed.inject(TranslateService);
		formBuilder = TestBed.inject(FormBuilder);
		offerServiceSpy.getOffers.mockReturnValue(of([]));
		offerServiceSpy.getFilteredOffers.mockReturnValue(of([]));
		offerServiceSpy.getOfferRejectionReason.mockReturnValue(of(mockOfferRejectionReason));
		offerServiceSpy.countOffers.mockReturnValue(of(0));
		offerServiceSpy.deleteOffers.mockReturnValue(of(null));
		breadcrumbService = TestBed.inject(BreadcrumbService);
		activatedRouteMock = TestBed.inject(ActivatedRoute);
		component.dropdownsData = {
			statuses: [],
			offerTypes: [],
		};
		component.availableGrants = [];
		component.offersTable = new TableComponent<OfferTableDto>(dialogService);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('Tests for modal open', () => {
		const dialogRefMock = { afterClosed: () => of(true) };

		it('should call dialogService.message on create offer button click', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));

			component.openCreateOfferModal();
			expect(dialogService['message']).toHaveBeenCalled();
		});

		it('should open the create offer popup', () => {
			jest.spyOn(dialogService as any, 'message');

			component.openCreateOfferModal();

			expect((dialogService as any).message).toHaveBeenCalledWith(CreateOfferComponent, {
				width: '70%',
				closeOnNavigation: false,
			});
		});

		it('should handle error when opening create offer modal', () => {
			jest.spyOn(dialogService, 'message').mockImplementation(() => {
				throw new Error('Failed to open modal');
			});

			expect(() => component.openCreateOfferModal()).toThrowError('Failed to open modal');
		});
	});

	describe('Tests for after dialog close ', () => {
		const dialogRefMock = { afterClosed: () => of(true) };

		it('should call dialogService.message on openCreateOfferModal', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
			component['countOffers'] = jest.fn();

			component.openCreateOfferModal();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['countOffers']).toHaveBeenCalled();
		});
		it('should call dialogService.message on openCreateOfferModal and no nothing if dismissed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(false));

			component['countOffers'] = jest.fn();

			component.openCreateOfferModal();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['countOffers']).not.toHaveBeenCalled();
		});
	});

	it('should call shouldOpenOffersPopup and openCreateOfferModal', () => {
		const shouldOpenOffersPopupSpy = jest.spyOn(component as any, 'shouldOpenOffersPopup');
		const openCreateOfferModalSpy = jest.spyOn(component as any, 'openCreateOfferModal');
		offerService.shouldOpenOfferPopup = true;

		component['shouldOpenOffersPopup']();

		expect(shouldOpenOffersPopupSpy).toHaveBeenCalled();
		expect(openCreateOfferModalSpy).toHaveBeenCalled();
	});

	describe('Tests for table', () => {
		it('should manage columns on calling manageColumns', () => {
			component['dataCount'] = 2;
			component.offersTable = new TableComponent<OfferTableDto>(dialogService);
			const manageColumnsSpy = jest.spyOn(component.offersTable, 'manageColumns');
			component.manageColumns();
			expect(manageColumnsSpy).toHaveBeenCalled();
		});

		it('should call service on countOffers', () => {
			component['countOffers']();
			expect(offerServiceSpy.countOffers).toHaveBeenCalledWith();
		});

		it('should not call initializeComponentData when passholders count = 0', () => {
			jest.spyOn(component, 'initializeComponentData');
			component['countOffers']();
			expect(offerServiceSpy.countOffers).toHaveBeenCalledWith();
			expect(component.initializeComponentData).not.toHaveBeenCalled();
		});

		it('should call initializeComponentData when passholders count > 0', () => {
			jest.spyOn(component, 'initializeComponentData');
			offerServiceSpy.countOffers.mockReturnValue(of(2));

			component['countOffers']();

			expect(offerServiceSpy.countOffers).toHaveBeenCalledWith();
			expect(component.initializeComponentData).toHaveBeenCalled();
		});

		it('should initialize columns', () => {
			component.initializeColumns();
			const expectedColumns: TableColumn[] = [
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

			expect(component.allColumns).toEqual(expectedColumns);
		});

		it('should call service on getOffers', () => {
			component.offersTable = new TableComponent<OfferTableDto>(dialogService);
			const pages: Page<OfferTableDto>[] = Array.from({ length: 5 }, () => new Page([]));
			component.offersTable.paginatedData = new PaginatedData<OfferTableDto>(pages, 10, 0);
			component.loadData(component.offersTable.paginatedData);
			expect(offerServiceSpy.getOffers).toHaveBeenCalledWith(
				component.paginatedData.currentIndex,
				component.paginatedData.pageSize,
			);
		});

		it('should initialize the table with offers already filtered by status when the service has one assigned', () => {
			offerService.offerStatusFilter = GenericStatusEnum.ACTIVE;
			const mockFilterValue: FilterCriteria = {
				statusFilter: GenericStatusEnum.ACTIVE,
			};

			component.offersTable = new TableComponent<OfferTableDto>(dialogService);
			const pages: Page<OfferTableDto>[] = Array.from({ length: 5 }, () => new Page([]));
			component.offersTable.paginatedData = new PaginatedData<OfferTableDto>(pages, 25, 0);
			component.offersTable.filterFormGroup = {
				markAsDirty: jest.fn(),
				value: mockFilterValue,
			} as any;
			const filterDto = component['createFilterOfferRequestDto']({
				statusFilter: GenericStatusEnum.ACTIVE,
			} as FilterCriteria);

			component.loadData(component.offersTable.paginatedData);

			expect(offerServiceSpy.countFilteredOffers).toHaveBeenCalledWith(filterDto);
			expect(offerServiceSpy.getFilteredOffers).toHaveBeenCalledWith(filterDto, 0, 25);
			expect(component.offersTable.filterFormGroup.markAsDirty).toHaveBeenCalled();
		});

		it('should update paginated data and currentDisplayedPage after data is loaded', () => {
			component.offersTable = new TableComponent<OfferTableDto>(dialogService);
			const testData = [
				new OfferTableDto(
					'1',
					'Title',
					123,
					'CITIZEN_WITH_PASS',
					'offerType',
					'validity',
					GenericStatusEnum.EXPIRED,
					'test',
					'supplierId',
				),
				new OfferTableDto(
					'1',
					'Title',
					123,
					'CITIZEN_WITH_PASS',
					'offerType',
					'validity',
					GenericStatusEnum.PENDING,
					'test',
					'supplierId',
				),
			];
			const pages: Page<OfferTableDto>[] = Array.from({ length: 5 }, () => new Page([]));
			component.offersTable.paginatedData = new PaginatedData<OfferTableDto>(pages, 10, 0);
			component.afterDataLoaded(testData);

			expect(component.paginatedData.pages[0].values.length).toEqual(testData.length);
			expect(component.offersTable.currentDisplayedPage.length).toEqual(testData.length);
		});
	});

	it('should return AssignGrantComponent as the type of modal', () => {
		expect(component.typeOfModal).toBe(ChipRemainingDialogComponent);
	});

	it('should return the correct ids of the selected offers', () => {
		const testData = [
			new OfferTableDto(
				'2',
				'Title',
				123,
				'CITIZEN_WITH_PASS',
				'offerType',
				'validity',
				GenericStatusEnum.EXPIRED,
				'test',
				'supplierId',
			),
			new OfferTableDto(
				'3',
				'Title',
				123,
				'CITIZEN_WITH_PASS',
				'offerType',
				'validity',
				GenericStatusEnum.PENDING,
				'test',
				'supplierId',
			),
		];
		testData[1].selected = true;

		component['dataCount'] = 3;
		component.offersTable = new TableComponent<OfferTableDto>(dialogService);
		component.offersTable.currentDisplayedPage = testData;

		jest.spyOn(component as any, 'getSelectedOffersIds');

		component['getSelectedOffersIds']();

		expect(component['getSelectedOffersIds']).toHaveReturnedWith(['3']);
	});

	describe('areOffersSelected', () => {
		it('should set areOffersSelected to true if any checkboxes are selected', () => {
			component.setAreOffersSelected(5);
			expect(component.areOffersSelected).toBeTruthy();
		});

		it('should set areOffersSelected to false if no checkboxes are selected', () => {
			component.setAreOffersSelected(0);
			expect(component.areOffersSelected).toBeFalsy();
		});
	});

	describe('Action Buttons', () => {
		it('should open the delete offer modal when the Trash button is pressed', () => {
			const testOffer = new OfferTableDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
			);

			jest.spyOn(component, 'openDeleteDialog');

			component.onActionButtonClicked({ actionButton: ActionButtons.trashIcon, row: testOffer });

			expect(component.openDeleteDialog).toHaveBeenCalledWith('1', 'Title');
		});

		it('should open the reactivate offer modal when the Reactivate button is pressed', () => {
			const testOffer = new OfferTableDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
			);

			jest.spyOn(component as any, 'openReactivateOfferModal');

			component.onActionButtonClicked({ actionButton: ActionButtons.circlePlay, row: testOffer });

			expect(component['openReactivateOfferModal']).toHaveBeenCalledWith('1');
		});

		it('should not do anything when an unknown button is pressed', () => {
			const testOffer = new OfferTableDto(
				'1',
				'Title',
				123,
				'CITIZEN',
				'offerType',
				'validity',
				GenericStatusEnum.ACTIVE,
				'test',
				'supplierId',
			);

			jest.spyOn(component, 'openDeleteDialog');

			component.onActionButtonClicked({ actionButton: '', row: testOffer });

			expect(component.openDeleteDialog).not.toHaveBeenCalled();
		});
	});

	describe('Delete Offers', () => {
		it('should open the dialog with the correct configuration if opened from the Action Button', () => {
			jest.spyOn(translateService, 'instant').mockReturnValue('offer.delete.descriptionSingular');

			const expectedConfig = {
				autoFocus: true,
				data: {
					title: 'offer.delete.titleSingular',
					mainContent: '',
					secondaryContent: 'offer.delete.descriptionSingular',
					cancelButtonText: 'general.button.cancel',
					acceptButtonText: 'general.button.delete',
					disableClosing: false,
					modalTypeClass: 'alert',
					fileName: '',
					tooltipColor: 'danger',
					acceptButtonType: 'button-alert',
					cancelButtonType: 'button-link-dark',
					comments: '',
					optionalText: {
						comments: '-',
						email: '',
						reason: '',
						tenantName: '',
					},
				},
				disableClose: false,
				width: '400px',
			};

			jest.spyOn(dialogService, 'alert');

			component.openDeleteDialog('1', 'Title');

			expect(dialogService.alert).toHaveBeenCalledWith(CustomDialogComponent, expectedConfig);
		});

		it('should open the dialog with the correct configuration if opened from the Delete button', () => {
			jest.spyOn(translateService, 'instant').mockReturnValue('offer.delete.descriptionPlural');

			const expectedConfig = {
				autoFocus: true,
				data: {
					title: 'offer.delete.titlePlural',
					mainContent: '',
					secondaryContent: 'offer.delete.descriptionPlural',
					cancelButtonText: 'general.button.cancel',
					acceptButtonText: 'general.button.delete',
					disableClosing: false,
					modalTypeClass: 'alert',
					fileName: '',
					tooltipColor: 'danger',
					acceptButtonType: 'button-alert',
					cancelButtonType: 'button-link-dark',
					comments: '',
					optionalText: {
						comments: '-',
						email: '',
						reason: '',
						tenantName: '',
					},
				},
				disableClose: false,
				width: '400px',
			};

			jest.spyOn(dialogService, 'alert');

			component.openDeleteDialog();

			expect(dialogService.alert).toHaveBeenCalledWith(CustomDialogComponent, expectedConfig);
		});

		it('should call deleteOffersAndRefresh with the correct id if the Delete button was pressed', () => {
			const dialogRefMock = {
				afterClosed: () => of(true),
				close: jest.fn(),
			};

			jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);
			jest.spyOn(component as any, 'deleteOffersAndRefresh');

			component.openDeleteDialog('1', 'Title');

			expect(component['deleteOffersAndRefresh']).toHaveBeenCalledWith('1');
		});

		it('should not call deleteOffersAndRefresh if the Cancel button was pressed', () => {
			const dialogRefMock = {
				afterClosed: () => of(false),
				close: jest.fn(),
			};

			jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);
			jest.spyOn(component as any, 'deleteOffersAndRefresh');

			component.openDeleteDialog('1', 'Title');

			expect(component['deleteOffersAndRefresh']).not.toHaveBeenCalled();
		});

		it('should delete the correct ONE offer if opened with an offerId', () => {
			const dialogRefMock = {
				afterClosed: () => of(true),
				close: jest.fn(),
			};

			jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);

			component.openDeleteDialog('1', 'Title');

			expect(offerServiceSpy.deleteOffers).toHaveBeenCalledWith(new DeleteOffersDto(['1']));
		});

		it('should delete the correct offers if opened without an offerId', () => {
			const dialogRefMock = {
				afterClosed: () => of(true),
				close: jest.fn(),
			};

			jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);
			jest.spyOn(component as any, 'getSelectedOffersIds').mockReturnValue(['1', '2']);

			component.openDeleteDialog();

			expect(offerServiceSpy.deleteOffers).toHaveBeenCalledWith(new DeleteOffersDto(['1', '2']));
		});

		it('should trigger a refresh of the offers after any offer is deleted', () => {
			jest.spyOn(component as any, 'countOffers');
			jest.spyOn(component as any, 'displaySuccessfullyDeletedToaster');
			jest.spyOn(component as any, 'getSelectedOffersIds').mockReturnValue(['1', '2']);
			const testData = [
				new OfferTableDto(
					'2',
					'Title',
					123,
					'CITIZEN_WITH_PASS',
					'offerType',
					'validity',
					GenericStatusEnum.EXPIRED,
					'test',
					'supplierId',
				),
			];

			component['dataCount'] = 2;
			component.offersTable = new TableComponent<OfferTableDto>(dialogService);
			component.offersTable.currentDisplayedPage = testData;

			jest.spyOn(component.offersTable, 'toggleCheckbox');

			component['deleteOffersAndRefresh']();

			expect(component['countOffers']).toHaveBeenCalled();
			expect(component['displaySuccessfullyDeletedToaster']).toHaveBeenCalledWith(true);
		});
	});

	describe('Reactivate offers', () => {
		it('should open the dialog with the correct configuration if opened from the Reactivate button', () => {
			jest.spyOn(dialogService, 'message');

			component['openReactivateOfferModal']('18');

			expect((dialogService as any).message).toHaveBeenCalledWith(CreateOfferComponent, {
				width: '70%',
				closeOnNavigation: false,
				data: {
					offerToReactivate: '18',
				},
			});
		});

		it('should recount offers after dialog is closed', () => {
			const dialogRefMock = {
				afterClosed: () => of(true),
				close: jest.fn(),
			};

			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(component as any, 'countOffers');

			component['openReactivateOfferModal']('19');

			expect(component['countOffers']).toHaveBeenCalled();
		});
	});

	describe('onApplyFilters', () => {
		it('should not request filtered offers if the service has a status assigned', () => {
			jest.spyOn(component as any, 'createFilterOfferRequestDto');
			offerService.offerStatusFilter = GenericStatusEnum.ACTIVE;

			component.onApplyFilters(new FilterCriteria(), false);

			expect(component['createFilterOfferRequestDto']).not.toHaveBeenCalled();
			expect(offerServiceSpy.getFilteredOffers).not.toHaveBeenCalled();
		});

		it('should call getFilteredOffers with the correct parameters', () => {
			const filters: FilterCriteria = {
				statusFilter: GenericStatusEnum.ACTIVE,
				offerTypeFilter: 1,
				grantsFilter: 'grant1',
			};

			const filterDto = new FilterOfferRequestDto(GenericStatusEnum.ACTIVE, 1, 'grant1');
			component.offersTable = new TableComponent<OfferTableDto>(dialogService);
			component.offersTable.paginatedData = { currentIndex: 0, pageSize: 10 } as PaginatedData<OfferTableDto>;
			component.offersTable.currentDisplayedPage = [];
			jest.spyOn(component as any, 'createFilterOfferRequestDto').mockReturnValue(filterDto);

			component.onApplyFilters(filters, false);

			expect(offerServiceSpy.getFilteredOffers).toHaveBeenCalledWith(filterDto, 0, 10);
		});
	});

	describe('ngOnDestroy', () => {
		it('should remove breadcrumbs', () => {
			component.ngOnDestroy();
			expect(offerService.shouldOpenOfferPopup).toBe(false);
			expect(breadcrumbService.removeBreadcrumbs).toHaveBeenCalled();
		});
	});

	describe('shouldDisplayTable', () => {
		it('should return true when data exists and filter columns are defined', () => {
			component.offersTable = new TableComponent<OfferTableDto>(dialogService);
			component['dataCount'] = 3;
			component.allFilterColumns = [new TableFilterColumn('key', [], '')];

			const result = component.shouldDisplayTable();

			expect(Array.isArray(result) && result.length > 0).toEqual(true);
		});
	});

	describe('openCreateOfferModal', () => {
		it('should call dialogService.message', () => {
			const dialogRefMock = { afterClosed: () => of(true) };
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));

			component.openCreateOfferModal();

			expect(dialogService.message).toHaveBeenCalledWith(CreateOfferComponent, {
				width: '70%',
				closeOnNavigation: false,
			});
		});

		it('should call countOffers after modal is closed', () => {
			const dialogRefMock = { afterClosed: () => of(true) };
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(component as any, 'countOffers');

			component.openCreateOfferModal();

			expect(dialogService.message).toHaveBeenCalledWith(CreateOfferComponent, {
				width: '70%',
				closeOnNavigation: false,
			});
			expect(component['countOffers']).toHaveBeenCalled();
		});
	});

	describe('initializeColumns', () => {
		it('should initialize all columns', () => {
			component.initializeColumns();
			expect(component.allColumns.length).toBe(8);
		});
	});

	describe('manageColumns', () => {
		it('should call offersTable.manageColumns', () => {
			component.offersTable = { manageColumns: jest.fn() } as any;
			component.manageColumns();
			expect(component.offersTable.manageColumns).toHaveBeenCalled();
		});
	});

	describe('initializeComponentData', () => {
		it('should initialize columns and data', () => {
			component.offersTable = new TableComponent<OfferTableDto>(dialogService);
			jest.spyOn(component, 'initializeColumns');
			jest.spyOn(component.offersTable, 'initializeData');

			component.initializeComponentData();

			expect(component.initializeColumns).toHaveBeenCalled();
			expect(component.offersTable.initializeData).toHaveBeenCalled();
		});
	});

	describe('setAreOffersSelected', () => {
		it('should set areOffersSelected to true if count is greater than 0', () => {
			component.setAreOffersSelected(1);
			expect(component.areOffersSelected).toBe(true);
		});

		it('should set areOffersSelected to false if count is 0', () => {
			component.setAreOffersSelected(0);
			expect(component.areOffersSelected).toBe(false);
		});
	});

	it('should initialize allFilterColumns correctly', () => {
		component['initFilterColumnsData']();

		expect(component.allFilterColumns).toHaveLength(8);

		expect(component.allFilterColumns[0].filterName).toEqual(FilterColumnKey.CHECKBOX);
		expect(component.allFilterColumns[1].filterName).toEqual(FilterColumnKey.STATUS);
		expect(component.allFilterColumns[1].source).toEqual(component.dropdownsData.statuses);
		expect(component.allFilterColumns[2].filterName).toEqual(FilterColumnKey.TITLE);
	});

	it('should clear the filters in the table when the clear method is called', () => {
		component.offersTable = {
			clearFilters: jest.fn(),
		} as unknown as TableComponent<any>;

		jest.spyOn(component.offersTable as any, 'clearFilters');

		component.clearFilters();

		expect(component.offersTable['clearFilters']).toHaveBeenCalled();
	});

	describe('areFiltersApplied getter', () => {
		beforeEach(() => {
			component.offersTable = {
				areFiltersApplied: jest.fn(),
			} as unknown as TableComponent<any>;
		});

		it('should be true if offersTable.areFiltersApplied returns true', () => {
			jest.spyOn(component.offersTable as any, 'areFiltersApplied').mockReturnValue(true);

			expect(component.areFiltersApplied).toBe(true);
		});

		it('should be false if offersTable.areFiltersApplied returns false', () => {
			jest.spyOn(component.offersTable as any, 'areFiltersApplied').mockReturnValue(false);

			expect(component.areFiltersApplied).toBe(false);
		});
	});

	describe('createFilterOfferRequestDto', () => {
		it('should create FilterOfferRequestDto object correctly from FilterCriteria', () => {
			const mockFilters: FilterCriteria = {
				statusFilter: GenericStatusEnum.ACTIVE,
				offerTypeFilter: 1,
				grantsFilter: '123',
			};

			const result = component['createFilterOfferRequestDto'](mockFilters);

			expect(result).toBeTruthy();
			expect(result.status).toEqual(GenericStatusEnum.ACTIVE);
			expect(result.offerTypeId).toEqual(1);
			expect(result.grantId).toEqual('123');
		});

		it('should handle undefined or null values gracefully', () => {
			const mockFilters: FilterCriteria = {
				statusFilter: undefined,
				offerTypeFilter: null as any,
				grantsFilter: undefined,
			};

			const result = component['createFilterOfferRequestDto'](mockFilters);

			expect(result).toBeTruthy();
			expect(result.status).toBeUndefined();
			expect(result.offerTypeId).toBeNull();
			expect(result.grantId).toBeUndefined();
		});
	});

	describe('initializeGrants', () => {
		it('should initialize availableGrants correctly', () => {
			component['initializeGrants'](mockGrants);

			expect(component.availableGrants.length).toEqual(2);
			expect(component.availableGrants[0].key).toEqual('id1');
			expect(component.availableGrants[0].value).toEqual('title');
		});

		it('should handle empty data gracefully', () => {
			component['initializeGrants']([]);

			expect(component.availableGrants).toEqual([]);
		});
	});

	describe('convertOfferTypeToEnumValueDto', () => {
		it('should convert offer types to EnumValueDto array correctly', () => {
			const mockOfferTypes: OfferType[] = [
				{ offerTypeId: 1, offerTypeLabel: 'Type A' },
				{ offerTypeId: 2, offerTypeLabel: 'Type B' },
			];

			const result = component['convertOfferTypeToEnumValueDto'](mockOfferTypes);

			expect(result.length).toEqual(2);
			expect(result[0].value).toEqual('Type A');
			expect(result[0].key).toEqual(1);
		});

		it('should handle empty offer types array', () => {
			const result = component['convertOfferTypeToEnumValueDto']([]);

			expect(result.length).toEqual(0);
		});

		it('should handle undefined offer types gracefully', () => {
			const result = component['convertOfferTypeToEnumValueDto']([]);

			expect(result).toEqual([]);
		});
	});

	describe('initOfferTypeAndGrants', () => {
		it('should initialize dropdown data and grants correctly', () => {
			const mockData = [
				{
					offerTypes: [
						{ offerTypeId: 1, offerTypeLabel: 'Type A' },
						{ offerTypeId: 2, offerTypeLabel: 'Type B' },
					],
					statuses: [{ value: 'Status A' }, { value: 'Status B' }],
					targets: [{ value: 'Target A' }, { value: 'Target B' }],
				},
				[
					{ id: '1', title: 'Grant 1' },
					{ id: '2', title: 'Grant 2' },
				],
			];

			jest.spyOn(component as any, 'getRequestsObservable').mockReturnValue(of(mockData));

			component['initOfferTypeAndGrants']();

			expect(component.dropdownsData.offerTypes.length).toEqual(2);
			expect(component.availableGrants.length).toEqual(2);
		});

		it('should handle undefined data from observable gracefully', () => {
			jest.spyOn(component as any, 'getRequestsObservable').mockReturnValue(of(undefined));

			component['initOfferTypeAndGrants']();

			expect(component.dropdownsData).toEqual({ offerTypes: [], statuses: [] });
			expect(component.availableGrants.length).toEqual(0);
		});
	});

	it('should initialize availableGrants when data is an array', () => {
		const mockData: GrantDto[] = [
			new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date()),
			new GrantDto('id2', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date()),
		];

		jest.spyOn(component as any, 'convertGrantsToEnumValueDto').mockReturnValue([...mockData]);

		component['initializeGrants'](mockData);

		expect(component.availableGrants).toEqual([...mockData]);
	});

	it('should return early when data is not an array', () => {
		const invalidData: any = 'invalid data';

		jest.spyOn(component as any, 'convertGrantsToEnumValueDto');

		component['initializeGrants'](invalidData);

		expect(component.availableGrants).toEqual([]);
		expect(component['convertGrantsToEnumValueDto']).not.toHaveBeenCalled();
	});

	it('should update listLength when countFilteredOffers is called', () => {
		const mockFilterValue: FilterCriteria = {
			statusFilter: GenericStatusEnum.ACTIVE,
		};
		component.offersTable = {
			filterFormGroup: {
				value: mockFilterValue,
			},
		} as any;

		component['countFilteredOffers']();

		expect(offerService.countFilteredOffers).toHaveBeenCalledWith({
			grantId: undefined,
			offerTypeId: undefined,
			status: GenericStatusEnum.ACTIVE,
			targetType: undefined,
		});

		expect(component['dataCount']).toEqual(10);
		const filterDto = new FilterOfferRequestDto(GenericStatusEnum.ACTIVE, 1, 'grant1');
		component['offerService'].countFilteredOffers(filterDto).subscribe(() => {
			expect(component['dataCount']).toEqual(10);
		});
	});

	it('should open the create offer modal and count offers on close', () => {
		const dialogRefMock = { afterClosed: () => of(true) };
		jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
		jest.spyOn(component as any, 'countOffers');

		component.openCreateOfferModal();

		expect(dialogService.message).toHaveBeenCalledWith(CreateOfferComponent, {
			width: '70%',
			closeOnNavigation: false,
		});
		expect(component['countOffers']).toHaveBeenCalled();
	});

	it('should open the delete offer modal and delete offers on confirmation', () => {
		const dialogRefMock = { afterClosed: () => of(true) };
		jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);
		jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
		jest.spyOn(component as any, 'deleteOffersAndRefresh');

		component.openDeleteDialog('offerId', 'offerTitle');

		expect(dialogService.alert).toHaveBeenCalled();
		expect(component['deleteOffersAndRefresh']).toHaveBeenCalledWith('offerId');
	});

	it('should initialize columns correctly', () => {
		component.initializeColumns();
		const expectedColumns = [
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
		expect(component.allColumns).toEqual(expectedColumns);
	});

	it('should apply filters when filterDto is present', () => {
		const mockFilterCriteria = {
			checkboxFilter: '',
			titleFilter: '',
			statusFilter: GenericStatusEnum.ACTIVE,
			citizenOfferTypeFilter: 'CITIZEN',
			offerTypeFilter: 0,
			grantsFilter: 'id',
		};

		component.filterDto = new FilterOfferRequestDto(
			mockFilterCriteria.statusFilter as GenericStatusEnum,
			mockFilterCriteria.offerTypeFilter as number,
			mockFilterCriteria.grantsFilter as string,
		);

		const mockFormGroup = new FormGroup({
			checkboxFilter: new FormControl(''),
			titleFilter: new FormControl(''),
			statusFilter: new FormControl(mockFilterCriteria.statusFilter),
			citizenOfferTypeFilter: new FormControl(mockFilterCriteria.citizenOfferTypeFilter),
			offerTypeFilter: new FormControl(mockFilterCriteria.offerTypeFilter),
			grantsFilter: new FormControl(mockFilterCriteria.grantsFilter),
		});

		const testData = [
			new OfferTableDto(
				'2',
				'Title',
				123,
				'CITIZEN_WITH_PASS',
				'offerType',
				'validity',
				GenericStatusEnum.EXPIRED,
				'test',
				'supplierId',
			),
			new OfferTableDto(
				'3',
				'Title',
				123,
				'CITIZEN_WITH_PASS',
				'offerType',
				'validity',
				GenericStatusEnum.PENDING,
				'test',
				'supplierId',
			),
		];
		testData[1].selected = true;

		component.offersTable = new TableComponent<OfferTableDto>(dialogService);
		component['dataCount'] = 3;
		component.offersTable.currentDisplayedPage = testData;
		component.offersTable.filterFormGroup = mockFormGroup;
		const pages: Page<OfferTableDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.offersTable.paginatedData = new PaginatedData<OfferTableDto>(pages, 10, 0);

		const onApplyFiltersSpy = jest.spyOn(component, 'onApplyFilters');
		const loadDataSpy = jest.spyOn(offerServiceSpy, 'getFilteredOffers').mockReturnValue(of(testData));

		component.loadData(component.offersTable.paginatedData);

		expect(onApplyFiltersSpy).toHaveBeenCalledWith(mockFilterCriteria, false);
		expect(loadDataSpy).toHaveBeenCalledWith(
			component.filterDto,
			component.offersTable.paginatedData.currentIndex,
			component.offersTable.paginatedData.pageSize,
		);
	});

	describe('offer rejection', () => {
		it('should display reason if the rejected offer id is in the URL', () => {
			jest.spyOn(component as any, 'displayOfferRejectedNotice');
			jest.spyOn(component as any, 'createOfferRejectedModal');
			jest.spyOn(activatedRouteMock.paramMap, 'subscribe').mockImplementationOnce((callback: any) => {
				callback({ get: () => 'offerId' });
			});

			component['subscribeToRouteParam']();

			expect(component['displayOfferRejectedNotice']).toHaveBeenCalledWith('offerId');
			expect(component['createOfferRejectedModal']).toHaveBeenCalledWith(mockOfferRejectionReason);
		});

		it('should create the proper dialogService configuration', () => {
			jest.spyOn(component as any, 'createOfferRejectedModal');
			jest.spyOn(dialogService as any, 'message');

			component['displayOfferRejectedNotice']('offerId');

			const expectedConfig = {
				autoFocus: true,
				data: {
					acceptButtonText: 'general.button.applyAgain',
					acceptButtonType: 'button-success',
					cancelButtonText: 'general.button.cancel',
					cancelButtonType: 'button-link-dark',
					comments: '',
					disableClosing: false,
					fileName: 'rejected.svg',
					mainContent: 'generalRejection.modal.title',
					modalTypeClass: 'success',
					optionalText: {
						comments: '',
						email: '',
						offerName: 'rejected title',
						reason: 'reason',
						tenantName: '',
					},
					secondaryContent: 'rejectOffer.modal.description',
					title: 'generalRejection.modal.header',
					tooltipColor: 'theme',
				},
				disableClose: false,
				width: '600px',
			};
			expect(component['createOfferRejectedModal']).toHaveReturnedWith(expectedConfig);
			expect(dialogService['message']).toHaveBeenCalledWith(CustomDialogComponent, expectedConfig);
		});

		it('should not display reason if there is no offer id in the URL', () => {
			jest.spyOn(component as any, 'displayOfferRejectedNotice');
			jest.spyOn(activatedRouteMock.paramMap, 'subscribe').mockImplementationOnce((callback: any) => {
				callback({ get: () => null });
			});

			component['subscribeToRouteParam']();

			expect(component['displayOfferRejectedNotice']).not.toHaveBeenCalledWith('offerId');
		});

		describe('rejection dialog', () => {
			it('should not do anything if dismissed', () => {
				jest.spyOn(component as any, 'applyAgain');
				jest.spyOn(dialogService, 'message').mockReturnValue({
					afterClosed: jest.fn(() => of(null)),
				} as any);

				component['displayOfferRejectedNotice']('offerId');

				expect(component['applyAgain']).not.toHaveBeenCalled();
			});

			it('should call applyAgain method if confirmed', () => {
				jest.spyOn(component as any, 'applyAgain');
				jest.spyOn(dialogService, 'message').mockReturnValue({
					afterClosed: jest.fn(() => of(true)),
				} as any);

				component['displayOfferRejectedNotice']('offerId');

				expect(component['applyAgain']).toHaveBeenCalled();
			});
		});
	});

	it('should reset currentIndex to 0 when isFirstFiltering is true', () => {
		const filters: FilterCriteria = {
			statusFilter: GenericStatusEnum.ACTIVE,
			offerTypeFilter: 1,
			grantsFilter: '123',
		};

		component.offersTable = new TableComponent<OfferTableDto>(dialogService);
		const pages: Page<OfferTableDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.offersTable.paginatedData = new PaginatedData<OfferTableDto>(pages, 10, 0);
		const testData = [
			new OfferTableDto(
				'2',
				'Title',
				123,
				'CITIZEN_WITH_PASS',
				'offerType',
				'validity',
				GenericStatusEnum.EXPIRED,
				'test',
				'supplierId',
			),
			new OfferTableDto(
				'3',
				'Title',
				123,
				'CITIZEN_WITH_PASS',
				'offerType',
				'validity',
				GenericStatusEnum.PENDING,
				'test',
				'supplierId',
			),
		];
		component.offersTable.currentDisplayedPage = testData;

		component.paginatedData.currentIndex = 5;

		component.onApplyFilters(filters, true);

		expect(component.paginatedData.currentIndex).toBe(0);
	});
});
