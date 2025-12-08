/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, commonRoutingConstants, UserInfo } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TOAST_CONFIG, ToastrService } from '@windmill/ng-windmill/toastr';
import DOMPurify from 'dompurify';
import { of } from 'rxjs';

import { NoneCategoryFitComponent } from './none-category-fit.component';

jest.mock('dompurify', () => ({
	default: {
		sanitize: jest.fn((value: any) => value),
	},
}));

describe('NoneCategoryFitComponent', () => {
	let component: NoneCategoryFitComponent;
	let fixture: ComponentFixture<NoneCategoryFitComponent>;
	let mockAuthService: AuthService;
	let mockRouter: Router;
	let mockTenantService: any;

	beforeAll(() => {
		mockRouter = {
			navigate: jest.fn(),
		} as unknown as Router;

		(global as any).ResizeObserver = class {
			observe() {
				// intentionally empty for test mock
			}
			unobserve() {
				// intentionally empty for test mock
			}
			disconnect() {
				// intentionally empty for test mock
			}
		};

		(DOMPurify.sanitize as jest.Mock).mockImplementation((value: any) => value);
	});

	beforeEach(async () => {
		mockAuthService = {
			extractSupplierInformation: jest.fn(),
		} as unknown as AuthService;

		mockTenantService = {
			getTenant: jest.fn(),
			tenant: null,
		};

		await TestBed.configureTestingModule({
			imports: [NoneCategoryFitComponent, TranslateModule.forRoot(), ReactiveFormsModule],
			providers: [
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: Router, useValue: mockRouter },
				{ provide: 'TenantService', useValue: mockTenantService },
				{ provide: 'env', useValue: {} },
				ToastrService,
				TranslateService,
				{ provide: TOAST_CONFIG, useValue: {} },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(NoneCategoryFitComponent);
		component = fixture.componentInstance;
		(component as any).tenantService = mockTenantService;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize form with default values', () => {
		expect(component.noneCategoryFitForm).toBeInstanceOf(FormGroup);
		expect(component.noneCategoryFitForm.controls['message']).toBeDefined();
	});

	it('should have default municipalityName, phoneNumber, and emailAddress', () => {
		expect(component.municipalityName).toBe('');
		expect(component.phoneNumber).toBe('');
		expect(component.emailAddress).toBe('');
	});

	it('should mark message as invalid if empty', () => {
		component.noneCategoryFitForm.controls['message'].setValue('');
		expect(component.noneCategoryFitForm.controls['message'].valid).toBeFalsy();
	});

	it('should call getTenantInformation on ngOnInit and update municipalityName after tenantService emits', () => {
		const tenantId = 'tenant-456';
		const tenantData = { name: 'Rotterdam', phone: '010 987 6543', email: 'support@rotterdam.nl' };
		(mockAuthService.extractSupplierInformation as jest.Mock).mockReturnValue(tenantId);
		mockTenantService.getTenant.mockReturnValue(of(tenantData));

		component.ngOnInit();
		component['getTenantInformation']();

		expect(mockAuthService.extractSupplierInformation).toHaveBeenCalledWith(UserInfo.TenantId);
		expect(mockTenantService.getTenant).toHaveBeenCalledWith(tenantId);
		expect(component.municipalityName).toBe('Rotterdam');
		expect(component.phoneNumber).toBe('010 987 6543');
		expect(component.emailAddress).toBe('support@rotterdam.nl');
		expect(mockTenantService.tenant).toEqual(tenantData);
	});

	it('getTenantInformation should call extractSupplierInformation with UserInfo.TenantId', () => {
		mockAuthService.extractSupplierInformation = jest.fn().mockReturnValue('tenant-123');
		mockTenantService.getTenant.mockReturnValue(
			of({ name: 'Utrecht', phone: '030 123 4567', email: 'support@utrecht.nl' }),
		);
		component['getTenantInformation']();
		expect(mockAuthService.extractSupplierInformation).toHaveBeenCalledWith(UserInfo.TenantId);
		expect(mockTenantService.getTenant).toHaveBeenCalledWith('tenant-123');
	});

	it('sendMessage should be defined', () => {
		expect(typeof component.sendMessage).toBe('function');
	});

	it('should navigate to citizenGroupAssignment when goBack is called', () => {
		component.goBack();
		expect(mockRouter.navigate).toHaveBeenCalledWith([commonRoutingConstants.citizenGroupAssignment]);
	});

	it.each([
		{
			description: 'all fields are undefined',
			tenantId: 'tenant-789',
			tenantData: {},
			expected: { municipalityName: '', phoneNumber: '', emailAddress: '' },
		},
		{
			description: 'all fields are null',
			tenantId: 'tenant-101',
			tenantData: { name: null, phone: null, email: null },
			expected: { municipalityName: '', phoneNumber: '', emailAddress: '' },
		},
		{
			description: 'only some fields are present',
			tenantId: 'tenant-202',
			tenantData: { name: 'Eindhoven', phone: undefined, email: null },
			expected: { municipalityName: 'Eindhoven', phoneNumber: '', emailAddress: '' },
		},
	])(
		'should set municipalityName, phoneNumber, and emailAddress correctly when $description',
		({ tenantId, tenantData, expected }) => {
			(mockAuthService.extractSupplierInformation as jest.Mock).mockReturnValue(tenantId);
			mockTenantService.getTenant.mockReturnValue(of(tenantData));

			component['getTenantInformation']();

			expect(component.municipalityName).toBe(expected.municipalityName);
			expect(component.phoneNumber).toBe(expected.phoneNumber);
			expect(component.emailAddress).toBe(expected.emailAddress);
		},
	);

	it('sendMessage should call citizenGroupsService.sendMessageForNoneCategoryFit and reset message', () => {
		const mockCitizenGroupsService = {
			sendMessageForNoneCategoryFit: jest.fn().mockReturnValue(of(null)),
		};
		(component as any).citizenGroupsService = mockCitizenGroupsService;

		component.noneCategoryFitForm.controls['message'].setValue('Test message');

		component.sendMessage();

		expect(mockCitizenGroupsService.sendMessageForNoneCategoryFit).toHaveBeenCalledWith('Test message');
		expect(component.noneCategoryFitForm.controls['message'].value).toBeNull();
	});

	it('should display the success toaster when an message was sent', () => {
		jest.spyOn(component['translateService'], 'instant');
		jest.spyOn(component['toastrService'], 'success');

		const mockCitizenGroupsService = {
			sendMessageForNoneCategoryFit: jest.fn().mockReturnValue(of(null)),
		};
		(component as any).citizenGroupsService = mockCitizenGroupsService;

		component.noneCategoryFitForm.controls['message'].setValue('Test message');

		component.sendMessage();

		expect(component['translateService'].instant).toHaveBeenCalledWith('noneCategoryFit.messageSentSucesfully');
		expect(component['toastrService'].success).toHaveBeenCalled();
	});

	it('should call citizenGroupsService with undefined when message control is missing', () => {
		const mockCitizenGroupsService = {
			sendMessageForNoneCategoryFit: jest.fn().mockReturnValue(of(null)),
		};
		(component as any).citizenGroupsService = mockCitizenGroupsService;

		component.noneCategoryFitForm.removeControl('message');

		component.sendMessage();

		expect(mockCitizenGroupsService.sendMessageForNoneCategoryFit).toHaveBeenCalledWith(undefined);
	});
});
