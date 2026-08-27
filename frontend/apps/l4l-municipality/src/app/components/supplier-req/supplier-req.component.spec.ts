import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import {
	ActionButtons,
	AuthService,
	ColumnDataType,
	Page,
	PaginatedData,
	SupplierProfile,
	SupplierProfileService,
	SupplierStatus,
	SupplierViewDto,
	TableActionButton,
	TableColumn,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
import { of } from 'rxjs';

import { GetSuppliersDto } from '../../_models/get-suppliers-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { MunicipalityMockUtil } from '../../_util/mock.util';
import { AppModule } from '../../app.module';
import { SupplierReviewPopupComponent } from '../supplier-review-popup/supplier-review-popup.component';
import { SupplierReqComponent } from './supplier-req.component';

jest.mock('@angular/material/dialog');

describe('SupplierReqComponent', () => {
	let component: SupplierReqComponent;
	let fixture: ComponentFixture<SupplierReqComponent>;
	let dialogService: DialogService;
	let supplierProfileService: jest.Mocked<SupplierProfileService>;
	let elementRef: ElementRef;

	let supplierServiceSpy: any;
	let authServiceSpy: any;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const sampleSuppliers: SupplierViewDto[] = MunicipalityMockUtil.createSuppliersArray(12);

	beforeEach(async () => {
		global.IntersectionObserver = class {
			constructor() {
				// mock constructor
			}
			observe() {
				// mock observe
			}
			unobserve() {
				// mock unobserve
			}
			disconnect() {
				// mock disconnect
			}
		} as any;

		supplierProfileService = {
			getSupplierProfile: jest.fn(),
			supplierProfileInformation: {} as any,
		} as unknown as jest.Mocked<SupplierProfileService>;

		const dialogServiceMock = {
			message: jest.fn(),
		};

		supplierServiceSpy = {
			getPendingSuppliers: jest.fn(),
		};

		authServiceSpy = {
			extractSupplierInformation: jest.fn(),
		};

		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			imports: [HttpClientModule, WindmillModule, AppModule],
			declarations: [SupplierReqComponent],
			providers: [
				{ provide: 'env', useValue: environmentMock },
				{ provide: MunicipalitySupplierService, useValue: supplierServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: SupplierProfileService, useValue: supplierProfileService },
				{ provide: ElementRef, useValue: { nativeElement: document.createElement('div') } },
				{ provide: MatDialog, useValue: {} },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierReqComponent);
		component = fixture.componentInstance;

		supplierServiceSpy.getPendingSuppliers.mockReturnValue(of(sampleSuppliers));
		dialogService = TestBed.inject(DialogService);
		elementRef = TestBed.inject(ElementRef);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize columns', () => {
		component.initializeColumns();
		const expectedColumns: TableColumn[] = [
			new TableColumn('general.status', 'status', 'status', true, true, ColumnDataType.STATUS),
			new TableColumn('general.name', 'name', 'companyName', true, true),
			new TableColumn('general.category', 'category', 'category', true),
			new TableColumn('supplierList.tableColumn.district', 'province', 'province', true),
			new TableColumn('supplierList.tableColumn.manager', 'manager', 'accountManager', true),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
		expect(component.allColumns).toEqual(expectedColumns);
	});

	it('should create request DTO', () => {
		const tenantId = 'sampleTenantId';
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);

		const dto = component.createRequestDto(component.supplierRequestTable.paginatedData, tenantId);
		const statuses = [SupplierStatus.PENDING, SupplierStatus.REJECTED, SupplierStatus.CREATED];
		expect(dto).toEqual(
			new GetSuppliersDto(
				component.supplierRequestTable.paginatedData.currentIndex,
				component.supplierRequestTable.paginatedData.pageSize,
				tenantId,
				statuses.join(','),
			),
		);
	});

	it('should not call supplierService.getPendingSuppliers when no tenant', () => {
		authServiceSpy.extractSupplierInformation.mockReturnValue();
		component.loadData(component.supplierRequestTable.paginatedData);
		expect(supplierServiceSpy.getPendingSuppliers).not.toBeCalled();
	});

	it('should call supplierService.getPendingSuppliers', () => {
		authServiceSpy.extractSupplierInformation.mockReturnValue('sampleTenantId');
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		component.loadData(component.supplierRequestTable.paginatedData);

		const statuses = [SupplierStatus.PENDING, SupplierStatus.REJECTED, SupplierStatus.CREATED];
		expect(supplierServiceSpy.getPendingSuppliers).toHaveBeenCalledWith(
			new GetSuppliersDto(
				component.supplierRequestTable.paginatedData.currentIndex,
				component.supplierRequestTable.paginatedData.pageSize,
				'sampleTenantId',
				statuses.join(','),
			),
		);
	});

	it('should update paginated data and currentDisplayedPage after data is loaded', () => {
		const testData = [
			new SupplierViewDto('1', 'TestName', 'kvk', 'accountManager', 'district', 'category', new Date(), 'status'),
			new SupplierViewDto(
				'2',
				'TestName2',
				'kvk',
				'accountManager',
				'district',
				'category',
				new Date(),
				'status',
			),
		];
		const mockPanelElement = {
			scrollTo: jest.fn(),
		};
		jest.spyOn(component.supplierRequestTable['elementRef'].nativeElement, 'querySelector').mockReturnValue(
			mockPanelElement,
		);
		component.supplierRequestTable.paginatedData.currentIndex = 1;
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		component.afterDataLoaded(testData);

		expect(component.supplierRequestTable.paginatedData.pages[0].values.length).toEqual(testData.length);
		expect(component.supplierRequestTable.currentDisplayedPage.length).toEqual(testData.length);
	});

	it('should not throw errors when called with valid arguments', () => {
		const mockAction = {
			actionButton: 'someActionButton',
			row: new SupplierViewDto(
				'1',
				'TestName',
				'kvk',
				'accountManager',
				'district',
				'category',
				new Date(),
				'status',
			),
		};

		expect(() => component.onActionButtonClicked(mockAction)).not.toThrow();
	});

	it('should open suppliers approval popup and initialize supplier profile data', () => {
		const mockRow: SupplierViewDto = {
			id: 'mockId',
			kvk: '12345678',
			companyName: 'Company',
			accountManager: 'Manager',
			district: 'District',
			category: 'Category',
			status: 'Status',
			createdDate: new Date(),
			province: 'Province',
			selected: false,
			isCheckboxDisabled: false,
		};

		component['openSupplierReviewPopup'] = jest.fn();
		component['initSupplierProfileData'] = jest.fn();

		component.onActionButtonClicked({ actionButton: 'file-2_approval-seal_bb', row: mockRow });

		expect(component['openSupplierReviewPopup']).toHaveBeenCalledTimes(1);
		expect(component['initSupplierProfileData']).toHaveBeenCalledWith('mockId');
	});

	it('should open the suppliers approval popup', () => {
		jest.spyOn(dialogService as any, 'message');

		component['openSupplierReviewPopup']();

		expect((dialogService as any).message).toHaveBeenCalledWith(SupplierReviewPopupComponent, {
			id: 'accessible-first-dialog',
			panelClass: 'suppliers-approval',
			width: '80%',
			disableClose: false,
			restoreFocus: true,
			data: {
				mainContent: 'general.success.title',
				secondContent: 'general.success.text',
				acceptButtonType: 'high-emphasis-success',
				acceptButtonText: 'register.continue',
			},
		});
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

	it('should remove approved supplier and update suppliers number', () => {
		jest.spyOn(component as any, 'updateSuppliersNumber');
		jest.spyOn(component as any, 'resetPendingRequestsList');

		component['updateSuppliersLists'](SupplierStatus.APPROVED);

		expect(component['updateSuppliersNumber']).toHaveBeenCalled();
		expect(component['resetPendingRequestsList']).toHaveBeenCalled();
	});
	it('should open suppliers approval popup and remove approved supplier on closure', () => {
		const dialogRefMock = {
			afterClosed: () => of({ actionType: 'update', status: SupplierStatus.APPROVED }),
			close: jest.fn(),
		};

		const dialogServiceSpy = jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);

		const updateSuppliersListsSpy = jest.spyOn(component as any, 'updateSuppliersLists');

		component['openSupplierReviewPopup']();

		expect(dialogServiceSpy).toHaveBeenCalledWith(SupplierReviewPopupComponent, {
			id: 'accessible-first-dialog',
			panelClass: 'suppliers-approval',
			width: '80%',
			disableClose: false,
			restoreFocus: true,
			data: {
				mainContent: 'general.success.title',
				secondContent: 'general.success.text',
				acceptButtonType: 'high-emphasis-success',
				acceptButtonText: 'register.continue',
			},
		});

		expect(updateSuppliersListsSpy).toHaveBeenCalled();
	});

	it('should NOT update suppliers lists when the approval dialog closes without a response', () => {
		const dialogRefMock = {
			afterClosed: () => of(null),
		};

		const messageSpy = jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		const updateSuppliersListsSpy = jest.spyOn(component as any, 'updateSuppliersLists');

		component['openSupplierReviewPopup']();

		expect(messageSpy).toHaveBeenCalled();
		expect(updateSuppliersListsSpy).not.toHaveBeenCalled();
	});

	it('should create request DTO including CREATED status', () => {
		// Arrange
		const tenantId = 'sampleTenantId';
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);

		// Act
		const dto = component.createRequestDto(component.supplierRequestTable.paginatedData, tenantId);

		// Assert
		const expectedStatuses = [SupplierStatus.PENDING, SupplierStatus.REJECTED, SupplierStatus.CREATED].join(',');
		expect(dto.status).toBe(expectedStatuses);
	});

	it('should replace null category with "-" in afterDataLoaded', () => {
		// Arrange
		const supplier = new SupplierViewDto(
			'1',
			'TestName',
			'kvk',
			'accountManager',
			'district',
			null as unknown as string,
			new Date(),
			SupplierStatus.PENDING,
		);
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		jest.spyOn(component.supplierRequestTable['elementRef'].nativeElement, 'querySelector').mockReturnValue({
			scrollTo: jest.fn(),
		});

		// Act
		component.afterDataLoaded([supplier]);

		// Assert
		expect(component.supplierRequestTable.currentDisplayedPage[0].category).toBe('-');
	});

	it('should replace undefined province with "-" in afterDataLoaded', () => {
		// Arrange — province is not set in the constructor, so it is undefined by default
		const supplier = new SupplierViewDto(
			'1',
			'TestName',
			'kvk',
			'accountManager',
			'district',
			'category',
			new Date(),
			SupplierStatus.PENDING,
		);
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		jest.spyOn(component.supplierRequestTable['elementRef'].nativeElement, 'querySelector').mockReturnValue({
			scrollTo: jest.fn(),
		});

		// Act
		component.afterDataLoaded([supplier]);

		// Assert
		expect(component.supplierRequestTable.currentDisplayedPage[0].province).toBe('-');
	});

	it('should replace null accountManager with "-" in afterDataLoaded', () => {
		// Arrange
		const supplier = new SupplierViewDto(
			'1',
			'TestName',
			'kvk',
			null as unknown as string,
			'district',
			'category',
			new Date(),
			SupplierStatus.PENDING,
		);
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		jest.spyOn(component.supplierRequestTable['elementRef'].nativeElement, 'querySelector').mockReturnValue({
			scrollTo: jest.fn(),
		});

		// Act
		component.afterDataLoaded([supplier]);

		// Assert
		expect(component.supplierRequestTable.currentDisplayedPage[0].accountManager).toBe('-');
	});

	it('should set action button isDisabled to false when supplier status is PENDING', () => {
		// Arrange
		const supplier = new SupplierViewDto(
			'1',
			'TestName',
			'kvk',
			'accountManager',
			'district',
			'category',
			new Date(),
			SupplierStatus.PENDING,
		);
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		jest.spyOn(component.supplierRequestTable['elementRef'].nativeElement, 'querySelector').mockReturnValue({
			scrollTo: jest.fn(),
		});

		// Act
		component.afterDataLoaded([supplier]);

		// Assert
		const actionButton = component.supplierRequestTable.currentDisplayedPage[0]
			.actionButtons?.[0] as TableActionButton;
		expect(actionButton.isDisabled).toBe(false);
	});

	it('should set action button isDisabled to true when supplier status is not PENDING', () => {
		// Arrange
		const supplier = new SupplierViewDto(
			'1',
			'TestName',
			'kvk',
			'accountManager',
			'district',
			'category',
			new Date(),
			SupplierStatus.APPROVED,
		);
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		jest.spyOn(component.supplierRequestTable['elementRef'].nativeElement, 'querySelector').mockReturnValue({
			scrollTo: jest.fn(),
		});

		// Act
		component.afterDataLoaded([supplier]);

		// Assert
		const actionButton = component.supplierRequestTable.currentDisplayedPage[0]
			.actionButtons?.[1] as TableActionButton;
		expect(actionButton.isDisabled).toBe(true);
	});

	it('should emit countSuppliersEvent with count decremented by one and actionType', () => {
		// Arrange
		const emitSpy = jest.spyOn(component.countSuppliersEvent, 'emit');
		component.dataCount = 5;

		// Act
		component['updateSuppliersNumber'](SupplierStatus.APPROVED);

		// Assert
		expect(emitSpy).toHaveBeenCalledWith({ count: 4, actionType: SupplierStatus.APPROVED });
	});

	it('should emit countSuppliersEvent with count 0 when dataCount is 1', () => {
		// Arrange
		const emitSpy = jest.spyOn(component.countSuppliersEvent, 'emit');
		component.dataCount = 1;

		// Act
		component['updateSuppliersNumber'](SupplierStatus.REJECTED);

		// Assert
		expect(emitSpy).toHaveBeenCalledWith({ count: 0, actionType: SupplierStatus.REJECTED });
	});

	it('should reset pending requests list preserving original page index and page size', () => {
		// Arrange
		const originalPageIndex = 2;
		const originalPageSize = 10;
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(
			pages,
			originalPageSize,
			originalPageIndex,
		);
		component.dataCount = 8;
		authServiceSpy.extractSupplierInformation.mockReturnValue('sampleTenantId');
		const initializeSpy = jest.spyOn(component.supplierRequestTable, 'initializePaginatedDataBasedOnPageSize');

		// Act
		component['resetPendingRequestsList']();

		// Assert
		expect(component.supplierRequestTable.listLength).toBe(8);
		expect(initializeSpy).toHaveBeenCalledWith(originalPageSize);
		expect(component.supplierRequestTable.paginatedData.currentIndex).toBe(originalPageIndex);
	});

	describe('afterDataLoaded - adminEdit button', () => {
		beforeEach(() => {
			authServiceSpy.isSuperAdmin = true;
		});

		const setupTable = (component: SupplierReqComponent) => {
			const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
			component.supplierRequestTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
			jest.spyOn(component.supplierRequestTable['elementRef'].nativeElement, 'querySelector').mockReturnValue({
				scrollTo: jest.fn(),
			});
		};

		const createSupplier = (status: SupplierStatus): SupplierViewDto => {
			return new SupplierViewDto(
				'1',
				'TestName',
				'kvk',
				'accountManager',
				'district',
				'category',
				new Date(),
				status,
			);
		};

		describe.each([
			[SupplierStatus.PENDING, 3, false],
			[SupplierStatus.REJECTED, 3, undefined],
			[SupplierStatus.CREATED, 3, undefined],
			[SupplierStatus.APPROVED, 2, undefined],
		])('when supplier status is %s', (status, expectedButtonCount, expectedDisabled) => {
			it(`should ${expectedButtonCount === 3 ? 'add' : 'not add'} adminEdit action button`, () => {
				// Arrange
				const supplier = createSupplier(status);
				setupTable(component);

				// Act
				component.afterDataLoaded([supplier]);

				// Assert
				const actionButtons = component.supplierRequestTable.currentDisplayedPage[0]
					.actionButtons as TableActionButton[];
				expect(actionButtons.length).toBe(expectedButtonCount);

				const adminEditButton = actionButtons.find((b) => b.name === ActionButtons.adminEdit);
				if (expectedButtonCount === 3) {
					expect(adminEditButton).toBeDefined();
					expect(adminEditButton?.isDisabled).toBe(false);
				} else {
					expect(adminEditButton).toBeUndefined();
				}
			});
		});
	});

	// ─── onActionButtonClicked - adminEdit ────────────────────────────────────

	it('should call openSupplierEditPopup and initSupplierProfileData when adminEdit button is clicked', () => {
		// Arrange
		const mockRow: SupplierViewDto = {
			id: 'supplier-abc',
			kvk: '12345678',
			companyName: 'Company',
			accountManager: 'Manager',
			district: 'District',
			category: 'Category',
			status: SupplierStatus.PENDING,
			createdDate: new Date(),
			province: 'Province',
			selected: false,
			isCheckboxDisabled: false,
		};

		component['openSupplierEditPopup'] = jest.fn();
		component['initSupplierProfileData'] = jest.fn();

		// Act
		component.onActionButtonClicked({ actionButton: ActionButtons.adminEdit, row: mockRow });

		// Assert
		expect(component['openSupplierEditPopup']).toHaveBeenCalledWith('supplier-abc');
		expect(component['initSupplierProfileData']).toHaveBeenCalledWith('supplier-abc');
	});

	// ─── openSupplierEditPopup ────────────────────────────────────────────────

	describe('openSupplierEditPopup', () => {
		it('should open the edit popup with the correct config', () => {
			// Arrange
			const dialogServiceSpy = jest.spyOn(dialogService, 'message').mockReturnValue({
				afterClosed: () => of(null),
			} as any);

			// Act
			component['openSupplierEditPopup']('supplier-xyz');

			// Assert
			expect(dialogServiceSpy).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					disableClose: true,
					data: expect.objectContaining({ supplierId: 'supplier-xyz' }),
				}),
			);
		});

		it('should NOT update suppliers lists when edit popup closes without a response', () => {
			// Arrange
			jest.spyOn(dialogService, 'message').mockReturnValue({ afterClosed: () => of(null) } as any);
			const updateSuppliersListsSpy = jest.spyOn(component as any, 'updateSuppliersLists');

			// Act
			component['openSupplierEditPopup']('supplier-xyz');

			// Assert
			expect(updateSuppliersListsSpy).not.toHaveBeenCalled();
		});

		it('should call updateSuppliersLists with the response when edit popup closes with a value', () => {
			// Arrange
			jest.spyOn(dialogService, 'message').mockReturnValue({
				afterClosed: () => of(SupplierStatus.APPROVED),
			} as any);
			const updateSuppliersListsSpy = jest.spyOn(component as any, 'updateSuppliersLists');

			// Act
			component['openSupplierEditPopup']('supplier-xyz');

			// Assert
			expect(updateSuppliersListsSpy).toHaveBeenCalledWith(SupplierStatus.APPROVED);
		});
	});

	// ─── openSupplierReviewPopup - adminEdit branch ───────────────────────────

	it('should call openSupplierEditPopup when review popup closes with actionType "adminEdit"', () => {
		// Arrange
		jest.spyOn(dialogService, 'message').mockReturnValue({
			afterClosed: () => of({ actionType: 'adminEdit', supplierId: 'supplier-xyz' }),
		} as any);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const openEditSpy = jest.spyOn(component as any, 'openSupplierEditPopup').mockImplementation(() => {});

		// Act
		component['openSupplierReviewPopup']();

		// Assert
		expect(openEditSpy).toHaveBeenCalledWith('supplier-xyz');
	});
});
