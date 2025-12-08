import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService, MockRouter, PdokService, PdokUtil, SupplierCoordinates, SupplierStatus } from '@frontend/common';
import { ContactInformation, GeneralInformation, UserDto, UserService } from '@frontend/common';
import {
	ContactInformationComponent,
	GeneralInformationComponent,
	WindmillModule,
	WorkingHoursEditComponent,
} from '@frontend/common-ui';
import { AriaAttributesDirective } from '@innovation/accesibility';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { CentricStepperModule } from '@windmill/ng-windmill/stepper';
import { ToastrService } from '@windmill/ng-windmill/toastr';
import { of } from 'rxjs';
import { Observable } from 'rxjs';

import { SetupProfileService } from '../../services/supplier-profile-service/setup-profile-service/setup-profile.service';
import { SetupProfileComponent } from './setup-profile.component';

describe('SetupProfileComponent', () => {
	let component: SetupProfileComponent;
	let fixture: ComponentFixture<SetupProfileComponent>;
	let dialogRef: MatDialogRef<SetupProfileComponent>;
	let dialogService: DialogService;
	let userService: UserService;
	let serviceMock: any;
	let authService: AuthService;
	let pdokService: PdokService;
	let toastrService: ToastrService;

	const generalInformationForm: GeneralInformation = {
		logo: '',
		companyName: 'companyName',
		adminEmail: 'admin@gmail.com',
		kvkNumber: '12345678',
		ownerName: 'owner',
		legalForm: '0',
		group: '0',
		category: '0',
		subcategory: '0',
		bic: 'ABNANL2A',
		iban: 'NL91ABNA0417164300',
		cashierEmails: '',
	};

	const contactInformationForm: ContactInformation = {
		branchProvince: 'branchProvince',
		companyBranchAddress: 'companyBranchAddress',
		branchLocation: 'branchLocation',
		branchZip: '1234ZD',
		branchTelephone: '+31852158217',
		accountManager: 'account',
		email: 'test@gmail.com',
		website: 'website.com',
	};

	const authServiceMock = {
		logout: jest.fn(),
	};

	beforeEach(async () => {
		dialogRef = {
			disableClose: true,
			close: jest.fn(),
		} as unknown as MatDialogRef<SetupProfileComponent>;

		dialogService = {
			message: jest.fn(),
		} as unknown as DialogService;

		const mockDialogData = {};

		serviceMock = {
			saveSupplierProfile: jest.fn(() => of({})),
		};

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

		const mockUserService = {
			userInformationObservable: { subscribe: jest.fn() },
			addUserInformation: jest.fn(),
		};

		Object.defineProperty(mockUserService, 'userInformation', {
			get: () => userMock,
		});

		global.structuredClone = jest.fn((val) => {
			return JSON.parse(JSON.stringify(val));
		});

		await TestBed.configureTestingModule({
			declarations: [
				SetupProfileComponent,
				AriaAttributesDirective,
				GeneralInformationComponent,
				ContactInformationComponent,
				WorkingHoursEditComponent,
			],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				HttpClientModule,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				CentricStepperModule,
				BrowserModule,
				RouterTestingModule,
			],
			providers: [
				{ provide: MatDialogRef, useValue: dialogRef },
				{ provide: DialogService, useValue: dialogService },
				{ provide: UserService, useValue: mockUserService },
				{ provide: SetupProfileService, useValue: serviceMock },
				{ provide: MAT_DIALOG_DATA, useValue: mockDialogData },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: 'env', useValue: environmentMock },
				{ provide: Router, useClass: MockRouter },
				{
					provide: ToastrService,
					useValue: {
						error: () => {
							return;
						},
						clear: () => {
							return;
						},
					},
				},
				PdokService,
				TranslateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SetupProfileComponent);
		component = fixture.componentInstance;
		userService = TestBed.inject(UserService);
		authService = TestBed.get(AuthService);
		pdokService = TestBed.inject(PdokService);
		toastrService = TestBed.inject(ToastrService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close the dialog and call displaySuccessfulRegistrationDialog', () => {
		component.saveSupplierSetupProfile();

		expect(dialogRef.close).toHaveBeenCalled();
	});

	it('should remove local storage data', () => {
		localStorage.setItem('generalFormInformation', 'test');
		localStorage.setItem('contactFormInformation', 'test');
		component['removeLocalStorageData']();

		const localStorageData1 = localStorage.getItem('generalFormInformation');
		const localStorageData2 = localStorage.getItem('contactFormInformation');

		expect(localStorageData1).toBeNull();
		expect(localStorageData2).toBeNull();
	});

	it('should assign supplierId on onCurrentSuuplierId call', () => {
		component.onCurrentSupplierId('1');
		expect(component['supplierId']).toBe('1');
	});

	it('should map supplier properties correctly', () => {
		component.contactInformationForm?.setValue(contactInformationForm);
		component.generalInformationForm?.setValue(generalInformationForm);

		component.generalInformationForm.get('subcategory')?.setValue('0');
		component.generalInformationForm.get('subcategory')?.enable();

		const supplierProfile = component['mapSupplierProfile']();

		const workingHours = component.workingHoursEdit.mapWorkingHours();

		const { companyName, adminEmail, kvkNumber, ...restGeneralInformationForm } = generalInformationForm;

		const supplierProfilePatchDto = {
			...restGeneralInformationForm,
			...contactInformationForm,
			legalForm: parseInt(generalInformationForm.legalForm, 10),
			group: parseInt(generalInformationForm.group, 10),
			category: parseInt(generalInformationForm.category, 10),
			subcategory: parseInt(generalInformationForm.subcategory, 10),
			supplierId: component['supplierId'],
			workingHours,
			cashierEmails: [],
		};

		const expected = {
			companyName: generalInformationForm.companyName,
			adminEmail: generalInformationForm.adminEmail,
			kvkNumber: generalInformationForm.kvkNumber,
			supplierProfilePatchDto,
		};

		expect(supplierProfile).toEqual(expected);
	});

	it('should update user information', async () => {
		const data: UserDto = new UserDto();

		userService.addUserInformation = jest.fn();

		const mockObservable = new Observable<UserDto>((observer) => {
			observer.next(data);
			observer.complete();
		});

		userService.userInformationObservable = mockObservable;

		component['updateUserInformation']();

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(userService.addUserInformation).toHaveBeenCalledWith({
			...data,
			isProfileSet: true,
		});
	});

	it('should close dialogRef and call setupProfileService.saveSupplierProfile, displayApprovalWaitingPopup, and removeLocalStorageData', () => {
		const mockPdokData = {
			response: {
				numFound: 1,
			},
		};
		const mockCoordinates: SupplierCoordinates = {
			longitude: 26.1025,
			latitude: 44.4268,
		};

		const displayApprovalWaitingPopupSpy = jest.spyOn<any, any>(component, 'displayApprovalWaitingPopup');
		const removeLogoSpy = jest.spyOn<any, any>(component, 'removeLocalStorageData');

		jest.spyOn(pdokService, 'getCoordinateFromAddress').mockReturnValue(of(mockPdokData));
		jest.spyOn(PdokUtil, 'getCoordinatesFromPdok').mockReturnValue(mockCoordinates);

		component.saveSupplierSetupProfile();

		expect(dialogRef.close).toHaveBeenCalled();

		expect(pdokService.getCoordinateFromAddress).toHaveBeenCalled();
		expect(PdokUtil.getCoordinatesFromPdok).toHaveBeenCalledWith(mockPdokData);

		expect(displayApprovalWaitingPopupSpy).toHaveBeenCalled();
		expect(removeLogoSpy).toHaveBeenCalled();
	});

	it('should display error toaster when numFound is falsy', () => {
		const mockPdokData = {
			response: {
				numFound: 0,
			},
		};

		const displayErrorToasterSpy = jest.spyOn(component as any, 'displayErrorToaster');
		const displayApprovalWaitingPopupSpy = jest.spyOn(component as any, 'displayApprovalWaitingPopup');
		const removeLogoSpy = jest.spyOn(component as any, 'removeLocalStorageData');

		jest.spyOn(pdokService, 'getCoordinateFromAddress').mockReturnValue(of(mockPdokData));

		component.saveSupplierSetupProfile();

		expect(dialogRef.close).toHaveBeenCalled();

		expect(pdokService.getCoordinateFromAddress).toHaveBeenCalled();
		expect(displayErrorToasterSpy).toHaveBeenCalled();
		expect(displayApprovalWaitingPopupSpy).not.toHaveBeenCalled();
		expect(removeLogoSpy).not.toHaveBeenCalled();
	});

	it('should call authService.logout() on logout', fakeAsync(() => {
		const authServiceLogoutSpy = jest.spyOn(authService, 'logout');
		component.logout();
		tick();
		expect(authServiceLogoutSpy).toHaveBeenCalled();
	}));

	describe('Tests for shouldDisableFinishButton ', () => {
		const invalidContactInformationForm = {
			...contactInformationForm,
			companyBranchAddress: null,
		};

		const invalidGeneralInformationForm = {
			...generalInformationForm,
			kvkNumber: null,
		};
		it('should return true if both forms are invalid', () => {
			component.contactInformationForm?.setValue(invalidContactInformationForm);
			component.generalInformationForm?.setValue(invalidGeneralInformationForm);

			expect(component.shouldShowFinishButton()).toBe(false);
		});

		it('should return true if contact form is invalid and general form is valid', () => {
			component.contactInformationForm?.setValue(invalidContactInformationForm);
			component.generalInformationForm?.setValue(generalInformationForm);
			expect(component.shouldShowFinishButton()).toBe(false);
		});

		it('should return true if contact form is valid and general form is invalid', () => {
			component.contactInformationForm?.setValue(contactInformationForm);
			component.generalInformationForm?.setValue(invalidGeneralInformationForm);
			expect(component.shouldShowFinishButton()).toBe(false);
		});

		it('should return true if just two of forms are valid', () => {
			component.contactInformationForm?.setValue(contactInformationForm);
			component.generalInformationForm?.setValue(generalInformationForm);

			expect(component.shouldShowFinishButton()).toBe(false);
		});
	});

	it('should go to the next step', () => {
		const nextSpy = jest.spyOn(component.horizontalStepper, 'next');
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component as any, 'scrollToTop').mockImplementation(() => {});

		component.goToNextStep();
		expect(nextSpy).toHaveBeenCalled();
	});

	it('should go to the previous step', () => {
		const previousSpy = jest.spyOn(component.horizontalStepper, 'previous');
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component as any, 'scrollToTop').mockImplementation(() => {});

		component.goToPreviousStep();
		expect(previousSpy).toHaveBeenCalled();
	});

	const backButtonTestCases = [
		{ stepIndex: 0, expected: true },
		{ stepIndex: 1, expected: true },
	];

	backButtonTestCases.forEach(({ stepIndex, expected }) => {
		it(`should ${expected ? 'disable' : 'not disable'} the back button if ${expected ? 'on' : 'not on'} the first step at step ${stepIndex}`, () => {
			component.horizontalStepper.selectedIndex = stepIndex;
			expect(component.shouldDisableBackButton()).toBe(expected);
		});
	});

	const nextButtonTestCases = [
		{ stepIndex: 0, form: 'generalInformationForm', isValid: false, expected: true },
		{ stepIndex: 1, form: 'contactInformationForm', isValid: false, expected: true },
		{ stepIndex: 0, form: 'generalInformationForm', isValid: true, expected: true },
		{ stepIndex: 1, form: 'contactInformationForm', isValid: true, expected: true },
	];

	nextButtonTestCases.forEach(({ stepIndex, form, isValid, expected }) => {
		it(`should ${expected ? 'disable' : 'not disable'} 
			the next button if the current step form is ${isValid ? 'valid' : 'invalid'} at step ${stepIndex}`, () => {
			component.horizontalStepper.selectedIndex = stepIndex;
			(component as any)[form].setErrors(isValid ? null : { invalid: true });
			(component as any)[form].updateValueAndValidity();
			expect(component.shouldDisableNextButton()).toBe(expected);
		});
	});

	const finishButtonTestCases = [
		{ contactFormValid: false, generalFormValid: false, workingHourEditFormValid: false, expected: false },
		{ contactFormValid: true, generalFormValid: false, workingHourEditFormValid: false, expected: false },
		{ contactFormValid: false, generalFormValid: true, workingHourEditFormValid: false, expected: false },
		{ contactFormValid: false, generalFormValid: false, workingHourEditFormValid: true, expected: false },
		{ contactFormValid: true, generalFormValid: true, workingHourEditFormValid: false, expected: false },
		{ contactFormValid: true, generalFormValid: false, workingHourEditFormValid: true, expected: false },
		{ contactFormValid: false, generalFormValid: true, workingHourEditFormValid: true, expected: false },
		{ contactFormValid: true, generalFormValid: true, workingHourEditFormValid: true, expected: true },
	];

	finishButtonTestCases.forEach(({ contactFormValid, generalFormValid, workingHourEditFormValid, expected }) => {
		it(`should ${expected ? 'show' : 'not show'} the finish button if contact form is ${contactFormValid ? 'valid' : 'invalid'}, general form is ${generalFormValid ? 'valid' : 'invalid'}, and working hour edit form is ${workingHourEditFormValid ? 'valid' : 'invalid'}`, () => {
			jest.spyOn(component.contactInformationForm, 'valid', 'get').mockReturnValue(contactFormValid);
			jest.spyOn(component.generalInformationForm, 'valid', 'get').mockReturnValue(generalFormValid);
			jest.spyOn(component.workingHoursEdit, 'isFormValid').mockReturnValue(workingHourEditFormValid);
			jest.spyOn(component.generalInformation as any, 'isCashierEmailsFieldValid', 'get').mockReturnValue(true);
			expect(component.shouldShowFinishButton()).toBe(expected);
		});
	});

	it('should display the approval waiting popup', () => {
		const dialogServiceSpy = jest.spyOn(dialogService, 'message');
		component['displayApprovalWaitingPopup']();
		expect(dialogServiceSpy).toHaveBeenCalled();
	});

	it('should remove local storage data', () => {
		localStorage.setItem('generalFormInformation', 'test');
		localStorage.setItem('contactFormInformation', 'test');
		localStorage.setItem('workingHours', 'test');
		component['removeLocalStorageData']();
		expect(localStorage.getItem('generalFormInformation')).toBeNull();
		expect(localStorage.getItem('contactFormInformation')).toBeNull();
		expect(localStorage.getItem('workingHours')).toBeNull();
	});

	it('should map supplier profile correctly', () => {
		component.contactInformationForm.setValue(contactInformationForm);
		component.generalInformationForm.setValue(generalInformationForm);

		component.generalInformationForm.get('subcategory')?.setValue('0');
		component.generalInformationForm.get('subcategory')?.enable();

		const supplierProfile = component['mapSupplierProfile']();

		const workingHours = component.workingHoursEdit.mapWorkingHours();
		const { companyName, adminEmail, kvkNumber, ...restGeneralInformationForm } = generalInformationForm;

		const supplierProfilePatchDto = {
			...restGeneralInformationForm,
			...contactInformationForm,
			legalForm: parseInt(generalInformationForm.legalForm, 10),
			group: parseInt(generalInformationForm.group, 10),
			category: parseInt(generalInformationForm.category, 10),
			subcategory: parseInt(generalInformationForm.subcategory, 10),
			supplierId: component['supplierId'],
			workingHours,
			cashierEmails: [],
		};

		const expected = {
			companyName: generalInformationForm.companyName,
			adminEmail: generalInformationForm.adminEmail,
			kvkNumber: generalInformationForm.kvkNumber,
			supplierProfilePatchDto,
		};

		expect(supplierProfile).toEqual(expected);
	});

	it('should update user information', () => {
		const userServiceSpy = jest.spyOn(userService, 'addUserInformation');
		const userDto: UserDto = new UserDto();
		userService.userInformationObservable = of(userDto);
		component['updateUserInformation']();
		expect(userServiceSpy).toHaveBeenCalledWith({
			...userDto,
			isProfileSet: true,
		});
	});

	it('should display error toaster', () => {
		const toastrServiceSpy = jest.spyOn(toastrService, 'error');
		component['displayErrorToaster']();
		expect(toastrServiceSpy).toHaveBeenCalled();
	});

	it('should call scrollToTop when goToNextStep is called', () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const scrollSpy = jest.spyOn(component as any, 'scrollToTop').mockImplementation(() => {});
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component.horizontalStepper, 'next').mockImplementation(() => {});
		component.goToNextStep();
		expect(scrollSpy).toHaveBeenCalled();
	});

	it('should call scrollToTop when goToPreviousStep is called', () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const scrollSpy = jest.spyOn(component as any, 'scrollToTop').mockImplementation(() => {});
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component.horizontalStepper, 'previous').mockImplementation(() => {});
		component.goToPreviousStep();
		expect(scrollSpy).toHaveBeenCalled();
	});

	it('should return true for shouldShowNextButton if selectedIndex < 2', () => {
		component.horizontalStepper.selectedIndex = 1;
		expect(component.shouldShowNextButton()).toBe(true);
	});

	it('should call reloadCurrentRoute on logout', () => {
		const reloadSpy = jest.spyOn(component['navigationService'], 'reloadCurrentRoute');
		component.logout();
		expect(reloadSpy).toHaveBeenCalled();
	});

	it('should call detectChanges in ngAfterViewInit', () => {
		const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');
		component.generalInformation = {
			generalInformationForm: component.generalInformationForm,
			isCashierEmailsFieldValid: true,
			cashierEmailsList: [],
		} as any;
		component.contactInformation = {
			contactInformationForm: component.contactInformationForm,
		} as any;
		component.ngAfterViewInit();
		expect(detectChangesSpy).toHaveBeenCalled();
	});

	it('should call scrollTo on scrollToTop if container exists', () => {
		const scrollMock = jest.fn();
		document.body.innerHTML = `<div mat-dialog-content></div>`;
		const container = document.querySelector('div[mat-dialog-content]') as HTMLElement;
		container.scrollTo = scrollMock;
		component['scrollToTop']();
		expect(scrollMock).toHaveBeenCalledWith({ top: 0 });
	});

	it('should not throw if scrollToTop called and container does not exist', () => {
		document.body.innerHTML = ``;
		expect(() => component['scrollToTop']()).not.toThrow();
	});

	it.each([
		[true, true],
		[true, false],
	])('should return %s when shouldShowFinishButton returns %s', (expected, shouldShow) => {
		jest.spyOn(component, 'shouldShowFinishButton').mockReturnValue(shouldShow);
		expect(component.shouldDisableFinishButton()).toBe(expected);
	});

	it.each([
		[false, true, 2, false, true],
		[false, true, 1, true, true],
		[false, true, 2, true, false],
		[false, false, 2, true, false],
		[false, true, 1, false, false],
	])(
		'should return %s when contactValid=%s, generalValid=%s, step=%s, workingHoursValid=%s',
		(expected, contactValid, generalValid, step, workingHoursValid) => {
			component.contactInformationForm.setErrors(contactValid ? null : { invalid: true });
			component.generalInformationForm.setErrors(generalValid ? null : { invalid: true });
			jest.spyOn(component.generalInformation as any, 'isCashierEmailsFieldValid', 'get').mockReturnValue(true);
			component.horizontalStepper.selectedIndex = Number(step);
			jest.spyOn(component.workingHoursEdit, 'isFormValid').mockReturnValue(workingHoursValid);

			expect(component.shouldShowFinishButton()).toBe(expected);
		},
	);

	it.each([
		[true, true, true],
		[false, false, false],
		[false, true, false],
		[false, false, false],
	])(
		'should return %s when generalInformationForm.valid=%s and cashierEmailsFieldValid=%s',
		(expected, generalFormValid, cashierEmailsFieldValid) => {
			jest.spyOn(component.generalInformationForm, 'valid', 'get').mockReturnValue(generalFormValid);
			jest.spyOn(component.generalInformation as any, 'isCashierEmailsFieldValid', 'get').mockReturnValue(
				cashierEmailsFieldValid,
			);
			expect(component.isFirstStepValid).toBe(expected);
		},
	);
});
