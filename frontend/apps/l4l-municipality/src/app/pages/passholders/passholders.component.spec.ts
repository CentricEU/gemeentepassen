/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import {
	ActionButtons,
	ColumnDataType,
	commonRoutingConstants,
	Page,
	PaginatedData,
	PassholderViewDto,
	TableColumn,
} from '@frontend/common';
import { CustomDialogComponent, TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
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
	let elementRef: ElementRef;

	beforeEach(async () => {
		passholdersServiceSpy = {
			countFilteredPassholders: jest.fn(),
			getFilteredPassholders: jest.fn(),
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
				{ provide: ElementRef, useValue: { nativeElement: document.createElement('div') } },
				{ provide: MatDialog, useValue: {} },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(PassholdersComponent);
		component = fixture.componentInstance;
		passholdersServiceSpy.getFilteredPassholders.mockReturnValue(of([]));
		passholdersServiceSpy.countFilteredPassholders.mockReturnValue(of(0));
		passholdersServiceSpy.deletePassholder.mockReturnValue(of());
		dialogService = TestBed.inject(DialogService);
		elementRef = TestBed.inject(ElementRef);

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
		component.passholdersTable = new TableComponent<PassholderViewDto>(dialogService, elementRef);
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

	it('should call service on countFilteredPassholders', () => {
		component['countFilteredPassholders']();
		expect(passholdersServiceSpy.countFilteredPassholders).toHaveBeenCalled();
	});

	it('should not call initializeComponentData when passholders count = 0', () => {
		jest.spyOn(component, 'initializeComponentData');
		component['countFilteredPassholders']();
		expect(passholdersServiceSpy.countFilteredPassholders).toHaveBeenCalled();
		expect(component.initializeComponentData).not.toHaveBeenCalled();
	});

	it('should call initializeComponentData when passholders count > 0', () => {
		jest.spyOn(component, 'initializeComponentData');
		passholdersServiceSpy.countFilteredPassholders.mockReturnValue(of(2));

		component['countFilteredPassholders'](true);

		expect(passholdersServiceSpy.countFilteredPassholders).toHaveBeenCalled();
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

	it('should call service on getFilteredPassholders', () => {
		const pages: Page<PassholderViewDto>[] = Array.from({ length: 5 }, () => new Page([]));

		component['dataCount'] = 1;
		component.passholdersTable = new TableComponent<PassholderViewDto>(dialogService, elementRef);
		component.passholdersTable.paginatedData = new PaginatedData<PassholderViewDto>(pages, 10, 0);
		component.loadData(component.passholdersTable.paginatedData);
		expect(passholdersServiceSpy.getFilteredPassholders).toHaveBeenCalledWith(
			undefined,
			component.passholdersTable.paginatedData.currentIndex,
			component.passholdersTable.paginatedData.pageSize,
		);
	});

	describe('Tests for after dialog close ', () => {
		const dialogRefMock = { afterClosed: () => of(true) };

		it('should call dialogService.message on openApprovedModal and not do anything if dismissed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(false));
			component['countFilteredPassholders'] = jest.fn();

			component.openPassholdersModal();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['countFilteredPassholders']).not.toHaveBeenCalled();
		});

		it('should call dialogService.message on openApprovedModal and recount if confirmed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));

			component.passholdersTable = {
				deselectAllCheckboxes: jest.fn(),
			} as any;

			component['countFilteredPassholders'] = jest.fn();

			component.openPassholdersModal();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['countFilteredPassholders']).toHaveBeenCalled();
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
		component['countFilteredPassholders'] = jest.fn();

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
			expect(component['countFilteredPassholders']).toHaveBeenCalled();
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

	it('should navigate to passholder details page', () => {
		const passholderId = 'abc123';

		const navigateSpy = jest.spyOn(component['router'], 'navigateByUrl');
		(component as any).navigateToPassholderDetails(passholderId);
		expect(navigateSpy).toHaveBeenCalledWith(`${commonRoutingConstants.passholders}/${passholderId}`);
	});

	describe('areFiltersApplied', () => {
		it('should return true when filters are applied', () => {
			component.passholdersTable = {
				areFiltersApplied: jest.fn().mockReturnValue(true),
			} as any;

			expect(component.areFiltersApplied).toBe(true);
			expect(component.passholdersTable.areFiltersApplied).toHaveBeenCalled();
		});

		it('should return false when filters are not applied', () => {
			component.passholdersTable = {
				areFiltersApplied: jest.fn().mockReturnValue(false),
			} as any;

			expect(component.areFiltersApplied).toBe(false);
			expect(component.passholdersTable.areFiltersApplied).toHaveBeenCalled();
		});

		it('should return undefined when passholdersTable is not initialized', () => {
			component.passholdersTable = undefined as any;

			expect(component.areFiltersApplied).toBeUndefined();
		});
	});

	describe('paginatedData', () => {
		it('should return paginatedData from passholdersTable', () => {
			const mockPaginatedData = new PaginatedData<PassholderViewDto>([], 10, 0);
			component.passholdersTable = {
				paginatedData: mockPaginatedData,
			} as any;

			expect(component.paginatedData).toBe(mockPaginatedData);
		});

		it('should return undefined when passholdersTable is not initialized', () => {
			component.passholdersTable = undefined as any;

			expect(component.paginatedData).toBeUndefined();
		});
	});

	describe('onApplyFilters', () => {
		it('should reset page content and index when isFirstFiltering is true', () => {
			const mockFilters = { bsnFilter: '123456789', passholderNumberFilter: 'PH001' };
			const mockData = [{ id: '1', name: 'Test' }] as PassholderViewDto[];

			component.passholdersTable = {
				paginatedData: new PaginatedData<PassholderViewDto>([], 10, 5),
				resetPageContent: jest.fn(),
				deselectAllCheckboxes: jest.fn(),
				filterFormGroup: { value: mockFilters },
			} as any;

			passholdersServiceSpy.getFilteredPassholders.mockReturnValue(of(mockData));

			component.onApplyFilters(mockFilters, true);

			expect(component.passholdersTable.paginatedData.currentIndex).toBe(0);
			expect(component.passholdersTable.resetPageContent).toHaveBeenCalled();
			expect(component.passholdersTable.deselectAllCheckboxes).toHaveBeenCalled();
		});

		it('should not reset page content when isFirstFiltering is false', () => {
			const mockFilters = { bsnFilter: '123456789', passholderNumberFilter: 'PH001' };
			const mockData = [{ id: '1', name: 'Test' }] as PassholderViewDto[];

			component.passholdersTable = {
				paginatedData: new PaginatedData<PassholderViewDto>([], 10, 5),
				resetPageContent: jest.fn(),
				deselectAllCheckboxes: jest.fn(),
				filterFormGroup: { value: mockFilters },
			} as any;

			passholdersServiceSpy.getFilteredPassholders.mockReturnValue(of(mockData));

			component.onApplyFilters(mockFilters, false);

			expect(component.passholdersTable.paginatedData.currentIndex).toBe(5);
			expect(component.passholdersTable.resetPageContent).not.toHaveBeenCalled();
			expect(component.passholdersTable.deselectAllCheckboxes).toHaveBeenCalled();
		});

		it('should call getFilteredPassholders with correct parameters', () => {
			const mockFilters = { bsnFilter: '123456789', passholderNumberFilter: 'PH001' };
			const mockData = [{ id: '1', name: 'Test' }] as PassholderViewDto[];

			component.passholdersTable = {
				paginatedData: new PaginatedData<PassholderViewDto>([], 10, 2),
				resetPageContent: jest.fn(),
				deselectAllCheckboxes: jest.fn(),
				filterFormGroup: { value: mockFilters },
			} as any;

			passholdersServiceSpy.getFilteredPassholders.mockReturnValue(of(mockData));

			component.onApplyFilters(mockFilters, false);

			expect(passholdersServiceSpy.getFilteredPassholders).toHaveBeenCalledWith(
				expect.objectContaining({
					bsnFilter: '123456789',
					passholderNumberFilter: 'PH001',
				}),
				2,
				10,
			);
		});

		it('should call afterDataLoaded and countFilteredPassholders after successful filter', () => {
			const mockFilters = { bsnFilter: '123456789', passholderNumberFilter: 'PH001' };
			const mockData = [{ id: '1', name: 'Test' }] as PassholderViewDto[];

			component.passholdersTable = {
				paginatedData: new PaginatedData<PassholderViewDto>([], 10, 0),
				resetPageContent: jest.fn(),
				deselectAllCheckboxes: jest.fn(),
				afterDataLoaded: jest.fn(),
				filterFormGroup: { value: mockFilters },
			} as any;

			jest.spyOn(component, 'afterDataLoaded');
			component['countFilteredPassholders'] = jest.fn();
			passholdersServiceSpy.getFilteredPassholders.mockReturnValue(of(mockData));

			component.onApplyFilters(mockFilters, true);

			expect(component.afterDataLoaded).toHaveBeenCalledWith(mockData);
			expect(component['countFilteredPassholders']).toHaveBeenCalled();
		});
	});

	describe('clearFilters', () => {
		it('should call clearFilters on passholdersTable', () => {
			component.passholdersTable = {
				clearFilters: jest.fn(),
			} as any;

			component.clearFilters();

			expect(component.passholdersTable.clearFilters).toHaveBeenCalled();
		});
	});

	describe('loadData', () => {
		it('should call onApplyFilters when filterDto exists', () => {
			const mockFilters = { bsnFilter: '123456789', passholderNumberFilter: 'PH001' };
			const mockEvent = new PaginatedData<PassholderViewDto>([], 10, 2);

			component.filterDto = { bsnFilter: '123456789', passholderNumberFilter: 'PH001' } as any;
			component.passholdersTable = {
				filterFormGroup: { value: mockFilters },
				paginatedData: mockEvent,
				deselectAllCheckboxes: jest.fn(),
			} as any;

			jest.spyOn(component, 'onApplyFilters');

			component.loadData(mockEvent);

			expect(component.onApplyFilters).toHaveBeenCalledWith(mockFilters, false);
		});

		it('should call getFilteredPassholders when filterDto does not exist', () => {
			const mockEvent = new PaginatedData<PassholderViewDto>([], 10, 2);
			const mockData = [{ id: '1', name: 'Test' }] as PassholderViewDto[];

			component.filterDto = undefined as any;
			passholdersServiceSpy.getFilteredPassholders.mockReturnValue(of(mockData));
			jest.spyOn(component, 'afterDataLoaded');

			component.loadData(mockEvent);

			expect(passholdersServiceSpy.getFilteredPassholders).toHaveBeenCalledWith(
				undefined,
				mockEvent.currentIndex,
				mockEvent.pageSize,
			);
			expect(component.afterDataLoaded).toHaveBeenCalledWith(mockData);
		});

		it('should not call getFilteredPassholders when filterDto exists', () => {
			const mockFilters = { bsnFilter: '123456789', passholderNumberFilter: 'PH001' };
			const mockEvent = new PaginatedData<PassholderViewDto>([], 10, 2);

			component.filterDto = { bsnFilter: '123456789', passholderNumberFilter: 'PH001' } as any;
			component.passholdersTable = {
				filterFormGroup: { value: mockFilters },
				paginatedData: mockEvent,
				deselectAllCheckboxes: jest.fn(),
			} as any;

			jest.spyOn(component, 'onApplyFilters').mockImplementation(jest.fn());

			component.loadData(mockEvent);

			expect(passholdersServiceSpy.getFilteredPassholders).not.toHaveBeenCalled();
		});
	});

	describe('onActionButtonClicked', () => {
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

		it('should call openDialogDelete when action is trashIcon', () => {
			const spy = jest.spyOn(component as any, 'openDialogDelete').mockImplementation();
			component.onActionButtonClicked({ actionButton: ActionButtons.trashIcon, row: mockRow });
			expect(spy).toHaveBeenCalledWith(mockRow.id);
		});

		it('should call navigateToPassholderDetails when action is visibilityIcon', () => {
			const spy = jest.spyOn(component as any, 'navigateToPassholderDetails').mockImplementation();
			component.onActionButtonClicked({ actionButton: ActionButtons.visibilityIcon, row: mockRow });
			expect(spy).toHaveBeenCalledWith(mockRow.id);
		});
	});
});
