import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DropdownDataFilterDto, Environment } from '@frontend/common';
import { EnumValueDto } from '@frontend/common';

import { DropdownDataService } from './dropdown-data.service';

describe('DropdownDataService', () => {
	let service: DropdownDataService;
	let httpMock: HttpTestingController;

	const environmentMock: Environment = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [DropdownDataService, { provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(DropdownDataService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should fetch dropdown data via GET', () => {
		const mockData: DropdownDataFilterDto = new DropdownDataFilterDto(
			[new EnumValueDto('status1', 'Status 1'), new EnumValueDto('status2', 'Status 2')],
			[new EnumValueDto('target1', 'Target 1'), new EnumValueDto('target2', 'Target 2')],
			[new EnumValueDto('offerType1', 'Offer Type 1'), new EnumValueDto('offerType2', 'Offer Type 2')],
		);

		service.getAllDropdownsData().subscribe((data) => {
			expect(data).toEqual(mockData);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/dropdowns/offer-filter`);
		expect(req.request.method).toBe('GET');
		req.flush(mockData);
	});
});
