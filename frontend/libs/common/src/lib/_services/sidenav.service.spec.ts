import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AppType } from '../_enums/app-type.enum';
import { SidenavService } from './sidenav.service';

describe('SidenavService', () => {
	let service: SidenavService;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [SidenavService, { provide: HttpClient }, { provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(SidenavService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return true when checkForCommonComponents() returns true', () => {
		const checkForCommonComponents = jest.fn(() => true);
		service['checkForCommonComponents'] = checkForCommonComponents;

		const result = service['checkForSupplierComponent']('somePath');

		expect(result).toBe(true);
		expect(checkForCommonComponents).toHaveBeenCalledWith('somePath');
	});

	it('should return true when currentPath is commonRoutingConstants.recover', () => {
		const checkForCommonComponents = jest.fn(() => false);
		service['checkForCommonComponents'] = checkForCommonComponents;
		const commonRoutingConstants = { recover: 'recover' };

		const result = service['checkForSupplierComponent'](commonRoutingConstants.recover);

		expect(result).toBe(true);
		expect(checkForCommonComponents).toHaveBeenCalledWith(commonRoutingConstants.recover);
	});

	it('should return true when currentPath includes commonRoutingConstants.register', () => {
		const currentPath = 'path/with/register';

		const result = service['checkForCommonComponents'](currentPath);

		expect(result).toBe(true);
	});

	it('should return true when currentPath includes commonRoutingConstants.login', () => {
		const currentPath = 'path/with/login';

		const result = service['checkForCommonComponents'](currentPath);

		expect(result).toBe(true);
	});

	it('should return false when currentPath does not include commonRoutingConstants.register or commonRoutingConstants.login', () => {
		const currentPath = 'path/without/these/keywords';

		const result = service['checkForCommonComponents'](currentPath);

		expect(result).toBe(false);
	});

	it('should return true when appType is AppType.supplier and checkForSupplierComponent returns true', () => {
		const appType = AppType.supplier;
		const mockCheckForSupplierComponent = jest.fn(() => true);
		const mockCheckForCommonComponents = jest.fn(() => false);
		service['checkForSupplierComponent'] = mockCheckForSupplierComponent;
		service['checkForCommonComponents'] = mockCheckForCommonComponents;

		const result = service['shouldHideNavigation'](appType);

		expect(result).toBe(true);
		expect(mockCheckForSupplierComponent).toHaveBeenCalled();
		expect(mockCheckForCommonComponents).toHaveBeenCalled();
	});

	it('should return false when appType is not AppType.supplier and checkForSupplierComponent returns false', () => {
		const appType = AppType.municipality;
		const mockCheckForSupplierComponent = jest.fn(() => false);
		const mockCheckForCommonComponents = jest.fn(() => true);
		service['checkForSupplierComponent'] = mockCheckForSupplierComponent;
		service['checkForCommonComponents'] = mockCheckForCommonComponents;

		const result = service['shouldHideNavigation'](appType);

		expect(result).toBe(true);
		expect(mockCheckForSupplierComponent).toHaveBeenCalled();
		expect(mockCheckForCommonComponents).toHaveBeenCalled();
	});

	it('should reload the current route', async () => {
		const router = TestBed.inject(Router);
		const navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl');
		router.navigateByUrl('/example-route');
		service.reloadCurrentRoute();

		expect(navigateByUrlSpy).toHaveBeenCalledWith('/example-route');
	});
});
