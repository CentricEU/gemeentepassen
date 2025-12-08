import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SupplierForMapViewDto, SupplierStatus, SupplierViewDto } from '@frontend/common';

import { GetSuppliersDto } from '../_models/get-suppliers-dto.model';
import { InvitationDto } from '../_models/invitation-dto.model';
import { InviteSuppliersDto } from '../_models/invite-suppliers-dto.model';
import { MunicipalitySupplierService } from './suppliers.service';

describe('MunicipalitySupplierService', () => {
	let service: MunicipalitySupplierService;
	let httpMock: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [MunicipalitySupplierService, { provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(MunicipalitySupplierService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get suppliers count', () => {
		const mockResponse = 10;
		const tenantId = 'sampleTenantId';
		const statuses = [SupplierStatus.APPROVED];
		service.countSuppliers(tenantId, statuses).subscribe((count) => {
			expect(count).toEqual(mockResponse);
		});

		const request = httpMock.expectOne(
			`${environmentMock.apiPath}/suppliers/all/count?tenantId=${tenantId}&statuses=${SupplierStatus.APPROVED}`,
		);

		expect(request.request.method).toBe('GET');

		request.flush(mockResponse);
	});

	it('should send a PUT request to approve a supplier', () => {
		const supplierId = '123';

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		service.approveSupplier(supplierId).subscribe(() => {});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/suppliers/approve/${supplierId}`);
		expect(req.request.method).toEqual('PUT');

		req.flush({});
	});

	it('should retrieve suppliers', () => {
		const mockGetSuppliersDto: GetSuppliersDto = {
			pageIndex: '1',
			perPage: '10',
			tenantId: 'sampleTenantId',
			status: SupplierStatus.APPROVED,
		};

		const mockResponse: SupplierViewDto[] = [
			new SupplierViewDto(
				'id1',
				'name1',
				'kvk1',
				'accountManager1',
				'district1',
				'category',
				new Date(),
				'status',
			),
			new SupplierViewDto(
				'id2',
				'name11',
				'kvk1',
				'accountManager1',
				'district1',
				'category',
				new Date(),
				'status',
			),
		];

		service.getSuppliers(mockGetSuppliersDto).subscribe((suppliers) => {
			expect(suppliers).toEqual(mockResponse);
		});

		const request = httpMock.expectOne(
			`${environmentMock.apiPath}/suppliers/all?page=${mockGetSuppliersDto.pageIndex}&size=${mockGetSuppliersDto.perPage}&tenantId=${mockGetSuppliersDto.tenantId}&status=${mockGetSuppliersDto.status}`,
		);

		expect(request.request.method).toBe('GET');

		request.flush(mockResponse);
	});

	it('should retrieve pending and rejected suppliers', () => {
		const mockGetSuppliersDto: GetSuppliersDto = {
			pageIndex: '1',
			perPage: '10',
			tenantId: 'sampleTenantId',
			status: SupplierStatus.APPROVED,
		};

		const mockResponse: SupplierViewDto[] = [
			new SupplierViewDto(
				'id1',
				'name1',
				'kvk1',
				'accountManager1',
				'district1',
				'category',
				new Date(),
				'status',
			),
			new SupplierViewDto(
				'id2',
				'name11',
				'kvk1',
				'accountManager1',
				'district1',
				'category',
				new Date(),
				'status',
			),
		];

		service.getPendingSuppliers(mockGetSuppliersDto).subscribe((suppliers) => {
			expect(suppliers).toEqual(mockResponse);
		});

		const request = httpMock.expectOne(
			`${environmentMock.apiPath}/suppliers/pending?page=${mockGetSuppliersDto.pageIndex}&size=${mockGetSuppliersDto.perPage}&tenantId=${mockGetSuppliersDto.tenantId}&status=${mockGetSuppliersDto.status}`,
		);

		expect(request.request.method).toBe('GET');

		request.flush(mockResponse);
	});

	it('should send a POST request to invite suppliers', () => {
		const inviteSuppliersDto: InviteSuppliersDto = {
			emails: ['test@domain.com'],
			message: 'Test message',
		};

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		service.inviteSuppliers(inviteSuppliersDto).subscribe(() => {});

		const request = httpMock.expectOne(`${environmentMock.apiPath}/invitations/send`);
		expect(request.request.method).toEqual('POST');

		request.flush({});
	});

	it('should GET invitations count', () => {
		const mockResponse = 5;

		service.getInvitationsCount().subscribe((count) => {
			expect(count).toEqual(mockResponse);
		});

		const request = httpMock.expectOne(`${environmentMock.apiPath}/invitations/count`);
		expect(request.request.method).toEqual('GET');

		request.flush(mockResponse);
	});

	it('should GET invitations', () => {
		const mockResponse = [
			new InvitationDto('test1@domain.com', 'date1', 'msg1'),
			new InvitationDto('test2@domain.com', 'date2', 'msg2'),
			new InvitationDto('test3@domain.com', 'date3', 'msg3'),
		];

		service.getInvitations(1, 5).subscribe((invitations) => {
			expect(invitations).toEqual(mockResponse);
		});

		const request = httpMock.expectOne(`${environmentMock.apiPath}/invitations?page=1&size=5`);
		expect(request.request.method).toEqual('GET');

		request.flush(mockResponse);
	});

	it('should retrieve suppliers for map', () => {
		const tenantId = 'sampleTenantId';
		const mockResponse: SupplierForMapViewDto[] = [
			new SupplierForMapViewDto('id1', 'name1', 'coordinates'),
			new SupplierForMapViewDto('id2', 'name2', 'coordinates'),
		];

		service.getSuppliersForMap(tenantId).subscribe((suppliers) => {
			expect(suppliers).toEqual(mockResponse);
		});

		const request = httpMock.expectOne(`${environmentMock.apiPath}/suppliers/${tenantId}/all-for-map`);
		expect(request.request.method).toBe('GET');

		request.flush(mockResponse);
	});
});
