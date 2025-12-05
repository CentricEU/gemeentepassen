import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	ActionButtons,
	ColumnDataType,
	GrantDto,
	GrantHolder,
	GrantService,
	Page,
	PaginatedData,
	TableColumn,
} from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { AppModule } from '../../../app.module';
import { CreateGrantComponent } from '../../../components/create-grant/create-grant/create-grant.component';
import { GrantsComponent } from './grants.component';

describe('GrantsComponent', () => {
	let component: GrantsComponent;
	let fixture: ComponentFixture<GrantsComponent>;
	let dialogService: DialogService;
	let grantServiceSpy: any;

	beforeEach(async () => {
		grantServiceSpy = {
			getGrantsPaginated: jest.fn(),
			countGrants: jest.fn(),
		};

		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			afterClosed: jest.fn(() => of({})),
		};
		await TestBed.configureTestingModule({
			declarations: [GrantsComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
			providers: [
				{ provide: GrantService, useValue: grantServiceSpy },
				{ provide: DialogService, useValue: dialogServiceMock },
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(GrantsComponent);
		component = fixture.componentInstance;
		grantServiceSpy.getGrantsPaginated.mockReturnValue(of([]));
		grantServiceSpy.countGrants.mockReturnValue(of(0));
		dialogService = TestBed.inject(DialogService);

		component.grantsTable = {
			initializeData: jest.fn(),
			manageColumns: jest.fn(),
			afterDataLoaded: jest.fn(),
			paginatedData: new PaginatedData<GrantDto>([], 10, 0),
			getSelectedElements: jest.fn(),
		} as unknown as TableComponent<GrantDto>;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open the import grants popup', () => {
		jest.spyOn(dialogService as any, 'message');

		component.openModal();

		expect((dialogService as any).message).toHaveBeenCalledWith(CreateGrantComponent, {
			width: '55%',
			closeOnNavigation: false,
			disableClose: true,
			data: undefined,
		});
	});

	it('should call service on getGrantsCount', () => {
		component['getGrantsCount']();
		expect(grantServiceSpy.countGrants).toHaveBeenCalledWith();
	});

	it('should not call initializeComponentData when grants count = 0', () => {
		jest.spyOn(component, 'initializeComponentData');
		component['getGrantsCount']();
		expect(grantServiceSpy.countGrants).toHaveBeenCalledWith();
		expect(component.initializeComponentData).not.toHaveBeenCalled();
	});

	it('should call initializeComponentData when grants count > 0', () => {
		jest.spyOn(component, 'initializeComponentData');
		grantServiceSpy.countGrants.mockReturnValue(of(2));

		component['getGrantsCount']();

		expect(grantServiceSpy.countGrants).toHaveBeenCalledWith();
		expect(component.initializeComponentData).toHaveBeenCalled();
	});

	it('should initialize columns', () => {
		component.initializeColumns();
		const expectedColumns: TableColumn[] = [
			new TableColumn('checkbox', 'checkbox', 'checkbox', true, true, ColumnDataType.DEFAULT, true),
			new TableColumn('general.name', 'title', 'title', true, false),
			new TableColumn('general.description', 'description', 'description', true, false),
			new TableColumn('general.amount', 'tableAmount', 'tableAmount', true, false),
			new TableColumn(
				'grants.beneficiaries',
				'beneficiaries',
				'beneficiaries',
				true,
				false,
				ColumnDataType.TRANSLATION,
				false,
			),
			new TableColumn('grants.nrBeneficiaries', 'nrBeneficiaries', 'nrBeneficiaries', true, false),
			new TableColumn('grants.validity', 'validity', 'validity', true, false),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];

		expect(component.allColumns).toEqual(expectedColumns);
	});

	it('should call service on getGrantsPaginated', () => {
		component['dataCount'] = 2;
		component.grantsTable = new TableComponent<GrantDto>(dialogService);

		const mockGrantDtos: GrantDto[] = [
			{
				id: 'id1',
				title: 'Grant Title 1',
				description: 'Description 1',
				amount: 100,
				createFor: GrantHolder.PASS_CHILD,
				startDate: new Date(),
				expirationDate: new Date(),
				selected: false,
				isCheckboxDisabled: false,
			},
			{
				id: 'id2',
				title: 'Grant Title 2',
				description: 'Description 2',
				amount: 100,
				createFor: GrantHolder.PASS_OWNER,
				startDate: new Date(),
				expirationDate: new Date(),
				selected: false,
				isCheckboxDisabled: false,
			},
		];

		grantServiceSpy.getGrantsPaginated.mockReturnValue(of(mockGrantDtos));

		const pages: Page<GrantDto>[] = Array.from({ length: 5 }, () => new Page([]));
		const dataPaginated = new PaginatedData<GrantDto>(pages, 10, 0);

		component.loadData(dataPaginated);

		expect(grantServiceSpy.getGrantsPaginated).toHaveBeenCalledWith(
			dataPaginated.currentIndex,
			dataPaginated.pageSize,
		);
	});

	describe('Tests for after dialog close ', () => {
		const dialogRefMock = { afterClosed: () => of(true) };

		it('should call dialogService.message on not do anything if dismissed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(false));
			component['getGrantsCount'] = jest.fn();

			component.openModal();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['getGrantsCount']).not.toHaveBeenCalled();
		});

		it('should call dialogService.message on openApprovedModal and recount if new grant created', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));

			component.grantsTable = {
				deselectAllCheckboxes: jest.fn(),
			} as any;

			component['getGrantsCount'] = jest.fn();

			component.openModal();
			expect(dialogService['message']).toHaveBeenCalled();
			expect(component['getGrantsCount']).toHaveBeenCalled();
		});
	});

	it('should not call openModal for other actionButton values', () => {
		const event = {
			actionButton: 'deleteIcon',
			row: new GrantDto('1', 'title', 'desc', 10, GrantHolder.PASS_OWNER, new Date(), new Date()),
		};
		jest.spyOn(component, 'openModal');
		component.onActionButtonClicked(event);
		expect(component.openModal).not.toHaveBeenCalled();
	});

	it('should call openModal when editIcon is clicked', () => {
		const mockGrant: GrantDto = {
			id: 'mockId',
			title: 'title',
			description: 'desc',
			tableAmount: '10',
			beneficiaries: 'beneficiaries',
			nrBeneficiaries: 0,
			validity: 'validity',
			selected: false,
			isCheckboxDisabled: false,
			amount: 0,
			createFor: GrantHolder.PASS_OWNER,
			startDate: new Date(),
			expirationDate: new Date(),
		};
		const event = { actionButton: ActionButtons.editIcon, row: mockGrant };
		jest.spyOn(component, 'openModal');
		component.onActionButtonClicked(event);
		expect(component.openModal).toHaveBeenCalledWith(mockGrant);
	});

	it('should not call openModal for other actionButton values', () => {
		const event = {
			actionButton: 'deleteIcon',
			row: new GrantDto('1', 'title', 'desc', 10, GrantHolder.PASS_OWNER, new Date(), new Date()),
		};
		jest.spyOn(component, 'openModal');
		component.onActionButtonClicked(event);
		expect(component.openModal).not.toHaveBeenCalled();
	});

	it('should open the import grants popup', () => {
		jest.spyOn(dialogService as any, 'message');

		component.openModal();

		expect((dialogService as any).message).toHaveBeenCalledWith(CreateGrantComponent, {
			width: '55%',
			closeOnNavigation: false,
			disableClose: true,
			data: undefined,
		});
	});

	it('should call openModal with the correct grant when editIcon is clicked', () => {
		const mockGrant: GrantDto = {
			id: 'mockId',
			title: 'title',
			description: 'desc',
			tableAmount: '10',
			beneficiaries: 'beneficiaries',
			nrBeneficiaries: 0,
			validity: 'validity',
			selected: false,
			isCheckboxDisabled: false,
			amount: 0,
			createFor: GrantHolder.PASS_OWNER,
			startDate: new Date(),
			expirationDate: new Date(),
		};
		const event = { actionButton: ActionButtons.editIcon, row: mockGrant };
		jest.spyOn(component, 'openModal');
		component.onActionButtonClicked(event);
		expect(component.openModal).toHaveBeenCalledWith(mockGrant);
	});
});
