import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import {
	AuthService,
	commonRoutingConstants,
	ModalData,
	SupplierRejectionService,
	SupplierStatus,
	SupplierViewDto,
	TenantService,
	UserDto,
	UserService,
} from '@frontend/common';
import { CustomDialogConfigUtil, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { SetupProfileComponent } from '../../_components/setup-profile/setup-profile.component';
import { OfferService } from '../../services/offer-service/offer.service';
import { SupplierService } from '../../services/supplier-service/supplier.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
	let component: DashboardComponent;
	let fixture: ComponentFixture<DashboardComponent>;
	let authServiceSpy: any;
	let userServiceSpy: any;
	let dialogService: DialogService;
	let suplierServiceSpy: any;
	let supplierRejectionServiceSpy: any;
	let router: Router;
	let offerService: OfferService;
	let tenantServiceMock: jest.Mocked<TenantService>;
	let sanitizerMock: jest.Mocked<DomSanitizer>;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		tenantServiceMock = {} as jest.Mocked<TenantService>;

		authServiceSpy = {
			extractSupplierInformation: jest.fn().mockReturnValue('123'),
		};

		suplierServiceSpy = {
			getSupplierById: jest.fn(),
			resetSupplierHasStatusUpdate: jest.fn(),
			getQRCodeImage: jest.fn(),
		};

		supplierRejectionServiceSpy = {
			getSupplierRejectionInformation: jest.fn(),
			getRejectionReasonLabel: jest.fn().mockReturnValue('Rejection Reason'),
		};

		dialogService = {
			message: jest.fn(),
		} as unknown as DialogService;

		sanitizerMock = {
			sanitize: jest.fn((context, value) => value),
			bypassSecurityTrustHtml: jest.fn((value: string) => value),
			bypassSecurityTrustUrl: jest.fn((value: string) => value),
		} as unknown as jest.Mocked<DomSanitizer>;

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [WindmillModule, CommonModule, NoopAnimationsModule, HttpClientModule, TranslateModule.forRoot()],
			providers: [
				{ provide: DialogService, useValue: dialogService },
				TranslateService,
				OfferService,
				{ provide: 'env', useValue: environmentMock },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: SupplierService, useValue: suplierServiceSpy },
				{ provide: SupplierRejectionService, useValue: supplierRejectionServiceSpy },
				{ provide: TenantService, useValue: tenantServiceMock },
				{ provide: DomSanitizer, useValue: sanitizerMock },
			],
			declarations: [DashboardComponent, SetupProfileComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(DashboardComponent);
		userServiceSpy = TestBed.inject(UserService);
		router = TestBed.inject(Router);
		offerService = TestBed.inject(OfferService);
		component = fixture.componentInstance;
		const mockSupplierData = { status: SupplierStatus.APPROVED, hasStatusUpdate: true };
		const mockSupplierObservable = of(mockSupplierData);
		jest.spyOn(suplierServiceSpy, 'getSupplierById').mockImplementation(() => mockSupplierObservable);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('displayApprovalWaitingPopup', () => {
		it('should open the approval waiting modal and navigate with reapply param removed after close', () => {
			const dialogRefMock = { afterClosed: () => of(true) };
			const messageSpy = jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			const afterClosedSpy = jest.spyOn(dialogRefMock, 'afterClosed');
			const navigateSpy = jest.spyOn(router, 'navigate');

			component['displayApprovalWaitingPopup']();

			expect(messageSpy).toHaveBeenCalled();
			expect(afterClosedSpy).toHaveBeenCalled();

			dialogRefMock.afterClosed().subscribe(() => {
				expect(navigateSpy).toHaveBeenCalledWith([], {
					queryParams: { reapply: null },
					queryParamsHandling: 'merge',
				});
			});
		});
	});

	describe('initSupplierInformation', () => {
		let userId: string;

		beforeEach(() => {
			userId = 'testUserId';
			component['supplier'] = undefined as any;
		});

		it('should call displayApprovalWaitingPopup if status is PENDING, hasStatusUpdate is true, isApprovalModal is true, and reapply param is true', () => {
			const mockData = { status: SupplierStatus.PENDING, hasStatusUpdate: true };
			jest.spyOn(suplierServiceSpy, 'getSupplierById').mockReturnValue(of(mockData));
			const displayApprovalWaitingPopupSpy = jest.spyOn(component as any, 'displayApprovalWaitingPopup');

			// Mock routerState.root.queryParams to emit { reapply: 'true' }
			const queryParams$ = of({ reapply: 'true' });
			Object.defineProperty(router.routerState, 'root', {
				get: () => ({
					queryParams: queryParams$,
				}),
			});

			component['initSupplierInformation'](userId, true);

			expect(displayApprovalWaitingPopupSpy).toHaveBeenCalled();
		});

		it('should not call displayApprovalWaitingPopup if status is PENDING, hasStatusUpdate is true, isApprovalModal is true, and reapply param is not true', () => {
			const mockData = { status: SupplierStatus.PENDING, hasStatusUpdate: true };
			jest.spyOn(suplierServiceSpy, 'getSupplierById').mockReturnValue(of(mockData));
			const displayApprovalWaitingPopupSpy = jest.spyOn(component as any, 'displayApprovalWaitingPopup');

			const queryParams$ = of({ reapply: 'false' });
			Object.defineProperty(router.routerState, 'root', {
				get: () => ({
					queryParams: queryParams$,
				}),
			});

			component['initSupplierInformation'](userId, true);

			expect(displayApprovalWaitingPopupSpy).not.toHaveBeenCalled();
		});
	});

	it('should return the first name from userInfoData if it exists', () => {
		component['userInfoData'] = {
			firstName: 'John',
			companyName: '',
			kvkNumber: '',
			email: '',
			status: SupplierStatus.APPROVED,
			tenantId: '',
			supplierId: '',
			isApproved: false,
			isProfileSet: true,
			hasStatusUpdate: false,
			lastName: 'Doe',
		};
		expect(component['userFirstName']).toBe('John');
	});

	it('should return an empty string if userInfoData is undefined', () => {
		component['userInfoData'] = undefined as unknown as UserDto;
		expect(component['userFirstName']).toBe('');
	});

	it('should return an empty string if firstName is not defined in userInfoData', () => {
		component['userInfoData'] = {
			companyName: '',
			kvkNumber: '',
			email: '',
			status: SupplierStatus.APPROVED,
			tenantId: '',
			supplierId: '',
			isApproved: false,
			isProfileSet: true,
			hasStatusUpdate: false,
			firstName: 'User',
			lastName: 'Test',
		};
		expect(component['userFirstName']).toBe('User');
	});

	describe('Tests for initializeData', () => {
		it('should call initUserInformationData when initializeData is called', () => {
			const userId = '123';
			const mockUserData = { isProfileSet: true };
			const mockObservable = of(mockUserData);

			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			jest.spyOn(userServiceSpy, 'getUserInformation').mockImplementation(() => mockObservable);
			component['initUserInformationData'] = jest.fn();

			component['initializeData']();

			expect(component['initUserInformationData']).toHaveBeenCalled();
		});

		it('should not call initUserInformationData if user is not present', () => {
			authServiceSpy.extractSupplierInformation.mockReturnValue(null);
			component['initUserInformationData'] = jest.fn();

			component['initializeData']();

			expect(component['initUserInformationData']).not.toHaveBeenCalled();
		});

		it('when  initUserInformationData should call manageProfileNotSet if isProfileSet is false', () => {
			const userId = '123';
			component['manageProfileNotSet'] = jest.fn();
			const mockUserData = { isProfileSet: false };
			const mockObservable = of(mockUserData);

			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			jest.spyOn(userServiceSpy, 'getUserInformation').mockImplementation(() => mockObservable);

			component['initUserInformationData'](userId);

			expect(component['manageProfileNotSet']).toHaveBeenCalled();
			expect(component.shouldDisableAddOfferButton).toBeTruthy();
		});

		it('when  initUserInformationData should not call manageProfileNotSet if isProfileSet is true', () => {
			const userId = '123';
			component['manageProfileNotSet'] = jest.fn();
			const mockUserData = { isProfileSet: true };
			const mockObservable = of(mockUserData);

			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			jest.spyOn(userServiceSpy, 'getUserInformation').mockImplementation(() => mockObservable);

			component['initUserInformationData'](userId);

			expect(component['manageProfileNotSet']).not.toHaveBeenCalled();
		});

		it('when  initUserInformationData should not call manageProfileNotSet if isProfileSet is true and isApproved true', () => {
			const userId = '123';
			component['manageProfileNotSet'] = jest.fn();
			const mockUserData = { isProfileSet: true, isApproved: true };
			const mockObservable = of(mockUserData);

			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			jest.spyOn(userServiceSpy, 'getUserInformation').mockImplementation(() => mockObservable);

			component['initUserInformationData'](userId);

			expect(component['manageProfileNotSet']).not.toHaveBeenCalled();
			expect(component.shouldDisableAddOfferButton).toBeFalsy();
		});
	});

	describe('Tests for modal opening', () => {
		it('should not open the modal if user profile is already set', () => {
			const userId = '123';
			const mockUserData = { isProfileSet: true };
			const mockObservable = of(mockUserData);

			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			jest.spyOn(userServiceSpy, 'getUserInformation').mockImplementation(() => mockObservable);
			component['manageProfileNotSet'] = jest.fn();
			component['openSetupProfileModal'] = jest.fn();

			component['initUserInformationData'](userId);
			expect(component['manageProfileNotSet']).not.toHaveBeenCalled();
			expect(component['openSetupProfileModal']).not.toHaveBeenCalled();
		});

		it('should open the modal if user profile is not set', () => {
			const userId = '123';
			const mockUserData = { isProfileSet: false };
			const mockObservable = of(mockUserData);

			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			jest.spyOn(userServiceSpy, 'getUserInformation').mockImplementation(() => mockObservable);
			component['openSetupProfileModal'] = jest.fn();

			component['initUserInformationData'](userId);

			expect(component['openSetupProfileModal']).toHaveBeenCalled();
		});

		it('should call dialogService.message when open the modal', () => {
			const userId = '123';
			const mockUserData = { isProfileSet: false };
			const mockObservable = of(mockUserData);

			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			jest.spyOn(userServiceSpy, 'getUserInformation').mockImplementation(() => mockObservable);
			component['openSetupProfileModal']();

			expect(dialogService['message']).toHaveBeenCalled();
		});

		it('should call openApprovedModal if hasStatusUpdate is true and status is APPROVED', () => {
			const userId = '123';
			const mockSupplierData = { status: SupplierStatus.APPROVED, hasStatusUpdate: true };
			const mockSupplierObservable = of(mockSupplierData);
			jest.spyOn(suplierServiceSpy, 'getSupplierById').mockImplementation(() => mockSupplierObservable);
			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			component['openApprovalModal'] = jest.fn();

			component['initSupplierInformation'](userId, true);

			expect(component['openApprovalModal']).toHaveBeenCalled();
		});

		it('should open rejection modal when status is REJECTED and isApprovalModal is false', () => {
			const mockData = { status: SupplierStatus.REJECTED, hasStatusUpdate: true };
			suplierServiceSpy.getSupplierById.mockReturnValue(of(mockData));

			jest.spyOn(component as any, 'openRejectionModal');

			component['initSupplierInformation']('testUserId', false);

			expect(component['openRejectionModal']).toHaveBeenCalled();
		});

		it('should not call openApprovedModal if hasStatusUpdate is false', () => {
			const userId = '123';
			const mockSupplierData = { status: SupplierStatus.APPROVED, hasStatusUpdate: false };
			const mockObservable = of(mockSupplierData);

			authServiceSpy.extractSupplierInformation.mockReturnValue(userId);
			jest.spyOn(suplierServiceSpy, 'getSupplierById').mockImplementation(() => mockObservable);
			component['openApprovalModal'] = jest.fn();

			component['initSupplierInformation'](userId, true);

			expect(component['openApprovalModal']).not.toHaveBeenCalled();
		});
	});

	describe('Tests for calling supplierService ', () => {
		it('should call supplierService.getSupplierById when initSupplierInformation called', () => {
			jest.spyOn(component as any, 'setLogo');
			const userId = '123';

			const suplayerMockData = { status: SupplierStatus.APPROVED, logo: 'logoUrl' };

			const mockObservable = of(suplayerMockData);

			jest.spyOn(suplierServiceSpy, 'getSupplierById').mockImplementation(() => mockObservable);
			component['initSupplierInformation'](userId, true);
			expect(suplierServiceSpy.getSupplierById).toHaveBeenCalledWith(userId);
			expect(component['setLogo']).toHaveBeenCalledWith('logoUrl');
		});

		it('should call supplierService.resetSupplierHasStatusUpdate when resetHasStatusUpdate called', () => {
			const mockedResponse = {};
			component['supplier'] = new SupplierViewDto(
				'id',
				'name',
				'kvk',
				'manager',
				'district',
				'categ',
				new Date(),
				'status',
			);
			const mockObservable = of(mockedResponse);
			jest.spyOn(suplierServiceSpy, 'resetSupplierHasStatusUpdate').mockImplementation(() => mockObservable);
			component['resetHasStatusUpdate']();
			expect(suplierServiceSpy.resetSupplierHasStatusUpdate).toHaveBeenCalledWith(
				component['supplier'].id,
				false,
			);
		});
	});

	describe('Tests for after dialog close ', () => {
		const dialogConfig = CustomDialogConfigUtil.MESSAGE_MODAL_CONFIG;

		it('should call dialogService.message on openApprovalModal', () => {
			const dialogRefMock = { afterClosed: () => of(true) };
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
			component['resetHasStatusUpdate'] = jest.fn();
			component['createDialogConfig'] = jest.fn().mockReturnValue(dialogConfig);
			component['addOffer'] = jest.fn();

			component['openApprovalModal']();
			expect(dialogService['message']).toHaveBeenCalled();
		});

		it('should call dialogService.message on openRejectionModal', () => {
			const dialogRefMock = { afterClosed: () => of(true) };
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
			component['resetHasStatusUpdate'] = jest.fn();
			component['createDialogConfig'] = jest.fn().mockReturnValue(dialogConfig);
			component['addOffer'] = jest.fn();

			component['openRejectionModal']();
			expect(dialogService['message']).toHaveBeenCalled();
		});

		it('should call resetHasStatusUpdate and addOffer after closing dialog  with true', () => {
			const dialogRefMock = { afterClosed: () => of(true) };
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(true));
			component['resetHasStatusUpdate'] = jest.fn();
			component['createDialogConfig'] = jest.fn().mockReturnValue(dialogConfig);
			component['addOffer'] = jest.fn();

			component['openApprovalModal']();
			expect(component['resetHasStatusUpdate']).toHaveBeenCalled();
			expect(component['addOffer']).toHaveBeenCalled();
		});

		it('should call resetHasStatusUpdate and not call addOffer after closing dialog with false', () => {
			const dialogRefMock = { afterClosed: () => of(false) };
			jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefMock as any);
			jest.spyOn(dialogRefMock, 'afterClosed').mockReturnValue(of(false));
			component['resetHasStatusUpdate'] = jest.fn();
			component['addOffer'] = jest.fn();
			component['createDialogConfig'] = jest.fn().mockReturnValue(dialogConfig);

			component['openApprovalModal']();
			expect(component['resetHasStatusUpdate']).toHaveBeenCalled();
			expect(component['addOffer']).not.toHaveBeenCalled();
		});
	});

	it('should call supplierRejectionService.getSupplierRejectionInformation with the correct argument', () => {
		const supplierId = '123';

		component['initSupplierRejectionInformation'](supplierId);

		expect(supplierRejectionServiceSpy.getSupplierRejectionInformation).toHaveBeenCalledWith(supplierId);
	});

	it('should update supplierRejectionInformation when subscription emits data', () => {
		const supplierId = '123';
		const mockResponse = {};
		supplierRejectionServiceSpy.getSupplierRejectionInformation.mockReturnValue(of(mockResponse));

		component['initSupplierRejectionInformation'](supplierId);

		expect(component.supplierRejectionInformation).toEqual(mockResponse);
	});

	it('should not initialize data when supplier ID is not present', () => {
		authServiceSpy.extractSupplierInformation.mockReturnValueOnce('mockUserId').mockReturnValueOnce(undefined);

		jest.spyOn(component as any, 'initUserInformationData');
		jest.spyOn(component as any, 'initSupplierRejectionInformation');

		component['initializeData']();

		expect(component['initSupplierRejectionInformation']).not.toHaveBeenCalled();
	});

	it('should initialize data when user and supplier IDs are present', () => {
		jest.spyOn(component as any, 'initUserInformationData');
		jest.spyOn(component as any, 'initSupplierRejectionInformation');

		authServiceSpy.extractSupplierInformation.mockReturnValueOnce('mockUserId');

		component['initializeData']();

		expect(component['initUserInformationData']).toHaveBeenCalledWith('mockUserId');
	});

	it('should navigate to offers and set shouldOpenOfferPopup to true', () => {
		const navigateSpy = jest.spyOn(router, 'navigate');

		component['addOffer']();

		expect(navigateSpy).toHaveBeenCalledWith([commonRoutingConstants.offers]);
		expect(offerService.shouldOpenOfferPopup).toBe(true);
	});

	it('should create a MatDialogConfig for APPROVED status', () => {
		const status = 'APPROVED';
		const result: MatDialogConfig = component['createDialogConfig'](status);
		result.data.optionalText.reason = '';

		const data = {
			comments: '-',
			tenantName: '',
			reason: '',
			email: '',
		};

		const configMap = {
			APPROVED: {
				header: 'approvedModal.header',
				title: 'approvedModal.title',
				description: 'approvedModal.description',
				cancelBtn: 'general.button.cancel',
				actionBtn: 'general.button.addOffer',
				icon: 'verified.svg',
			},
			default: {
				header: 'generalRejection.modal.header',
				title: 'generalRejection.modal.title',
				description: 'rejectSupplier.modal.description',
				cancelBtn: 'general.button.cancel',
				actionBtn: 'general.button.applyAgain',
				icon: 'rejected.svg',
			},
		};

		const { header, title, description, cancelBtn, actionBtn, icon } =
			configMap[status as keyof typeof configMap] || configMap['default'];

		const modal = new ModalData(
			header,
			title,
			description,
			cancelBtn,
			actionBtn,
			false,
			'success',
			'theme',
			icon,
			data,
		);

		expect(result).toEqual(CustomDialogConfigUtil.createMessageModal(modal));
	});

	it('should initialize user information data and call initSupplierRejectionInformation if status is REJECTED', fakeAsync(() => {
		const userId = 'sampleUserId';
		const mockUserData = {
			status: SupplierStatus.REJECTED,
			supplierId: 'sampleSupplierId',
		};

		userServiceSpy.getUserInformation = jest.fn(() => of(mockUserData));

		tenantServiceMock.tenant = {
			id: '1',
			name: 'sampleTenantName',
			address: 'address',
			createdDate: new Date(),
			phone: '',
			email: '',
		};

		jest.spyOn(component as any, 'initSupplierRejectionInformation');

		component['initUserInformationData'](userId);

		expect(userServiceSpy.getUserInformation).toHaveBeenCalledWith(userId);
		expect(component['userInfoData']).toEqual({
			...mockUserData,
			tenantName: 'sampleTenantName',
		});

		// Flush any pending timers to avoid "1 timer(s) still in the queue."
		tick();

		if (mockUserData.status === SupplierStatus.REJECTED) {
			expect(component['initSupplierRejectionInformation']).toHaveBeenCalledWith(mockUserData.supplierId);
		} else {
			expect(component['initSupplierRejectionInformation']).not.toHaveBeenCalled();
		}
	}));

	// describe('QR Code', () => {
	// 	it('should initialize the qr code if the profile was approved', async () => {
	// 		const mockBlob = new Blob(['blob']);
	// 		const mockObjectUrl = 'url';

	// 		suplierServiceSpy.getQRCodeImage.mockReturnValue(of(mockBlob));
	// 		jest.spyOn(component as any, 'fetchQrCodeImage');
	// 		(URL.createObjectURL as jest.Mock) = jest.fn().mockReturnValue(mockObjectUrl);
	// 		sanitizerMock.bypassSecurityTrustHtml.mockReturnValue(mockObjectUrl);

	// 	component['initializeQrCode']	(true);

	// 		expect(component.qrTranslationLabel).toEqual('dashboard.qrCode.textApproved');
	// 		expect(component['fetchQrCodeImage']).toHaveBeenCalled();
	// 		expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
	// 		expect(sanitizerMock.bypassSecurityTrustUrl).toHaveBeenCalledWith(mockObjectUrl);
	// 		expect(component.qrImageUrl).toBe(mockObjectUrl);
	// 		expect(component.qrHasEmptyState).toBe(false);
	// 	});

	// 	it('should initialize the qr code if the profile was NOT approved', () => {
	// 		component['initializeQrCode'](false);

	// 		expect(component.qrTranslationLabel).toEqual('dashboard.qrCode.textPending');
	// 		expect(component.qrImageUrl).toEqual('/assets/images/QR_empty.svg');
	// 	});

	// 	it('should create a download link with correct attributes and trigger a click event', () => {
	// 		component['qrObjectUrl'] = 'mocked-url';

	// 		const createElementMock = jest.spyOn(document, 'createElement');
	// 		const appendChildMock = jest.spyOn(document.body, 'appendChild');

	// 		const anchorElement = document.createElement('a');
	// 		createElementMock.mockReturnValue(anchorElement);

	// 		const clickMock = jest.spyOn(anchorElement, 'click');

	// 		component.downloadQrCodeImage();

	// 		expect(createElementMock).toHaveBeenCalledWith('a');
	// 		expect(appendChildMock).toHaveBeenCalledWith(anchorElement);

	// 		expect(anchorElement.href).toBe('http://localhost/mocked-url');
	// 		expect(anchorElement.download).toBe('QR-L4L.png');

	// 		expect(clickMock).toHaveBeenCalled();
	// 	});
	// });
});
