/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BenefitService } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { CitizenIdentityDto } from '../../shared/models/citizen-identity-dto.model';
import { CheckAndSendComponent } from './check-and-send.component';

describe('CheckAndSendComponent', () => {
	let component: CheckAndSendComponent;
	let fixture: ComponentFixture<CheckAndSendComponent>;
	let benefitServiceMock: Partial<BenefitService>;

	const commonMockData: CitizenIdentityDto = {
		lastName: 'Doe',
		firstName: 'John',
		bsnNumber: '123456789',
		birthDate: '1990-01-01',
		telephone: '+40123456789',
		email: 'john.doe@example.com',
	};

	beforeEach(async () => {
		benefitServiceMock = {
			getAllBenefitsForCitizenGroup: jest.fn(),
		};

		await TestBed.configureTestingModule({
			imports: [ReactiveFormsModule, TranslateModule.forRoot(), WindmillModule, CheckAndSendComponent],
			providers: [{ provide: BenefitService, useValue: benefitServiceMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(CheckAndSendComponent);
		component = fixture.componentInstance;

		component.checkAndSendFormGroup = new FormGroup({
			lastName: new FormControl(''),
			firstName: new FormControl(''),
			bsn: new FormControl(''),
			birthdate: new FormControl(''),
			telephone: new FormControl(''),
			email: new FormControl(''),
			additionalMessage: new FormControl(''),
		});
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should patch form with citizen identity data', () => {
		component.additionalMessage = 'Extra info';
		component.updateFormWithCitizenData(commonMockData);
		component.updateFormWithAdditionalMessage();

		expect(component.checkAndSendFormGroup.value).toEqual({
			lastName: 'Doe',
			firstName: 'John',
			bsn: '123456789',
			birthdate: '1990-01-01',
			telephone: '+40123456789',
			email: 'john.doe@example.com',
			additionalMessage: 'Extra info',
		});
	});

	it('should not patch form if formGroup is undefined', () => {
		component.checkAndSendFormGroup = undefined as any;
		expect(() => component.updateFormWithCitizenData(commonMockData)).not.toThrow();
	});

	it('should patch form with different citizen data', () => {
		const newMockData: CitizenIdentityDto = {
			lastName: 'Smith',
			firstName: 'Alice',
			bsnNumber: '987654321',
			birthDate: '1985-05-05',
			telephone: '+40987654321',
			email: 'alice.smith@example.com',
		};

		component.updateFormWithCitizenData(newMockData);

		expect(component.checkAndSendFormGroup.value).toEqual({
			lastName: 'Smith',
			firstName: 'Alice',
			bsn: '987654321',
			birthdate: '1985-05-05',
			telephone: '+40987654321',
			email: 'alice.smith@example.com',
			additionalMessage: undefined,
		});
	});

	it('should not patch form with different citizen data if formGroup is undefined', () => {
		component.checkAndSendFormGroup = undefined as any;
		const newMockData: CitizenIdentityDto = {
			lastName: 'Smith',
			firstName: 'Alice',
			bsnNumber: '987654321',
			birthDate: '1985-05-05',
			telephone: '+40987654321',
			email: 'alice.smith@example.com',
		};
		expect(() => component.updateFormWithCitizenData(newMockData)).not.toThrow();
	});

	it('should patch form with additional message', () => {
		component.additionalMessage = 'Test message';
		component.updateFormWithAdditionalMessage();
		expect(component.checkAndSendFormGroup.get('additionalMessage')?.value).toBe('Test message');
	});

	it('should not patch form with additional message if formGroup is undefined', () => {
		component.checkAndSendFormGroup = undefined as any;
		component.additionalMessage = 'Test message';
		expect(() => component.updateFormWithAdditionalMessage()).not.toThrow();
	});

	it('should call updateFormWithAdditionalMessage in ngOnChanges when formGroup and additionalMessage are defined', () => {
		const spy = jest.spyOn(component, 'updateFormWithAdditionalMessage');
		component.checkAndSendFormGroup = new FormGroup({
			additionalMessage: new FormControl(''),
		});
		component.additionalMessage = 'Some message';
		component.ngOnChanges();
		expect(spy).toHaveBeenCalled();
	});

	it('should not call updateFormWithAdditionalMessage in ngOnChanges when formGroup is undefined', () => {
		const spy = jest.spyOn(component, 'updateFormWithAdditionalMessage');
		component.checkAndSendFormGroup = undefined as any;
		component.additionalMessage = 'Some message';
		component.ngOnChanges();
		expect(spy).not.toHaveBeenCalled();
	});

	it('should not call updateFormWithAdditionalMessage in ngOnChanges when additionalMessage is undefined', () => {
		const spy = jest.spyOn(component, 'updateFormWithAdditionalMessage');
		component.checkAndSendFormGroup = new FormGroup({
			additionalMessage: new FormControl(''),
		});
		component.additionalMessage = undefined as any;
		component.ngOnChanges();
		expect(spy).not.toHaveBeenCalled();
	});
});
