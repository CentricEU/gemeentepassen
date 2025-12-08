/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CitizenGroupAge, CitizenGroupDto, CitizenGroupsService, EligibilityCriteria, RequiredDocuments } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import DOMPurify from 'dompurify';
import { of } from 'rxjs';

import { CreateCitizenGroupPopupComponent } from './create-citizen-group-popup.component';

jest.mock('dompurify', () => ({
	default: {
		sanitize: jest.fn((value: any) => value),
	},
}));

describe('CreateCitizenGroupPopupComponent', () => {
	let component: CreateCitizenGroupPopupComponent;
	let fixture: ComponentFixture<CreateCitizenGroupPopupComponent>;
	let dialogService: DialogService;
	let citizenGroupServiceMock: jest.Mocked<CitizenGroupsService>;
	let httpClientSpy: { post: jest.Mock };

	(DOMPurify.sanitize as jest.Mock).mockImplementation((value: any) => value);

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
		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			alert: jest.fn(),
			afterClosed: jest.fn(() => of(true)),
		};

		citizenGroupServiceMock = {
			saveCitizenGroup: jest.fn(() =>
				of({
					subscribe: () => jest.fn(),
				}),
			),
		} as any;

		const environmentMock = {
			production: false,
			envName: 'dev',
			apiPath: '/api',
		};

		httpClientSpy = { post: jest.fn() };

		await TestBed.configureTestingModule({
			imports: [CreateCitizenGroupPopupComponent, TranslateModule.forRoot()],
			providers: [
				TranslateService,
				{ provide: 'env', useValue: environmentMock },
				{ provide: HttpClient, useValue: httpClientSpy },
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: CitizenGroupsService, useValue: citizenGroupServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CreateCitizenGroupPopupComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should subscribe to backdropClick after creating', () => {
		jest.spyOn(dialogRefStub as any, 'backdropClick');

		expect((dialogRefStub as any).backdropClick).toHaveBeenCalled();
	});

	it('should open the warning dialog if the form is not dirty and close is called', () => {
		jest.spyOn(component, 'openWarningModal');
		jest.spyOn(component['dialogRef'] as any, 'close');

		component.close();
		expect(component.openWarningModal).not.toHaveBeenCalled();
		expect(component['dialogRef']['close']).toHaveBeenCalled();
	});

	it('should open the warning dialog if the form is marked as dirty and close is called', () => {
		component.createCitizenGroupForm.get('groupName')?.setValue('GroupName');
		component.createCitizenGroupForm.get('groupName')?.markAsDirty();

		jest.spyOn(component, 'openWarningModal');

		component.close();
		expect(component.openWarningModal).toHaveBeenCalled();
	});

	it('should close the dialog if the warning was confirmed', () => {
		jest.spyOn(dialogService, 'message').mockReturnValue({
			afterClosed: jest.fn(() => of(true)),
		} as any);

		jest.spyOn(dialogRefStub, 'close');

		component.openWarningModal();

		expect(dialogRefStub.close).toHaveBeenCalledWith(false);
	});

	it('should create the citizen group and close the dialog', () => {
		component.createCitizenGroupForm.get('groupName')?.setValue('Group Name');
		component.createCitizenGroupForm.get('ageGroup')?.setValue([{ id: CitizenGroupAge.AGE_18_64, value: '18-64' }]);
		component.createCitizenGroupForm.get('threshold')?.setValue(10);
		component.createCitizenGroupForm.get('maxIncome')?.setValue(20);
		component.createCitizenGroupForm.get('dependentChildren')?.setValue(component.actionsList[0]);
		component.createCitizenGroupForm.get('formControlIs18OrOlder')?.setValue(true);
		component.createCitizenGroupForm.get('formControlDebtsOrAlimony')?.setValue(true);

		jest.spyOn(dialogRefStub, 'close');
		jest.spyOn(component as any, 'formValuesToCreateCitizenDto');

		component.createCitizenGroup();

		expect(component['formValuesToCreateCitizenDto']).toHaveReturnedWith(
			new CitizenGroupDto(
				'Group Name',
				[CitizenGroupAge.AGE_18_64],
				false,
				10,
				0,
				[EligibilityCriteria.IS_AGE_18_OR_OLDER],
				[RequiredDocuments.DEBTS_OR_ALIMONY_OBLIGATIONS],
			),
		);

		expect(dialogRefStub.close).toHaveBeenCalledWith(true);
		expect(citizenGroupServiceMock.saveCitizenGroup).toHaveBeenCalled();
	});

	describe('saveButtonDisabled getter', () => {
		it('should return true when form is invalid', () => {
			expect(component.saveButtonDisabled).toBe(true);
		});

		it('should return true when no eligibility criteria are selected', () => {
			component.createCitizenGroupForm.get('groupName')?.setValue('Group Name');
			component.createCitizenGroupForm
				.get('ageGroup')
				?.setValue({ id: CitizenGroupAge.AGE_18_64, value: '18-64' });
			component.createCitizenGroupForm.get('threshold')?.setValue(10);
			component.createCitizenGroupForm.get('dependentChildren')?.setValue(component.actionsList[0]);

			component.createCitizenGroupForm.get('formControlDebtsOrAlimony')?.setValue(true);

			expect(component.saveButtonDisabled).toBe(true);
		});

		it('should return true when no required documents are selected', () => {
			component.createCitizenGroupForm.get('groupName')?.setValue('Group Name');
			component.createCitizenGroupForm
				.get('ageGroup')
				?.setValue({ id: CitizenGroupAge.AGE_18_64, value: '18-64' });
			component.createCitizenGroupForm.get('threshold')?.setValue(10);
			component.createCitizenGroupForm.get('dependentChildren')?.setValue(component.actionsList[0]);

			component.createCitizenGroupForm.get('formControlIs18OrOlder')?.setValue(true);

			expect(component.saveButtonDisabled).toBe(true);
		});

		it('should return false when form is valid and at least one eligibility criteria and one required document are selected', () => {
			component.createCitizenGroupForm.get('groupName')?.setValue('Group Name');
			component.createCitizenGroupForm
				.get('ageGroup')
				?.setValue({ id: CitizenGroupAge.AGE_18_64, value: '18-64' });
			component.createCitizenGroupForm.get('threshold')?.setValue(10);
			component.createCitizenGroupForm.get('dependentChildren')?.setValue(component.actionsList[0]);

			component.createCitizenGroupForm.get('formControlIs18OrOlder')?.setValue(true);
			component.createCitizenGroupForm.get('formControlDebtsOrAlimony')?.setValue(true);

			expect(component.saveButtonDisabled).toBe(false);
		});
	});
	describe('openWarningModal', () => {
		it('should close the dialog if the warning was confirmed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue({
				afterClosed: jest.fn(() => of(true)),
			} as any);

			jest.spyOn(dialogRefStub, 'close');

			component.openWarningModal();

			expect(dialogRefStub.close).toHaveBeenCalledWith(false);
		});

		it('should call close and open warning modal', async () => {
			jest.spyOn(component, 'close');
			jest.spyOn(component['dialogRef'] as any, 'close');
			jest.spyOn(dialogService, 'message').mockReturnValue({
				afterClosed: jest.fn(() => of(false)),
			} as any);

			component.close();

			expect(dialogRefStub.close).toHaveBeenCalled();
		});
	});
	describe('subscribeToThresholdChanges', () => {
		it('should calculate maxIncome when threshold changes', () => {
			(component['tenantService'] as any).tenant = { wage: 2000 };

			component.createCitizenGroupForm.get('threshold')?.setValue(50);

			expect(component['calculatedMaxIncome']).toBe(1000);
			expect(component.createCitizenGroupForm.get('maxIncome')?.value).toBe('€1.000,00');
		});

		it('should not calculate maxIncome when tenant data is missing', () => {
			(component['tenantService'] as any).tenant = null;

			component.createCitizenGroupForm.get('threshold')?.setValue(50);

			expect(component.createCitizenGroupForm.get('maxIncome')?.value).toBe('');
		});

		it('should set maxIncome to empty when threshold is negative', () => {
			(component['tenantService'] as any).tenant = { wage: 2000 };

			component.createCitizenGroupForm.get('threshold')?.setValue(-10);

			expect(component.createCitizenGroupForm.get('maxIncome')?.value).toBe('');
		});

		it('should set maxIncome to empty when threshold is not provided', () => {
			(component['tenantService'] as any).tenant = { wage: 2000 };

			component.createCitizenGroupForm.get('threshold')?.setValue(null);

			expect(component.createCitizenGroupForm.get('maxIncome')?.value).toBe('');
		});

		it('should set maxIncome to empty when tenant wage is not available', () => {
			(component['tenantService'] as any).tenant = { wage: null };

			component.createCitizenGroupForm.get('threshold')?.setValue(50);

			expect(component.createCitizenGroupForm.get('maxIncome')?.value).toBe('');
		});

		it('should use the current language for formatting the maxIncome', () => {
			(component['tenantService'] as any).tenant = { wage: 2000 };

			jest.spyOn(component, 'language', 'get').mockReturnValue('en-US');

			component.createCitizenGroupForm.get('threshold')?.setValue(50);

			expect(component.createCitizenGroupForm.get('maxIncome')?.value).toBe('€1,000.00');
		});
	});
	describe('wage getter', () => {
		it('should format wage correctly with default language', () => {
			(component['tenantService'] as any).tenant = { wage: 2000 };

			jest.spyOn(component, 'language', 'get').mockReturnValue('nl-NL');

			expect(component.wage).toBe('€2.000,00');
		});

		it('should format wage correctly with English locale', () => {
			(component['tenantService'] as any).tenant = { wage: 2000 };

			jest.spyOn(component, 'language', 'get').mockReturnValue('en-US');

			expect(component.wage).toBe('€2,000.00');
		});

		it('should handle null tenant', () => {
			(component['tenantService'] as any).tenant = null;

			expect(component.wage).toBe('€0,00');
		});

		it('should handle undefined wage', () => {
			(component['tenantService'] as any).tenant = { wage: undefined };

			expect(component.wage).toBe('€0,00');
		});

		it('should format zero wage correctly', () => {
			(component['tenantService'] as any).tenant = { wage: 0 };

			expect(component.wage).toBe('€0,00');
		});

		it('should format negative wage correctly', () => {
			(component['tenantService'] as any).tenant = { wage: -1000 };

			expect(component.wage).toBe('€-1.000,00');
		});
	});
	describe('ngOnInit', () => {
		it('should subscribe to dialogRef keydownEvents', () => {
			jest.spyOn(dialogRefStub, 'keydownEvents').mockReturnValue(of({ key: 'Enter' }));

			component.ngOnInit();

			expect(dialogRefStub.keydownEvents).toHaveBeenCalled();
		});

		it('should call close when Escape key is pressed', () => {
			jest.spyOn(dialogRefStub, 'keydownEvents').mockReturnValue(of({ key: 'Escape' }));
			jest.spyOn(component, 'close');

			component.ngOnInit();

			expect(component.close).toHaveBeenCalled();
		});
	});
});
