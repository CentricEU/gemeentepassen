/* eslint-disable @typescript-eslint/no-empty-function */
import { Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { SupplierDetailsComponent } from './supplier-details.component';

describe('SupplierDetailsComponent', () => {
	let component: SupplierDetailsComponent;
	let fixture: ComponentFixture<SupplierDetailsComponent>;
	let location: Location;
	let activatedRoute: ActivatedRoute;

	beforeEach(async () => {
		const activatedRouteStub = {
			paramMap: of({
				get: (key: string) => (key === 'id' ? '123e4567-e89b-12d3-a456-426614174000' : null),
			}),
			snapshot: { data: {} },
		};

		const locationStub = {
			go: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [SupplierDetailsComponent],
			imports: [HttpClientModule, WindmillModule, AppModule, RouterModule.forRoot([]), TranslateModule.forRoot()],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: Location, useValue: locationStub },
			],
		}).compileComponents();
		(global as any).ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
		fixture = TestBed.createComponent(SupplierDetailsComponent);
		component = fixture.componentInstance;
		location = TestBed.inject(Location);
		activatedRoute = TestBed.inject(ActivatedRoute);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize supplierId from route params', () => {
		component.ngOnInit();
		expect(component.supplierId).toBe('123e4567-e89b-12d3-a456-426614174000');
	});

	it('should set tabIndex to 1 if route snapshot data contains "route"', () => {
		(activatedRoute.snapshot.data as any).route = true;
		component.ngOnInit();
		expect(component.tabIndex).toBe(1);
	});

	it('should not update location on tab change when supplierId is not present', () => {
		component.supplierId = '';
		const event: any = { index: 1, tab: {} as any };
		component.tabChanged(event);

		expect(component.tabIndex).toBe(1);
		expect(location.go).not.toHaveBeenCalled();
	});

	it('should navigate to supplierDetails when tabIndex is 0 and supplierId is present', () => {
		component.supplierId = '123e4567-e89b-12d3-a456-426614174000';
		const event: any = { index: 0 };
		const navigateSpy = jest.spyOn(component['router'], 'navigate');

		component.tabChanged(event);

		expect(component.tabIndex).toBe(0);
		expect(navigateSpy).toHaveBeenCalledWith(['supplier-details/123e4567-e89b-12d3-a456-426614174000'], {
			replaceUrl: false,
		});
	});

	it('should navigate to supplierOffers when tabIndex is 1 and supplierId is present', () => {
		component.supplierId = '123e4567-e89b-12d3-a456-426614174000';
		const event: any = { index: 1, tab: {} as any };
		const navigateSpy = jest.spyOn(component['router'], 'navigate');

		component.tabChanged(event);

		expect(component.tabIndex).toBe(1);
		expect(navigateSpy).toHaveBeenCalledWith(['supplier-details/123e4567-e89b-12d3-a456-426614174000/offers'], {
			replaceUrl: false,
		});
	});
});
