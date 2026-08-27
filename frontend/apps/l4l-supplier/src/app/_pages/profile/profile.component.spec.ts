import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, commonRoutingConstants, UserInfo } from '@frontend/common';
import { WindmillTabComponent } from '@windmill/ng-windmill/tabs';

import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
	let component: ProfileComponent;
	let fixture: ComponentFixture<ProfileComponent>;
	let routerMock: { navigate: jest.Mock };
	let authServiceMock: { extractSupplierInformation: jest.Mock };
	let activatedRouteMock: { snapshot: { url: { join: jest.Mock } } };

	function createActivatedRouteMock(joinResult: string) {
		return { snapshot: { url: { join: jest.fn().mockReturnValue(joinResult) } } };
	}

	beforeEach(async () => {
		routerMock = { navigate: jest.fn() };
		authServiceMock = { extractSupplierInformation: jest.fn().mockReturnValue('supplier-123') };
		activatedRouteMock = createActivatedRouteMock('profile/edit');

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [ProfileComponent],
			providers: [
				{ provide: Router, useValue: routerMock },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: AuthService, useValue: authServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ProfileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should initialize supplierId from auth service', () => {
			expect(authServiceMock.extractSupplierInformation).toHaveBeenCalledWith(UserInfo.SupplierId);
			expect(component.supplierId).toBe('supplier-123');
		});

		it('should set tabIndex to 0 when current route matches editProfile', () => {
			expect(component.tabIndex).toBe(0);
		});

		it('should set tabIndex to 1 when current route matches history', async () => {
			activatedRouteMock.snapshot.url.join.mockReturnValue('profile/history');
			component.ngOnInit();
			expect(component.tabIndex).toBe(1);
		});

		it('should set tabIndex to 0 when current route is unknown', async () => {
			activatedRouteMock.snapshot.url.join.mockReturnValue('some/unknown/route');
			component.ngOnInit();
			expect(component.tabIndex).toBe(0);
		});

		it('should keep tabIndex at 0 when current route is empty', async () => {
			activatedRouteMock.snapshot.url.join.mockReturnValue('');
			component.ngOnInit();
			expect(component.tabIndex).toBe(0);
		});
	});

	describe('tabChanged', () => {
		it('should navigate to editProfile route when tab index is 0', () => {
			const event = { index: 0 } as WindmillTabComponent;
			component.tabChanged(event);
			expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.editProfile], {
				replaceUrl: false,
			});
		});

		it('should navigate to history route when tab index is 1', () => {
			const event = { index: 1 } as WindmillTabComponent;
			component.tabChanged(event);
			expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.history], {
				replaceUrl: false,
			});
		});
	});
});
