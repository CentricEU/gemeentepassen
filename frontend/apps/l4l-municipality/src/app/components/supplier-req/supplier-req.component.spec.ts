import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import {
	AuthService,
	ColumnDataType,
	Page,
	PaginatedData,
	SupplierProfile,
	SupplierProfileService,
	SupplierStatus,
	SupplierViewDto,
	TableColumn,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill';
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

	let supplierServiceSpy: any;
	let authServiceSpy: any;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const sampleSuppliers: SupplierViewDto[] = MunicipalityMockUtil.createSuppliersArray(12);

	beforeEach(async () => {
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
				{ provide: MatDialog, useValue: {} },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierReqComponent);
		component = fixture.componentInstance;

		supplierServiceSpy.getPendingSuppliers.mockReturnValue(of(sampleSuppliers));
		dialogService = TestBed.inject(DialogService);
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
		const statuses = [SupplierStatus.PENDING, SupplierStatus.REJECTED];
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

		const statuses = [SupplierStatus.PENDING, SupplierStatus.REJECTED];
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
			hasStatusUpdate: false,
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
				acceptButtonType: 'button-success',
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
			afterClosed: () => of('mockResponse'),
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
				acceptButtonType: 'button-success',
				acceptButtonText: 'register.continue',
			},
		});

		expect(updateSuppliersListsSpy).toHaveBeenCalled();
	});
});
