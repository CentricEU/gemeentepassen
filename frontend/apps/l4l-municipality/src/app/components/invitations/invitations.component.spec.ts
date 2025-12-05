import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionButtons, AuthService, ColumnDataType, Page, PaginatedData, TableColumn } from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, ToastrService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { InvitationDto } from '../../_models/invitation-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { AppModule } from '../../app.module';
import { InviteSuppliersComponent } from '../invite-suppliers/invite-suppliers.component';
import { InvitationsComponent } from './invitations.component';

describe('InvitationsComponent', () => {
	let component: InvitationsComponent;
	let fixture: ComponentFixture<InvitationsComponent>;
	let dialogService: DialogService;

	let supplierServiceSpy: any;
	let authServiceSpy: any;

	beforeEach(async () => {
		supplierServiceSpy = {
			getInvitations: jest.fn(),
		};

		authServiceSpy = {
			extractSupplierInformation: jest.fn(),
		};

		const environmentMock = {
			production: false,
			envName: 'dev',
			apiPath: '/api',
		};

		const dialogServiceMock = {
			message: jest.fn(),
		};

		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			imports: [HttpClientModule, WindmillModule, AppModule],
			declarations: [InvitationsComponent],
			providers: [
				{ provide: MunicipalitySupplierService, useValue: supplierServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: 'env', useValue: environmentMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				ToastrService,
				TranslateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(InvitationsComponent);
		component = fixture.componentInstance;
		supplierServiceSpy.getInvitations.mockReturnValue(of([]));
		dialogService = TestBed.inject(DialogService);

		component.invitationTable = {
			initializeData: jest.fn(),
			manageColumns: jest.fn(),
			afterDataLoaded: jest.fn(),
			paginatedData: new PaginatedData<InvitationDto>([], 10, 0),
		} as unknown as TableComponent<InvitationDto>;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize the table columns', () => {
		component.initializeColumns();

		const expectedColumns = [
			new TableColumn('general.email', 'email', 'email', true, true),
			new TableColumn('invitations.sendingDate', 'createdDate', 'createdDate', true, true),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];

		expect(component.allColumns).toEqual(expectedColumns);
	});

	it('should call supplierService.getInvitations if there is a tenant', () => {
		authServiceSpy.extractSupplierInformation.mockReturnValue('tenantId');
		component.invitationTable.paginatedData = new PaginatedData<InvitationDto>(Array(5).fill(new Page([])), 5, 0);
		component.loadData(component.invitationTable.paginatedData);

		expect(supplierServiceSpy.getInvitations).toHaveBeenCalledWith(
			component.invitationTable.paginatedData.currentIndex,
			component.invitationTable.paginatedData.pageSize,
		);
	});

	it('should not call supplierService.getInvitations if there is no tenant', () => {
		authServiceSpy.extractSupplierInformation.mockReturnValue(null);
		component.loadData(component.invitationTable.paginatedData);

		expect(supplierServiceSpy.getInvitations).toHaveBeenCalledTimes(0);
	});

	it('should update paginatedData and currentDisplayedPage after loading the data', () => {
		const mockInvitations = [
			new InvitationDto('test1@domain.com', new Date(), 'test1'),
			new InvitationDto('test2@domain.com', new Date(), 'test2'),
		];

		component.invitationTable.paginatedData = new PaginatedData<InvitationDto>(Array(5).fill(new Page([])), 5, 0);
		component.afterDataLoaded(mockInvitations);

		expect(component.invitationTable.paginatedData.pages[0].values.length).toEqual(mockInvitations.length);
		expect(component.invitationTable.currentDisplayedPage.length).toEqual(mockInvitations.length);
	});

	it('should open the invite supplier modal with the correct email when the resend button is pressed', () => {
		jest.spyOn(dialogService as any, 'message');

		const testEmail = 'test0@domain.com';
		const testAction = {
			actionButton: ActionButtons.envelopeSend,
			row: new InvitationDto(testEmail, '', ''),
		};

		component['onActionButtonClicked'](testAction);

		expect((dialogService as any).message).toHaveBeenCalledWith(InviteSuppliersComponent, {
			width: '736px',
			height: '664px',
			closeOnNavigation: false,
			disableClose: true,
			data: {
				email: testEmail,
			},
		});
	});

	it('should emit the count invitations event if new invites were sent', () => {
		const dialogRefMock = {
			afterClosed: () => of(true),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		jest.spyOn(component.countInvitationsEvent, 'emit');

		const testEmail = 'test0@domain.com';
		component['openResendInvitationModal'](testEmail);

		expect(component['countInvitationsEvent'].emit).toHaveBeenCalled();
	});

	it('should not emit the count invitations event if the dialog is dismissed without sending any new ones', () => {
		const dialogRefMock = {
			afterClosed: () => of(null),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		jest.spyOn(component.countInvitationsEvent, 'emit');

		const testEmail = 'test0@domain.com';
		component['openResendInvitationModal'](testEmail);

		expect(component['countInvitationsEvent'].emit).not.toHaveBeenCalled();
	});

	it('should reload the data when invitations are updated', () => {
		jest.spyOn(component.invitationTable as any, 'initializePaginatedDataBasedOnPageSize');
		jest.spyOn(component as any, 'loadData');

		component.updateInvitations();

		expect(component.invitationTable['initializePaginatedDataBasedOnPageSize']).toHaveBeenCalled();
		expect(component['loadData']).toHaveBeenCalled();
	});

	it('should not trigger an update when the invitations first load', () => {
		jest.spyOn(component as any, 'updateInvitations');

		const testChanges = {
			dataCount: {
				currentValue: 5,
				isFirstChange: () => true,
			},
		};

		component.ngOnChanges(testChanges as any);

		expect(component.updateInvitations).not.toHaveBeenCalled();
	});

	it('should trigger an update when the invitations count updates', () => {
		jest.spyOn(component as any, 'updateInvitations');

		const testChanges = {
			dataCount: {
				currentValue: 5,
				isFirstChange: () => false,
			},
		};

		component.ngOnChanges(testChanges as any);

		expect(component.updateInvitations).toHaveBeenCalled();
		expect(component.dataCount).toEqual(5);
	});

	it('should display the success toaster when an invitation was sent', () => {
		const dialogRefMock = {
			afterClosed: () => of(true),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		jest.spyOn(component['translateService'], 'instant');
		jest.spyOn(component['toastrService'], 'success');

		const testEmail = 'test0@domain.com';
		component['openResendInvitationModal'](testEmail);

		expect(component['translateService'].instant).toHaveBeenCalledWith('inviteSuppliers.sentSuccessfully');
		expect(component['toastrService'].success).toHaveBeenCalled();
	});
});
