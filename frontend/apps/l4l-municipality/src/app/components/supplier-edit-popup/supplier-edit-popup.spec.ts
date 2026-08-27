import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	CharacterLimitMessageService,
	PdokService,
	SupplierCoordinates,
	SupplierProfile,
	SupplierProfileService,
	SupplierStatus,
	WorkingHoursService,
} from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
import { of, Subject } from 'rxjs';

import { SupplierRequestPatchDto } from '../../_models/supplier-request-patch-dto.model.';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { SupplierEditPopupComponent } from './supplier-edit-popup';

@Component({ selector: 'frontend-working-hours-edit', template: '', standalone: false })
class WorkingHoursEditStubComponent {
	workingHoursForm = { dirty: false };
	mapWorkingHours = jest.fn().mockReturnValue([]);
	isFormValid = jest.fn().mockReturnValue(true);
	areRequiredDaysValid = jest.fn().mockReturnValue(true);
	populateForm = jest.fn();
}

describe('SupplierEditPopupComponent', () => {
	global.structuredClone = jest.fn((val) => JSON.parse(JSON.stringify(val)));

	let component: SupplierEditPopupComponent;
	let fixture: ComponentFixture<SupplierEditPopupComponent>;
	let dialogRef: jest.Mocked<MatDialogRef<any>>;
	let dialogService: jest.Mocked<DialogService>;
	let municipalitySupplierService: jest.Mocked<MunicipalitySupplierService>;
	let supplierProfileService: jest.Mocked<SupplierProfileService>;
	let workingHoursService: jest.Mocked<WorkingHoursService>;
	let pdokService: jest.Mocked<PdokService>;

	const backdropSubject = new Subject<void>();

	const mockPdokResponse = (numFound: number) => ({
		response: {
			numFound,
			docs: [{ centroide_ll: 'POINT(4.897 52.377)' }],
		},
	});

	beforeEach(async () => {
		dialogRef = {
			close: jest.fn(),
			backdropClick: jest.fn(() => backdropSubject.asObservable()),
			updateSize: jest.fn(),
		} as unknown as jest.Mocked<MatDialogRef<any>>;

		dialogService = {
			message: jest.fn(() => ({
				afterClosed: jest.fn(() => of(true)),
			})),
		} as unknown as jest.Mocked<DialogService>;

		municipalitySupplierService = {
			patchSupplierProfile: jest.fn(() => of(undefined)),
		} as unknown as jest.Mocked<MunicipalitySupplierService>;

		supplierProfileService = {
			supplierProfileInformation: {
				supplierId: 'test-supplier-id',
				companyName: 'Test Company',
			} as any,
		} as unknown as jest.Mocked<SupplierProfileService>;

		workingHoursService = {
			getWorkingHours: jest.fn(() => of([])),
		} as unknown as jest.Mocked<WorkingHoursService>;

		pdokService = {
			getCoordinateFromAddress: jest.fn(() => of(mockPdokResponse(1))),
		} as unknown as jest.Mocked<PdokService>;

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [SupplierEditPopupComponent, WorkingHoursEditStubComponent],
			imports: [ReactiveFormsModule, BrowserAnimationsModule, TranslateModule.forRoot()],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: { supplierId: 'test-supplier-id' } },
				{ provide: MatDialogRef, useValue: dialogRef },
				{ provide: DialogService, useValue: dialogService },
				{ provide: MunicipalitySupplierService, useValue: municipalitySupplierService },
				{ provide: SupplierProfileService, useValue: supplierProfileService },
				{ provide: WorkingHoursService, useValue: workingHoursService },
				{ provide: PdokService, useValue: pdokService },
				{ provide: CharacterLimitMessageService, useValue: { messageCount: 0 } },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierEditPopupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		(component as any).workingHoursEdit = {
			mapWorkingHours: jest.fn(() => [{ isChecked: true }]),
			workingHoursForm: { dirty: false },
			isFormValid: jest.fn().mockReturnValue(true),
			areRequiredDaysValid: jest.fn().mockReturnValue(true),
		};
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	// --- ngOnInit ---------------------------------------------------------------

	describe('ngOnInit', () => {
		it('should subscribe to backdropClick and call close when backdrop is clicked', () => {
			const closeSpy = jest.spyOn(component, 'close');
			backdropSubject.next();
			expect(closeSpy).toHaveBeenCalled();
		});

		it('should call getWorkingHours with the supplierId from data', () => {
			expect(workingHoursService.getWorkingHours).toHaveBeenCalledWith('test-supplier-id');
		});

		it('should NOT call getWorkingHours when data.supplierId is absent', () => {
			workingHoursService.getWorkingHours.mockClear();
			component.data = {};
			component['getWorkingHours']();
			expect(workingHoursService.getWorkingHours).not.toHaveBeenCalled();
		});

		it('should NOT call getWorkingHours when data is null', () => {
			workingHoursService.getWorkingHours.mockClear();
			component.data = null;
			component['getWorkingHours']();
			expect(workingHoursService.getWorkingHours).not.toHaveBeenCalled();
		});
	});

	// --- ngAfterViewChecked -----------------------------------------------------

	describe('ngAfterViewChecked', () => {
		it('should call cdr.detectChanges', () => {
			const cdrSpy = jest.spyOn((component as any).cdr, 'detectChanges');
			component.ngAfterViewChecked();
			expect(cdrSpy).toHaveBeenCalled();
		});
	});

	// --- supplierProfileServiceInformation --------------------------------------

	describe('supplierProfileServiceInformation', () => {
		it('should return the profile when it exists', () => {
			const profile = { supplierId: 'abc' } as any;
			supplierProfileService.supplierProfileInformation = profile;
			expect(component.supplierProfileServiceInformation).toBe(profile);
		});

		it('should return a new SupplierProfile when profile is null', () => {
			supplierProfileService.supplierProfileInformation = null as any;
			expect(component.supplierProfileServiceInformation).toBeInstanceOf(SupplierProfile);
		});
	});

	// --- supplierId getter ------------------------------------------------------

	describe('supplierId getter', () => {
		it('should return supplierId from supplierProfileInformation', () => {
			expect(component.supplierId).toBe('test-supplier-id');
		});

		it('should return undefined when supplierProfileInformation is null', () => {
			supplierProfileService.supplierProfileInformation = null as any;
			expect(component.supplierId).toBeUndefined();
		});
	});

	// --- areFormValuesChanged ---------------------------------------------------

	describe('areFormValuesChanged', () => {
		beforeEach(() => {
			component.initialContactInformationForm = { name: 'initial' } as any;
			component.initialGeneralInformationForm = { company: 'initial' } as any;
			component.contactInformationForm = { value: { name: 'initial' }, valid: true } as any;
			component.generalInformationForm = { value: { company: 'initial' }, valid: true } as any;
		});

		it('should return false when isReadOnly is true regardless of form state', () => {
			component.isReadOnly = true;
			component.contactInformationForm = { value: { name: 'changed' }, valid: true } as any;
			(component as any).workingHoursEdit = {
				mapWorkingHours: jest.fn(() => [{ isChecked: true }]),
				workingHoursForm: { dirty: false },
				isFormValid: jest.fn().mockReturnValue(true),
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};
			expect(component.areFormValuesChanged).toBe(false);
		});

		it('should return false when nothing has changed and no working hours are checked', () => {
			(component as any).workingHoursEdit = {
				mapWorkingHours: jest.fn(() => []),
				workingHoursForm: { dirty: false },
				isFormValid: jest.fn().mockReturnValue(true),
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};
			expect(component.areFormValuesChanged).toBe(false);
		});

		it('should return true when contactInformationForm value changed', () => {
			component.contactInformationForm = { value: { name: 'changed' }, valid: true } as any;
			(component as any).workingHoursEdit = {
				mapWorkingHours: jest.fn(() => [{ isChecked: false }]),
				workingHoursForm: { dirty: false },
				isFormValid: jest.fn().mockReturnValue(true),
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};
			expect(component.areFormValuesChanged).toBe(true);
		});

		it('should return true when generalInformationForm value changed', () => {
			component.generalInformationForm = { value: { company: 'changed' }, valid: true } as any;
			(component as any).workingHoursEdit = {
				mapWorkingHours: jest.fn(() => [{ isChecked: false }]),
				workingHoursForm: { dirty: false },
				isFormValid: jest.fn().mockReturnValue(true),
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};
			expect(component.areFormValuesChanged).toBe(true);
		});

		it('should return true when at least one working hour day is checked', () => {
			(component as any).workingHoursEdit = {
				mapWorkingHours: jest.fn(() => [{ isChecked: true }]),
				workingHoursForm: { dirty: true },
				isFormValid: jest.fn().mockReturnValue(true),
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};
			expect(component.areFormValuesChanged).toBe(true);
		});

		it('should return false when workingHoursEdit is not yet initialised', () => {
			(component as any).workingHoursEdit = undefined;
			expect(component.areFormValuesChanged).toBe(false);
		});
	});

	// --- isFormValid ------------------------------------------------------------

	describe('isFormValid', () => {
		it('should return true when all forms are valid and areRequiredDaysValid returns true', () => {
			component.contactInformationForm = { valid: true } as any;
			component.generalInformationForm = { valid: true } as any;
			(component as any).workingHoursEdit = {
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};
			expect(component.isFormValid).toBe(true);
		});

		it('should return false when contactInformationForm is invalid', () => {
			component.contactInformationForm = { valid: false } as any;
			component.generalInformationForm = { valid: true } as any;
			(component as any).workingHoursEdit = {
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};
			expect(component.isFormValid).toBe(false);
		});

		it('should return false when generalInformationForm is invalid', () => {
			component.contactInformationForm = { valid: true } as any;
			component.generalInformationForm = { valid: false } as any;
			(component as any).workingHoursEdit = {
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};
			expect(component.isFormValid).toBe(false);
		});

		it('should return false when areRequiredDaysValid returns false', () => {
			component.contactInformationForm = { valid: true } as any;
			component.generalInformationForm = { valid: true } as any;
			(component as any).workingHoursEdit = {
				areRequiredDaysValid: jest.fn().mockReturnValue(false),
			};
			expect(component.isFormValid).toBe(false);
		});

		it('should return falsy when workingHoursEdit is not yet initialised', () => {
			component.contactInformationForm = { valid: true } as any;
			component.generalInformationForm = { valid: true } as any;
			(component as any).workingHoursEdit = undefined;
			expect(component.isFormValid).toBeFalsy();
		});
	});

	// --- close ------------------------------------------------------------------

	describe('close', () => {
		it('should open the warning modal when there are unsaved changes', () => {
			jest.spyOn(component, 'areFormValuesChanged', 'get').mockReturnValue(true);
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			const openWarningSpy = jest.spyOn(component, 'openWarningModal').mockImplementation(() => {});

			component.close();

			expect(openWarningSpy).toHaveBeenCalled();
			expect(dialogRef.close).not.toHaveBeenCalled();
		});

		it('should close the dialog directly when there are no unsaved changes', () => {
			jest.spyOn(component, 'areFormValuesChanged', 'get').mockReturnValue(false);

			component.close('someValue');

			expect(dialogRef.close).toHaveBeenCalledWith('someValue');
		});
	});

	// --- openWarningModal -------------------------------------------------------

	describe('openWarningModal', () => {
		it('should close the dialogRef with false when warning modal result is truthy', () => {
			dialogService.message.mockReturnValue({
				afterClosed: jest.fn(() => of(true)),
			} as any);

			component.openWarningModal();

			expect(dialogService.message).toHaveBeenCalled();
			expect(dialogRef.close).toHaveBeenCalledWith(false);
		});

		it('should NOT close the dialogRef when warning modal result is falsy', () => {
			dialogService.message.mockReturnValue({
				afterClosed: jest.fn(() => of(false)),
			} as any);

			component.openWarningModal();

			expect(dialogRef.close).not.toHaveBeenCalled();
		});

		it('should NOT close the dialogRef when dialogService.message returns null', () => {
			dialogService.message.mockReturnValue(null as any);

			component.openWarningModal();

			expect(dialogRef.close).not.toHaveBeenCalled();
		});
	});

	// --- discardChanges ---------------------------------------------------------

	describe('discardChanges', () => {
		it('should close the dialog without a value', () => {
			component.discardChanges();
			expect(dialogRef.close).toHaveBeenCalledWith();
		});
	});

	// --- handleInformationFormEvent --------------------------------------------

	describe('handleInformationFormEvent', () => {
		it('should set initialContactInformationForm on first call with non-empty contact form', () => {
			const formMock = { value: { name: 'test' } } as unknown as FormGroup;
			component.initialContactInformationForm = undefined as any;

			component.handleInformationFormEvent(formMock, true);

			expect(component.initialContactInformationForm).toEqual({ name: 'test' });
			expect(component.contactInformationForm).toBe(formMock);
		});

		it('should set initialGeneralInformationForm on first call with non-empty general form', () => {
			const formMock = { value: { company: 'Acme' } } as unknown as FormGroup;
			component.initialGeneralInformationForm = undefined as any;

			component.handleInformationFormEvent(formMock, false);

			expect(component.initialGeneralInformationForm).toEqual({ company: 'Acme' });
			expect(component.generalInformationForm).toBe(formMock);
		});

		it('should NOT override initialContactInformationForm on subsequent calls', () => {
			const firstForm = { value: { name: 'first' } } as unknown as FormGroup;
			const secondForm = { value: { name: 'second' } } as unknown as FormGroup;

			component.handleInformationFormEvent(firstForm, true);
			component.handleInformationFormEvent(secondForm, true);

			expect(component.initialContactInformationForm).toEqual({ name: 'first' });
			expect(component.contactInformationForm).toBe(secondForm);
		});

		it('should NOT set initial form when form value is empty {}', () => {
			const emptyForm = { value: {} } as unknown as FormGroup;
			component.initialContactInformationForm = undefined as any;

			component.handleInformationFormEvent(emptyForm, true);

			expect(component.initialContactInformationForm).toBeUndefined();
		});
	});

	// --- saveSupplierPatch ------------------------------------------------------

	describe('saveSupplierPatch', () => {
		beforeEach(() => {
			component.generalInformationForm = {
				value: {
					legalForm: '1',
					group: '2',
					category: '3',
					subcategory: '4',
					companyName: 'TestCo',
					kvkNumber: '12345678',
					adminEmail: 'admin@test.com',
					ownerName: 'Owner',
				},
			} as unknown as FormGroup;

			component.contactInformationForm = {
				value: {
					branchLocation: 'Amsterdam',
					branchZip: '1234AB',
					branchTelephone: '0612345678',
				},
			} as unknown as FormGroup;

			(component as any).workingHoursEdit = {
				mapWorkingHours: jest.fn(() => []),
				workingHoursForm: { dirty: false },
				isFormValid: jest.fn().mockReturnValue(true),
				areRequiredDaysValid: jest.fn().mockReturnValue(true),
			};

			(component as any).generalInformation = {
				cashierEmailsList: new Set<string>(),
			};
		});

		it('should call pdokService.getCoordinateFromAddress with branchLocation and branchZip', () => {
			component.saveSupplierPatch();
			expect(pdokService.getCoordinateFromAddress).toHaveBeenCalledWith('Amsterdam', '1234AB');
		});

		it('should call patchSupplierProfile with a valid SupplierRequestPatchDto when pdok returns coordinates', () => {
			pdokService.getCoordinateFromAddress.mockReturnValue(of(mockPdokResponse(1)));

			component.saveSupplierPatch();

			expect(municipalitySupplierService.patchSupplierProfile).toHaveBeenCalledWith(
				expect.any(SupplierRequestPatchDto),
			);
		});

		it('should set latlon on profile when pdok returns a valid result', () => {
			pdokService.getCoordinateFromAddress.mockReturnValue(of(mockPdokResponse(1)));

			component.saveSupplierPatch();

			const dto: SupplierRequestPatchDto = municipalitySupplierService.patchSupplierProfile.mock.calls[0][0];
			expect(dto.profile?.latlon).toBeInstanceOf(SupplierCoordinates);
			expect(dto.profile?.latlon?.longitude).toBe(4.897);
			expect(dto.profile?.latlon?.latitude).toBe(52.377);
		});

		it('should call patchSupplierProfile without latlon when pdok returns numFound=0', () => {
			pdokService.getCoordinateFromAddress.mockReturnValue(of(mockPdokResponse(0)));

			component.saveSupplierPatch();

			const dto: SupplierRequestPatchDto = municipalitySupplierService.patchSupplierProfile.mock.calls[0][0];
			expect(dto.profile?.latlon).toBeUndefined();
		});

		it('should call patchSupplierProfile without latlon when pdok response is null', () => {
			pdokService.getCoordinateFromAddress.mockReturnValue(of(null as any));

			component.saveSupplierPatch();

			const dto: SupplierRequestPatchDto = municipalitySupplierService.patchSupplierProfile.mock.calls[0][0];
			expect(dto.profile?.latlon).toBeUndefined();
		});

		it('should include supplierId, companyName, kvkNumber, adminEmail at the top level', () => {
			component.saveSupplierPatch();

			const dto: SupplierRequestPatchDto = municipalitySupplierService.patchSupplierProfile.mock.calls[0][0];
			expect(dto.supplierId).toBe('test-supplier-id');
			expect(dto.companyName).toBe('TestCo');
			expect(dto.kvkNumber).toBe('12345678');
			expect(dto.adminEmail).toBe('admin@test.com');
		});

		it('should parse legalForm, group, category, subcategory as integers in profile', () => {
			component.saveSupplierPatch();

			const dto: SupplierRequestPatchDto = municipalitySupplierService.patchSupplierProfile.mock.calls[0][0];
			expect(dto.profile?.legalForm).toBe(1);
			expect(dto.profile?.group).toBe(2);
			expect(dto.profile?.category).toBe(3);
			expect(dto.profile?.subcategory).toBe(4);
		});

		it('should include contact information fields in profile', () => {
			component.saveSupplierPatch();

			const dto: SupplierRequestPatchDto = municipalitySupplierService.patchSupplierProfile.mock.calls[0][0];
			expect(dto.profile?.branchLocation).toBe('Amsterdam');
			expect(dto.profile?.branchZip).toBe('1234AB');
		});

		it('should call workingHoursEdit.mapWorkingHours and set result in dto', () => {
			const mockHours = [{ day: 1, openTime: '09:00', closeTime: '17:00', isChecked: true }] as any;
			(component as any).workingHoursEdit.mapWorkingHours = jest.fn(() => mockHours);

			component.saveSupplierPatch();

			const dto: SupplierRequestPatchDto = municipalitySupplierService.patchSupplierProfile.mock.calls[0][0];
			expect(dto.workingHours).toBe(mockHours);
		});

		it('should use empty array for workingHours when workingHoursEdit is undefined', () => {
			(component as any).workingHoursEdit = undefined;

			component.saveSupplierPatch();

			const dto: SupplierRequestPatchDto = municipalitySupplierService.patchSupplierProfile.mock.calls[0][0];
			expect(dto.workingHours).toEqual([]);
		});

		it('should close the dialog with SupplierStatus.APPROVED on success', () => {
			component.saveSupplierPatch();
			expect(dialogRef.close).toHaveBeenCalledWith(SupplierStatus.APPROVED);
		});

		it('should set hasDuplicateError to true when patchSupplierProfile fails with cashierEmailDuplicated', async () => {
			const { SilentErrorCode } = await import('@frontend/common');
			const { config, throwError } = await import('rxjs');
			const previousOnUnhandledError = config.onUnhandledError;
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

			config.onUnhandledError = jest.fn();
			municipalitySupplierService.patchSupplierProfile.mockReturnValue(
				throwError(() => ({ error: SilentErrorCode.cashierEmailDuplicated })),
			);

			component.hasDuplicateError = false;
			component.saveSupplierPatch();

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(consoleSpy).toHaveBeenCalledWith(
				'Error patching supplier profile:',
				expect.objectContaining({ error: SilentErrorCode.cashierEmailDuplicated }),
			);
			expect(component.hasDuplicateError).toBe(true);
			expect(dialogRef.close).not.toHaveBeenCalledWith(SupplierStatus.APPROVED);

			config.onUnhandledError = previousOnUnhandledError;
			consoleSpy.mockRestore();
		});

		it('should keep hasDuplicateError false when patchSupplierProfile fails with a different error code', async () => {
			const { config, throwError } = await import('rxjs');
			const previousOnUnhandledError = config.onUnhandledError;
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

			config.onUnhandledError = jest.fn();
			municipalitySupplierService.patchSupplierProfile.mockReturnValue(
				throwError(() => ({ error: 'some-other-error' })),
			);

			component.hasDuplicateError = false;
			component.saveSupplierPatch();

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(consoleSpy).toHaveBeenCalledWith(
				'Error patching supplier profile:',
				expect.objectContaining({ error: 'some-other-error' }),
			);
			expect(component.hasDuplicateError).toBe(false);
			expect(dialogRef.close).not.toHaveBeenCalledWith(SupplierStatus.APPROVED);

			config.onUnhandledError = previousOnUnhandledError;
			consoleSpy.mockRestore();
		});
	});

	// --- getWorkingHours (private) ----------------------------------------------

	describe('getWorkingHours', () => {
		it('should do nothing when data returns an empty array', () => {
			// Arrange
			workingHoursService.getWorkingHours.mockReturnValue(of([]));
			const populateSpy = jest.fn();
			(component as any).workingHoursEdit = { populateForm: populateSpy };

			// Act
			component['getWorkingHours']();

			// Assert
			expect(component.workingHoursData).toEqual([]);
			expect(populateSpy).not.toHaveBeenCalled();
		});

		it('should push WorkingHoursDtos and call populateForm when service returns data', () => {
			// Arrange
			const rawData = [
				{ day: 1, openTime: '09:00:00', closeTime: '17:00:00', isChecked: true, id: 'abc' },
				{ day: 2, openTime: '', closeTime: '', isChecked: false, id: 'def' },
			];
			workingHoursService.getWorkingHours.mockReturnValue(of(rawData as any));
			const populateSpy = jest.fn();
			(component as any).workingHoursEdit = { populateForm: populateSpy };
			component.workingHoursData = [];

			// Act
			component['getWorkingHours']();

			// Assert
			expect(component.workingHoursData.length).toBe(2);
			expect(component.workingHoursData[0].day).toBe(1);
			expect(component.workingHoursData[0].id).toBe('abc');
			expect(populateSpy).toHaveBeenCalledWith(component.workingHoursData);
		});
	});
});
