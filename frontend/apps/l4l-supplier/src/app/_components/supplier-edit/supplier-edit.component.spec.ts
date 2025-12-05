import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Breadcrumb, BreadcrumbService, commonRoutingConstants } from '@frontend/common';

import { SupplierEditComponent } from './supplier-edit.component';

describe('SupplierEditComponent', () => {
	let component: SupplierEditComponent;
	let fixture: ComponentFixture<SupplierEditComponent>;
	const breadcrumbServiceSpy = {
		setBreadcrumbs: jest.fn(),
		removeBreadcrumbs: jest.fn(),
	};
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [SupplierEditComponent],
			providers: [{ provide: BreadcrumbService, useValue: breadcrumbServiceSpy }],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize breadcrumbs on ngOnInit', () => {
		component.ngOnInit();
		expect(breadcrumbServiceSpy.setBreadcrumbs).toHaveBeenCalledWith([
			new Breadcrumb('general.pages.dashboard', ['']),
			new Breadcrumb('general.pages.editProfile', [commonRoutingConstants.editProfile]),
		]);
	});
});
