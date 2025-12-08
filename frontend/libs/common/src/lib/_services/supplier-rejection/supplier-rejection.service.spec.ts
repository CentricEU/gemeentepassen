import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RejectionReason } from '../../_enums/rejection-reason.enum';
import { RejectSupplierDto } from '../../_models/reject-supplier-dto.model';
import { SupplierRejectionService } from './supplier-rejection.service';

describe('SupplierRejectionService', () => {
	let service: SupplierRejectionService;
	let httpMock: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [SupplierRejectionService, { provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(SupplierRejectionService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should send a POST request to reject a supplier', () => {
		const rejectSupplierModel: RejectSupplierDto = {
			reason: RejectionReason.DUPLICATE,
			supplierId: '123',
		};

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		service.rejectSupplier(rejectSupplierModel).subscribe(() => {});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/suppliers/reject`);
		expect(req.request.method).toEqual('POST');

		req.flush({});
	});

	it('should return a RejectSupplierDto object after successful get by id', () => {
		const expectedResult: RejectSupplierDto = {
			reason: RejectionReason.IDLE,
			comments: 'Comms',
			supplierId: '123',
		};

		service.getSupplierRejectionInformation('id').subscribe((data) => {
			expect(data).toMatchObject(expectedResult);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/suppliers/rejection/id`);
		expect(req.request.method).toBe('GET');
		req.flush(expectedResult);
	});

	describe('getRejectionReasonLabel', () => {
		const testCases = [
			{ input: RejectionReason.NOT_IN_REGION, expected: 'rejectSupplier.reasons.notInRegion' },
			{ input: RejectionReason.MISBEHAVIOR, expected: 'rejectSupplier.reasons.misbehavior' },
			{ input: RejectionReason.IDLE, expected: 'rejectSupplier.reasons.idle' },
			{ input: RejectionReason.INCOMPLETE_INFORMATION, expected: 'rejectSupplier.reasons.incompleteInformation' },
			{ input: RejectionReason.DUPLICATE, expected: 'rejectSupplier.reasons.duplicate' },
			{ input: RejectionReason.NOT_IN_REGION.toString(), expected: 'rejectSupplier.reasons.notInRegion' },
			{ input: RejectionReason.MISBEHAVIOR.toString(), expected: 'rejectSupplier.reasons.misbehavior' },
			{ input: 'UNKNOWN_REASON', expected: '' },
			{ input: '', expected: '' },
		];

		testCases.forEach(({ input, expected }) => {
			it(`should return "${expected}" for input "${input}"`, () => {
				expect(service['getRejectionReasonLabel'](input)).toBe(expected);
			});
		});

		describe('rejectionReasonValues', () => {
			it('should return all rejection reasons with correct keys and values', () => {
				const values = service.rejectionReasonValues;
				expect(Array.isArray(values)).toBe(true);
				expect(values.length).toBe(5);

				expect(values).toContainEqual({
					key: 'rejectSupplier.reasons.notInRegion',
					value: RejectionReason.NOT_IN_REGION,
				});
				expect(values).toContainEqual({
					key: 'rejectSupplier.reasons.misbehavior',
					value: RejectionReason.MISBEHAVIOR,
				});
				expect(values).toContainEqual({
					key: 'rejectSupplier.reasons.idle',
					value: RejectionReason.IDLE,
				});
				expect(values).toContainEqual({
					key: 'rejectSupplier.reasons.incompleteInformation',
					value: RejectionReason.INCOMPLETE_INFORMATION,
				});
				expect(values).toContainEqual({
					key: 'rejectSupplier.reasons.duplicate',
					value: RejectionReason.DUPLICATE,
				});
			});
		});
	});
});
