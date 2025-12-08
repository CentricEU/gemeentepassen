import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Breadcrumb, BreadcrumbService, commonRoutingConstants, UserService } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { CreateUserPopupComponent } from '../../components/create-user-popup/create-user-popup.component';
import { UserManagementComponent } from './user-management.component';

describe('UserManagementComponent', () => {
	let component: UserManagementComponent;
	let fixture: ComponentFixture<UserManagementComponent>;
	let dialogService: DialogService;
	let authServiceMock: any;
	let userServiceMock: any;
	let routerMock: any;

	const breadcrumbServiceSpy = {
		setBreadcrumbs: jest.fn(),
		removeBreadcrumbs: jest.fn(),
	};

	beforeEach(async () => {
		authServiceMock = {
			extractSupplierInformation: jest.fn(),
		};

		userServiceMock = {
			getUserInformation: jest.fn(),
			countAdminUsers: jest.fn(),
			getUsersPaged: jest.fn(),
		};

		routerMock = {
			navigate: jest.fn(),
		};

		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			alert: jest.fn(),
			afterClosed: jest.fn(() => of(true)),
		};

		await TestBed.configureTestingModule({
			declarations: [UserManagementComponent],
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
				{ provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: UserService, useValue: userServiceMock },
				{ provide: Router, useValue: routerMock },
				TranslateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(UserManagementComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);

		userServiceMock.getUsersPaged.mockReturnValue(of([]));
		userServiceMock.countAdminUsers.mockReturnValue(of(0));
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open the create user dialog', () => {
		jest.spyOn(dialogService, 'message');

		component.openCreateUserDialog();

		expect(dialogService.message).toHaveBeenCalledWith(CreateUserPopupComponent, {
			width: '624px',
			disableClose: true,
		});
	});

	it('should display toaster and countData if new user was created', () => {
		const dialogRefMock = {
			afterClosed: () => of(true),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		jest.spyOn(component as any, 'showToaster');
		jest.spyOn(component as any, 'countUsers');

		component.openCreateUserDialog();

		expect(component['showToaster']).toHaveBeenCalled();
		expect(component['countUsers']).toHaveBeenCalled();
	});

	it('should display the correct toaster', () => {
		jest.spyOn(component['translateService'], 'instant');
		jest.spyOn(component['toastrService'], 'success');

		component['showToaster']();

		expect(component['translateService'].instant).toHaveBeenCalledWith('createUser.success');
		expect(component['toastrService'].success).toHaveBeenCalled();
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
			new Breadcrumb('general.pages.userManagement', [commonRoutingConstants.userManagement]),
		]);
	});

	it('should call removeBreadcrumbs on ngOnDestroy', () => {
		const removeBreadcrumbsSpy = jest.spyOn(component['breadcrumbService'], 'removeBreadcrumbs');
		component.ngOnDestroy();
		expect(removeBreadcrumbsSpy).toHaveBeenCalled();
	});

	describe('getUsersCount', () => {
		it('should set dataCount and call initializeComponentData when dataCount > 0', () => {
			const mockUserService = component['userService'];
			jest.spyOn(mockUserService, 'countAdminUsers').mockReturnValue({
				subscribe: (callback: (count: number) => void) => callback(5),
			} as any);
			const initSpy = jest.spyOn(component as any, 'initializeComponentData');

			(component as any)['countUsers']();

			expect(component['dataCount']).toBe(5);
			expect(initSpy).toHaveBeenCalled();
		});

		it('should set dataCount and not call initializeComponentData when dataCount === 0', () => {
			const mockUserService = component['userService'];
			jest.spyOn(mockUserService, 'countAdminUsers').mockReturnValue({
				subscribe: (callback: (count: number) => void) => callback(0),
			} as any);
			const initSpy = jest.spyOn(component as any, 'initializeComponentData');

			(component as any).countUsers();

			expect(component['dataCount']).toBe(0);
			expect(initSpy).not.toHaveBeenCalled();
		});
	});

	describe('initializeComponentData', () => {
		it('should call initializeColumns and benefitsTable.initializeData', () => {
			const initColumnsSpy = jest.spyOn(component as any, 'initializeColumns');
			component.usersTable = { initializeData: jest.fn() } as any;

			(component as any).initializeComponentData();

			expect(initColumnsSpy).toHaveBeenCalled();
			expect(component.usersTable.initializeData).toHaveBeenCalled();
		});
	});

	describe('initializeColumns', () => {
		it('should define allColumns with expected structure', () => {
			(component as any).initializeColumns();
			expect(component['allColumns'].length).toBeGreaterThan(0);
		});
	});

	describe('afterDataLoaded', () => {
		it('should call usersTable.afterDataLoaded with transformed data', () => {
			component.usersTable = { afterDataLoaded: jest.fn() } as any;

			(component as any).afterDataLoaded([]);

			expect(component.usersTable.afterDataLoaded).toHaveBeenCalled();
		});
	});

	it('should call getUsersPaged with correct pagination and call afterDataLoaded', () => {
		const mockData = [{ fullName: 'Test User', email: 'test@example.com', createdDate: '2025-01-01' }] as any[];
		jest.spyOn(component['userService'], 'getUsersPaged').mockReturnValue(of(mockData));
		const afterDataLoadedSpy = jest.spyOn(component as any, 'afterDataLoaded');

		component.loadData({ currentIndex: 2, pageSize: 5 } as any);

		expect(component['userService'].getUsersPaged).toHaveBeenCalledWith(2, 5);
		expect(afterDataLoadedSpy).toHaveBeenCalledWith(mockData);
	});

	it('should transform data and call usersTable.afterDataLoaded with actionButtons added', () => {
		const rawData = [{ fullName: 'Another User', email: 'another@example.com' }] as any[];
		component.usersTable = { afterDataLoaded: jest.fn() } as any;
		jest.spyOn(component['userService'], 'getUsersPaged').mockReturnValue(of(rawData));

		component.loadData({ currentIndex: 0, pageSize: 10 } as any);

		const expectedTransformed = rawData.map((d) => ({ ...d, actionButtons: [] }));
		expect(component.usersTable.afterDataLoaded).toHaveBeenCalledWith(expectedTransformed);
	});
});
