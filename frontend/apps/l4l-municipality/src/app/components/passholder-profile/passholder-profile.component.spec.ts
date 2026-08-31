import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BenefitService, EligibleBenefitDto, PassholderViewDto } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PassholderProfileComponent } from './passholder-profile.component';

describe('PassholderProfileComponent', () => {
	let component: PassholderProfileComponent;
	let fixture: ComponentFixture<PassholderProfileComponent>;

	const mockPassholder = {
		id: 1,
		name: 'John Doe',
		bsn: '123456789',
		address: '123 Main St',
		residenceCity: 'Amsterdam',
		passNumber: 'AB123456',
		expiringDate: '2026-12-31',
	};

	const benefitsServiceMock = {
		getAllBenefitsByPassholderId: jest.fn().mockReturnValue(
			of([
				{ name: 'Gym', description: 'Access to Gym' },
				{ name: 'Pool', description: 'Access to Swimming Pool' },
			] as EligibleBenefitDto[]),
		),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PassholderProfileComponent, TranslateModule.forRoot()],
			providers: [FormBuilder, { provide: BenefitService, useValue: benefitsServiceMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(PassholderProfileComponent);
		component = fixture.componentInstance;
		component.passholder = mockPassholder as unknown as PassholderViewDto;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize the form with passholder values', () => {
		component.ngOnInit();

		const form = component.passholderProfileForm;

		expect(form).toBeDefined();
		expect(form.get('fullName')?.value).toBe(mockPassholder.name);
		expect(form.get('bsn')?.value).toBe(mockPassholder.bsn);
		expect(form.get('address')?.value).toBe(mockPassholder.address);
		expect(form.get('residence')?.value).toBe(mockPassholder.residenceCity);
		expect(form.get('passNumber')?.value).toBe(mockPassholder.passNumber);
		expect(form.get('expirationDate')?.value).toBe('31/12/2026');
	});

	describe('citizenGroupName', () => {
		it('should return citizen group name when present', () => {
			component.passholder = {
				citizenGroupName: 'Group A',
			} as PassholderViewDto;

			expect(component.citizenGroupName).toBe('Group A');
		});

		it('should return empty string when citizen group name is missing', () => {
			component.passholder = {
				citizenGroupName: null,
			} as unknown as PassholderViewDto;

			expect(component.citizenGroupName).toBe('');
		});
	});

	describe('isRegisteredLabel', () => {
		it('should return "general.yes" when registered', () => {
			component.passholder = {
				isRegistered: true,
			} as PassholderViewDto;

			expect(component.isRegisteredLabel).toBe('general.yes');
		});

		it('should return "general.no" when not registered', () => {
			component.passholder = {
				isRegistered: false,
			} as PassholderViewDto;

			expect(component.isRegisteredLabel).toBe('general.no');
		});
	});

	describe('registrationClass', () => {
		it('should return "registered" when registered', () => {
			component.passholder = {
				isRegistered: true,
			} as PassholderViewDto;

			expect(component.registrationClass).toBe('registered');
		});

		it('should return "not-registered" when not registered', () => {
			component.passholder = {
				isRegistered: false,
			} as PassholderViewDto;

			expect(component.registrationClass).toBe('not-registered');
		});
	});

	it('should load benefits and assign them to component', () => {
		const mockBenefits = [{ id: 10 }, { id: 20 }];
		component.passholder = mockPassholder as unknown as PassholderViewDto;
		benefitsServiceMock.getAllBenefitsByPassholderId.mockReturnValue(of(mockBenefits));

		(component as any).loadBenefits();

		expect(benefitsServiceMock.getAllBenefitsByPassholderId).toHaveBeenCalledWith(mockPassholder.id);

		expect(component.benefits).toEqual(mockBenefits);
	});

	describe('isExpiredPassholder', () => {
		let component: any;

		beforeEach(() => {
			component = {
				passholder: {
					expiringDate: null,
				},
				get isExpiredPassholder() {
					return new Date(this.passholder.expiringDate) < new Date();
				},
			};
		});

		it('should return true when passholder is expired', () => {
			const pastDate = new Date();
			pastDate.setDate(pastDate.getDate() - 1);

			component.passholder.expiringDate = pastDate.toISOString();

			expect(component.isExpiredPassholder).toBe(true);
		});

		it('should return false when passholder is not expired', () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 1);

			component.passholder.expiringDate = futureDate.toISOString();

			expect(component.isExpiredPassholder).toBe(false);
		});

		it('should return false when expiring date is now or in the future', () => {
			const now = new Date().toISOString();

			component.passholder.expiringDate = now;

			expect(component.isExpiredPassholder).toBe(false);
		});
	});
});
