import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CodeValidationDto } from '../../models/code-validation.model';
import { DiscountCodeService } from './discount-code.service';

describe('DiscountCodeService', () => {
	let service: DiscountCodeService;
	let httpClientSpy: { post: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { post: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				DiscountCodeService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		service = TestBed.inject(DiscountCodeService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return a CodeValidationDto object after successful code validation', () => {
		const codeValidation: CodeValidationDto = new CodeValidationDto('DISCOUNT2024', '2024-12-04T10:00:00');
		const expectedResult: CodeValidationDto = new CodeValidationDto('DISCOUNT2024', '2024-12-04T10:00:00');

		httpClientSpy.post.mockReturnValue(of(expectedResult));

		service.validateCode(codeValidation).subscribe((data) => {
			expect(data).toMatchObject(expectedResult);
		});

		expect(httpClientSpy.post).toHaveBeenCalledWith(
			`${environmentMock.apiPath}/discount-codes/validate`,
			codeValidation,
		);
	});
});
