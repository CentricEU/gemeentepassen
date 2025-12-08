import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BankInformationDto } from '../_models/bank-information-dto.model';
import { TenantService } from './tenant.service';
import { Tenant } from '../_models/tenant.model';

describe('TenantService', () => {
	let service: TenantService;
	let httpClientSpy: { get: jest.Mock; patch: jest.Mock };
	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { get: jest.fn(), patch: jest.fn() };

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

	it('should save bank information via PATCH', () => {
		const bankInfo = new BankInformationDto('RO49AAAA1B31007593840000', 'AAAADEF1XXX');

		const patchSpy = jest.fn().mockReturnValue(of(undefined));
		httpClientSpy.patch = patchSpy;

		service.saveBankInformation(bankInfo).subscribe((response) => {
			expect(response).toBeUndefined();
		});

		expect(httpClientSpy.patch).toHaveBeenCalledWith(
			`${environmentMock.apiPath}/tenants/bank-information`,
			bankInfo,
		);
	});

	it('should return tenantLogo with Base64 when logo exists', () => {
		const base64Logo = 'iVBORw0KGgoAAAANSUhEUgAA...';
		service.tenant = {} as Tenant;
		service.tenant.logo = base64Logo;
		expect(service.tenantLogo).toBe('data:image/png;base64,' + base64Logo);
	});

	it('should return default logo path when logo does not exist', () => {
		service.tenant = {} as Tenant;
		expect(service.tenantLogo).toBe('/assets/images/citypasses-logo.png');
	});
});
