import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
	let service: NavigationService;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [NavigationService, { provide: HttpClient }, { provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(NavigationService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should reload the current route', async () => {
		const router = TestBed.inject(Router);
		const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl');
		router.navigateByUrl('/example-route');
		service.reloadCurrentRoute();

		expect(navigateByUrlSpy).toHaveBeenCalledWith('/example-route');
	});
});
