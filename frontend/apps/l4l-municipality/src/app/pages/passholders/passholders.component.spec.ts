import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import {
	ColumnDataType,
	commonRoutingConstants,
	Page,
	PaginatedData,
	PassholderViewDto,
	TableColumn,
} from '@frontend/common';
import { CustomDialogComponent, TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { PassholdersService } from '../../_services/passholders.service';
import { AppModule } from '../../app.module';
import { ImportPassholdersComponent } from '../../components/import-passholders/import-passholders.component';
import { PassholdersComponent } from './passholders.component';

jest.mock('@angular/material/dialog');

describe('PassholdersComponent', () => {
	let component: PassholdersComponent;
	let fixture: ComponentFixture<PassholdersComponent>;
	let dialogService: DialogService;
	let passholdersServiceSpy: any;

	beforeEach(async () => {
		passholdersServiceSpy = {
			getPassholders: jest.fn(),
			countPassholders: jest.fn(),
			deletePassholder: jest.fn(),
		};

		global.structuredClone = jest.fn((val) => {
			return JSON.parse(JSON.stringify(val));
		});

		global.ResizeObserver = require('resize-observer-polyfill');

		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			alert: jest.fn(),
			afterClosed: jest.fn(() => of({})),
		};

		await TestBed.configureTestingModule({
			declarations: [PassholdersComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
			providers: [
				{ provide: PassholdersService, useValue: passholdersServiceSpy },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: MatDialog, useValue: {} },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(PassholdersComponent);
		component = fixture.componentInstance;
		passholdersServiceSpy.getPassholders.mockReturnValue(of([]));
		passholdersServiceSpy.countPassholders.mockReturnValue(of(0));
		passholdersServiceSpy.deletePassholder.mockReturnValue(of());
		dialogService = TestBed.inject(DialogService);

		component.passholdersTable = {
			initializeData: jest.fn(),
			manageColumns: jest.fn(),
			afterDataLoaded: jest.fn(),
			paginatedData: new PaginatedData<PassholderViewDto>([], 10, 0),
		} as unknown as TableComponent<PassholderViewDto>;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should manage columns on calling manageColumns', () => {
		component['dataCount'] = 2;
		component.passholdersTable = new TableComponent<PassholderViewDto>(dialogService);
		const manageColumnsSpy = jest.spyOn(component.passholdersTable, 'manageColumns');
		component.manageColumns();
		expect(manageColumnsSpy).toHaveBeenCalled();
	});

	it('should open the import passholders popup', () => {
		jest.spyOn(dialogService as any, 'message');

		component.openPassholdersModal();

		expect((dialogService as any).message).toHaveBeenCalledWith(ImportPassholdersComponent, {
			width: '524px',
			closeOnNavigation: false,
		});
	});

	it('should call service on countPassholders', () => {
		component['countPassholders']();
		expect(passholdersServiceSpy.countPassholders).toHaveBeenCalledWith();
	});

	it('should not call initializeComponentData when passholders count = 0', () => {
		jest.spyOn(component, 'initializeComponentData');
		component['countPassholders']();
		expect(passholdersServiceSpy.countPassholders).toHaveBeenCalledWith();
		expect(component.initializeComponentData).not.toHaveBeenCalled();
	});

	it('should call initializeComponentData when passholders count > 0', () => {
		jest.spyOn(component, 'initializeComponentData');
		passholdersServiceSpy.countPassholders.mockReturnValue(of(2));

		component['countPassholders']();

		expect(passholdersServiceSpy.countPassholders).toHaveBeenCalledWith();
		expect(component.initializeComponentData).toHaveBeenCalled();
	});

	it('should initialize columns', () => {
		component.initializeColumns();
		const expectedColumns: TableColumn[] = [
			new TableColumn('general.name', 'name', 'name', true, true),
			new TableColumn('general.bsn', 'bsn', 'bsn', true, false),
			new TableColumn('general.address', 'address', 'address', true, false),
			new TableColumn('general.residenceCity', 'residenceCity', 'residenceCity', true, false),
			new TableColumn('general.expiringDate', 'expiringDate', 'expiringDate', true, false, ColumnDataType.DATE),
			new TableColumn('general.passNumber', 'passNumber', 'passNumber', true, true),
			new TableColumn('general.citizenGroup', 'citizenGroupName', 'citizenGroupName', true, false),
			new TableColumn(
				'general.registered',
				'isRegistered',
				'isRegistered',
				true,
				false,
				ColumnDataType.REGISTERED,
			),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];

		expect(component.allColumns).toEqual(expectedColumns);
	});

	it('should call service on getPassholders', () => {
		const pages: Page<PassholderViewDto>[] = Array.from({ length: 5 }, () => new Page([]));

		component['dataCount'] = 1;
		component.passholdersTable = new TableComponent<PassholderViewDto>(dialogService);
		component.passholdersTable.paginatedData = new PaginatedData<PassholderViewDto>(pages, 10, 0);
		component.loadData(component.passholdersTable.paginatedData);
		expect(passholdersServiceSpy.getPassholders).toHaveBeenCalledWith(
			component.passholdersTable.paginatedData.currentIndex,
			component.passholdersTable.paginatedData.pageSize,
		);
	});

	describe('Tests for after dialog close ', () => {
		const dialogRefMock = { afterClosed: () => of(true) };

		it('should call dialogService.message on openApprovedModal and not do anything if dismissed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(false));
			component['countPassholders'] = jest.fn();

			component.openPassholdersModal();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['countPassholders']).not.toHaveBeenCalled();
		});

		it('should call dialogService.message on openApprovedModal and recount if confirmed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));

			component.passholdersTable = {
				deselectAllCheckboxes: jest.fn(),
			} as any;

			component['countPassholders'] = jest.fn();

			component.openPassholdersModal();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['countPassholders']).toHaveBeenCalled();
		});
	});

	describe('Tests for isDataExisting ', () => {
		it('should return true if listLength > 0', () => {
			component['dataCount'] = 1; // Set the listLength to a positive value for the test

			const result = component.isDataExisting;

			expect(result).toBeTruthy();
		});

		it('should return false if listLength is 0', () => {
			component['dataCount'] = 0;
			const result = component.isDataExisting;
			expect(result).toBeFalsy();
		});

		it('should return false if listLength is less than 0', () => {
			component['dataCount'] = -1;

			const result = component.isDataExisting;

			expect(result).toBeFalsy();
		});
	});

	it('should not throw errors when called with valid arguments', () => {
		const mockRow: PassholderViewDto = {
			id: 'mockId',
			name: 'name',
			bsn: 'bsn',
			address: 'test',
			passNumber: '3423232',
			residenceCity: 'Gouda',
			expiringDate: new Date(),
			citizenGroupName: 'groupName',
			selected: false,
			isCheckboxDisabled: false,
		};

		const mockAction = {
			actionButton: 'someActionButton',
			row: mockRow,
		};

		expect(() => component.onActionButtonClicked(mockAction)).not.toThrow();
	});

	it('should open delete popup and remove entry when click on delete button', () => {
		const dialogRefMock = {
			afterClosed: () => of(true),
			close: jest.fn(),
		};

		const dialogServiceSpy = jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);

		component['openDialogDelete']('testId');

		expect(dialogServiceSpy).toHaveBeenCalledWith(CustomDialogComponent, {
			autoFocus: true,
			data: {
				acceptButtonText: 'general.button.delete',
				acceptButtonType: 'high-emphasis-danger',
				cancelButtonText: 'general.button.cancel',
				cancelButtonType: 'ghost-greyscale',
				comments: '',
				disableClosing: false,
				fileName: '',
				mainContent: '',
				modalTypeClass: 'danger',
				optionalText: {
					comments: '-',
					email: '',
					reason: '',
					tenantName: '',
				},
				secondaryContent: 'passholders.delete.content',
				title: 'passholders.delete.title',
				tooltipColor: 'danger',
			},
			disableClose: false,
			width: '400px',
		});
	});

	it('should create correct warning dialog configuration', () => {
		const expectedConfig = {
			autoFocus: true,
			data: {
				acceptButtonText: 'general.button.delete',
				acceptButtonType: 'high-emphasis-danger',
				cancelButtonText: 'general.button.cancel',
				cancelButtonType: 'ghost-greyscale',
				comments: '',
				disableClosing: false,
				fileName: '',
				mainContent: '',
				modalTypeClass: 'danger',
				optionalText: {
					comments: '-',
					email: '',
					reason: '',
					tenantName: '',
				},
				secondaryContent: 'passholders.delete.content',
				title: 'passholders.delete.title',
				tooltipColor: 'danger',
			},
			disableClose: false,
			width: '400px',
		};

		const config = component['createWarningDialogConfig']();

		expect(config).toEqual(expectedConfig);
	});

	it('should call dialogService alert on openDialogDelete', () => {
		const dialogRefMock = {
			afterClosed: () => of(true),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);
		jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
		component['countPassholders'] = jest.fn();

		component['openDialogDelete']('testId');
		expect(dialogService['alert']).toHaveBeenCalled();
		expect(passholdersServiceSpy.deletePassholder).toHaveBeenCalledWith('testId');
	});

	it('should not call dialogService alert when the return is false', () => {
		const dialogRefMock = {
			afterClosed: () => of(true),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);
		jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(false));

		component['openDialogDelete']('testId');
		expect(dialogService['alert']).toHaveBeenCalled();
		expect(passholdersServiceSpy.deletePassholder).not.toHaveBeenCalled();
	});

	describe('Tests for onGetSelectedItemsNumber ', () => {
		it('should set isMultipleSelect to true when count is greater than 0', () => {
			component.onGetSelectedItemsNumber(5);
			expect(component.isMultipleSelect).toBe(true);
		});

		it('should set isMultipleSelect to false when count is 0', () => {
			component.onGetSelectedItemsNumber(0);
			expect(component.isMultipleSelect).toBe(false);
		});

		it('should set isMultipleSelect to false when count is less than 0', () => {
			component.onGetSelectedItemsNumber(-1);
			expect(component.isMultipleSelect).toBe(false);
		});
	});

	it('should open delete popup and delete passholder on confirmation', () => {
		const passholderId = 'testId';
		const dialogRefMock = {
			afterClosed: () => of(true),
		};

		jest.spyOn(dialogService, 'alert').mockReturnValue(dialogRefMock as any);

		jest.spyOn(passholdersServiceSpy, 'deletePassholder').mockReturnValue(of({}));

		const toastrSuccessSpy = jest.spyOn(component['toastrService'], 'success');

		component['openDialogDelete'](passholderId);

		expect(dialogService.alert).toHaveBeenCalled();

		dialogRefMock.afterClosed().subscribe(() => {
			expect(passholdersServiceSpy.deletePassholder).toHaveBeenCalledWith(passholderId);
			expect(toastrSuccessSpy).toHaveBeenCalledWith('passholders.successDelete', '', {
				toastBackground: 'toast-light',
			});
		});
	});

	describe('getCitizenGroupsCount', () => {
		it('should set showCreateCitizenGroupState to false when count is greater than 0', () => {
			const mockCitizenGroupsService = component['citizenGroupsService'];
			jest.spyOn(mockCitizenGroupsService, 'countCitizenGroups').mockReturnValue({
				subscribe: (callback: (count: number) => void) => callback(5),
			} as any);

			component.showCreateCitizenGroupState = true;
			(component as any).getCitizenGroupsCount();

			expect(component.showCreateCitizenGroupState).toBe(false);
		});

		it('should not change showCreateCitizenGroupState when count is 0', () => {
			const mockCitizenGroupsService = component['citizenGroupsService'];
			jest.spyOn(mockCitizenGroupsService, 'countCitizenGroups').mockReturnValue({
				subscribe: (callback: (count: number) => void) => callback(0),
			} as any);

			component.showCreateCitizenGroupState = true;
			(component as any).getCitizenGroupsCount();

			expect(component.showCreateCitizenGroupState).toBe(true);
		});
	});

	it('should navigate to profile page when goToProfilePage is called', () => {
		const navigateSpy = jest.spyOn(component['router'], 'navigate');
		component.goToProfilePage();
		expect(navigateSpy).toHaveBeenCalledWith([commonRoutingConstants.profile]);
	});
});
