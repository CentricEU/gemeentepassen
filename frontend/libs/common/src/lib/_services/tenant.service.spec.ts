import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TenantService } from './tenant.service';

describe('TenantService', () => {
	let service: TenantService;
	let httpClientSpy: { get: jest.Mock };
	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { get: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				TenantService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		service = TestBed.inject(TenantService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should fetch tenants from the API via GET', () => {
		const dummyTenants = [
			{ id: 1, name: 'Tenant 1' },
			{ id: 2, name: 'Tenant 2' },
		];

		httpClientSpy.get.mockReturnValue(of(dummyTenants));

		service.getTenants().subscribe((tenants) => {
			expect(tenants).toEqual(dummyTenants);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/tenants/all`);
	});

	it('should fetch tenant by id from the API via GET', () => {
		const dummyTenant = { id: '1', name: 'Tenant 1' };

		httpClientSpy.get.mockReturnValue(of(dummyTenant));

		service.getTenant('1').subscribe((tenants) => {
			expect(tenants).toEqual(dummyTenant);
		});
		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/tenants/1`);
	});
});
