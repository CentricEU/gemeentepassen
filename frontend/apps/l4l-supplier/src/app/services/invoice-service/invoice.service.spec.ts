import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { GenerateInvoiceDto } from '../../models/generate-invoice-dto.model';
import { InvoiceService } from './invoice.service';

describe('InvoiceService', () => {
	let service: InvoiceService;
	let httpClientSpy: { post: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { post: jest.fn() };

		TestBed.configureTestingModule({
			providers: [
				InvoiceService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		service = TestBed.inject(InvoiceService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return a Blob object after successful invoice generation', () => {
		const headers = new HttpHeaders({
			Accept: 'application/pdf',
		});
		const generateInvoiceDto = new GenerateInvoiceDto('INV123', 'February 2021', '2021-02-01', 14);

		const expectedBlob = new Blob(['dummy content'], { type: 'application/pdf' });

		httpClientSpy.post.mockReturnValue(of(expectedBlob));

		service.generateInvoice(generateInvoiceDto).subscribe((data) => {
			expect(data).toBe(expectedBlob);
		});

		expect(httpClientSpy.post).toHaveBeenCalledWith(
			`${environmentMock.apiPath}/invoices`,
			expect.objectContaining({
				invoiceNumber: 'INV123',
				issueDate: '2021-02-01',
				currentDate: '2021-02-01',
				dueDate: 14,
			}),
			expect.objectContaining({
				headers: expect.any(Object),
				responseType: 'blob',
			}),
		);
	});
});
