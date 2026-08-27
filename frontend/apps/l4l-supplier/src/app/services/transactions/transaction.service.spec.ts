import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TransactionTableDto, ValidatedCode } from '@frontend/common';
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

	it('should return an array of ValidatedCode objects after fetching all validated codes', () => {
		const expectedValidatedCodes: ValidatedCode[] = [
			new ValidatedCode('CODE1', '2024-12-01', '10:00:00'),
			new ValidatedCode('CODE2', '2024-12-02', '12:00:00'),
		];

		httpClientSpy.get.mockReturnValue(of(expectedValidatedCodes));

		service.getAllValidatedCodes().subscribe((data) => {
			expect(data).toEqual(expectedValidatedCodes);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/transactions/supplier/all`);
	});

	it('should return the number of all transactions', () => {
		httpClientSpy.get.mockReturnValue(of(5));

		service.countAllTransactions().subscribe((data) => {
			expect(data).toEqual(5);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/transactions/supplier/count-all`);
	});

	it('should return the number of all distinct years for transactions', () => {
		const years = [2023, 2024, 2025];

		httpClientSpy.get.mockReturnValue(of(years));

		service.getDistinctYearsForTransactions().subscribe((data) => {
			expect(data).toEqual(years);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/transactions/supplier/years`);
	});

	it('should call count-all when countDateIntervalTransactions is invoked without dates', () => {
		httpClientSpy.get.mockReturnValue(of(42));

		service.countDateIntervalTransactions(undefined, undefined).subscribe((count) => {
			expect(count).toBe(42);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/transactions/supplier/count-all`);
	});

	it('should call count with startDate and endDate params when both dates provided', () => {
		const startDate = '2024-12-01';
		const endDate = '2024-12-31';

		httpClientSpy.get.mockReturnValue(of(7));

		service.countDateIntervalTransactions(startDate, endDate).subscribe((count) => {
			expect(count).toBe(7);
		});

		const call = httpClientSpy.get.mock.calls[0];
		expect(call[0]).toBe(`${environmentMock.apiPath}/transactions/supplier/count`);
		const params: HttpParams = call[1].params;
		expect(params.get('startDate')).toBe(startDate);
		expect(params.get('endDate')).toBe(endDate);
	});

	it('should return empty array when getDateIntervalTransactions is called without dates', () => {
		service.getDateIntervalTransactions(0, 10, undefined, undefined).subscribe((data) => {
			expect(data).toEqual([]);
		});

		expect(httpClientSpy.get).not.toHaveBeenCalled();
	});

	it('should call filter endpoint with correct params when dates provided', () => {
		const page = 2;
		const size = 25;
		const startDate = '2024-01-01';
		const endDate = '2024-01-31';

		const expected = [
			new TransactionTableDto('1', '111', 'Alice', 100, '01/15/2024', '10:15'),
			new TransactionTableDto('2', '222', 'Bob', 200, '01/20/2024', '11:30'),
		];

		httpClientSpy.get.mockReturnValue(of(expected));

		service.getDateIntervalTransactions(page, size, startDate, endDate).subscribe((data) => {
			expect(data).toEqual(expected);
		});

		const call = httpClientSpy.get.mock.calls[0];
		expect(call[0]).toBe(`${environmentMock.apiPath}/transactions/supplier/filter`);

		const params: HttpParams = call[1].params;
		expect(params.get('page')).toBe(page.toString());
		expect(params.get('size')).toBe(size.toString());
		expect(params.get('startDate')).toBe(startDate);
		expect(params.get('endDate')).toBe(endDate);
	});
});
