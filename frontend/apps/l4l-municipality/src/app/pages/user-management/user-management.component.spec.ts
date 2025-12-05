import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Breadcrumb, BreadcrumbService, commonRoutingConstants } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { CreateUserPopupComponent } from '../../components/create-user-popup/create-user-popup.component';
import { UserManagementComponent } from './user-management.component';

describe('UserManagementComponent', () => {
	let component: UserManagementComponent;
	let fixture: ComponentFixture<UserManagementComponent>;
	let dialogService: DialogService;

	const breadcrumbServiceSpy = {
		setBreadcrumbs: jest.fn(),
		removeBreadcrumbs: jest.fn(),
	};

	beforeEach(async () => {
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
				TranslateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(UserManagementComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize breadcrumbs on ngOnInit', () => {
		component.ngOnInit();
		expect(breadcrumbServiceSpy.setBreadcrumbs).toHaveBeenCalledWith([
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.userManagement', [commonRoutingConstants.userManagement]),
		]);
	});

	it('should open the create user dialog', () => {
		jest.spyOn(dialogService, 'message');

		component.openCreateUserDialog();

		expect(dialogService.message).toHaveBeenCalledWith(CreateUserPopupComponent, {
			width: '624px',
			disableClose: true,
		});
	});

	it('should display toaster if new user was created', () => {
		const dialogRefMock = {
			afterClosed: () => of(true),
			close: jest.fn(),
		};

		jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
		jest.spyOn(component as any, 'showToaster');

		component.openCreateUserDialog();

		expect(component['showToaster']).toHaveBeenCalled();
	});

	it('should display the correct toaster', () => {
		jest.spyOn(component['translateService'], 'instant');
		jest.spyOn(component['toastrService'], 'success');

		component['showToaster']();

		expect(component['translateService'].instant).toHaveBeenCalledWith('createUser.success');
		expect(component['toastrService'].success).toHaveBeenCalled();
	});
});
