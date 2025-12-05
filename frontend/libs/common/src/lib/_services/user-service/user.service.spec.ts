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
});
