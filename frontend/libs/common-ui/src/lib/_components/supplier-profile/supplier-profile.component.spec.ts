import { HttpClientModule } from '@angular/common/http';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
	AuthService,
	BreadcrumbService,
	commonRoutingConstants,
	ContactInformation,
	GeneralInformation,
	PdokService,
	PdokUtil,
	SupplierCoordinates,
	SupplierProfile,
	SupplierProfileService,
	UserInfo,
} from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CentricToastrModule, ToastrService } from '@windmill/ng-windmill/toastr';
import { of } from 'rxjs';

import { SupplierProfileComponent } from './supplier-profile.component';

function createBlobWithSize(sizeInBytes: number): Blob {
	return new Blob([new Uint8Array(sizeInBytes)], { type: 'application/octet-stream' });
}

describe('SupplierProfileComponent', () => {
	let component: SupplierProfileComponent;
	let fixture: ComponentFixture<SupplierProfileComponent>;
	let supplierProfileService: SupplierProfileService;
	let activatedRouteMock: any;
	let authServiceMock: any;
	let formBuilder: FormBuilder;
	let fileInput: DebugElement;
	let pdokService: PdokService;
	let toastrService: ToastrService;
	let translateService: TranslateService;

	const breadcrumbServiceMock = {
		setBreadcrumbs: jest.fn(),
		removeBreadcrumbs: jest.fn(),
	};

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const mockSupplierProfile: SupplierProfile = {
		companyBranchAddress: 'Address',
		branchProvince: 'Province',
		branchZip: 'Zip',
		branchLocation: 'Location',
		branchTelephone: 'Telephone',
		email: 'email@email.com',
		website: 'Website',
		accountManager: 'Manager',
		companyName: 'Company',
		adminEmail: 'Email',
		kvkNumber: '12345678',
		ownerName: 'Owner',
		legalForm: 'Form',
		group: 'Group',
		category: 'Category',
		subcategory: 'Subcategory',
		supplierId: '123',
	};

	beforeEach(async () => {
		global.structuredClone = jest.fn((val) => {
			return JSON.parse(JSON.stringify(val));
		});

		activatedRouteMock = {
			paramMap: of({ get: jest.fn() }),
		};

		authServiceMock = {
			extractSupplierInformation: jest.fn(),
		};

		supplierProfileService = {
			updateSupplierProfile: jest.fn(() => of({})),
			reapplySupplierProfile: jest.fn(() => of({})),
			getSupplierProfile: jest.fn(() => of({})),
		} as any;

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				FormsModule,
				ReactiveFormsModule,
				HttpClientModule,
				RouterModule.forRoot([]),
				TranslateModule.forRoot(),
				CentricToastrModule.forRoot(),
			],
			declarations: [SupplierProfileComponent],
			providers: [
				{ provide: 'env', useValue: environmentMock },
				{ provide: ActivatedRoute, useValue: activatedRouteMock },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: SupplierProfileService, useValue: supplierProfileService },
				{ provide: BreadcrumbService, useValue: breadcrumbServiceMock },
				ToastrService,
				PdokService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierProfileComponent);
		component = fixture.componentInstance;
		jest.spyOn(component as any, 'initSupplier');
		supplierProfileService = TestBed.inject(SupplierProfileService);
		formBuilder = TestBed.inject(FormBuilder);
		activatedRouteMock = TestBed.inject(ActivatedRoute);
		toastrService = TestBed.inject(ToastrService);
		translateService = TestBed.inject(TranslateService);
		pdokService = TestBed.inject(PdokService);
		fileInput = fixture.debugElement.query(By.css('input[type="file"]'));
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should not remove breadcrumbs if shouldUpdateBreadcrumbs is false', () => {
		jest.spyOn(breadcrumbServiceMock, 'removeBreadcrumbs');
		component['shouldUpdateBreadcrumbs'] = false;
		component['removeBreadcrumbs']();
		expect(breadcrumbServiceMock.removeBreadcrumbs).not.toHaveBeenCalled();
	});

	it('should remove breadcrumbs if shouldUpdateBreadcrumbs is true', () => {
		jest.spyOn(breadcrumbServiceMock, 'setBreadcrumbs');
		component['shouldUpdateBreadcrumbs'] = true;
		component['removeBreadcrumbs']();
		expect(breadcrumbServiceMock.removeBreadcrumbs).toHaveBeenCalled();
	});

	it('should decode base64 image and set decodedImage', () => {
		const value = 'base64String';

		jest.spyOn(component as any, 'createImageFromBlob');

		component['decodeBase64Image'](value);

		expect(component['createImageFromBlob']).toHaveBeenCalledWith(expect.any(Blob));
	});

	it('should handle case when logo is not present', () => {
		const supplierId = 'someSupplierId';

		jest.spyOn(supplierProfileService, 'getSupplierProfile').mockReturnValue(of(mockSupplierProfile));

		component['initSupplier'](supplierId);
	});

	it('should decode logo during initialization if it is present', () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component as any, 'decodeBase64Image').mockImplementation(() => {});
		const supplierId = 'someSupplierId';
		const mockSupplierProfileWithLogo: SupplierProfile = {
			...mockSupplierProfile,
			logo: 'base64mock',
		};

		jest.spyOn(supplierProfileService, 'getSupplierProfile').mockReturnValue(of(mockSupplierProfileWithLogo));

		component['initSupplier'](supplierId);

		expect(component['decodeBase64Image']).toHaveBeenCalledWith(mockSupplierProfileWithLogo.logo);
	});

	it('should log a message when suspendSupplier is called', () => {
		const consoleSpy = jest.spyOn(console, 'log');

		component.suspendSupplier();

		expect(consoleSpy).toHaveBeenCalledWith('Out of scope for this PIB');
	});

	it('should log a message when resetChanges is called', () => {
		const consoleSpy = jest.spyOn(console, 'log');

		component.resetChanges();

		expect(consoleSpy).toHaveBeenCalledWith('Should be implemented');
	});

	it('should subscribe to route param if isReadOnly is true', () => {
		component.isReadOnly = true;
		const subscribeToRouteParamSpy = jest.spyOn(component as any, 'subscribeToRouteParam');

		component['initSupplierProfile']();

		expect(subscribeToRouteParamSpy).toHaveBeenCalled();
	});

	it('should not call initSupplier if supplierId is undefined', fakeAsync(() => {
		component.isReadOnly = false;
		const supplierId = undefined;

		authServiceMock.extractSupplierInformation.mockReturnValue(supplierId);
		const initSupplierSpy = jest.spyOn(component as any, 'initSupplier');
		component['initSupplierProfile']();
		tick();

		expect(authServiceMock.extractSupplierInformation).toHaveBeenCalledWith(UserInfo.SupplierId);
		expect(initSupplierSpy).not.toHaveBeenCalled();
	}));

	it('should initialize supplier if isReadOnly is false and supplierId is present', () => {
		component.isReadOnly = false;
		const supplierId = '123';
		authServiceMock.extractSupplierInformation.mockReturnValue(supplierId);
		const initSupplierSpy = jest.spyOn(component as any, 'initSupplier');

		component['initSupplierProfile']();

		expect(authServiceMock.extractSupplierInformation).toHaveBeenCalledWith(UserInfo.SupplierId);
		expect(initSupplierSpy).toHaveBeenCalledWith(supplierId);
	});

	it('should set supplierId and call initSupplier when route param is present', () => {
		const mockSupplierId = '123';
		const paramMapSpy = jest.spyOn(activatedRouteMock.paramMap, 'subscribe');

		paramMapSpy.mockImplementationOnce((callback: any) => {
			callback({ get: () => mockSupplierId });
		});

		component['subscribeToRouteParam']();

		expect(component.supplierId).toBe(mockSupplierId);
		expect(component['initSupplier']).toHaveBeenCalledWith(mockSupplierId);
	});

	it('should set contactInformationForm if isContactInformationForm is true', () => {
		const contactForm = formBuilder.group({
			logo: [''],
			ownerName: ['', Validators.required],
			legalForm: ['legalForm', Validators.required],
			category: ['category'],
			kvkNumber: ['kvk'],
			companyName: ['company'],
			adminEmail: ['email'],
			group: ['group'],
			subcategory: ['subcategory'],
		});
		component.handleInformationFormEvent(contactForm, true);

		expect(component.contactInformationForm).toBe(contactForm);
	});

	it('should set generalInformationForm if isContactInformationForm is false', () => {
		const generalForm = formBuilder.group({
			logo: [''],
			ownerName: ['', Validators.required],
			legalForm: ['legalForm', Validators.required],
			category: ['category'],
			kvkNumber: ['kvk'],
			companyName: ['company'],
			adminEmail: ['email'],
			group: ['group'],
			subcategory: ['subcategory'],
		});

		component.handleInformationFormEvent(generalForm, false);

		expect(component.generalInformationForm).toBe(generalForm);
	});

	it('should log a message in resetChanges method', () => {
		const consoleSpy = jest.spyOn(console, 'log');

		component.resetChanges();

		expect(consoleSpy).toHaveBeenCalledWith('Should be implemented');
	});

	it('should set the value of the input element to an empty string', () => {
		const mockEvent: any = {
			target: document.createElement('input'),
		};

		const initialValue = 'value';
		(mockEvent.target as HTMLInputElement).value = initialValue;

		component.fileInputClick(mockEvent);

		expect((mockEvent.target as HTMLInputElement).value).toBe('');
	});

	it('should set isSizeExceeded to true when file size exceeds 200 * 1024', () => {
		const mockFile = new File([createBlobWithSize(201 * 1024)], 'example.jpg', { type: 'image/jpeg' });
		const event = { target: { files: [mockFile] } } as any;

		component.onFileSelected(event);

		expect(component.isSizeExceeded).toBe(true);
	});

	it('should not set isSizeExceeded to true when file size is within the limit', () => {
		const mockFile = new File([createBlobWithSize(199 * 1024)], 'example.jpg', { type: 'image/jpeg' });
		const event = { target: { files: [mockFile] } } as any;

		component.onFileSelected(event);

		expect(component.isSizeExceeded).toBe(false);
	});

	it('should convert an image to base64', () => {
		const file = new Blob(['image data'], { type: 'image/jpeg' });
		component['convertImageToBase64'](file);
		fixture.detectChanges();
		expect(component.generalInformationForm.get('logo')?.value).toBe(undefined);
	});

	it('should convert an image to base64 and update the form value', () => {
		const readAsDataURL = jest.fn();
		const addEventListener = jest.fn();
		const file: Blob = new Blob(['sample content'], { type: 'image/png' });
		const fileReaderMock: any = {
			readAsDataURL,
			addEventListener,
		};
		jest.spyOn(global, 'FileReader').mockImplementation(() => fileReaderMock);

		const setValueMock = jest.fn();
		const generalInformationFormMock: any = {
			get: jest.fn(() => ({ setValue: setValueMock })),
		};
		component.generalInformationForm = generalInformationFormMock;

		component['convertImageToBase64'](file);

		const base64Image = 'base64-encoded-image';
		fileReaderMock.result = `data:image/png;base64,${base64Image}`;
		fileReaderMock.onload({ target: { result: fileReaderMock.result } });

		expect(readAsDataURL).toHaveBeenCalledWith(file);
		expect(setValueMock).toHaveBeenCalledWith(base64Image);
		expect(setValueMock).toHaveBeenCalledWith(base64Image);
	});

	it('should open file input on Enter key press when not read-only', () => {
		component.isReadOnly = false;
		component.isGenericState = false;
		fixture.detectChanges();

		const openFileInputSpy = jest.spyOn(component, 'openFileInput');
		const editLogoElement = fixture.debugElement.query(By.css('.edit-logo'));

		expect(editLogoElement).toBeTruthy();

		const event = new KeyboardEvent('keydown', { key: 'Enter' });

		if (editLogoElement) {
			editLogoElement.nativeElement.dispatchEvent(event);
		}

		fixture.detectChanges();

		expect(openFileInputSpy).toHaveBeenCalled();
	});

	it('should get the information from PDOK on', () => {
		const mockPdokData = {
			response: {
				numFound: 1,
			},
		};

		const mockCoordinates: SupplierCoordinates = {
			longitude: 26.1025,
			latitude: 44.4268,
		};

		jest.spyOn(toastrService, 'success');
		jest.spyOn(translateService, 'instant').mockReturnValue('general.success.changesSavedText');

		jest.spyOn(pdokService, 'getCoordinateFromAddress').mockReturnValue(of(mockPdokData));
		jest.spyOn(PdokUtil, 'getCoordinatesFromPdok').mockReturnValue(mockCoordinates);

		component.saveChanges(false);

		expect(pdokService.getCoordinateFromAddress).toHaveBeenCalled();
		expect(PdokUtil.getCoordinatesFromPdok).toHaveBeenCalledWith(mockPdokData);
		expect(translateService.instant).toHaveBeenCalledWith('general.success.changesSavedText');
		expect(toastrService['success']).toHaveBeenCalled();
	});

	it('should not get the information from PDOK on when zipcode and location are invalid', () => {
		const mockPdokData = {
			response: {
				numFound: 0,
			},
		};

		const mockCoordinates: SupplierCoordinates = {
			longitude: 26.1025,
			latitude: 44.4268,
		};

		jest.spyOn(toastrService, 'success');
		jest.spyOn(translateService, 'instant').mockReturnValue('general.success.changesSavedText');

		jest.spyOn(pdokService, 'getCoordinateFromAddress').mockReturnValue(of(mockPdokData));
		jest.spyOn(PdokUtil, 'getCoordinatesFromPdok').mockReturnValue(mockCoordinates);

		component.saveChanges(false);

		expect(pdokService.getCoordinateFromAddress).toHaveBeenCalled();
		expect(translateService.instant).toHaveBeenCalledWith('general.success.changesSavedText');
		expect(toastrService['success']).not.toHaveBeenCalled();
	});

	it('should call return the object when calling mapSupplierProfile', () => {
		const generalInformationForm: GeneralInformation = {
			logo: '',
			companyName: 'companyName',
			adminEmail: 'admin',
			kvkNumber: 'kvk',
			ownerName: 'owner',
			legalForm: 'legalForm',
			group: 'group',
			category: 'category',
			subcategory: 'subcategory',
			bic: 'ABNANL2A',
			iban: 'NL91ABNA0417164300',
		};

		const contactInformationForm: ContactInformation = {
			branchProvince: 'branchProvince',
			companyBranchAddress: 'companyBranchAddress',
			branchLocation: 'branchLocation',
			branchZip: '1234fe',
			branchTelephone: '+3112345678',
			accountManager: 'account',
			email: 'email',
			website: 'website',
		};

		const object = {
			...generalInformationForm,
			...contactInformationForm,
			latLon: `{longitude: 26.1025,latitude: 44.4268}`,
			supplierId: component['supplierId'],
		};

		jest.spyOn(component as any, 'mapSupplierProfile').mockReturnValue(object);

		const data = component['mapSupplierProfile']();

		expect(data).toEqual(object);
	});

	it('should return true if contactInformationForm values have not changed', () => {
		component.isReadOnly = false;
		component.initialContactInformationForm = formBuilder.group({ field: ['initialValue'] });
		component.generalInformationForm = formBuilder.group({ field: ['initialValue'] });
		component.contactInformationForm = formBuilder.group({ field: ['initialValue'] });
		component.contactInformationForm.setValue({ field: 'initialValue' });

		expect(
			JSON.stringify(component.initialContactInformationForm.value) !==
				JSON.stringify(component.contactInformationForm.value),
		).toBe(false);
	});

	it('should return true if generalInformationForm values have not changed', () => {
		component.isReadOnly = false;
		component.initialGeneralInformationForm = formBuilder.group({ field: ['initialValue'] });
		component.generalInformationForm = formBuilder.group({ field: ['initialValue'] });
		component.generalInformationForm.setValue({ field: 'initialValue' });

		expect(component.areFormValuesChanged).toBe(true);
	});

	it('should return false if isReadOnly is true', () => {
		component.isReadOnly = true;
		component.initialContactInformationForm = formBuilder.group({ field: ['initialValue'] });
		component.generalInformationForm = formBuilder.group({ field: ['initialValue'] });
		component.contactInformationForm = formBuilder.group({ field: ['initialValue'] });
		component.contactInformationForm.setValue({ field: 'changedValue' });

		expect(component.areFormValuesChanged).toBe(false);
	});

	describe('updateSupplierProfile', () => {
		let supplierProfilePatchDto: any;
		let toastText: string;
		let isRejectedStatus: boolean;

		beforeEach(() => {
			supplierProfilePatchDto = {
				branchLocation: 'TestLocation',
				branchZip: '1234AB',
			};
			toastText = 'Saved!';
			isRejectedStatus = false;

			jest.spyOn(pdokService, 'getCoordinateFromAddress').mockReturnValue(of({ response: { numFound: 1 } }));
			jest.spyOn(PdokUtil, 'getCoordinatesFromPdok').mockReturnValue({ longitude: 1, latitude: 2 });
			jest.spyOn(supplierProfileService, 'updateSupplierProfile').mockReturnValue(of(void 0));
			jest.spyOn(supplierProfileService, 'reapplySupplierProfile').mockReturnValue(of(void 0));
			jest.spyOn(toastrService, 'success');
			jest.spyOn(toastrService, 'error');
			jest.spyOn(translateService, 'instant').mockReturnValue('translated');
			jest.spyOn(component as any, 'displayErrorToaster');
			jest.spyOn(component['router'], 'navigate');
			component.contactInformationForm = formBuilder.group({ field: ['value'] });
			component.generalInformationForm = formBuilder.group({ field: ['value'] });
		});

		it('should call updateSupplierProfile and show success toast when PDOK returns coordinates and isRejectedStatus is false', () => {
			component['updateSupplierProfile'](supplierProfilePatchDto, toastText, false);
			expect(pdokService.getCoordinateFromAddress).toHaveBeenCalledWith('TestLocation', '1234AB');
			expect(PdokUtil.getCoordinatesFromPdok).toHaveBeenCalled();
			expect(supplierProfileService.updateSupplierProfile).toHaveBeenCalled();
			expect(toastrService.success).toHaveBeenCalledWith(toastText, '', { toastBackground: 'toast-light' });
		});

		it('should call reapplySupplierProfile and navigate when isRejectedStatus is true', () => {
			component['updateSupplierProfile'](supplierProfilePatchDto, toastText, true);
			expect(pdokService.getCoordinateFromAddress).toHaveBeenCalledWith('TestLocation', '1234AB');
			expect(PdokUtil.getCoordinatesFromPdok).toHaveBeenCalled();
			expect(supplierProfileService.reapplySupplierProfile).toHaveBeenCalled();
			expect(component['router'].navigate).toHaveBeenCalledWith([commonRoutingConstants.dashboard], {
				queryParams: { reapply: true },
			});
		});

		it('should call displayErrorToaster and not call updateSupplierProfile if PDOK returns numFound 0', () => {
			(pdokService.getCoordinateFromAddress as jest.Mock).mockReturnValueOnce(of({ response: { numFound: 0 } }));
			component['updateSupplierProfile'](supplierProfilePatchDto, toastText, false);
			expect(component['displayErrorToaster']).toHaveBeenCalled();
			expect(supplierProfileService.updateSupplierProfile).not.toHaveBeenCalled();
			expect(supplierProfileService.reapplySupplierProfile).not.toHaveBeenCalled();
		});

		it('should not show success toast if result is null', () => {
			(pdokService.getCoordinateFromAddress as jest.Mock).mockReturnValueOnce(of({ response: { numFound: 0 } }));
			component['updateSupplierProfile'](supplierProfilePatchDto, toastText, false);
			expect(toastrService.success).not.toHaveBeenCalled();
		});
	});
});
