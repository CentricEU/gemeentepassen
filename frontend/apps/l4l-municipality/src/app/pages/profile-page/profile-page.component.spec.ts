import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
	Breadcrumb,
	CitizenGroupAge,
	CitizenGroupsService,
	CitizenGroupViewDto,
	ColumnDataType,
	commonRoutingConstants,
	Page,
	PaginatedData,
	TableColumn,
} from '@frontend/common';
import { TableComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { CreateCitizenGroupPopupComponent } from '../../components/create-citizen-group-popup/create-citizen-group-popup.component';
import { ProfilePageComponent } from './profile-page.component';

describe('ProfilePageComponent', () => {
	let component: ProfilePageComponent;
	let fixture: ComponentFixture<ProfilePageComponent>;
	let citizenGroupsServiceSpy: any;
	let dialogService: DialogService;

	beforeEach(async () => {
		citizenGroupsServiceSpy = {
			getCitizenGroupsPaginated: jest.fn(),
			countCitizenGroups: jest.fn(),
		};

		const dialogServiceMock = {
			message: jest.fn(),
		};

		await TestBed.configureTestingModule({
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				AppModule,
			],
			providers: [
				FormBuilder,
				TranslateService,
				{ provide: CitizenGroupsService, useValue: citizenGroupsServiceSpy },
				{ provide: DialogService, useValue: dialogServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ProfilePageComponent);
		component = fixture.componentInstance;
		citizenGroupsServiceSpy.getCitizenGroupsPaginated.mockReturnValue(of([]));
		citizenGroupsServiceSpy.countCitizenGroups.mockReturnValue(of(0));
		dialogService = TestBed.inject(DialogService);
		component.citizenGroupsTable = {
			initializeData: jest.fn(),
			paginatedData: new PaginatedData<CitizenGroupViewDto>([], 10, 0),
		} as unknown as TableComponent<CitizenGroupViewDto>;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call initBreadcrumbs on ngOnInit', () => {
		const initBreadcrumbsSpy = jest.spyOn(component as any, 'initBreadcrumbs');
		component.ngOnInit();
		expect(initBreadcrumbsSpy).toHaveBeenCalled();
	});

	it('should set breadcrumbs on ngOnInit', () => {
		const setBreadcrumbsSpy = jest.spyOn(component['breadcrumbService'], 'setBreadcrumbs');
		component.ngOnInit();
		expect(setBreadcrumbsSpy).toHaveBeenCalledWith([
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.profile', [commonRoutingConstants.profile]),
		]);
	});

	it('should call removeBreadcrumbs on ngOnDestroy', () => {
		const removeBreadcrumbsSpy = jest.spyOn(component['breadcrumbService'], 'removeBreadcrumbs');
		component.ngOnDestroy();
		expect(removeBreadcrumbsSpy).toHaveBeenCalled();
	});

	it('should call dialogService.message with correct parameters when save is called', () => {
		const mockDialogRef = {
			afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
		};
		jest.spyOn(component['dialogService'], 'message').mockReturnValue(mockDialogRef as any);

		component.save();

		expect(component['dialogService'].message).toHaveBeenCalledWith(CreateCitizenGroupPopupComponent, {
			ariaLabel: 'citizenGroup.createGroup',
			width: '824px',
			disableClose: true,
		});
	});

	it('should call showToaster when dialog is confirmed', () => {
		const mockDialogRef = {
			afterClosed: jest.fn().mockReturnValue({
				subscribe: (callback: (result: boolean) => void) => callback(true),
			}),
		};
		jest.spyOn(component['dialogService'], 'message').mockReturnValue(mockDialogRef as any);
		const showToasterSpy = jest.spyOn(component as any, 'showToaster');

		component.save();

		expect(showToasterSpy).toHaveBeenCalled();
	});

	it('should not call showToaster when dialog is not confirmed', () => {
		const mockDialogRef = {
			afterClosed: jest.fn().mockReturnValue({
				subscribe: (callback: (result: boolean) => void) => callback(false),
			}),
		};
		jest.spyOn(component['dialogService'], 'message').mockReturnValue(mockDialogRef as any);
		const showToasterSpy = jest.spyOn(component as any, 'showToaster');

		component.save();

		expect(showToasterSpy).not.toHaveBeenCalled();
	});

	it('should handle case when dialogService.message returns undefined', () => {
		jest.spyOn(component['dialogService'], 'message').mockReturnValue(undefined);
		const showToasterSpy = jest.spyOn(component as any, 'showToaster');

		component.save();

		expect(showToasterSpy).not.toHaveBeenCalled();
	});

	it('should call toastrService.success with correct parameters in showToaster', () => {
		const mockTranslatedText = 'Success message';
		jest.spyOn(component['translateService'], 'instant').mockReturnValue(mockTranslatedText);
		const toastrServiceSpy = jest.spyOn(component['toastrService'], 'success');

		(component as any).showToaster();

		expect(component['translateService'].instant).toHaveBeenCalledWith('citizenGroup.createGroupSuccess');
		expect(toastrServiceSpy).toHaveBeenCalledWith(mockTranslatedText, '', { toastBackground: 'toast-light' });
	});

	it('should subscribe to afterClosed observable when dialog is opened', () => {
		const mockObservable = {
			subscribe: jest.fn(),
		};
		const mockDialogRef = {
			afterClosed: jest.fn().mockReturnValue(mockObservable),
		};

		jest.spyOn(component['dialogService'], 'message').mockReturnValue(mockDialogRef as any);

		component.save();

		expect(mockDialogRef.afterClosed).toHaveBeenCalled();
		expect(mockObservable.subscribe).toHaveBeenCalledWith(expect.any(Function));
	});

	it('should initialize columns', () => {
		component.initializeColumns();
		const expectedColumns: TableColumn[] = [
			new TableColumn('citizenGroup.groupName', 'groupName', 'groupName', true, false),
			new TableColumn(
				'citizenGroup.ageGroup',
				'ageGroup',
				'ageGroup',
				true,
				false,
				ColumnDataType.FROM_CITIZEN_GROUP_AGE_ENUM,
			),
			new TableColumn(
				'citizenGroup.isDependentChildrenIncluded',
				'isDependentChildrenIncluded',
				'isDependentChildrenIncluded',
				true,
				false,
				ColumnDataType.YES_NO,
				false,
			),
			new TableColumn(
				'citizenGroup.threshold',
				'thresholdAmount',
				'thresholdAmount',
				true,
				false,
				ColumnDataType.PERCENTAGE,
			),
			new TableColumn(
				'citizenGroup.calculatedMaxIncome',
				'maxIncome',
				'maxIncome',
				true,
				false,
				ColumnDataType.CURRENCY,
			),
			//new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];

		expect(component.allColumns).toEqual(expectedColumns);
	});

	it('should call service on countCitizenGroups', () => {
		component['getCitizenGroupsCount']();
		expect(citizenGroupsServiceSpy.countCitizenGroups).toHaveBeenCalledWith();
	});

	it('should not call initializeComponentData when citizen groups count = 0', () => {
		jest.spyOn(component, 'initializeComponentData');
		component['getCitizenGroupsCount']();
		expect(citizenGroupsServiceSpy.countCitizenGroups).toHaveBeenCalledWith();
		expect(component.initializeComponentData).not.toHaveBeenCalled();
	});

	it('should call initializeComponentData when citizen groups count > 0', () => {
		jest.spyOn(component, 'initializeComponentData');
		citizenGroupsServiceSpy.countCitizenGroups.mockReturnValue(of(2));

		component['getCitizenGroupsCount']();

		expect(citizenGroupsServiceSpy.countCitizenGroups).toHaveBeenCalledWith();
		expect(component.initializeComponentData).toHaveBeenCalled();
	});

	it('should call service on getCitizenGroupsPaginated', () => {
		component['dataCount'] = 2;
		component.citizenGroupsTable = new TableComponent<CitizenGroupViewDto>(dialogService);

		const mockCitizenGroupViewDtos: CitizenGroupViewDto[] = [
			{
				id: 'id1',
				groupName: 'Group Name 1',
				ageGroup: [CitizenGroupAge.AGE_18_64],
				isDependentChildrenIncluded: true,
				thresholdAmount: 56.65,
				maxIncome: 12000,
				selected: false,
				isCheckboxDisabled: false,
			},
			{
				id: 'id2',
				groupName: 'Group Name 2',
				ageGroup: [CitizenGroupAge.UNDER_18],
				isDependentChildrenIncluded: true,
				thresholdAmount: 56.65,
				maxIncome: 12000,
				selected: false,
				isCheckboxDisabled: false,
			},
		];

		citizenGroupsServiceSpy.getCitizenGroupsPaginated.mockReturnValue(of(mockCitizenGroupViewDtos));

		const pages: Page<CitizenGroupViewDto>[] = Array.from({ length: 5 }, () => new Page([]));
		const dataPaginated = new PaginatedData<CitizenGroupViewDto>(pages, 10, 0);

		component.loadData(dataPaginated);

		expect(citizenGroupsServiceSpy.getCitizenGroupsPaginated).toHaveBeenCalledWith(
			dataPaginated.currentIndex,
			dataPaginated.pageSize,
		);
	});
});
