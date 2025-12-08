import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
	ActionButtonIcons,
	AuthService,
	ColumnDataType,
	Page,
	PaginatedData,
	SupplierStatus,
	SupplierViewDto,
	TableColumn,
} from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { of } from 'rxjs';

import { GetSuppliersDto } from '../../_models/get-suppliers-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { MunicipalityMockUtil } from '../../_util/mock.util';
import { AppModule } from '../../app.module';
import { ActiveSuppliersComponent } from './active-suppliers.component';

describe('ActiveSuppliersComponent', () => {
	let component: ActiveSuppliersComponent;
	let fixture: ComponentFixture<ActiveSuppliersComponent>;
	let supplierServiceSpy: any;
	let authServiceSpy: any;
	let router: Router;

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

		supplierServiceSpy = {
			getSuppliers: jest.fn(),
		};

		authServiceSpy = {
			extractSupplierInformation: jest.fn(),
		};

		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			imports: [HttpClientModule, WindmillModule, AppModule],
			declarations: [ActiveSuppliersComponent],
			providers: [
				{ provide: MunicipalitySupplierService, useValue: supplierServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				Router,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ActiveSuppliersComponent);
		component = fixture.componentInstance;
		supplierServiceSpy.getSuppliers.mockReturnValue(of(sampleSuppliers));
		router = TestBed.inject(Router);

		component.suppliersTable = {
			initializeData: jest.fn(),
			manageColumns: jest.fn(),
			afterDataLoaded: jest.fn(),
			paginatedData: new PaginatedData<SupplierViewDto>([], 10, 0),
		} as unknown as TableComponent<SupplierViewDto>;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should not call manageColumns on SuppliersTableComponent if no active suppliers', () => {
		const manageColumnsSpy = jest.spyOn(component.suppliersTable, 'manageColumns');

		component.manageColumns();

		expect(manageColumnsSpy).not.toHaveBeenCalled();
	});

	it('should call manageColumns on SuppliersTableComponent if  active suppliers', () => {
		component.dataCount = 2;
		const manageColumnsSpy = jest.spyOn(component.suppliersTable, 'manageColumns');

		component.manageColumns();

		expect(manageColumnsSpy).toHaveBeenCalled();
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
		component.suppliersTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);

		const dto = component.createRequestDto(component.suppliersTable.paginatedData, tenantId);
		expect(dto).toEqual(
			new GetSuppliersDto(
				component.suppliersTable.paginatedData.currentIndex,
				component.suppliersTable.paginatedData.pageSize,
				tenantId,
				SupplierStatus.APPROVED,
			),
		);
	});

	it('should not call supplierService.getSuppliers when no tenant', () => {
		authServiceSpy.extractSupplierInformation.mockReturnValue();
		component.loadData(component.suppliersTable.paginatedData);
		expect(supplierServiceSpy.getSuppliers).not.toBeCalled();
	});

	it('should call supplierService.getSuppliers', () => {
		authServiceSpy.extractSupplierInformation.mockReturnValue('sampleTenantId');
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.suppliersTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		component.loadData(component.suppliersTable.paginatedData);
		expect(supplierServiceSpy.getSuppliers).toHaveBeenCalledWith(
			new GetSuppliersDto(
				component.suppliersTable.paginatedData.currentIndex,
				component.suppliersTable.paginatedData.pageSize,
				'sampleTenantId',
				SupplierStatus.APPROVED,
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
		component.suppliersTable.paginatedData.currentIndex = 1;
		const pages: Page<SupplierViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		component.suppliersTable.paginatedData = new PaginatedData<SupplierViewDto>(pages, 10, 0);
		component.afterDataLoaded(testData);

		expect(component.suppliersTable.paginatedData.pages[0].values.length).toEqual(testData.length);
		expect(component.suppliersTable.currentDisplayedPage.length).toEqual(testData.length);
	});

	it('should navigate to supplier details when action button is "view"', () => {
		const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl').mockImplementation();

		const event = {
			actionButton: ActionButtonIcons.visibilityIcon,
			row: {
				id: '123',
				companyName: 'Company',
				kvk: '12345678',
				accountManager: 'Account',
				district: 'Distrcit',
				category: 'Category',
				status: 'APPROVED',
				hasStatusUpdate: true,
				createdDate: new Date(),
				selected: true,
				isCheckboxDisabled: false,
			},
		};

		component.onActionButtonClicked(event);

		expect(navigateByUrlSpy).toHaveBeenCalledWith(`supplier-details/${event.row.id}`);
		expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);

		navigateByUrlSpy.mockRestore();
	});

	it('should navigate to supplier details when view button is clicked', () => {
		const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl').mockImplementation();

		const row: SupplierViewDto = {
			id: '123',
			companyName: 'Example Company',
			kvk: '123456789',
			accountManager: 'John Doe',
			district: 'Example District',
			category: 'Category',
			status: 'APPROVED',
			hasStatusUpdate: true,
			createdDate: new Date(),
			selected: true,
			isCheckboxDisabled: false,
		};

		const event = {
			actionButton: ActionButtonIcons.visibilityIcon,
			row: row,
		};

		component.onActionButtonClicked(event);

		expect(navigateByUrlSpy).toHaveBeenCalledWith('supplier-details/123');
	});
});
