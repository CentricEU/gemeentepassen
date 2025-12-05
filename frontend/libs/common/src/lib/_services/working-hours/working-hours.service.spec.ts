import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { WorkingHoursDto } from '../../_models/working-hours.model';
import { WorkingHoursService } from './working-hours.service';

describe('WorkingHoursService', () => {
	let service: WorkingHoursService;
	let httpClientSpy: { get: jest.Mock; patch: jest.Mock; post: jest.Mock };

	const mockEnv = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		httpClientSpy = { get: jest.fn(), patch: jest.fn(), post: jest.fn() };

		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientModule, HttpClientTestingModule],
			providers: [
				WorkingHoursService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: mockEnv },
			],
		});
		service = TestBed.inject(WorkingHoursService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should post the working hours and return the data', () => {
		const mockWorkingHours: WorkingHoursDto[] = [new WorkingHoursDto(1, '09:00', '17:00', true, '123')];
		const supplierId = 'supplier123';

		httpClientSpy.post.mockReturnValue(of(mockWorkingHours)); // Using 'of' to return an Observable

		service.saveWorkingHours(mockWorkingHours, supplierId).subscribe((data) => {
			expect(data).toEqual(mockWorkingHours);
			expect(httpClientSpy.post).toHaveBeenCalledWith(
				`${mockEnv.apiPath}/working-hours/${supplierId}`,
				mockWorkingHours,
			);
		});
	});

	it('should patch the working hours and return the data', () => {
		const mockWorkingHours: WorkingHoursDto[] = [new WorkingHoursDto(2, '10:00', '18:00', false, '456')];
		const supplierId = 'supplier456';

		httpClientSpy.patch.mockReturnValue(of(mockWorkingHours));

		service.updateWorkingHours(mockWorkingHours, supplierId).subscribe((data) => {
			expect(data).toEqual(mockWorkingHours);
			expect(httpClientSpy.patch).toHaveBeenCalledWith(
				`${mockEnv.apiPath}/working-hours/${supplierId}`,
				mockWorkingHours,
			);
		});
	});

	it('should fetch the working hours', () => {
		const mockWorkingHours: WorkingHoursDto[] = [new WorkingHoursDto(3, '11:00', '19:00', true, '789')];
		const supplierId = 'supplier789';

		httpClientSpy.get.mockReturnValue(of(mockWorkingHours));

		service.getWorkingHours(supplierId).subscribe((data) => {
			expect(data).toEqual(mockWorkingHours);
			expect(httpClientSpy.get).toHaveBeenCalledWith(`${mockEnv.apiPath}/working-hours/${supplierId}`);
		});
	});
});
