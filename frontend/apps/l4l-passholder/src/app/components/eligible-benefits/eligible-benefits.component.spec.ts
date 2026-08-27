import { TestBed } from '@angular/core/testing';
import { BenefitService, commonRoutingConstants, EligibleBenefitDto, PersistentErrorCode } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { EligibleBenefitsComponent } from './eligible-benefits.component';

describe('EligibleBenefitsComponent', () => {
	let component: EligibleBenefitsComponent;
	let benefitServiceMock: Partial<BenefitService>;
	let translateServiceMock: Partial<TranslateService>;

	beforeEach(() => {
		benefitServiceMock = {
			getAllBenefitsForCitizenGroup: jest.fn(),
		};

		translateServiceMock = {
			instant: jest.fn((key) => key),
		};

		TestBed.configureTestingModule({
			providers: [
				EligibleBenefitsComponent,
				{ provide: BenefitService, useValue: benefitServiceMock },
				{ provide: TranslateService, useValue: translateServiceMock },
			],
		});

		component = TestBed.inject(EligibleBenefitsComponent);
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should fetch and map benefits on init', () => {
		const mockBenefits: EligibleBenefitDto[] = [
			{ name: 'Credit 1', description: 'Credit Desc' } as any,
			{ name: 'Credit 2', description: 'Credit Desc 2' } as any,
			{ name: 'Credit 3', description: 'Credit Desc 3' } as any,
		];

		(benefitServiceMock.getAllBenefitsForCitizenGroup as jest.Mock).mockReturnValue(of(mockBenefits));

		component.ngOnInit();

		expect(benefitServiceMock.getAllBenefitsForCitizenGroup).toHaveBeenCalled();
		expect(component.benefitsData.length).toBe(3);
	});

	it('should handle service error', () => {
		(benefitServiceMock.getAllBenefitsForCitizenGroup as jest.Mock).mockReturnValue(
			throwError(() => new Error('Service error')),
		);

		expect(() => component.ngOnInit()).not.toThrow();
		expect(component.benefitsData).toBeUndefined();
	});

	it('should navigate to digidCategory if citizen group not found', () => {
		const routerMock = { navigate: jest.fn() };
		(component as any).router = routerMock;

		(benefitServiceMock.getAllBenefitsForCitizenGroup as jest.Mock).mockReturnValue(
			throwError(() => ({ error: PersistentErrorCode.citizenGroupNotFound })),
		);

		component.ngOnInit();

		expect(routerMock.navigate).toHaveBeenCalledWith([commonRoutingConstants.digidCategory]);
	});
});
