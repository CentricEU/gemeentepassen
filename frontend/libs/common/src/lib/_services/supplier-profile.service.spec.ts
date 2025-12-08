import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { CategoryDto } from '../_models/category-dto.model';
import { ProfileLabelDto } from '../_models/profile_label-dto.model';
import { ProfileDropdownsDto } from '../_models/profile-dropdowns-dto.model';
import { SupplierProfile } from '../_models/supplier-profile.model';
import { SupplierProfilePatchDto } from '../_models/supplier-profile-patch-dto.model';
import { SupplierProfileService } from './supplier-profile.service';

describe('SupplierProfileService', () => {
	let service: SupplierProfileService;
	let httpTestingController: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const mockSupplierProfile: SupplierProfile = {
		companyBranchAddress: 'Address',
		branchProvince: 'Province',
		branchZip: 'Zip',
		branchLocation: 'Location',
		branchTelephone: 'Telephone',
		email: 'email@email.com',
		website: 'Website',
		accountManager: 'Manager',
		companyName: 'Company',
		adminEmail: 'Email',
		kvkNumber: '12345678',
		ownerName: 'Owner',
		legalForm: 'Form',
		group: 'Group',
		category: 'Category',
		subcategory: 'Subcategory',
		supplierId: '123',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, BrowserAnimationsModule, HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [{ provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(SupplierProfileService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get and set supplierProfileInformation', () => {
		service.supplierProfileInformation = mockSupplierProfile;

		expect(service.supplierProfileInformation).toEqual(mockSupplierProfile);
	});

	it('should call httpClient.get with the correct URL and parameters', () => {
		const supplierId = '123';

		service.getSupplierProfile(supplierId).subscribe((result: SupplierProfile) => {
			expect(result).toEqual(mockSupplierProfile);
		});

		const req = httpTestingController.expectOne(`${environmentMock.apiPath}/supplier-profiles/${supplierId}`);
		expect(req.request.method).toEqual('GET');

		req.flush(mockSupplierProfile);
	});

	it('should update supplier profile', () => {
		const mockSupplierProfilePatch: SupplierProfilePatchDto = {
			companyBranchAddress: 'Address',
			branchProvince: 'Province',
			branchZip: 'Zip',
			branchLocation: 'Location',
			branchTelephone: 'Telephone',
			email: 'email@email.com',
			website: 'Website',
			accountManager: 'Manager',
			ownerName: 'Owner',
			legalForm: 0,
			group: 1,
			category: 2,
			subcategory: 2,
			supplierId: '123',
		};

		service.updateSupplierProfile(mockSupplierProfilePatch).subscribe();

		const req = httpTestingController.expectOne(`${environmentMock.apiPath}/supplier-profiles`);

		expect(req.request.method).toBe('PATCH');
		expect(req.request.body).toEqual({
			group: 1,
			subcategory: 2,
			category: 2,
			legalForm: 0,
			companyBranchAddress: 'Address',
			branchProvince: 'Province',
			branchZip: 'Zip',
			branchLocation: 'Location',
			branchTelephone: 'Telephone',
			email: 'email@email.com',
			website: 'Website',
			accountManager: 'Manager',
			ownerName: 'Owner',
			supplierId: '123',
		});

		req.flush(null);
	});

	it('should reapply supplier profile', () => {
		const mockSupplierProfilePatch: SupplierProfilePatchDto = {
			companyBranchAddress: 'Address',
			branchProvince: 'Province',
			branchZip: 'Zip',
			branchLocation: 'Location',
			branchTelephone: 'Telephone',
			email: 'email@email.com',
			website: 'Website',
			accountManager: 'Manager',
			ownerName: 'Owner',
			legalForm: 0,
			group: 1,
			category: 2,
			subcategory: 2,
			supplierId: '123',
		};

		service.reapplySupplierProfile(mockSupplierProfilePatch).subscribe();

		const req = httpTestingController.expectOne(`${environmentMock.apiPath}/supplier-profiles/reapplication`);

		expect(req.request.method).toBe('PATCH');
		expect(req.request.body).toEqual({
			group: 1,
			subcategory: 2,
			category: 2,
			legalForm: 0,
			companyBranchAddress: 'Address',
			branchProvince: 'Province',
			branchZip: 'Zip',
			branchLocation: 'Location',
			branchTelephone: 'Telephone',
			email: 'email@email.com',
			website: 'Website',
			accountManager: 'Manager',
			ownerName: 'Owner',
			supplierId: '123',
		});

		req.flush(null);
	});

	it('should return dropdown data', () => {
		const subcategory: ProfileLabelDto[] = [
			{
				id: 0,
				label: 'subcategory',
			},
		];
		const categories: CategoryDto[] = [
			{
				id: 1,
				categoryLabel: 'category',
				subcategoryLabels: subcategory,
			},
		];
		const legalFormLabels: ProfileLabelDto[] = [
			{
				id: 3,
				label: 'legalForm',
			},
		];
		const groupLabels: ProfileLabelDto[] = [
			{
				id: 3,
				label: 'group',
			},
		];
		const mockData: ProfileDropdownsDto = {
			categories: categories,
			legalFormLabels: legalFormLabels,
			groupLabels: groupLabels,
		};

		service.getAllDropdownsData().subscribe((data) => {
			expect(data).toEqual(mockData);
		});

		const req = httpTestingController.expectOne(`${environmentMock.apiPath}/supplier-profiles/dropdown-data`);
		expect(req.request.method).toEqual('GET');

		req.flush(mockData);
	});
});
