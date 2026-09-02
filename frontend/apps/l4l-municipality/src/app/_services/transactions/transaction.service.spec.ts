import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TransactionTableDto, TransactionTableTenantDto } from '@frontend/common';
import { of } from 'rxjs';

import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
	let service: TransactionService;
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
				TransactionService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		service = TestBed.inject(TransactionService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return the number of all transactions', () => {
		httpClientSpy.get.mockReturnValue(of(5));

		service.countAllTransactionsByTenant().subscribe((data) => {
			expect(data).toEqual(5);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/transactions/admin/count-all`);
	});

	it('should return paginated transactions', () => {
		const mockTransactions: TransactionTableDto[] = [
			new TransactionTableDto('1', '1234567890', 'John Doe', 1000, '12/12/2024', '14:30'),
			new TransactionTableDto('2', '0987654321', 'Jane Smith', 500, '12/12/2024', '09:00'),
		];

		const currentIndex = 0;
		const pageSize = 1;
		const expectedPagedTransactions = mockTransactions.slice(currentIndex, currentIndex + pageSize);

		service.getTransactionsByTenant = jest.fn().mockReturnValue(of(expectedPagedTransactions));

		service.getTransactionsByTenant(currentIndex, pageSize).subscribe((data) => {
			expect(data).toEqual(expectedPagedTransactions);
		});

		expect(service.getTransactionsByTenant).toHaveBeenCalledWith(currentIndex, pageSize);
	});

	it('should return paginated transactions', () => {
		const mockTransactions: TransactionTableDto[] = [
			new TransactionTableDto('1', '1234567890', 'John Doe', 1000, '12/12/2024', '14:30'),
			new TransactionTableDto('2', '0987654321', 'Jane Smith', 500, '12/12/2024', '09:00'),
		];

		const currentIndex = 0;
		const pageSize = 1;
		const expectedPagedTransactions = mockTransactions.slice(currentIndex, currentIndex + pageSize);

		httpClientSpy.get.mockReturnValue(of(expectedPagedTransactions));

		service.getTransactionsByTenant(currentIndex, pageSize).subscribe((data) => {
			expect(data).toEqual(expectedPagedTransactions);
		});

		const expectedParams = new HttpParams().set('page', currentIndex.toString()).set('size', pageSize.toString());

		const expectedQueryString = expectedParams.toString();
		const actualQueryString = httpClientSpy.get.mock.calls[0][1].params.toString();

		expect(actualQueryString).toBe(expectedQueryString);
	});

	it('should return paginated transactions with month and year filters', () => {
		const mockTransactions: TransactionTableDto[] = [
			new TransactionTableDto('1', '1234567890', 'John Doe', 1000, '12/12/2024', '14:30'),
			new TransactionTableDto('2', '0987654321', 'Jane Smith', 500, '12/12/2024', '09:00'),
		];

		const currentIndex = 0;
		const pageSize = 1;
		const month = 12;
		const year = 2024;
		const expectedPagedTransactions = mockTransactions.slice(currentIndex, currentIndex + pageSize);

		httpClientSpy.get.mockReturnValue(of(expectedPagedTransactions));

		service.getTransactionsByTenant(currentIndex, pageSize, month, year).subscribe((data) => {
			expect(data).toEqual(expectedPagedTransactions);
		});

		const expectedParams = new HttpParams()
			.set('page', currentIndex.toString())
			.set('size', pageSize.toString())
			.set('month', month.toString())
			.set('year', year.toString());

		const actualQueryString = httpClientSpy.get.mock.calls[0][1].params.toString();

		expect(actualQueryString).toBe(expectedParams.toString());
	});

	it('should call count-all when startDate or endDate is missing', () => {
		httpClientSpy.get.mockReturnValue(of(3));

		service.countDateIntervalTransactionsByTenant(undefined, new Date().toISOString()).subscribe((data) => {
			expect(data).toEqual(3);
		});
		expect(httpClientSpy.get).toHaveBeenLastCalledWith(`${environmentMock.apiPath}/transactions/admin/count-all`);

		service.countDateIntervalTransactionsByTenant(new Date().toISOString(), undefined).subscribe((data) => {
			expect(data).toEqual(3);
		});
		expect(httpClientSpy.get).toHaveBeenLastCalledWith(`${environmentMock.apiPath}/transactions/admin/count-all`);
	});

	it('should call count with start/end date params when both dates are provided', () => {
		const startDate = '2024-01-01';
		const endDate = '2024-01-31';
		httpClientSpy.get.mockReturnValue(of(7));

		service.countDateIntervalTransactionsByTenant(startDate, endDate).subscribe((data) => expect(data).toEqual(7));

		const call = httpClientSpy.get.mock.calls[0];
		expect(call[0]).toBe(`${environmentMock.apiPath}/transactions/admin/count`);
		const params: HttpParams = call[1].params;
		expect(params.get('startDate')).toBe(startDate);
		expect(params.get('endDate')).toBe(endDate);
		expect(params.get('supplierId')).toBeNull();
	});

	it('should include supplierId when provided for countDateIntervalTransactionsByTenant', () => {
		const startDate = '2024-02-01';
		const endDate = '2024-02-28';
		const supplierId = 'supplier-123';
		httpClientSpy.get.mockReturnValue(of(10));

		service
			.countDateIntervalTransactionsByTenant(startDate, endDate, supplierId)
			.subscribe((data) => expect(data).toEqual(10));

		const call = httpClientSpy.get.mock.calls[0];
		const params: HttpParams = call[1].params;
		expect(params.get('startDate')).toBe(startDate);
		expect(params.get('endDate')).toBe(endDate);
		expect(params.get('supplierId')).toBe(supplierId);
		expect(call[1].responseType).toBe('json');
	});

	it('should return [] and not call http when dates are missing', () => {
		const page = 0;
		const size = 10;

		service
			.getDateIntervalTransactionsByTenant(page, size, undefined, new Date().toISOString())
			.subscribe((data) => {
				expect(data).toEqual([]);
			});
		service
			.getDateIntervalTransactionsByTenant(page, size, new Date().toISOString(), undefined)
			.subscribe((data) => {
				expect(data).toEqual([]);
			});

		expect(httpClientSpy.get).not.toHaveBeenCalled();
	});

	it('should call filter endpoint with page/size and dates', () => {
		const page = 1;
		const size = 20;
		const startDate = '2024-03-01';
		const endDate = '2024-03-31';
		const mockTransactions: TransactionTableTenantDto[] = [];

		httpClientSpy.get.mockReturnValue(of(mockTransactions));

		service
			.getDateIntervalTransactionsByTenant(page, size, startDate, endDate)
			.subscribe((data) => expect(data).toEqual(mockTransactions));

		const call = httpClientSpy.get.mock.calls[0];
		expect(call[0]).toBe(`${environmentMock.apiPath}/transactions/admin/filter`);
		const params: HttpParams = call[1].params;
		expect(params.get('page')).toBe(page.toString());
		expect(params.get('size')).toBe(size.toString());
		expect(params.get('startDate')).toBe(startDate);
		expect(params.get('endDate')).toBe(endDate);
		expect(params.get('supplierId')).toBeNull();
	});

	it('should include supplierId when provided for getDateIntervalTransactionsByTenant', () => {
		const page = 2;
		const size = 5;
		const startDate = '2024-04-01';
		const endDate = '2024-04-30';
		const supplierId = 'sup-987';
		const mockTransactions: TransactionTableTenantDto[] = [];

		httpClientSpy.get.mockReturnValue(of(mockTransactions));

		service
			.getDateIntervalTransactionsByTenant(page, size, startDate, endDate, supplierId)
			.subscribe((data) => expect(data).toEqual(mockTransactions));

		const call = httpClientSpy.get.mock.calls[0];
		const params: HttpParams = call[1].params;
		expect(params.get('page')).toBe(page.toString());
		expect(params.get('size')).toBe(size.toString());
		expect(params.get('startDate')).toBe(startDate);
		expect(params.get('endDate')).toBe(endDate);
		expect(params.get('supplierId')).toBe(supplierId);
	});
});
