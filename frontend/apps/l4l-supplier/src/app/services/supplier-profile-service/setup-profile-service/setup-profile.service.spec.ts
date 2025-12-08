import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupplierProfileDto, SupplierProfilePatchDto } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SetupProfileService } from './setup-profile.service';

describe('TenantService', () => {
	let service: SetupProfileService;
	let httpClientSpy: { get: jest.Mock; post: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { get: jest.fn(), post: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientModule, TranslateModule.forRoot()],
			providers: [
				SetupProfileService,
				TranslateService,
				{ provide: MAT_DIALOG_DATA, useValue: {} },
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		service = TestBed.inject(SetupProfileService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return a SupplierProfile object after successful save', () => {
		const patchDto: SupplierProfilePatchDto = {
			logo: 'logo',
			ownerName: 'owner',
			legalForm: 0,
			group: 0,
			category: 0,
			subcategory: 0,
			companyBranchAddress: 'address',
			branchProvince: 'district',
			branchZip: '1234fe',
			branchLocation: 'location',
			branchTelephone: '+31123456789',
			email: 'email@domain.com',
			website: '',
			accountManager: 'manager',
			supplierId: '1234',
			latlon: {
				longitude: 26.1025,
				latitude: 44.4268,
			},
			workingHours: [],
		};
		const expectedResult: SupplierProfileDto = {
			companyName: 'company',
			kvkNumber: '12345678',
			adminEmail: 'admin@domain.com',
			supplierProfilePatchDto: patchDto,
		};

		httpClientSpy.post.mockReturnValue(of(expectedResult));

		service.saveSupplierProfile(expectedResult).subscribe((data) => {
			expect(data).toMatchObject(expectedResult);
		});

		expect(httpClientSpy.post).toHaveBeenCalledWith(`${environmentMock.apiPath}/supplier-profiles`, expectedResult);
	});
});
