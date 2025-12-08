import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CitizenGroupAge, CitizenGroupAgeMapping, CommonUtil } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { TooltipOnEllipsisDirective } from '../../shared/directives/tooltip-on-elipsis/tooltip-on-elipsis.directive';
import { CitizenGroupCardComponent } from './citizen-group-card.component';

describe('CitizenGroupCardComponent', () => {
	let component: CitizenGroupCardComponent;
	let fixture: ComponentFixture<CitizenGroupCardComponent>;

	function mockTranslate(...args: unknown[]): string {
		const key = args[0] as string;
		switch (key) {
			case 'general.yes':
				return 'Yes';
			case 'general.no':
				return 'No';
			default:
				return key;
		}
	}

	beforeEach(async () => {
		// Mock IntersectionObserver
		global.IntersectionObserver = class {
			observe = jest.fn();
			unobserve = jest.fn();
			disconnect = jest.fn();
		} as any;

		// Mock ResizeObserver
		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			imports: [
				CitizenGroupCardComponent,
				TranslateModule.forRoot(),
				TooltipOnEllipsisDirective,
				NoopAnimationsModule,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CitizenGroupCardComponent);
		component = fixture.componentInstance;
		component.groupCardData = {
			ageGroup: [CitizenGroupAge.AGE_18_64],
			dependentChildren: true,
			selected: true,
			maxIncome: 2000,
		} as any;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should format currency based on maxIncome and language', () => {
		const spy = jest.spyOn((component as any).translateService, 'currentLang', 'get').mockReturnValue('en-US');
		const formatSpy = jest.spyOn(CommonUtil, 'formatCurrency').mockReturnValue('$1,234.56');

		expect(component.formattedIncome).toBe('$1,234.56');
		expect(formatSpy).toHaveBeenCalledWith(2000, 'en-US');

		spy.mockRestore();
		formatSpy.mockRestore();
	});

	it('should return correct categoryDetails', () => {
		const ageMapSpy = jest.spyOn(CitizenGroupAgeMapping(), 'get').mockReturnValue('18-66');
		const instantSpy = jest.spyOn((component as any).translateService, 'instant').mockImplementation(mockTranslate);
		const currencySpy = jest.spyOn(CommonUtil, 'formatCurrency').mockReturnValue('$2,000.00');

		const details = component.categoryDetails;
		expect(details).toEqual([
			{ key: 'citizenGroup.ageGroup', value: '18-66' },
			{ key: 'citizenGroup.isDependentChildrenIncluded', value: 'Yes' },
			{ key: 'applyForPass.groupCitizenAssignmentFromDigiD.maxIncome', value: '$2,000.00' },
		]);

		ageMapSpy.mockRestore();
		instantSpy.mockRestore();
		currencySpy.mockRestore();
	});

	it('should toggle selected when assignCitizenGroup is called and isReadonly is false or undefined', () => {
		component.groupCardData = { selected: false, isReadonly: false } as any;
		component.assignCitizenGroup();
		expect(component.groupCardData.selected).toBe(true);

		component.assignCitizenGroup();
		expect(component.groupCardData.selected).toBe(false);

		component.groupCardData = { selected: false } as any;
		component.assignCitizenGroup();
		expect(component.groupCardData.selected).toBe(true);
	});

	it('should not toggle selected when assignCitizenGroup is called and isReadonly is true', () => {
		component.groupCardData = { selected: false, isReadonly: true } as any;
		component.assignCitizenGroup();
		expect(component.groupCardData.selected).toBe(false);
	});

	it('should return correct categoryDetails for multiple age groups and dependentChildren false', () => {
		const ageMapSpy = jest.spyOn(CitizenGroupAgeMapping(), 'get');
		ageMapSpy.mockImplementation((age) => {
			if (age === CitizenGroupAge.UNDER_18) return '0-17';
			if (age === CitizenGroupAge.AGE_18_64) return '18-64';
			if (age === CitizenGroupAge.AGE_65_PLUS) return '67+';
			return '';
		});
		const instantSpy = jest.spyOn((component as any).translateService, 'instant').mockImplementation(mockTranslate);
		const currencySpy = jest.spyOn(CommonUtil, 'formatCurrency').mockReturnValue('€3,000.00');

		component.groupCardData = {
			ageGroup: ['AGE_0_17', 'AGE_65_PLUS'],
			dependentChildren: false,
			maxIncome: 3000,
		} as any;

		const details = component.categoryDetails;
		expect(details).toEqual([
			{ key: 'citizenGroup.ageGroup', value: '67+' },
			{ key: 'citizenGroup.isDependentChildrenIncluded', value: 'No' },
			{ key: 'applyForPass.groupCitizenAssignmentFromDigiD.maxIncome', value: '€3,000.00' },
		]);

		ageMapSpy.mockRestore();
		instantSpy.mockRestore();
		currencySpy.mockRestore();
	});

	it('should handle empty ageGroup and undefined dependentChildren in categoryDetails', () => {
		const ageMapSpy = jest.spyOn(CitizenGroupAgeMapping(), 'get').mockReturnValue('');
		const instantSpy = jest.spyOn((component as any).translateService, 'instant').mockImplementation(mockTranslate);
		const currencySpy = jest.spyOn(CommonUtil, 'formatCurrency').mockReturnValue('€0.00');

		component.groupCardData = {
			ageGroup: [],
			maxIncome: 0,
		} as any;

		const details = component.categoryDetails;
		expect(details).toEqual([
			{ key: 'citizenGroup.ageGroup', value: '' },
			{ key: 'citizenGroup.isDependentChildrenIncluded', value: 'No' },
			{ key: 'applyForPass.groupCitizenAssignmentFromDigiD.maxIncome', value: '€0.00' },
		]);

		ageMapSpy.mockRestore();
		instantSpy.mockRestore();
		currencySpy.mockRestore();
	});
});
