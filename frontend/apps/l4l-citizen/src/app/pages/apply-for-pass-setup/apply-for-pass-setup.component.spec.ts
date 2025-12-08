import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import {
	BenefitService,
	CitizenGroupsService,
	commonRoutingConstants,
	EligibleBenefitDto,
	FormUtil,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';
import { of } from 'rxjs';

import { StepType } from '../../shared/enums/step-type.enum';
import { ApplyForPassSetupComponent } from './apply-for-pass-setup.component';

describe('ApplyForPassSetupComponent', () => {
	let component: ApplyForPassSetupComponent;
	let fixture: ComponentFixture<ApplyForPassSetupComponent>;
	let httpClientSpy: { post: jest.Mock; get: jest.Mock };

	const dialogRefStub = {
		close: () => undefined,
		keydownEvents: jest.fn(() => of({})),
		afterClosed: jest.fn(() => of({})),
		backdropClick: jest.fn(() => of({})),
	};

	jest.spyOn(CustomDialogConfigUtil, 'createMessageModal').mockImplementation((modal) => ({
		data: { title: modal.title, description: modal.mainContent },
	}));

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	const dialogServiceMock = {
		message: jest.fn().mockReturnValue({ afterClosed: () => of(true) }),
		prompt: jest.fn(),
	};

	const routerMock = {
		navigate: jest.fn(),
	};

	const citizensGroupsServiceMock = {
		startFlowPageValue: '/start-page',
		getRequiredDocumentsForCitizenGroup: jest.fn().mockReturnValue(of([])),
	};

	const benefitsServiceMock = {
		getAllBenefitsForCitizenGroup: jest.fn().mockReturnValue(
			of([
				{ name: 'Gym', description: 'Access to Gym' },
				{ name: 'Pool', description: 'Access to Swimming Pool' },
			] as EligibleBenefitDto[]),
		),
	};

	let originalResizeObserver: any;

	beforeEach(async () => {
		// Mock ResizeObserver
		originalResizeObserver = global.ResizeObserver;
		global.ResizeObserver = jest.fn().mockImplementation(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));

		const environmentMock = {
			production: false,
			envName: 'dev',
			apiPath: '/api',
		};

		httpClientSpy = { post: jest.fn(), get: jest.fn() };

		TestBed.overrideComponent(ApplyForPassSetupComponent, {
			set: {
				schemas: [NO_ERRORS_SCHEMA],
			},
		});

		await TestBed.configureTestingModule({
			imports: [
				ApplyForPassSetupComponent,
				TranslateModule.forRoot(),
				HttpClientModule,
				HttpClientTestingModule,
				NoopAnimationsModule,
			],
			providers: [
				TranslateService,
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: 'env', useValue: environmentMock },
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: ToastrService, useValue: { success: jest.fn(), error: jest.fn() } },
				{ provide: BenefitService, useValue: benefitsServiceMock },
				{ provide: CitizenGroupsService, useValue: citizensGroupsServiceMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ApplyForPassSetupComponent);
		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	afterEach(() => {
		global.ResizeObserver = originalResizeObserver;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('isStepCompleted', () => {
		it('should return true when form control value is not empty, null, or undefined', () => {
			const formControl = new FormControl('test value');
			expect(component.isStepCompleted(formControl)).toBe(true);
		});

		it('should return false when form control value is an empty string', () => {
			const formControl = new FormControl('');
			expect(component.isStepCompleted(formControl)).toBe(false);
		});
	});

	describe('isLastStepCompleted', () => {
		it('should return true when form control value is truthy', () => {
			const formControl = new FormControl('valid value');
			expect(component.isLastStepCompleted(formControl)).toBe(true);
		});
	});

	describe('onSelectedStep', () => {
		it('should update selectedIndex when a step is selected', () => {
			const event = { selectedIndex: 2 } as StepperSelectionEvent;
			component.onSelectedStep(event);
			expect(component.selectedIndex).toBe(2);
		});
	});

	describe('Warning modal methods', () => {
		it('should call openWarningModal when cancel is invoked', () => {
			const openWarningModalSpy = jest.spyOn<any, any>(component, 'openWarningModal');

			component.cancel();

			expect(openWarningModalSpy).toHaveBeenCalled();
		});

		it('should create the warning dialog config correctly', () => {
			const modal = component['createWarningDialogConfig']();
			expect(modal).toBeDefined();
			expect(modal.data.title).toBe('applyForPassSetup.warningTitle');
		});

		it('should open warning modal and perform close when user confirms', () => {
			const performCloseSpy = jest.spyOn<any, any>(component, 'performClose');

			const mockDialogRef = {
				afterClosed: () => of(true),
			} as unknown as MatDialogRef<any>;

			const messageSpy = jest.spyOn(component['dialogService'], 'message').mockReturnValue(mockDialogRef);

			component['openWarningModal']();

			expect(messageSpy).toHaveBeenCalledWith(CustomDialogComponent, expect.any(Object));
			expect(performCloseSpy).toHaveBeenCalled();
		});

		it('should perform close correctly', () => {
			component['performClose']();
			expect(routerMock.navigate).toHaveBeenCalledWith(['/start-page']);
			expect(citizensGroupsServiceMock.startFlowPageValue).toBe(commonRoutingConstants.digidCategory);
		});
	});

	describe('private methods › updateLayoutBreakpoint', () => {
		let resizeObserverMock: any;
		let stepperDiv: HTMLElement;
		let resizeCallback: (entries: ResizeObserverEntry[]) => void;

		beforeEach(() => {
			stepperDiv = document.createElement('div');
			stepperDiv.className = 'centric-stepper';
			document.body.appendChild(stepperDiv);

			resizeObserverMock = {
				observe: jest.fn(),
				unobserve: jest.fn(),
				disconnect: jest.fn(),
			};

			global.ResizeObserver = jest.fn().mockImplementation((cb) => {
				resizeCallback = cb;
				return resizeObserverMock;
			});
		});

		afterEach(() => {
			stepperDiv.remove();
			jest.restoreAllMocks();
		});

		it('should instantiate ResizeObserver and call observe', () => {
			component['updateLayoutBreakpoint']();
			expect(global.ResizeObserver).toHaveBeenCalled();
			expect(resizeObserverMock.observe).toHaveBeenCalledWith(
				expect.objectContaining({ className: expect.stringContaining('centric-stepper') }),
			);
		});

		it('should update breakpointName based on responsiveService', () => {
			component['updateLayoutBreakpoint']();

			jest.spyOn(component['responsiveService'], 'isSmall').mockReturnValue(true);
			resizeCallback([{ contentRect: { width: 500 } } as ResizeObserverEntry]);
			expect(component.breakpointName).toBe('small');

			jest.spyOn(component['responsiveService'], 'isSmall').mockReturnValue(false);
			resizeCallback([{ contentRect: { width: 1200 } } as ResizeObserverEntry]);
			expect(component.breakpointName).toBe('large');
		});
	});

	describe('onFilesUploadedChanged', () => {
		it('should update filesAdded property with uploaded files', () => {
			const mockFiles = [new File(['content'], 'test.txt', { type: 'text/plain' })];
			component.onFilesUploadedChanged(mockFiles);
			expect(component.filesAdded).toEqual(mockFiles);
		});

		it('should set filesAdded to an empty array if no files are uploaded', () => {
			component.onFilesUploadedChanged([]);
			expect(component.filesAdded).toEqual([]);
		});
	});

	describe('onEmailValueChanged', () => {
		it('should update citizenIdentityData.email with the provided string value', () => {
			component.citizenIdentityData = {
				email: '',
				lastName: '',
				firstName: '',
				bsnNumber: '',
				birthDate: '',
				telephone: '',
			};
			const emailValue = 'test@example.com';
			const updateFormSpy = jest.spyOn(component.checkAndSend, 'updateFormWithCitizenData');
			component.onEmailValueChanged(emailValue);
			expect(component.citizenIdentityData.email).toBe(emailValue);
			expect(updateFormSpy).toHaveBeenCalledWith(component.citizenIdentityData);
		});
	});

	describe('onAdditionalMessageChanged', () => {
		it('should update additionalMessage with the provided value', () => {
			const message = 'Some additional info';
			component.additionalMessage = '';
			component.citizenIdentityData = {
				email: '',
				lastName: '',
				firstName: '',
				bsnNumber: '',
				birthDate: '',
				telephone: '',
			};
			component.onAdditionalMessageChanged(message);
			expect(component.additionalMessage).toBe(message);
		});
	});

	describe('Stepper navigation methods', () => {
		describe('goToNextStep', () => {
			it.each([
				['small', 'verticalStepper', 'next'],
				['large', 'horizontalStepper', 'next'],
			])(
				'should call %s stepper %s() when breakpointName is "%s"',
				(breakpointName, expectedStepper, methodName) => {
					component.breakpointName = breakpointName as string;
					component.verticalStepper = { next: jest.fn() } as any;
					component.horizontalStepper = { next: jest.fn() } as any;

					component.handleNextAction(StepType.ConfirmIdentity);

					expect((component as any)[expectedStepper][methodName]).toHaveBeenCalled();
					const otherStepper =
						expectedStepper === 'verticalStepper' ? 'horizontalStepper' : 'verticalStepper';
					expect((component as any)[otherStepper][methodName]).not.toHaveBeenCalled();
				},
			);
		});

		describe('goToPreviousStep', () => {
			it.each([
				['small', 'verticalStepper', 'previous'],
				['large', 'horizontalStepper', 'previous'],
			])(
				'should call %s stepper %s() when breakpointName is "%s"',
				(breakpointName, expectedStepper, methodName) => {
					component.breakpointName = breakpointName as string;
					component.verticalStepper = { previous: jest.fn() } as any;
					component.horizontalStepper = { previous: jest.fn() } as any;

					component.goToPreviousStep();

					expect((component as any)[expectedStepper][methodName]).toHaveBeenCalled();
					const otherStepper =
						expectedStepper === 'verticalStepper' ? 'horizontalStepper' : 'verticalStepper';
					expect((component as any)[otherStepper][methodName]).not.toHaveBeenCalled();
				},
			);
		});
	});

	describe('translateParams getter', () => {
		it.each([
			{
				description: 'should return email and phoneNumber from citizenIdentityData',
				input: { email: 'user@example.com', telephone: '1234567890' },
				expected: { email: 'user@example.com', phoneNumber: '1234567890' },
			},
			{
				description: 'should return empty strings when email and telephone are null',
				input: { email: null, telephone: null },
				expected: { email: '', phoneNumber: '' },
			},
			{
				description: 'should return empty strings when email and telephone are undefined',
				input: { email: undefined, telephone: undefined },
				expected: { email: '', phoneNumber: '' },
			},
		])('$description', ({ input, expected }) => {
			component.citizenIdentityData = {
				email: input.email ?? undefined,
				telephone: input.telephone ?? '',
				firstName: '',
				lastName: '',
				bsnNumber: '',
				birthDate: '',
			};

			expect(component.translateParams).toEqual(expected);
		});
	});

	describe('getPassDtoFromInputs', () => {
		it('should return a PassDto with correct values from form controls and additionalMessage', () => {
			const mockFormGroup = new FormGroup({
				firstName: new FormControl('John'),
				lastName: new FormControl('Doe'),
				birthdate: new FormControl('1990-01-01'),
				bsn: new FormControl('123456789'),
				telephone: new FormControl('0612345678'),
				email: new FormControl('john.doe@example.com'),
			});
			const normalizedDate = '01-01-1990';
			component.confirmIdentityFormGroup = mockFormGroup;
			component.additionalMessage = 'Extra info';

			const normalizeDateSpy = jest.spyOn(FormUtil, 'normalizeDate').mockReturnValue(normalizedDate);

			const passDto = component['getPassDtoFromInputs']();

			expect(normalizeDateSpy).toHaveBeenCalledWith('1990-01-01');
			expect(passDto.firstName).toBe('John');
			expect(passDto.lastName).toBe('Doe');
			expect(passDto.birthday).toBe(normalizedDate);
			expect(passDto.bsn).toBe('123456789');
			expect(passDto.contactPhone).toBe('0612345678');
			expect(passDto.contactEmail).toBe('john.doe@example.com');
			expect(passDto.additionalInfo).toBe('Extra info');
		});

		it('should handle missing form control values gracefully', () => {
			const mockFormGroup = new FormGroup({
				firstName: new FormControl(null),
				lastName: new FormControl(null),
				birthdate: new FormControl('2000-12-31'),
				bsn: new FormControl(''),
				telephone: new FormControl(null),
				email: new FormControl(''),
			});
			component.confirmIdentityFormGroup = mockFormGroup;
			component.additionalMessage = '';

			jest.spyOn(FormUtil, 'normalizeDate').mockReturnValue('31-12-2000');

			const passDto = component['getPassDtoFromInputs']();

			expect(passDto.firstName).toBeNull();
			expect(passDto.lastName).toBeNull();
			expect(passDto.birthday).toBe('31-12-2000');
			expect(passDto.bsn).toBe('');
			expect(passDto.contactPhone).toBeNull();
			expect(passDto.contactEmail).toBe('');
			expect(passDto.additionalInfo).toBe('');
		});

		describe('onConfirmIdentityFormGroupChange', () => {
			it('should update confirmIdentityFormGroup with the provided FormGroup', () => {
				const updatedFormGroup = new FormGroup({
					firstName: new FormControl('Alice'),
					lastName: new FormControl('Smith'),
				});
				component.confirmIdentityFormGroup = new FormGroup({}); // initial value

				component.onConfirmIdentityFormGroupChange(updatedFormGroup);

				expect(component.confirmIdentityFormGroup).toBe(updatedFormGroup);
				expect(component.confirmIdentityFormGroup.get('firstName')?.value).toBe('Alice');
				expect(component.confirmIdentityFormGroup.get('lastName')?.value).toBe('Smith');
			});
		});
		describe('handleNextAction', () => {
			it('should call passesService.savePass and set isSuccessfullySubmitted to true when stepType is CheckAndSend', () => {
				const savePassSpy = jest.spyOn(component['passesService'], 'savePass').mockReturnValue(of(undefined));
				component.isSuccessfullySubmitted = false;
				component.filesAdded = [new File([''], 'test.txt')];

				component.handleNextAction(StepType.CheckAndSend);

				expect(savePassSpy).toHaveBeenCalledWith(expect.any(Object), component.filesAdded);
				expect(component.isSuccessfullySubmitted).toBe(true);
			});

			it('should call verticalStepper.next() when breakpointName is "small" and stepType is not CheckAndSend', () => {
				component.breakpointName = 'small';
				component.verticalStepper = { next: jest.fn() } as any;
				component.horizontalStepper = { next: jest.fn() } as any;

				component.handleNextAction(StepType.ConfirmIdentity);

				expect(component.verticalStepper.next).toHaveBeenCalled();
				expect(component.horizontalStepper.next).not.toHaveBeenCalled();
			});

			it('should call horizontalStepper.next() when breakpointName is not "small" and stepType is not CheckAndSend', () => {
				component.breakpointName = 'large';
				component.verticalStepper = { next: jest.fn() } as any;
				component.horizontalStepper = { next: jest.fn() } as any;

				component.handleNextAction(StepType.ConfirmIdentity);

				expect(component.horizontalStepper.next).toHaveBeenCalled();
				expect(component.verticalStepper.next).not.toHaveBeenCalled();
			});
		});
	});
});
