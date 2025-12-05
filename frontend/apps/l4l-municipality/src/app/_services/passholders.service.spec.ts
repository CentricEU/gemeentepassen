import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AssignPassholderGrants, PassholderViewDto } from '@frontend/common';
import { of } from 'rxjs';

import { PassholdersService } from './passholders.service';

describe('PassholdersService', () => {
	let service: PassholdersService;
	let httpClientSpy: { post: jest.Mock; get: jest.Mock; put: jest.Mock; delete: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};
	beforeEach(() => {
		httpClientSpy = {
			post: jest.fn(),
			get: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
		};

		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				PassholdersService,
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: 'env', useValue: environmentMock },
			],
		});
		service = TestBed.inject(PassholdersService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should upload passholers when uploading CSV', () => {
		const dummyPassholders = [
			{ id: 1, name: 'Tenant 1' },
			{ id: 2, name: 'Tenant 2' },
		];
		const file = new File(['Hello, this is the file content.'], 'example.txt', { type: 'text/plain' });
		const data: FormData = new FormData();
		data.append('file', file, file.name);

		httpClientSpy.post.mockReturnValue(of(dummyPassholders));

		service.uploadCSV(file).subscribe((passholders) => {
			expect(passholders).toEqual(dummyPassholders);
		});

		expect(httpClientSpy.post).toHaveBeenCalledWith(`${environmentMock.apiPath}/passholders/upload`, data);
	});

	it('should get passholders count', () => {
		const mockResponse = 10;
		httpClientSpy.get.mockReturnValue(of(mockResponse));

		service.countPassholders().subscribe((count) => {
			expect(count).toEqual(mockResponse);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/passholders/count`);
	});

	it('should get passholders list when ', () => {
		const pageIndex = 1;
		const perPage = 10;

		const dummyPassholders = [
			{ id: 1, name: 'Tenant 1' },
			{ id: 2, name: 'Tenant 2' },
		];

		const httpParams = new HttpParams().set('page', pageIndex).set('size', perPage);

		httpClientSpy.get.mockReturnValue(of(dummyPassholders));

		service.getPassholders(pageIndex, perPage).subscribe((count) => {
			expect(count).toEqual(dummyPassholders);
		});

		expect(httpClientSpy.get).toHaveBeenCalledWith(`${environmentMock.apiPath}/passholders`, { params: httpParams });
	});

	it('should put passholder when updating ', () => {
		const passholder = new PassholderViewDto(
			'testId',
			'testAddr',
			'name',
			'bsn',
			'number',
			'residence',
			new Date(),
		);

		httpClientSpy.put.mockReturnValue(of());

		service.updatePassholder(passholder).subscribe();

		expect(httpClientSpy.put).toHaveBeenCalledWith(`${environmentMock.apiPath}/passholders`, passholder);
	});

	it('should put passholder when assign grants ', () => {
		const assignGrants = new AssignPassholderGrants(['testId'], ['testId']);

		httpClientSpy.put.mockReturnValue(of());

		service.assignGrants(assignGrants).subscribe();

		expect(httpClientSpy.put).toHaveBeenCalledWith(`${environmentMock.apiPath}/passholders/assign`, assignGrants);
	});

	it('should delete passholder when delete method is called ', () => {
		const id = 'testId';

		httpClientSpy.delete.mockReturnValue(of());

		service.deletePassholder(id).subscribe();

		expect(httpClientSpy.delete).toHaveBeenCalledWith(`${environmentMock.apiPath}/passholders/${id}`);
	});
});
