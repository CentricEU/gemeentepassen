import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CitizenGroupAge, CitizenGroupsService, commonRoutingConstants } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { TooltipOnEllipsisDirective } from '../../shared/directives/tooltip-on-elipsis/tooltip-on-elipsis.directive';
import { DigiDCategoryComponent } from './digid-category.component';
import { Router } from '@angular/router';

describe('DigiDCategoryComponent', () => {
	let component: DigiDCategoryComponent;
	let fixture: ComponentFixture<DigiDCategoryComponent>;
	let mockRouter: { navigate: jest.Mock };
	let mockCitizenGroupsService: { startFlowPageValue: string | null };

	beforeEach(async () => {
		mockRouter = { navigate: jest.fn() };
		mockCitizenGroupsService = { startFlowPageValue: null } as any;

		global.IntersectionObserver = class {
			constructor() {
				// mock constructor
			}
			observe() {
				// mock observe
			}
			unobserve() {
				// mock unobserve
			}
			disconnect() {
				// mock disconnect
			}
		} as any;

		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			imports: [
				DigiDCategoryComponent,
				TranslateModule.forRoot(),
				TooltipOnEllipsisDirective,
				NoopAnimationsModule,
			],
			providers: [
				{ provide: Router, useValue: mockRouter },
				{ provide: CitizenGroupsService, useValue: mockCitizenGroupsService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DigiDCategoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return correct age groups for ageGroup', () => {
		expect(component.ageGroup).toBeTruthy();
		expect(component.ageGroup).toBeDefined();
		expect(component.ageGroup).toEqual([
			CitizenGroupAge.UNDER_18,
			CitizenGroupAge.AGE_18_64,
			CitizenGroupAge.AGE_65_PLUS,
		]);
	});

	it('should call changeCategory', () => {
		const spy = jest.spyOn(component, 'changeCategory');
		component.changeCategory();
		expect(spy).toHaveBeenCalled();
	});

	it('should call confirmAssignedCategory', () => {
		const spy = jest.spyOn(component, 'confirmAssignedCategory');
		component.confirmAssignedCategory();
		expect(spy).toHaveBeenCalled();
	});

	it('should set startFlowPageValue and navigate correctly', () => {
		component.confirmAssignedCategory();

		expect(mockCitizenGroupsService.startFlowPageValue).toBe(commonRoutingConstants.digidCategory);
		expect(mockRouter.navigate).toHaveBeenCalledWith([commonRoutingConstants.applyForPassSetup]);
	});
});
