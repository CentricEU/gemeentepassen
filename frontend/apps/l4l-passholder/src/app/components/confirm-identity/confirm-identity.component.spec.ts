import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { FormUtil } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';

import { CitizenIdentityDto } from '../../shared/models/citizen-identity-dto.model';
import { ConfirmIdentityComponent } from './confirm-identity.component';

describe('ConfirmIdentityComponent', () => {
	let component: ConfirmIdentityComponent;
	let translateServiceMock: Partial<TranslateService>;

	beforeEach(async () => {
		translateServiceMock = {
			instant: jest.fn((key) => key),
		};

		TestBed.overrideComponent(ConfirmIdentityComponent, {
			set: {
				schemas: [NO_ERRORS_SCHEMA],
			},
		});

		await TestBed.configureTestingModule({
			providers: [ConfirmIdentityComponent, { provide: TranslateService, useValue: translateServiceMock }],
		}).compileComponents();

		component = TestBed.inject(ConfirmIdentityComponent);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should expose FormUtil functions', () => {
		expect(component.validationFunctionError).toBe(FormUtil.validationFunctionError);
		expect(component.hasControlErrorsAndTouched).toBe(FormUtil.hasControlErrorsAndTouched);
	});

	it('should patch form group with initial data', () => {
		const patchValueSpy = jest.fn();
		component.confirmIdentityFormGroup = { patchValue: patchValueSpy } as unknown as FormGroup;
		const data: CitizenIdentityDto = {
			lastName: 'Doe',
			firstName: 'John',
			bsnNumber: '123456789',
			birthDate: '01-01-1990',
			telephone: '0612345678',
			email: 'john@doe.com',
		};
		component.updateFormWithInitialData(data);
		expect(patchValueSpy).toHaveBeenCalledWith({
			lastName: 'Doe',
			firstName: 'John',
			bsn: '123456789',
			birthdate: '01-01-1990',
			telephone: '0612345678',
			email: 'john@doe.com',
		});
	});

	it('should not patch form group if confirmIdentityFormGroup is undefined', () => {
		component.confirmIdentityFormGroup = undefined as any;
		const data: CitizenIdentityDto = {
			lastName: 'Doe',
			firstName: 'John',
			bsnNumber: '123456789',
			birthDate: '01-01-1990',
			telephone: '0612345678',
			email: 'john@doe.com',
		};
		expect(() => component.updateFormWithInitialData(data)).not.toThrow();
	});

	it('should emit input value change', () => {
		const emitSpy = jest.spyOn(component.inputValueChanged, 'emit');
		component.onEmailValueChanged('test-value');
		expect(emitSpy).toHaveBeenCalledWith('test-value');
	});

	it('should handle inputFields correctly when set', () => {
		component.inputFields = [
			{
				labelKey: 'genericFields.lastName.title',
				controlName: 'lastName',
				id: 'last-name-id',
				name: 'lastName',
			},
			{
				labelKey: 'genericFields.firstName.title',
				controlName: 'firstName',
				id: 'first-name-id',
				name: 'firstName',
			},
			{
				labelKey: 'genericFields.bsn.title',
				controlName: 'bsn',
				id: 'bsn-id',
				name: 'bsnNumber',
			},
			{
				labelKey: 'genericFields.birthDate.title',
				controlName: 'birthdate',
				id: 'birthdate-id',
				name: 'birthDate',
			},
		];
		expect(component.inputFields.length).toBe(4);
		expect(component.inputFields[0].name).toBe('lastName');
	});
	it('should return true if email exists in confirmIdentityFormGroup', () => {
		const getMock = jest.fn().mockReturnValue({});
		component.confirmIdentityFormGroup = { get: getMock } as unknown as FormGroup;
		expect(component.checkEmailControl()).toBe(true);
		expect(getMock).toHaveBeenCalledWith('email');
	});

	it('should return false if confirmIdentityFormGroup is undefined', () => {
		component.confirmIdentityFormGroup = undefined as any;
		expect(component.checkEmailControl()).toBe(false);
	});

	it('should return false if email does not exist in confirmIdentityFormGroup', () => {
		const getMock = jest.fn().mockReturnValue(undefined);
		component.confirmIdentityFormGroup = { get: getMock } as unknown as FormGroup;
		expect(component.checkEmailControl()).toBe(false);
	});
});
