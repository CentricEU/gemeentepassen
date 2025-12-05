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
import { AuthService, MockRouter, PdokService, PdokUtil, SupplierCoordinates } from '@frontend/common';
import { ContactInformation, GeneralInformation, UserDto, UserService } from '@frontend/common';
import {
	ContactInformationComponent,
	GeneralInformationComponent,
	WindmillModule,
	WorkingHoursEditComponent,
} from '@frontend/common-ui';
import { AriaAttributesDirective } from '@innovation/accesibility';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CentricStepperModule, DialogService, ToastrService } from '@windmill/ng-windmill';
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

		const mockUserService = {
			userInformationObservable: {
				subscribe: jest.fn(),
			},
			addUserInformation: jest.fn(),
		};

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
				{ provide: UserService, userValue: mockUserService },
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

		const supplierProfile = component['mapSupplierProfile']();

		const createWorkingHour = (day: number) => ({
			closeTime: '00:00:00',
			day,
			id: undefined,
			isChecked: false,
			openTime: '00:00:00',
		});

		const workingHours = Array.from({ length: 7 }, (_, index) => createWorkingHour(index + 1));

		const object = {
			...generalInformationForm,
			...contactInformationForm,
			supplierId: component['supplierId'],
			workingHours,
		};

		const objectToTest: any = object;

		objectToTest.legalForm = parseInt(object.legalForm, 10);
		objectToTest.group = parseInt(object.group, 10);
		objectToTest.category = parseInt(object.category, 10);
		objectToTest.subcategory = parseInt(object.subcategory, 10);

		expect(supplierProfile).toEqual(object);
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

		const displayApprovalWaitingPopupSpy = jest.spyOn(component as any, 'displayApprovalWaitingPopup');
		const removeLogoSpy = jest.spyOn(component as any, 'removeLocalStorageData');

		jest.spyOn(pdokService, 'getCoordinateFromAddress').mockReturnValue(of(mockPdokData));
		jest.spyOn(PdokUtil, 'getCoordinatesFromPdok').mockReturnValue(mockCoordinates);

		component.saveSupplierSetupProfile();

		expect(dialogRef.close).toBeCalled();

		expect(pdokService.getCoordinateFromAddress).toHaveBeenCalled();
		expect(PdokUtil.getCoordinatesFromPdok).toHaveBeenCalledWith(mockPdokData);

		expect(displayApprovalWaitingPopupSpy).toBeCalled();
		expect(removeLogoSpy).toBeCalled();
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

		expect(dialogRef.close).toBeCalled();

		expect(pdokService.getCoordinateFromAddress).toHaveBeenCalled();
		expect(displayErrorToasterSpy).toBeCalled();
		expect(displayApprovalWaitingPopupSpy).not.toBeCalled();
		expect(removeLogoSpy).not.toBeCalled();
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
		component.goToNextStep();
		expect(nextSpy).toHaveBeenCalled();
	});

	it('should go to the previous step', () => {
		const previousSpy = jest.spyOn(component.horizontalStepper, 'previous');
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
		const supplierProfile = component['mapSupplierProfile']();
		expect(supplierProfile).toEqual({
			...contactInformationForm,
			...generalInformationForm,
			legalForm: parseInt(generalInformationForm.legalForm, 10),
			group: parseInt(generalInformationForm.group, 10),
			category: parseInt(generalInformationForm.category, 10),
			subcategory: parseInt(generalInformationForm.subcategory, 10),
			supplierId: component['supplierId'],
			workingHours: component.workingHoursEdit.mapWorkingHours(),
		});
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
			component.horizontalStepper.selectedIndex = Number(step);
			jest.spyOn(component.workingHoursEdit, 'isFormValid').mockReturnValue(workingHoursValid);

			expect(component.shouldShowFinishButton()).toBe(expected);
		},
	);
});
