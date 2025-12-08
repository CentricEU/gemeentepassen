import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MonthYearEntry, TransactionTableDto } from '@frontend/common';
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

	it('should return the number of all current month transactions', () => {
		const selectedDate = { monthValue: 1, year: 2024 };
		const httpParams = new HttpParams().set('month', selectedDate.monthValue).set('year', selectedDate.year);

		const expectedUrl = `${environmentMock.apiPath}/transactions/admin/count-by-month-and-year`;

		httpClientSpy.get.mockReturnValue(of(15));

		service.countCurrentMonthTransactionsByTenant(new MonthYearEntry('january', 1, 2024)).subscribe((data) => {
			expect(data).toEqual(15);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(expectedUrl, {
			params: httpParams,
			responseType: 'json',
		});
	});

	it('should return the number of all distinct years for transactions', () => {
		const years = [2023, 2024, 2025];

		httpClientSpy.get.mockReturnValue(of(years));

		service.getDistinctYearsForTransactionsByTenant().subscribe((data) => {
			expect(data).toEqual(years);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/transactions/admin/years`);
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
});
