/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('dompurify', () => ({
	__esModule: true,
	default: { sanitize: jest.fn((v: any) => v) },
}));
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
	BenefitDto,
	CitizenGroupAge,
	CitizenGroupsService,
	CitizenGroupViewDto,
	CommonUtil,
	ModalData,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import DOMPurify from 'dompurify';
import { of, throwError } from 'rxjs';

import { CreateBenefitPopupComponent } from './create-benefit-popup.component';
import * as moment from 'moment';

describe('CreateBenefitPopupComponent', () => {
	let component: CreateBenefitPopupComponent;
	let fixture: ComponentFixture<CreateBenefitPopupComponent>;
	let httpMock: HttpTestingController;

	let citizenGroupServiceMock: jest.Mocked<CitizenGroupsService>;

	const dialogRefStub = {
		close: () => undefined,
		keydownEvents: jest.fn(() => of({})),
		afterClosed: jest.fn(() => of({})),
		backdropClick: jest.fn(() => of({})),
	};

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	global.ResizeObserver = require('resize-observer-polyfill');

	beforeEach(async () => {
		(DOMPurify.sanitize as jest.Mock).mockImplementation((value: any) => value);
		const environmentMock = {
			production: false,
			envName: 'dev',
			apiPath: '/api',
		};

		citizenGroupServiceMock = {
			getCitizenGroups: jest.fn(() => of([])),
		} as any;

		await TestBed.configureTestingModule({
			imports: [CreateBenefitPopupComponent, TranslateModule.forRoot(), HttpClientTestingModule],
			providers: [
				{ provide: CitizenGroupsService, useValue: citizenGroupServiceMock },
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: 'env', useValue: environmentMock },
			],
		}).compileComponents();

		httpMock = TestBed.inject(HttpTestingController) as HttpTestingController;
		fixture = TestBed.createComponent(CreateBenefitPopupComponent);
		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('isSaveDisabled', () => {
		it('should return true if the form is not initialized', () => {
			component.createBenefitForm = undefined as any;
			expect(component.isSaveDisabled).toBe(true);
		});

		it('should return true if the form is invalid', () => {
			component.createBenefitForm = component['formBuilder'].group({
				benefitName: ['', Validators.required],
			});
			component.createBenefitForm.controls['benefitName'].setValue('');
			component.citizenGroupsData = [{ formControl: 'group1', id: '1', label: 'Group 1', dataTestId: 'group1' }];
			expect(component.isSaveDisabled).toBe(true);
		});

		it('should return true if no citizen group is selected', () => {
			component.createBenefitForm = component['formBuilder'].group({
				benefitName: ['Test Benefit', Validators.required],
			});
			component.citizenGroupsData = [{ formControl: 'group1', id: '1', label: '', dataTestId: '' }];
			component.createBenefitForm.addControl('group1', component['formBuilder'].control(false));
			expect(component.isSaveDisabled).toBe(true);
		});

		it('should return false if the form is valid and a citizen group is selected', () => {
			component.createBenefitForm = component['formBuilder'].group({
				benefitName: ['Test Benefit', Validators.required],
			});
			component.citizenGroupsData = [{ formControl: 'group1', id: '1', label: '', dataTestId: '' }];
			component.createBenefitForm.addControl('group1', component['formBuilder'].control(true));
			expect(component.isSaveDisabled).toBe(false);
		});
	});

	describe('onStartDateChange', () => {
		it('should call enforceStartDateBeforeExpiration with the form', () => {
			const enforceStartDateBeforeExpirationSpy = jest.spyOn(CommonUtil, 'enforceStartDateBeforeExpiration');
			component.createBenefitForm = component['formBuilder'].group({
				startDate: ['2023-01-01', Validators.required],
				expirationDate: ['2023-12-31', Validators.required],
			});

			component.onStartDateChange();

			expect(enforceStartDateBeforeExpirationSpy).toHaveBeenCalledWith(component.createBenefitForm);
		});
	});

	describe('displayValidityError', () => {
		it('should return true if startDate control is invalid', () => {
			component.createBenefitForm = component['formBuilder'].group({
				startDate: ['', Validators.required],
				expirationDate: ['2023-12-31', Validators.required],
			});
			component.createBenefitForm.controls['startDate'].markAsTouched();
			expect(component.displayValidityError()).toBe(true);
		});

		it('should return true if expirationDate control is invalid', () => {
			component.createBenefitForm = component['formBuilder'].group({
				startDate: ['2023-01-01', Validators.required],
				expirationDate: ['', Validators.required],
			});
			component.createBenefitForm.controls['expirationDate'].markAsTouched();
			expect(component.displayValidityError()).toBe(true);
		});

		it('should return false if both startDate and expirationDate controls are valid', () => {
			component.createBenefitForm = component['formBuilder'].group({
				startDate: ['2023-01-01', Validators.required],
				expirationDate: ['2023-12-31', Validators.required],
			});
			expect(component.displayValidityError()).toBe(false);
		});
	});

	describe('openWarningModal', () => {
		it('should call dialogService.message with the correct parameters', () => {
			const dialogServiceSpy = jest.spyOn(component['dialogService'], 'message').mockReturnValue({
				afterClosed: () => of(true),
			} as any);

			component.openWarningModal();

			expect(dialogServiceSpy).toHaveBeenCalledWith(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						'createBenefit.leavingWarning',
						'general.button.stay',
						'general.button.cancel',
						false,
						'warning',
						'theme',
						'',
						expect.any(WarningDialogData),
					),
				),
				width: '400px',
				ariaLabel: component['translateService'].instant('general.closingWarning'),
			});
		});

		it('should close the dialog if the user confirms the warning modal', () => {
			const dialogServiceSpy = jest.spyOn(component['dialogService'], 'message').mockReturnValue({
				afterClosed: () => of(true),
			} as any);
			const dialogRefSpy = jest.spyOn(component['dialogRef'], 'close');

			component.openWarningModal();

			expect(dialogServiceSpy).toHaveBeenCalled();
			expect(dialogRefSpy).toHaveBeenCalledWith(false);
		});

		it('should not close the dialog if the user cancels the warning modal', () => {
			const dialogServiceSpy = jest.spyOn(component['dialogService'], 'message').mockReturnValue({
				afterClosed: () => of(false),
			} as any);
			const dialogRefSpy = jest.spyOn(component['dialogRef'], 'close');

			component.openWarningModal();

			expect(dialogServiceSpy).toHaveBeenCalled();
		});
	});

	describe('close', () => {
		it('should close the dialog with false if the form is not dirty', () => {
			const dialogRefSpy = jest.spyOn(component['dialogRef'], 'close');
			component.createBenefitForm = component['formBuilder'].group({
				benefitName: ['Test Benefit', Validators.required],
			});
			component.createBenefitForm.markAsPristine();

			component.close();

			expect(dialogRefSpy).toHaveBeenCalledWith(false);
		});

		it('should call openWarningModal if the form is dirty', () => {
			const openWarningModalSpy = jest.spyOn(component, 'openWarningModal');
			component.createBenefitForm = component['formBuilder'].group({
				benefitName: ['Test Benefit', Validators.required],
			});
			component.createBenefitForm.markAsDirty();

			component.close();

			expect(openWarningModalSpy).toHaveBeenCalled();
		});
	});
	describe('ngOnInit', () => {
		it('should initialize the form', () => {
			const initFormSpy = jest.spyOn(component as any, 'initForm');
			const loadInitialDataSpy = jest.spyOn(component as any, 'loadInitialData');
			const subscribeToDialogEventsSpy = jest.spyOn(component as any, 'subscribeToDialogEvents');

			component.ngOnInit();

			expect(initFormSpy).toHaveBeenCalled();
			expect(loadInitialDataSpy).toHaveBeenCalled();
			expect(subscribeToDialogEventsSpy).toHaveBeenCalled();
		});

		it('should call loadInitialData to fetch citizen groups', () => {
			const loadInitialDataSpy = jest.spyOn(component as any, 'loadInitialData');

			component.ngOnInit();

			expect(loadInitialDataSpy).toHaveBeenCalled();
		});

		it('should subscribe to dialog events', () => {
			const subscribeToDialogEventsSpy = jest.spyOn(component as any, 'subscribeToDialogEvents');

			component.ngOnInit();

			expect(subscribeToDialogEventsSpy).toHaveBeenCalled();
		});
	});
	describe('createNewBenefit', () => {
		it('should call formValuesToBenefitDto and benefitService.createBenefit', () => {
			const formValuesToBenefitDtoSpy = jest.spyOn(component as any, 'formValuesToBenefitDto').mockReturnValue({
				benefitName: 'Test Benefit',
				benefitDescription: 'Test Description',
				startDate: new Date('2023-01-01'),
				expirationDate: new Date('2023-12-31'),
				citizenGroupIds: ['group1'],
			});
			const createBenefitSpy = jest
				.spyOn(component['benefitService'], 'createBenefit')
				.mockReturnValue(of(undefined));
			const dialogRefSpy = jest.spyOn(component['dialogRef'], 'close');

			component.createNewBenefit();

			expect(formValuesToBenefitDtoSpy).toHaveBeenCalled();
			expect(createBenefitSpy).toHaveBeenCalledWith({
				benefitName: 'Test Benefit',
				benefitDescription: 'Test Description',
				startDate: new Date('2023-01-01'),
				expirationDate: new Date('2023-12-31'),
				citizenGroupIds: ['group1'],
			});
			expect(dialogRefSpy).toHaveBeenCalledWith(true);
		});

		it('should handle errors from benefitService.createBenefit', () => {
			const formValuesToBenefitDtoSpy = jest.spyOn(component as any, 'formValuesToBenefitDto').mockReturnValue({
				benefitName: 'Test Benefit',
				benefitDescription: 'Test Description',
				startDate: new Date('2023-01-01'),
				expirationDate: new Date('2023-12-31'),
				citizenGroupIds: ['group1'],
			});
			const createBenefitSpy = jest
				.spyOn(component['benefitService'], 'createBenefit')
				.mockReturnValue(throwError(() => new Error('Error creating benefit')));

			component.createNewBenefit();

			expect(formValuesToBenefitDtoSpy).toHaveBeenCalled();
			expect(createBenefitSpy).toHaveBeenCalled();
		});
	});

	describe('formValuesToBenefitDto', () => {
		it('should map form values to BenefitDto correctly', () => {
			component.createBenefitForm.get('benefitName')?.setValue('Benefit Name');
			component.createBenefitForm.get('benefitDescription')?.setValue('Benefit Description');
			component.createBenefitForm.get('startDate')?.setValue(moment('2023-01-01'));
			component.createBenefitForm.get('expirationDate')?.setValue(moment('2023-12-31'));

			component.createBenefitForm.get('amount')?.setValue(20);
			component.citizenGroupsData = [
				{ formControl: 'group1', id: 'id1', label: 'Citizen Group 1', dataTestId: '' },
				{ formControl: 'group2', id: 'id2', label: 'Citizen Group 2', dataTestId: '' },
			];
			component.createBenefitForm.addControl('group1', component['formBuilder'].control(true));
			component.createBenefitForm.addControl('group2', component['formBuilder'].control(false));

			jest.spyOn(dialogRefStub, 'close');
			jest.spyOn(component as any, 'formValuesToBenefitDto');

			component.createNewBenefit();

			expect(component['formValuesToBenefitDto']).toHaveReturnedWith(
				new BenefitDto('Benefit Name', 'Benefit Description', '2023-01-01', '2023-12-31', ['id1'], 20),
			);
		});
	});

	describe('initForm', () => {
		it('should initialize the form with default controls', () => {
			component['citizenGroupsData'] = [];
			component['initForm']();

			expect(component.createBenefitForm.contains('benefitName')).toBe(true);
			expect(component.createBenefitForm.contains('benefitDescription')).toBe(true);
			expect(component.createBenefitForm.contains('startDate')).toBe(true);
			expect(component.createBenefitForm.contains('expirationDate')).toBe(true);
		});

		it('should add controls for each citizen group', () => {
			component['citizenGroupsData'] = [
				{ formControl: 'group1', id: '1', label: 'Group 1', dataTestId: 'group1' },
				{ formControl: 'group2', id: '2', label: 'Group 2', dataTestId: 'group2' },
			];

			component['initForm']();

			expect(component.createBenefitForm.contains('group1')).toBe(true);
			expect(component.createBenefitForm.contains('group2')).toBe(true);
			expect(component.createBenefitForm.get('group1')?.value).toBe(false);
			expect(component.createBenefitForm.get('group2')?.value).toBe(false);
		});
	});

	describe('loadInitialData', () => {
		it('should populate citizenGroupsData and add controls to the form', () => {
			const mockCitizenGroups = [
				new CitizenGroupViewDto('1', 'Group One', [CitizenGroupAge.AGE_18_64], false, 10, 0),
				new CitizenGroupViewDto('2', 'Group Two', [CitizenGroupAge.AGE_18_64], false, 10, 0),
			];
			const getCitizenGroupsSpy = jest
				.spyOn(component['citizenGroupsService'], 'getCitizenGroups')
				.mockReturnValue(of(mockCitizenGroups));

			component['loadInitialData']();

			expect(getCitizenGroupsSpy).toHaveBeenCalled();
			expect(component.citizenGroupsData).toEqual([
				{
					id: '1',
					label: 'Group One',
					formControl: 'formControlCitizenGroup-Group-One',
					value: 'Group-One',
					checked: false,
					dataTestId: 'citizenGroup-Group-One',
				},
				{
					id: '2',
					label: 'Group Two',
					formControl: 'formControlCitizenGroup-Group-Two',
					value: 'Group-Two',
					checked: false,
					dataTestId: 'citizenGroup-Group-Two',
				},
			]);
			expect(component.createBenefitForm.contains('formControlCitizenGroup-Group-One')).toBe(true);
			expect(component.createBenefitForm.contains('formControlCitizenGroup-Group-Two')).toBe(true);
			expect(component.createBenefitForm.get('formControlCitizenGroup-Group-One')?.value).toBe(false);
			expect(component.createBenefitForm.get('formControlCitizenGroup-Group-Two')?.value).toBe(false);
		});

		it('should handle an empty response from getCitizenGroups', () => {
			const getCitizenGroupsSpy = jest
				.spyOn(component['citizenGroupsService'], 'getCitizenGroups')
				.mockReturnValue(of([]));

			component['loadInitialData']();

			expect(getCitizenGroupsSpy).toHaveBeenCalled();
			expect(component.citizenGroupsData).toEqual([]);
		});
	});

	describe('onCounterValueChange', () => {
		const testCases = [
			{ input: '5', expected: '5', description: 'should update counterFacilityTypes with the provided value' },
			{ input: '', expected: '', description: 'should handle empty values gracefully' },
			{ input: undefined as any, expected: undefined, description: 'should handle undefined values gracefully' },
		];

		testCases.forEach(({ input, expected, description }) => {
			it(description, () => {
				component.counterFacilityTypes = '0';
				component.onCounterValueChange(input);
				expect(component.counterFacilityTypes).toBe(expected);
			});
		});
	});

	describe('ariaLabelCounter', () => {
		const testCases = [
			{
				counterFacilityTypes: '1',
				expectedTranslationKey: 'createBenefit.areaLabelCounterOneItemFacilityTypes',
				expectedParams: undefined,
				description: 'should return the correct aria label for a single facility type',
			},
			{
				counterFacilityTypes: '5',
				expectedTranslationKey: 'createBenefit.areaLabelCounterMultipleItemsFacilityTypes',
				expectedParams: { count: '5' },
				description: 'should return the correct aria label for multiple facility types',
			},
			{
				counterFacilityTypes: undefined as any,
				expectedTranslationKey: 'createBenefit.areaLabelCounterMultipleItemsFacilityTypes',
				expectedParams: { count: undefined },
				description: 'should handle an undefined counterFacilityTypes gracefully',
			},
		];

		testCases.forEach(({ counterFacilityTypes, expectedTranslationKey, expectedParams, description }) => {
			it(description, () => {
				component.counterFacilityTypes = counterFacilityTypes;
				const result = component.ariaLabelCounter;
				expect(result).toBe(component['translateService'].instant(expectedTranslationKey, expectedParams));
			});
		});
	});
});
