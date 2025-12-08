import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SupplierStatus } from '../../_enums/supplier-status.enum';
import { CreateUserDto } from '../../_models/create-user-dto.model';
import { UserDto } from '../../_models/user-dto.model';
import { UserService } from './user.service';

describe('UserService', () => {
	let service: UserService;
	let httpMock: HttpTestingController;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const userMock: UserDto = {
		companyName: 'company',
		hasStatusUpdate: false,
		kvkNumber: '12345678',
		email: 'email',
		supplierId: 'supplierId',
		isProfileSet: true,
		isApproved: true,
		status: SupplierStatus.APPROVED,
		firstName: 'firstName',
		lastName: 'lastName',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [UserService, { provide: 'env', useValue: environmentMock }],
		});

		service = TestBed.inject(UserService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return a User object after successful get', () => {
		service.getUserInformation('1').subscribe((data) => {
			expect(data).toEqual(userMock);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/users?userId=1`);
		expect(req.request.method).toBe('GET');
		req.flush(userMock);
	});

	it('should set the _userData property', () => {
		const userData: UserDto = new UserDto();

		const setUserlInfoSpy = jest.spyOn(service, 'userInformation', 'set');

		service.userInformation = userData;

		expect(setUserlInfoSpy).toHaveBeenCalledWith(userData);

		expect(service['_userInformation']).toEqual(userData);
	});

	it('should return user information', () => {
		const userData: UserDto = new UserDto();
		service.userInformation = userData;

		const retrievedUserInfo = service.userInformation;

		expect(retrievedUserInfo).toEqual(userData);
	});

	it('should send a POST request to create a user', () => {
		const createUserDto = new CreateUserDto('First Name', 'Last Name', 'email@domain.com');

		service.createUser(createUserDto).subscribe((response) => {
			expect(response).toBeTruthy();
		});

		const request = httpMock.expectOne(`${environmentMock.apiPath}/users/create`);
		expect(request.request.method).toEqual('POST');
		expect(request.request.body).toEqual(createUserDto);

		request.flush({});
	});

	it('should return the count of admin users', () => {
		const count = 5;

		service.countAdminUsers().subscribe((data) => {
			expect(data).toBe(count);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/users/admins/count`);
		expect(req.request.method).toBe('GET');

		req.flush(count);
	});

	it('should propagate an error when the request fails', () => {
		const errorMessage = 'Server error';

		service.countAdminUsers().subscribe({
			next: () => {
				throw new Error('Expected error, but got success');
			},
			error: (err) => {
				expect(err.status).toBe(500);
				expect(err.statusText).toBe('Server Error');
			},
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/users/admins/count`);
		expect(req.request.method).toBe('GET');

		req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
	});

	it('should call GET /users/admins/paginated with correct params and return UserTableDto[]', () => {
		const page = 1;
		const size = 10;
		const mockResponse = [
			{
				id: '1',
				fullName: 'User 1',
				email: 'email@test 1',
			},
		];

		service.getUsersPaged(page, size).subscribe((res) => {
			expect(res).toEqual(mockResponse);
		});

		const req = httpMock.expectOne(
			(r) =>
				r.url === `${environmentMock.apiPath}/users/admins/paginated` &&
				r.params.get('page') === page.toString() &&
				r.params.get('size') === size.toString(),
		);
		expect(req.request.method).toBe('GET');

		req.flush(mockResponse);
	});

	it('should handle errors when getUsersPaged fails', () => {
		let errorResponse: any;
		const page = 2;
		const size = 5;

		service.getUsersPaged(page, size).subscribe({
			error: (err) => (errorResponse = err),
		});

		const req = httpMock.expectOne(
			(r) =>
				r.url === `${environmentMock.apiPath}/users/admins/paginated` &&
				r.params.get('page') === page.toString() &&
				r.params.get('size') === size.toString(),
		);
		req.flush('Error', { status: 404, statusText: 'Not Found' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(404);
		expect(errorResponse.statusText).toBe('Not Found');
	});

	it('should call GET /users/cashiers/{supplierId} and return string[]', () => {
		const mockResponse = ['cashier1@test.com', 'cashier2@test.com'];
		const supplierId = 'SupplierID';
		service.getCashierEmailsForSupplier(supplierId).subscribe((res) => {
			expect(res).toEqual(mockResponse);
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/suppliers/${supplierId}/cashiers`);
		expect(req.request.method).toBe('GET');

		req.flush(mockResponse);
	});

	it('should propagate an error when getCashierEmailsForSupplier fails', () => {
		let errorResponse: any;
		const supplierId = 'SupplierID';

		service.getCashierEmailsForSupplier(supplierId).subscribe({
			next: () => {
				throw new Error('Expected error, but got success');
			},
			error: (err) => {
				errorResponse = err;
			},
		});

		const req = httpMock.expectOne(`${environmentMock.apiPath}/suppliers/${supplierId}/cashiers`);
		expect(req.request.method).toBe('GET');

		req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

		expect(errorResponse).toBeTruthy();
		expect(errorResponse.status).toBe(404);
		expect(errorResponse.statusText).toBe('Not Found');
	});
});
