import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RegisterSupplier } from '../models/register-supplier.model';
import { RegisterService } from './register.service';

describe('RegisterService', () => {
	let service: RegisterService;
	let httpClientSpy: { get: jest.Mock; post: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { get: jest.fn(), post: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientModule],
			providers: [
				RegisterService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});

		service = TestBed.inject(RegisterService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return a RegisterSupplier object after successful registration', () => {
		const expectedResult: RegisterSupplier = {
			id: '12345',
			firstName: 'User',
			lastName: 'User',
			companyName: 'Company',
			kvk: '12345678',
		};

		httpClientSpy.post.mockReturnValue(of(expectedResult));

		service.registerSupplier(expectedResult).subscribe((data) => {
			expect(data).toMatchObject(expectedResult);
		});

		expect(httpClientSpy.post).toHaveBeenCalledWith(
			`${environmentMock.apiPath}/suppliers/register`,
			expectedResult,
		);
	});
});
