import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	ActionButtons,
	ColumnDataType,
	GenericStatusEnum,
	OfferTableDto,
	Page,
	PaginatedData,
	SupplierProfile,
	SupplierProfileService,
	TableColumn,
} from '@frontend/common';
import { ChipRemainingDialogComponent, TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { OfferApprovalPopupComponent } from '../../components/offer-approval-popup/offer-approval-popup.component';
import { PendingOffersService } from '../../pending-offers.service';
import { OffersForMuniciaplityComponent } from './offers-for-municipality.component';

describe('OffersForMuniciaplityComponent', () => {
	let component: OffersForMuniciaplityComponent;
	let fixture: ComponentFixture<OffersForMuniciaplityComponent>;
	let supplierProfileService: jest.Mocked<SupplierProfileService>;
	let dialogService: DialogService;
	let offerServiceSpy: any;

	beforeEach(async () => {
		supplierProfileService = {
			getSupplierProfile: jest.fn(),
			supplierProfileInformation: {} as any,
		} as unknown as jest.Mocked<SupplierProfileService>;

		offerServiceSpy = {
			getPendingOffers: jest.fn(),
			countPendingOffers: jest.fn(),
			countPendingOffersBySupplier: jest.fn(),
			getPendingOffersBySupplier: jest.fn(),
		};

		const dialogServiceMock = {
			message: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [OffersForMuniciaplityComponent, TableComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
			providers: [
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: SupplierProfileService, useValue: supplierProfileService },
				{ provide: PendingOffersService, useValue: offerServiceSpy },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OffersForMuniciaplityComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);

		component.offersMunicipalityTable = {
			initializeData: jest.fn(),
			manageColumns: jest.fn(),
			afterDataLoaded: jest.fn(),
			paginatedData: new PaginatedData<OfferTableDto>([], 10, 0),
		} as unknown as TableComponent<OfferTableDto>;

		offerServiceSpy.getPendingOffers.mockReturnValue(of([]));
		offerServiceSpy.countPendingOffers.mockReturnValue(of(0));
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return AssignGrantComponent as the type of modal', () => {
		expect(component.typeOfModal).toBe(ChipRemainingDialogComponent);
	});

	describe('Tests for table', () => {
		it('should call service on countOffers', () => {
			component['countOffers']();
			expect(offerServiceSpy.countPendingOffers).toHaveBeenCalledWith();
		});

		it('should not call initializeComponentData when passholders count = 0', () => {
			jest.spyOn(component, 'initializeComponentData');
			component['countOffers']();
			expect(offerServiceSpy.countPendingOffers).toHaveBeenCalledWith();
			expect(component.initializeComponentData).not.toHaveBeenCalled();
		});

		it('should call initializeComponentData when passholders count > 0', () => {
			jest.spyOn(component, 'initializeComponentData');
			offerServiceSpy.countPendingOffers.mockReturnValue(of(2));

			component['countOffers']();

			expect(offerServiceSpy.countPendingOffers).toHaveBeenCalledWith();
			expect(component.initializeComponentData).toHaveBeenCalled();
		});

		it('should initialize columns', () => {
			component.initializeColumns();
			const expectedColumns: TableColumn[] = [
				new TableColumn('general.supplier', 'supplierName', 'supplierName', true, true, ColumnDataType.DEFAULT),
				new TableColumn('general.status', 'status', 'status', true, true, ColumnDataType.STATUS),
				new TableColumn('offer.title', 'title', 'title', true, true),
				new TableColumn('general.acceptedGrants', 'grants', 'grants', true, false, ColumnDataType.CHIPS),
				new TableColumn('offer.validity', 'validity', 'validity', true, false),
				new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
			];

			expect(component.allColumns).toEqual(expectedColumns);
		});

		it('should call service on getOffers', () => {
			component['dataCount'] = 1;
			component.offersMunicipalityTable = new TableComponent<OfferTableDto>(dialogService);
			const pages: Page<OfferTableDto>[] = Array.from({ length: 5 }, () => new Page([]));
			component.offersMunicipalityTable.paginatedData = new PaginatedData<OfferTableDto>(pages, 10, 0);
			component.loadData(component.offersMunicipalityTable.paginatedData);
			expect(offerServiceSpy.getPendingOffers).toHaveBeenCalledWith(
				component.offersMunicipalityTable.paginatedData.currentIndex,
				component.offersMunicipalityTable.paginatedData.pageSize,
			);
		});

		it('should update paginated data and currentDisplayedPage after data is loaded', () => {
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
			component['dataCount'] = 3;
			component.offersMunicipalityTable = new TableComponent<OfferTableDto>(dialogService);
			const pages: Page<OfferTableDto>[] = Array.from({ length: 5 }, () => new Page([]));
			component.offersMunicipalityTable.paginatedData = new PaginatedData<OfferTableDto>(pages, 10, 0);
			component.afterDataLoaded(testData);

			expect(component.offersMunicipalityTable.paginatedData.pages[0].values.length).toEqual(testData.length);
			expect(component.offersMunicipalityTable.currentDisplayedPage.length).toEqual(testData.length);
		});
	});

	it('should not throw errors when called with valid arguments', () => {
		const mockAction = {
			actionButton: 'someActionButton',
			row: new OfferTableDto(
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
		};

		expect(() => component.onActionButtonClicked(mockAction)).not.toThrow();
	});

	it('should open offer approval popup and initialize supplier profile data', () => {
		const mockedRow = new OfferTableDto(
			'supplierId',
			'Title',
			123,
			'CITIZEN_WITH_PASS',
			'offerType',
			'validity',
			GenericStatusEnum.PENDING,
			'test',
			'supplierId',
		);

		component['openOfferWithGrantApprovalPopup'] = jest.fn();
		component['initSupplierProfileData'] = jest.fn();

		component.onActionButtonClicked({ actionButton: 'file-2_approval-seal_bb', row: mockedRow });

		expect(component['openOfferWithGrantApprovalPopup']).toHaveBeenCalledTimes(1);
		expect(component['initSupplierProfileData']).toHaveBeenCalledWith('supplierId');
	});

	it('should open offer approval popup and initialize supplier profile data on approvalIcon click', () => {
		const mockEvent = {
			actionButton: ActionButtons.approvalIcon,
			row: { supplierId: 'supplierId' } as any,
		};

		component['openOfferWithGrantApprovalPopup'] = jest.fn();
		component['initSupplierProfileData'] = jest.fn();

		component.onActionButtonClicked(mockEvent);

		expect(component['openOfferWithGrantApprovalPopup']).toHaveBeenCalledWith(mockEvent.row);
		expect(component['initSupplierProfileData']).toHaveBeenCalledWith(mockEvent.row.supplierId);
	});

	it('should not open offer approval popup or initialize supplier profile data on unknown action button click', () => {
		const mockEvent = {
			actionButton: 'unknownButton',
			row: { supplierId: 456 } as any,
		};

		component['openOfferWithGrantApprovalPopup'] = jest.fn();
		component['initSupplierProfileData'] = jest.fn();

		component.onActionButtonClicked(mockEvent);

		expect(component['openOfferWithGrantApprovalPopup']).not.toHaveBeenCalled();
		expect(component['initSupplierProfileData']).not.toHaveBeenCalled();
	});

	it('should call getSupplierProfile and set supplierProfileInformation', () => {
		const supplierId = 'id';
		const testData: SupplierProfile = {
			companyBranchAddress: 'Address',
			branchProvince: 'Province',
			branchZip: 'Zip',
			branchLocation: 'Location',
			branchTelephone: 'Telephone',
			email: 'email@email.com',
			website: 'Website',
			accountManager: 'Manager',
			companyName: 'Company',
			adminEmail: 'Email',
			kvkNumber: '12345678',
			ownerName: 'Owner',
			legalForm: 'Form',
			group: 'Group',
			category: 'Category',
			subcategory: 'Subcategory',
			supplierId: '123',
		};

		supplierProfileService.getSupplierProfile.mockReturnValue(of(testData));

		component['initSupplierProfileData'](supplierId);

		expect(supplierProfileService.getSupplierProfile).toHaveBeenCalledWith(supplierId);
		expect(component['supplierProfileService'].supplierProfileInformation).toEqual(testData);
	});

	it('should open offer approval popup', () => {
		const dialogRefMock = {
			afterClosed: () => of('mockResponse'),
			close: jest.fn(),
		};

		const offerTableDto = new OfferTableDto(
			'1',
			'Title',
			123,
			'CITIZEN_WITH_PASS',
			'offerType',
			'validity',
			GenericStatusEnum.PENDING,
			'test',
			'supplierId',
		);

		const dialogServiceSpy = jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);

		const couldOffer = jest.spyOn(component as any, 'countOffers');

		component['openOfferWithGrantApprovalPopup'](offerTableDto);

		expect(dialogServiceSpy).toHaveBeenCalledWith(OfferApprovalPopupComponent, {
			id: 'accessible-first-dialog',
			panelClass: 'offer-approval',
			width: '80%',
			disableClose: true,
			data: {
				offer: offerTableDto,
				mainContent: 'general.success.title',
				secondContent: 'general.success.text',
				acceptButtonType: 'button-success',
				acceptButtonText: 'register.continue',
			},
		});

		expect(couldOffer).toHaveBeenCalled();
	});

	it('should not open offer approval popup when no response', () => {
		const dialogRefMock = {
			afterClosed: () => of(undefined),
			close: jest.fn(),
		};

		const offerTableDto = new OfferTableDto(
			'1',
			'Title',
			123,
			'CITIZEN_WITH_PASS',
			'offerType',
			'validity',
			GenericStatusEnum.PENDING,
			'test',
			'supplierId',
		);

		const dialogServiceSpy = jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);

		const couldOffer = jest.spyOn(component as any, 'countOffers');

		component['openOfferWithGrantApprovalPopup'](offerTableDto);

		expect(dialogServiceSpy).toHaveBeenCalledWith(OfferApprovalPopupComponent, {
			id: 'accessible-first-dialog',
			panelClass: 'offer-approval',
			width: '80%',
			disableClose: true,
			data: {
				offer: offerTableDto,
				mainContent: 'general.success.title',
				secondContent: 'general.success.text',
				acceptButtonType: 'button-success',
				acceptButtonText: 'register.continue',
			},
		});

		expect(couldOffer).not.toHaveBeenCalled();
	});

	it('should have the proper action buttons', () => {
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
				GenericStatusEnum.REJECTED,
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
		jest.spyOn(component, 'initializeComponentData');
		offerServiceSpy.countPendingOffers.mockReturnValue(of(4));
		component['dataCount'] = 4;
		component.offersMunicipalityTable = new TableComponent<OfferTableDto>(dialogService);
		const pages: Page<OfferTableDto>[] = Array.from({ length: 4 }, () => new Page([]));
		component.offersMunicipalityTable.paginatedData = new PaginatedData<OfferTableDto>(pages, 10, 0);
		// const dataPaginated = new PaginatedData<OfferTableDto>(pages, 10, 0);
		component.afterDataLoaded(testData);

		expect(component.offersMunicipalityTable.paginatedData.pages[0].values.length).toEqual(testData.length);
		// expect(component.offersMunicipalityTable.currentDisplayedPage.length).toEqual(testData.length);
	});
});
