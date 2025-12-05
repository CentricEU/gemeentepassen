import { TestBed } from '@angular/core/testing';

import { Breadcrumb } from '../_models/breadcrumb.model';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
	let breadcrumbService: BreadcrumbService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		breadcrumbService = TestBed.inject(BreadcrumbService);
	});

	it('should be created', () => {
		expect(breadcrumbService).toBeTruthy();
	});

	it('should have initial breadcrumbs', () => {
		expect(breadcrumbService.breadcrumbs.length).toBe(1);
		expect(breadcrumbService.breadcrumbs[0].translationLabel).toBe('general.home');
		expect(breadcrumbService.breadcrumbs[0].routerLink).toEqual(['/']);
	});

	it('should update breadcrumbs when setBreadcrumbs is called', () => {
		const newBreadcrumbs: Breadcrumb[] = [
			new Breadcrumb('New Crumb', ['/new']),
			new Breadcrumb('Another Crumb', ['/another']),
		];

		breadcrumbService.setBreadcrumbs(newBreadcrumbs);

		expect(breadcrumbService.breadcrumbs).toEqual(newBreadcrumbs);
	});

	it('should emit breadcrumbsChangedObservable when setBreadcrumbs is called', async () => {
		const newBreadcrumbs: Breadcrumb[] = [
			new Breadcrumb('New Crumb', ['/new']),
			new Breadcrumb('Another Crumb', ['/another']),
		];

		const promise = new Promise<Breadcrumb[]>((resolve) => {
			breadcrumbService.breadcrumbsChangedObservable.subscribe((breadcrumbs) => {
				expect(breadcrumbs).toEqual(newBreadcrumbs);
				resolve(breadcrumbs);
			});
		});

		breadcrumbService.setBreadcrumbs(newBreadcrumbs);

		await expect(promise).resolves.toEqual(newBreadcrumbs);
	});

	it('should call setBreadcrumbs on removeBreadcrumbs', () => {
		const setBreadcrumbsSpy = jest.spyOn(breadcrumbService, 'setBreadcrumbs');
		breadcrumbService.removeBreadcrumbs();
		expect(setBreadcrumbsSpy).toHaveBeenCalledWith([]);
	});
});
