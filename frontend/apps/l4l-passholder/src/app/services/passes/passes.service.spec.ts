import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PassDto } from '../../shared/models/pass-dto.model';
import { PassesService } from './passes.service';

describe('PassesService', () => {
	let service: PassesService;
	let httpMock: HttpTestingController;
	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule],
			providers: [PassesService, { provide: 'env', useValue: environmentMock }],
		});
		service = TestBed.inject(PassesService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeDefined();
	});

	it('should call httpClient.post with correct url and FormData when savePass is called', () => {
		const passDto: PassDto = { id: 1, name: 'Test Pass' } as any;
		const file = new File(['file-content'], 'test.txt', { type: 'text/plain' });
		service.savePass(passDto, [file]).subscribe();

		const req = httpMock.expectOne('/api/passes');
		expect(req.request.method).toBe('POST');
		expect(req.request.body instanceof FormData).toBe(true);

		const formData = req.request.body as FormData;
		expect(formData.has('passDto')).toBe(true);
		expect(formData.has('files')).toBe(true);
		req.flush({});
	});

	it('should create FormData with passDto and files', () => {
		const passDto: PassDto = { id: 2, name: 'Another Pass' } as any;
		const file1 = new File(['file1'], 'file1.txt', { type: 'text/plain' });
		const file2 = new File(['file2'], 'file2.txt', { type: 'text/plain' });

		const formData = service['getPassFormData'](passDto, [file1, file2]);
		expect(formData.has('passDto')).toBe(true);

		const passDtoBlob = formData.get('passDto') as Blob;
		expect(passDtoBlob instanceof Blob).toBe(true);

		const reader = new FileReader();
		reader.onload = () => {
			expect(reader.result).toBe(JSON.stringify(passDto));
		};
		reader.readAsText(passDtoBlob);

		const files = formData.getAll('files');
		expect(files.length).toBe(2);
		expect((files[0] as File).name).toBe('file1.txt');
		expect((files[1] as File).name).toBe('file2.txt');
	});

	it('should handle empty files array in getPassFormData', () => {
		const passDto: PassDto = { id: 3, name: 'No Files Pass' } as any;
		const formData = service['getPassFormData'](passDto, []);
		expect(formData.has('passDto')).toBe(true);
		expect(formData.getAll('files').length).toBe(0);
	});
});
