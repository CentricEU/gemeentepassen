import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTab } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService, PaginatedData, SupplierStatus, SupplierViewDto } from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';
import { of } from 'rxjs';

import { InvitationDto } from '../../_models/invitation-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { MunicipalityMockUtil } from '../../_util/mock.util';
import { AppModule } from '../../app.module';
import { ActiveSuppliersComponent } from '../active-suppliers/active-suppliers.component';
import { InvitationsComponent } from '../invitations/invitations.component';
import { InviteSuppliersComponent } from '../invite-suppliers/invite-suppliers.component';
import { SuppliersListComponent } from './suppliers.component';

describe('SuppliersListComponent', () => {
	let component: SuppliersListComponent;
	let fixture: ComponentFixture<SuppliersListComponent>;
	let supplierServiceSpy: any;
	let authServiceSpy: any;
	let toastrService: ToastrService;
	let dialogService: DialogService;

	const sampleSuppliers: SupplierViewDto[] = MunicipalityMockUtil.createSuppliersArray(12);

	const sampleCount = 10;

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
			getPendingSuppliers: jest.fn(),
			getSuppliers: jest.fn(),
			countSuppliers: jest.fn(),
			getInvitationsCount: jest.fn(),
			getInvitations: jest.fn(),
		};

		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
		};

		authServiceSpy = {
			extractSupplierInformation: jest.fn(),
		};
		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			declarations: [SuppliersListComponent, ActiveSuppliersComponent, InvitationsComponent, TableComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule, NoopAnimationsModule],
			providers: [
				{ provide: MunicipalitySupplierService, useValue: supplierServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: DialogService, useValue: dialogServiceMock },
				ToastrService,
				TranslateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SuppliersListComponent);

		component = fixture.componentInstance;
		authServiceSpy.extractSupplierInformation.mockReturnValue('sampleTenantId');
		supplierServiceSpy.countSuppliers.mockReturnValue(of(sampleCount));
		supplierServiceSpy.getPendingSuppliers.mockReturnValue(of(sampleSuppliers));
		supplierServiceSpy.getSuppliers.mockReturnValue(of(sampleSuppliers));
		supplierServiceSpy.getInvitationsCount.mockReturnValue(of(sampleCount));
		supplierServiceSpy.getInvitations.mockReturnValue(of([]));
		toastrService = TestBed.inject(ToastrService);
		dialogService = TestBed.inject(DialogService);

		component.activeSuppliers = TestBed.createComponent(ActiveSuppliersComponent).componentInstance;
		component.invitations = TestBed.createComponent(InvitationsComponent).componentInstance;

		component.activeSuppliers.suppliersTable = {
			initializeData: jest.fn(),
			manageColumns: jest.fn(),
			afterDataLoaded: jest.fn(),
			paginatedData: new PaginatedData<SupplierViewDto>([], 10, 0),
		} as unknown as TableComponent<SupplierViewDto>;

		component.activeSuppliers['dataCount'] = 1;
		component.invitations['dataCount'] = 1;
		component.invitationsCount = 1;
		component.invitations.invitationTable = {
			initializeData: jest.fn(),
			manageColumns: jest.fn(),
			afterDataLoaded: jest.fn(),
			paginatedData: new PaginatedData<InvitationDto>([], 10, 0),
		} as unknown as TableComponent<InvitationDto>;

		fixture.detectChanges();

		jest.spyOn(toastrService, 'success');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should update tabIndex when tabChanged is called', () => {
		const mockEvent: any = {
			index: 1,
			tab: {} as MatTab,
		};

		component.tabChanged(mockEvent);

		expect(component.tabIndex).toBe(1);
	});

	it('should count suppliers, requests and invitations on initialization', () => {
		component.ngOnInit();

		expect(component.suppliersCount).toBe(sampleCount);
		expect(component.requestsCount).toBe(sampleCount);
		expect(component.invitationsCount).toBe(sampleCount);
	});

	it('should set noDataTitle based on tabIndex', () => {
		component.tabIndex = 0;
		expect(component.noDataTitle).toBe('supplierList.welcome');
		component.tabIndex = 1;
		expect(component.noDataTitle).toBe('supplierRequests.noRequests');
		component.tabIndex = 2;
		expect(component.noDataTitle).toBe('invitations.welcome');
		component.tabIndex = 5;
		expect(component.noDataTitle).toBe('supplierList.welcome');
	});

	it('should set noDataDescription based on tabIndex', () => {
		component.tabIndex = 0;
		expect(component.noDataDescription).toBe('supplierList.noData');
		component.tabIndex = 1;
		expect(component.noDataDescription).toBe('supplierRequests.noData');
		component.tabIndex = 2;
		expect(component.noDataDescription).toBe('invitations.noData');
		component.tabIndex = 5;
		expect(component.noDataDescription).toBe('supplierList.noData');
	});

	it('should return true for shouldDisplaySuppliersTable when suppliersCount > 0', () => {
		component.suppliersCount = 5;
		expect(component.shouldDisplaySuppliersTable()).toBe(true);
	});

	it('should return true for shouldDisplayRequestsTable when requestsCount > 0', () => {
		component.requestsCount = 3;
		expect(component.shouldDisplayRequestsTable()).toBe(true);
	});

	it('should return true for shouldDisplayInvitationsTable when invitationsCount > 0', () => {
		component.invitationsCount = 3;
		expect(component.shouldDisplayInvitationsTable()).toBe(true);
	});

	it('should return true for shouldDisplayManageColumns when tabIndex is 0', () => {
		component.tabIndex = 0;
		expect(component.shouldDisplayManageColumns()).toBe(true);
	});

	it('should return false for shouldDisplayManageColumns when tabIndex is not 0', () => {
		component.tabIndex = 1;
		expect(component.shouldDisplayManageColumns()).toBe(false);
	});

	it('should return true for isFullSize when tabIndex is 0 and no suppliers', () => {
		component.tabIndex = 0;
		component.suppliersCount = 0;
		expect(component.isFullSize()).toBe(true);
	});

	it('should return true for isFullSize when tabIndex is 1 and no requests', () => {
		component.tabIndex = 1;
		component.requestsCount = 0;
		expect(component.isFullSize()).toBe(true);
	});

	it('should return true for isFullSize when tabIndex is 2 and no invitations', () => {
		component.tabIndex = 2;
		component.invitationsCount = 0;
		expect(component.isFullSize()).toBe(true);
	});

	it('should return false for isFullSize in other cases', () => {
		component.tabIndex = 0;
		component.suppliersCount = 5;
		expect(component.isFullSize()).toBe(false);

		component.tabIndex = 1;
		component.requestsCount = 3;
		expect(component.isFullSize()).toBe(false);
	});

	it('should change tabIndex on tabChanged', () => {
		const event = { index: 1 } as any;
		component.tabChanged(event);
		expect(component.tabIndex).toBe(1);
	});

	it('should call manageColumns on activeSuppliers', () => {
		const manageColumnsSpy = jest.spyOn(component.activeSuppliers, 'manageColumns');

		component.manageColumns();

		expect(manageColumnsSpy).toHaveBeenCalled();
	});

	it('should update suppliers number and show successful approval toast', () => {
		const data = 42;

		jest.spyOn(component as any, 'displaySuccessToaster');

		component.updateSuppliersNumber(data, SupplierStatus.APPROVED);

		expect(component.requestsCount).toBe(data);
		expect(component['displaySuccessToaster']).toHaveBeenCalledWith('suppliersApproval.successfulApproval');
	});

	it('should open the invite suppliers popup', () => {
		jest.spyOn(dialogService as any, 'message');

		component['openInviteSuppliersModal']();

		expect((dialogService as any).message).toHaveBeenCalledWith(InviteSuppliersComponent, {
			width: '736px',
			height: '664px',
			closeOnNavigation: false,
			disableClose: true,
		});
	});

	it('should recount invitations and show success toast if new invitations were sent', () => {
		const dialogRefMock = {
			afterClosed: () => of(true),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		jest.spyOn(component as any, 'getInvitationsCount');
		jest.spyOn(component as any, 'displaySuccessToaster');

		component['openInviteSuppliersModal']();

		expect(component['getInvitationsCount']).toHaveBeenCalled();
		expect(component['displaySuccessToaster']).toHaveBeenCalledWith('inviteSuppliers.sentSuccessfully');
	});

	it('should not recount the invitations if the dialog is dismissed without sending new ones', () => {
		const dialogRefMock = {
			afterClosed: () => of(null),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		jest.spyOn(component as any, 'getInvitationsCount');

		component['openInviteSuppliersModal']();

		expect(component['getInvitationsCount']).not.toHaveBeenCalled();
	});
});
