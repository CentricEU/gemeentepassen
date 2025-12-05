import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Breadcrumb, BreadcrumbService } from '@frontend/common';
import { Observable, Subscription } from 'rxjs';

import { BreadcrumbsComponent } from './breadcrumbs.component';

describe('BreadcrumbsComponent', () => {
	let component: BreadcrumbsComponent;
	let fixture: ComponentFixture<BreadcrumbsComponent>;
	let breadcrumbServiceSubscription: Subscription;
	let breadcrumbService: BreadcrumbService;
	const routerMock = {
		navigate: jest.fn(),
	};

	const crumb = new Breadcrumb('label', ['/route']);

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BreadcrumbsComponent],
			providers: [{ provide: Router, useValue: routerMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(BreadcrumbsComponent);
		component = fixture.componentInstance;

		breadcrumbService = TestBed.inject(BreadcrumbService);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should subscribe to breadcrumbService', () => {
			component['subscribeToService'] = jest.fn();

			component.ngOnInit();
			expect(component['subscribeToService']).toHaveBeenCalled();
		});
	});

	it('should unsubscribe from the breadcrumbSubscription on ngOnDestroy', () => {
		breadcrumbServiceSubscription = new Subscription();
		component['breadcrumbSubscription'] = breadcrumbServiceSubscription;
		const unsubscribeSpy = jest.spyOn(breadcrumbServiceSubscription, 'unsubscribe');
		component.ngOnDestroy();
		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should not throw an error if authSubscription is null on ngOnDestroy', () => {
		component['breadcrumbSubscription'] = null as unknown as Subscription;
		expect(() => component.ngOnDestroy()).not.toThrow();
	});

	describe('displayBreadcrumbs', () => {
		it('should return true if breadcrumbs length is greater than 0', () => {
			component.breadcrumbs = [crumb];
			expect(component.displayBreadcrumbs).toBe(true);
		});

		it('should return false if breadcrumbs length is 0', () => {
			component.breadcrumbs = [];
			expect(component.displayBreadcrumbs).toBe(false);
		});
	});

	describe('navigateToCrumb', () => {
		it('should not navigate if routerLink does not exist', () => {
			const testCrumb = new Breadcrumb('translationLabel');
			component.navigateToCrumb(testCrumb);
			expect(routerMock.navigate).not.toHaveBeenCalled();
		});

		it('should navigate to crumb if routerLink exists', () => {
			component.navigateToCrumb(crumb);
			expect(routerMock.navigate).toHaveBeenCalledWith(crumb.routerLink, { queryParams: crumb.queryParams });
		});
	});

	describe('subscribeToService', () => {
		it('should update breadcrumbs when service emits new data', () => {
			const mockObservable = new Observable<Breadcrumb[]>((observer) => {
				observer.next([crumb]);
				observer.complete();
			});

			breadcrumbService.breadcrumbsChangedObservable = mockObservable;

			component['subscribeToService']();

			expect(component.breadcrumbs).toEqual([crumb]);
		});
	});
});
