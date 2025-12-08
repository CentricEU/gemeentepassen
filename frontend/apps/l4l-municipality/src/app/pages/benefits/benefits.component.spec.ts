/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Breadcrumb, commonRoutingConstants } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { CreateBenefitPopupComponent } from '../../components/create-benefit-popup/create-benefit-popup.component';
import { BenefitsComponent } from './benefits.component';

jest.mock('@frontend/common', () => {
	const originalModule = jest.requireActual('@frontend/common');
	return {
		...originalModule,
		FacilityTypeMapping: jest.fn(),
	};
});

describe('BenefitsPage', () => {
	let component: BenefitsComponent;
	let fixture: ComponentFixture<BenefitsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				AppModule,
			],
			providers: [FormBuilder, TranslateService],
		}).compileComponents();

		fixture = TestBed.createComponent(BenefitsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call initBreadcrumbs on ngOnInit', () => {
		const initBreadcrumbsSpy = jest.spyOn(component as any, 'initBreadcrumbs');
		component.ngOnInit();
		expect(initBreadcrumbsSpy).toHaveBeenCalled();
	});

	it('should set breadcrumbs on ngOnInit', () => {
		const setBreadcrumbsSpy = jest.spyOn(component['breadcrumbService'], 'setBreadcrumbs');
		component.ngOnInit();
		expect(setBreadcrumbsSpy).toHaveBeenCalledWith([
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.benefits', [commonRoutingConstants.benefits]),
		]);
	});

	it('should call removeBreadcrumbs on ngOnDestroy', () => {
		const removeBreadcrumbsSpy = jest.spyOn(component['breadcrumbService'], 'removeBreadcrumbs');
		component.ngOnDestroy();
		expect(removeBreadcrumbsSpy).toHaveBeenCalled();
	});

	it('should call dialogService.message with correct parameters when openCreateBenefitModal is called', () => {
		const mockDialogRef = {
			afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
		};
		jest.spyOn(component['dialogService'], 'message').mockReturnValue(mockDialogRef as any);

		component.openCreateBenefitModal();

		expect(component['dialogService'].message).toHaveBeenCalledWith(CreateBenefitPopupComponent, {
			ariaLabel: 'benefitsPage.createBenefit',
			width: '824px',
			disableClose: true,
		});
	});

	it('should call showToaster when dialog is confirmed', () => {
		const mockDialogRef = {
			afterClosed: jest.fn().mockReturnValue({
				subscribe: (callback: (result: boolean) => void) => callback(true),
			}),
		};
		jest.spyOn(component['dialogService'], 'message').mockReturnValue(mockDialogRef as any);
		const showToasterSpy = jest.spyOn(component as any, 'showToaster');

		component.openCreateBenefitModal();

		expect(showToasterSpy).toHaveBeenCalled();
	});

	it('should not call showToaster when dialog is not confirmed', () => {
		const mockDialogRef = {
			afterClosed: jest.fn().mockReturnValue({
				subscribe: (callback: (result: boolean) => void) => callback(false),
			}),
		};
		jest.spyOn(component['dialogService'], 'message').mockReturnValue(mockDialogRef as any);
		const showToasterSpy = jest.spyOn(component as any, 'showToaster');

		component.openCreateBenefitModal();

		expect(showToasterSpy).not.toHaveBeenCalled();
	});

	it('should handle case when dialogService.message returns undefined', () => {
		jest.spyOn(component['dialogService'], 'message').mockReturnValue(undefined);
		const showToasterSpy = jest.spyOn(component as any, 'showToaster');

		component.openCreateBenefitModal();

		expect(showToasterSpy).not.toHaveBeenCalled();
	});

	it('should navigate to profile page when goToProfilePage is called', () => {
		const navigateSpy = jest.spyOn(component['router'], 'navigate');
		component.goToProfilePage();
		expect(navigateSpy).toHaveBeenCalledWith([commonRoutingConstants.profile]);
	});

	describe('getCitizenGroupsCount', () => {
		it('should set showCreateCitizenGroupState to false when count is greater than 0', () => {
			const mockCitizenGroupsService = component['citizenGroupsService'];
			jest.spyOn(mockCitizenGroupsService, 'countCitizenGroups').mockReturnValue({
				subscribe: (callback: (count: number) => void) => callback(5),
			} as any);

			component.showCreateCitizenGroupState = true;
			(component as any).getCitizenGroupsCount();

			expect(component.showCreateCitizenGroupState).toBe(false);
		});

		it('should not change showCreateCitizenGroupState when count is 0', () => {
			const mockCitizenGroupsService = component['citizenGroupsService'];
			jest.spyOn(mockCitizenGroupsService, 'countCitizenGroups').mockReturnValue({
				subscribe: (callback: (count: number) => void) => callback(0),
			} as any);

			component.showCreateCitizenGroupState = true;
			(component as any).getCitizenGroupsCount();

			expect(component.showCreateCitizenGroupState).toBe(true);
		});
	});

	describe('getBenefitsCount', () => {
		it('should set dataCount and call initializeComponentData when dataCount > 0', () => {
			const mockBenefitService = component['benefitService'];
			jest.spyOn(mockBenefitService, 'countBenefits').mockReturnValue({
				subscribe: (callback: (count: number) => void) => callback(5),
			} as any);
			const initSpy = jest.spyOn(component as any, 'initializeComponentData');

			(component as any).getBenefitsCount();

			expect(component['dataCount']).toBe(5);
			expect(initSpy).toHaveBeenCalled();
		});

		it('should set dataCount and not call initializeComponentData when dataCount === 0', () => {
			const mockBenefitService = component['benefitService'];
			jest.spyOn(mockBenefitService, 'countBenefits').mockReturnValue({
				subscribe: (callback: (count: number) => void) => callback(0),
			} as any);
			const initSpy = jest.spyOn(component as any, 'initializeComponentData');

			(component as any).getBenefitsCount();

			expect(component['dataCount']).toBe(0);
			expect(initSpy).not.toHaveBeenCalled();
		});
	});

	describe('initializeComponentData', () => {
		it('should call initializeColumns and benefitsTable.initializeData', () => {
			const initColumnsSpy = jest.spyOn(component as any, 'initializeColumns');
			component.benefitsTable = { initializeData: jest.fn() } as any;

			(component as any).initializeComponentData();

			expect(initColumnsSpy).toHaveBeenCalled();
			expect(component.benefitsTable.initializeData).toHaveBeenCalled();
		});
	});

	describe('initializeColumns', () => {
		it('should define allColumns with expected structure', () => {
			(component as any).initializeColumns();
			expect(component['allColumns'].length).toBeGreaterThan(0);
		});
	});

	describe('afterDataLoaded', () => {
		it('should call benefitsTable.afterDataLoaded with transformed data', () => {
			const mockData = [
				{
					startDate: '2024-01-01',
					expirationDate: '2024-12-31',
				},
			] as any;

			component.benefitsTable = { afterDataLoaded: jest.fn() } as any;
			jest.spyOn(component as any, 'getValidityPeriod').mockReturnValue('01/01/2024 - 31/12/2024');

			(component as any).afterDataLoaded(mockData);

			expect(component.benefitsTable.afterDataLoaded).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						validityPeriod: '01/01/2024 - 31/12/2024',
					}),
				]),
			);
		});
	});

	describe('getValidityPeriod', () => {
		it('should return formatted date range', () => {
			const start = new Date(2024, 0, 1); // Jan 1, 2024
			const end = new Date(2024, 11, 31); // Dec 31, 2024
			const result = (component as any).getValidityPeriod(start, end);
			expect(result).toBe('01/01/2024 - 31/12/2024');
		});

		it('should handle missing dates gracefully', () => {
			const result = (component as any).getValidityPeriod(null, null);
			expect(result).toBe(' - ');
		});
	});

	describe('loadData', () => {
		it('should call benefitService.getAllBenefitsPaged and afterDataLoaded with response data', () => {
			const mockEvent = { currentIndex: 1, pageSize: 10 } as any;
			const mockData = [{ id: 1, name: 'Benefit A' }] as any;

			const getAllSpy = jest
				.spyOn(component['benefitService'], 'getAllBenefitsPaged')
				.mockReturnValue(of(mockData));

			const afterDataLoadedSpy = jest.spyOn(component as any, 'afterDataLoaded');

			(component as any).loadData(mockEvent);

			expect(getAllSpy).toHaveBeenCalledWith(1, 10);
			expect(afterDataLoadedSpy).toHaveBeenCalledWith(mockData);
		});
	});
});
