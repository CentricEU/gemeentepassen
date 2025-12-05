import { HttpClient, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RejectionReason, RejectSupplierDto, SupplierViewDto } from '@frontend/common';
import { of } from 'rxjs';

import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
	let service: SupplierService;
	let httpClientSpy: { get: jest.Mock; put: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { get: jest.fn(), put: jest.fn() };

		TestBed.configureTestingModule({
			providers: [
				SupplierService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});
		service = TestBed.inject(SupplierService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return a SupplierViewDto object after successful get by id', () => {
		const expectedResult: SupplierViewDto = new SupplierViewDto(
			'id',
			'name',
			'kvk',
			'manager',
			'district',
			'category',
			new Date(),
			'status',
		);

		httpClientSpy.get.mockReturnValue(of(expectedResult));

		service.getSupplierById('id').subscribe((data) => {
			expect(data).toMatchObject(expectedResult);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/suppliers/id`);
	});

	it('should reset hasStatusUpdate property after successful call', () => {
		const updatedSupplierMock = {
			hasStatusUpdate: true,
		};
		httpClientSpy.put.mockReturnValue(of(updatedSupplierMock));

		service.resetSupplierHasStatusUpdate('id', true).subscribe((data) => {
			expect(data).toMatchObject(updatedSupplierMock);
		});

		const httpParams = new HttpParams().set('hasStatusUpdate', updatedSupplierMock.hasStatusUpdate.toString());

		expect(httpClientSpy.put).toHaveBeenCalledWith(
			`${environmentMock.apiPath}/suppliers/change-has-status-update/id`,
			null,
			{ params: httpParams },
		);
	});

	it('should return a RejectSupplierDto object after successful get by id', () => {
		const expectedResult: RejectSupplierDto = {
			reason: RejectionReason.IDLE,
			comments: 'Comms',
			supplierId: '123',
		};

		httpClientSpy.get.mockReturnValue(of(expectedResult));

		service.getSupplierRejectionInformation('id').subscribe((data) => {
			expect(data).toMatchObject(expectedResult);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/suppliers/rejection/id`);
	});

	it('should return a Blob after getQRCodeImage is called', (done) => {
		const expectedBlob = new Blob([''], { type: 'image/png' });
		httpClientSpy.get.mockReturnValue(of(expectedBlob));

		service.getQRCodeImage().subscribe((blob) => {
			expect(blob).toEqual(expectedBlob);
			done();
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/suppliers/qr-code/`, {
			responseType: 'blob',
		});
	});
});
