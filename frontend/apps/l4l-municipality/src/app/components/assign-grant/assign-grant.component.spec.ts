import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
	AssignPassholderGrants,
	ColumnDataType,
	GrantDto,
	GrantHolder,
	GrantService,
	PassholderViewDto,
	TableColumn,
} from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { PassholdersService } from '../../_services/passholders.service';
import { AppModule } from '../../app.module';
import { AssignGrantComponent } from './assign-grant.component';

describe('AssignGrantComponent', () => {
	let component: AssignGrantComponent;
	let fixture: ComponentFixture<AssignGrantComponent>;

	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };
	let grantServiceMock: any;
	let passholdersServiceMock: any;
	let dialogService: DialogService;

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		const mockDialogData = {};

		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			afterClosed: jest.fn(() => of({})),
		};

		grantServiceMock = {
			getAllGrants: jest.fn().mockReturnValue(of([])),
		};

		passholdersServiceMock = {
			updatePassholder: jest.fn().mockReturnValue(of()),
			assignGrants: jest.fn().mockReturnValue(of()),
		};
		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			imports: [WindmillModule, AppModule],
			declarations: [AssignGrantComponent],
			providers: [
				TranslateService,
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: MAT_DIALOG_DATA, useValue: mockDialogData },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: PassholdersService, useValue: passholdersServiceMock },
				{ provide: GrantService, useValue: grantServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(AssignGrantComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);

		component.assignGrantTable = new TableComponent<GrantDto>(dialogService);
		component['dataCount'] = 0;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close dialog on close', () => {
		jest.spyOn(dialogRefStub, 'close');
		component.performClose();
		expect(dialogRefStub.close).toHaveBeenCalled();
	});

	it('should save grants and update passholder', () => {
		component.assignGrantTable.currentDisplayedPage = [
			new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date()),
			new GrantDto('id2', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date()),
		];
		component.passholderObjects = [
			new PassholderViewDto('testId', 'testAddr', 'name', 'bsn', 'number', 'residence', new Date()),
		];
		jest.spyOn(component, 'performClose');
		jest.spyOn(passholdersServiceMock, 'updatePassholder').mockReturnValue(of({}));

		component.saveGrants();
		expect(passholdersServiceMock.updatePassholder).toHaveBeenCalledWith(component.passholderObjects[0]);
		expect(component.performClose).toHaveBeenCalled();
	});

	it('should initialize columns', () => {
		component['initializeColumns']();
		const expectedColumns: TableColumn[] = [
			new TableColumn('checkbox', 'checkbox', 'checkbox', true, true, ColumnDataType.DEFAULT, true),
			new TableColumn('passholders.grantName', 'title', 'title', true, false),
			new TableColumn('passholders.amoungGranted', 'amount', 'amount', true, false, ColumnDataType.CURRENCY),
			new TableColumn('grants.beneficiaries', 'createFor', 'createFor', true, false),
		];
		expect(component.allColumns).toEqual(expectedColumns);
	});

	it('should initialize selected state based on passholder grants', () => {
		const grant1 = new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());
		const grant2 = new GrantDto('id2', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());
		const grant3 = new GrantDto('id3', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());

		component.passholderObjects = [
			new PassholderViewDto('testId', 'testAddr', 'name', 'bsn', 'number', 'residence', new Date()),
		];
		component.passholderObjects[0].grants = [grant1, grant3];
		component.assignGrantTable.currentDisplayedPage = [grant1, grant2, grant3];

		component['initializeSelectedState'](component.passholderObjects[0]);

		expect(grant1.selected).toBe(true);
		expect(grant2.selected).toBe(false);
		expect(grant3.selected).toBe(true);
	});

	it('should handle empty passholder grants', () => {
		const grant1 = new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());
		const grant2 = new GrantDto('id2', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());
		const grant3 = new GrantDto('id3', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());

		component.passholderObjects = [
			new PassholderViewDto('testId', 'testAddr', 'name', 'bsn', 'number', 'residence', new Date()),
		];
		component.passholderObjects[0].grants = [];
		component.assignGrantTable.currentDisplayedPage = [grant1, grant2, grant3];

		component['initializeSelectedState'](component.passholderObjects[0]);

		expect(grant1.selected).toBe(false);
		expect(grant2.selected).toBe(false);
		expect(grant3.selected).toBe(false);
	});

	it('should not call openWarningModal and should call performClose when hasUpdates is undefined', () => {
		component['openWarningModal'] = jest.fn();
		component['performClose'] = jest.fn();

		component.closePopup();
		expect(component['openWarningModal']).not.toHaveBeenCalled();
		expect(component['performClose']).toHaveBeenCalled();
	});

	it('should call performClose when hasUpdates is false', () => {
		jest.spyOn(component, 'performClose');
		component.hasUpdates = false;

		component.closePopup();

		expect(component.performClose).toHaveBeenCalled();
	});

	it('should call openWarningModal when hasUpdates is true', () => {
		component['openWarningModal'] = jest.fn();

		jest.spyOn(component, 'performClose');
		component.hasUpdates = true;

		component.closePopup();

		expect(component['openWarningModal']).toHaveBeenCalled();
		expect(component.performClose).not.toHaveBeenCalled();
	});

	it('should update hasUpdates to true when value is true', () => {
		const value = true;
		component.onCheckboxClicked(value);
		expect(component.hasUpdates).toBe(true);
	});

	it('should update hasUpdates to false when value is false', () => {
		const value = false;
		component.onCheckboxClicked(value);
		expect(component.hasUpdates).toBe(false);
	});

	it('should create correct warning dialog configuration', () => {
		const expectedConfig = {
			autoFocus: true,
			data: {
				acceptButtonText: 'general.button.cancel',
				acceptButtonType: 'button-warning',
				cancelButtonText: 'general.button.stay',
				cancelButtonType: 'button-link-dark',
				comments: '',
				disableClosing: false,
				fileName: '',
				mainContent: '',
				modalTypeClass: 'warning',
				optionalText: {
					comments: '-',
					email: '',
					reason: '',
					tenantName: '',
				},
				secondaryContent: 'grants.warningMessage',
				title: 'grants.assigning',
				tooltipColor: 'theme',
			},
			disableClose: false,
			width: '600px',
		};

		const config = component['createWarningDialogConfig']();

		expect(config).toEqual(expectedConfig);
	});

	describe('Tests for after dialog close ', () => {
		const dialogRefMock = { afterClosed: () => of(true) };

		it('should not call dialogService.afterClosed on openWarningModal', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(undefined);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
			component['performClose'] = jest.fn();

			component['openWarningModal']();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(dialogRefMock.afterClosed).not.toHaveBeenCalled();
		});

		it('should call dialogService.message on openWarningModal', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
			component['performClose'] = jest.fn();

			component['openWarningModal']();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['performClose']).toHaveBeenCalled();
		});

		it('should not call performClose on openWarningModal', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(false));
			component['performClose'] = jest.fn();

			component['openWarningModal']();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['performClose']).not.toHaveBeenCalled();
		});
	});

	describe('Tests for assign passholder grants', () => {
		it('should assign passholder grants and set hasUpdates to true on success', () => {
			const grant1 = new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());
			const grant2 = new GrantDto('id2', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());
			const selectedGrants: GrantDto[] = [grant1, grant2];

			component.passholderObjects = [
				new PassholderViewDto('testId', 'testAddr', 'name', 'bsn', 'number', 'residence', new Date()),
			];

			const expectedAssignPassholderGrants = new AssignPassholderGrants(['testId'], ['id1', 'id2']);

			component['assignPassholderGrants'](selectedGrants);

			expect(passholdersServiceMock.assignGrants).toHaveBeenCalledWith(expectedAssignPassholderGrants);
			expect(passholdersServiceMock.assignGrants).toHaveBeenCalledTimes(1);

			passholdersServiceMock.assignGrants().subscribe(() => {
				expect(component['closeModal']).toHaveBeenCalled();
				expect(component.hasUpdates).toBe(true);
				jest.spyOn(component, 'performClose');
				component['assignPassholderGrants'](selectedGrants);
				expect(component.performClose).toHaveBeenCalled();
			});
		});
	});

	describe('Tests for update passholder', () => {
		it('should update passholder grants and set hasUpdates to true on success', () => {
			const grant1 = new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());
			const grant2 = new GrantDto('id2', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());

			const selectedGrants: GrantDto[] = [grant1, grant2];
			component.passholderObjects = [
				new PassholderViewDto('testId', 'testAddr', 'name', 'bsn', 'number', 'residence', new Date()),
			];

			const expectedPassholder = {
				...component.passholderObjects[0],
				grants: selectedGrants,
			};

			component['updatePassholder'](selectedGrants);

			expect(component.passholderObjects[0].grants).toEqual(selectedGrants);
			expect(passholdersServiceMock.updatePassholder).toHaveBeenCalledWith(expectedPassholder);
			expect(passholdersServiceMock.updatePassholder).toHaveBeenCalledTimes(1);

			passholdersServiceMock.updatePassholder().subscribe(() => {
				expect(component['closeModal']).toHaveBeenCalled();
				expect(component.hasUpdates).toBe(true);
				jest.spyOn(component, 'performClose');
				component['updatePassholder'](selectedGrants);
				expect(component.performClose).toHaveBeenCalled();
			});
		});
	});

	describe('Tests for load grants', () => {
		it('should call get all grants when multiple assign is true', () => {
			const passholder1 = new PassholderViewDto(
				'testId',
				'testAddr',
				'name',
				'bsn',
				'number',
				'residence',
				new Date(),
			);
			component.passholderObjects = [passholder1];

			const initializeSelectedStateSpy = jest.spyOn(component as any, 'initializeSelectedState');

			component['data'].isMultipleAssign = false;

			component['loadGrants']();

			expect(grantServiceMock.getAllGrants).toHaveBeenCalled();
			expect(initializeSelectedStateSpy).toHaveBeenCalled();
		});

		it('should not call get all grants when multiple assign is true', () => {
			const initializeSelectedStateSpy = jest.spyOn(component as any, 'initializeSelectedState');

			component['data'].isMultipleAssign = true;

			component['loadGrants']();

			expect(grantServiceMock.getAllGrants).toHaveBeenCalled();
			expect(initializeSelectedStateSpy).not.toHaveBeenCalled();
		});
	});

	describe('Tests for save grants', () => {
		it('should call assignPassholderGrants when isMultipleAssign is true', () => {
			component.passholderObjects = [
				new PassholderViewDto('testId', 'testAddr', 'name', 'bsn', 'number', 'residence', new Date()),
			];
			const grant1 = new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());

			component['data'].isMultipleAssign = true;
			component.assignGrantTable.currentDisplayedPage = [grant1];

			component.saveGrants();

			expect(passholdersServiceMock.assignGrants).toHaveBeenCalledWith({
				grantsIds: [],
				passholderIds: ['testId'],
			});
			expect(passholdersServiceMock.assignGrants).toHaveBeenCalledTimes(1);
			expect(passholdersServiceMock.updatePassholder).not.toHaveBeenCalled();
		});

		it('should call updatePassholder when isMultipleAssign is false', () => {
			component.passholderObjects = [
				new PassholderViewDto('testId', 'testAddr', 'name', 'bsn', 'number', 'residence', new Date()),
			];
			const grant1 = new GrantDto('id1', 'title', 'desc', 123, GrantHolder.PASS_CHILD, new Date(), new Date());
			component['data'].isMultipleAssign = false;
			component.assignGrantTable.currentDisplayedPage = [grant1];

			component.saveGrants();

			expect(passholdersServiceMock.updatePassholder).toHaveBeenCalledWith(component.passholderObjects[0]);
			expect(passholdersServiceMock.updatePassholder).toHaveBeenCalledTimes(1);
			expect(passholdersServiceMock.assignGrants).not.toHaveBeenCalled();
		});
	});
});
