import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CitizenGroupsService, commonRoutingConstants } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { CitizenGroupAssignmentComponent } from './citizen-group-assignment.component';

describe('CitizenGroupAssignmentComponent', () => {
	let component: CitizenGroupAssignmentComponent;
	let fixture: ComponentFixture<CitizenGroupAssignmentComponent>;
	let httpClientSpy: { post: jest.Mock; get: jest.Mock };

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};
	beforeEach(async () => {
		httpClientSpy = {
			post: jest.fn().mockReturnValue(of({})),
			get: jest.fn().mockReturnValue(of({})),
		};

		await TestBed.configureTestingModule({
			imports: [CitizenGroupAssignmentComponent, TranslateModule.forRoot()],
			providers: [
				{ provide: 'env', useValue: environmentMock },
				{ provide: HttpClient, useValue: httpClientSpy },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CitizenGroupAssignmentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('hasData', () => {
		it.each([
			{ data: [], expected: false },
			{ data: [{ id: 1 }], expected: true },
			{ data: [{ id: 1 }, { id: 2 }], expected: true },
		])('should return $expected for hasData when citizenGroupData is $data', ({ data, expected }) => {
			component.citizenGroupData = data as any;
			expect(component.hasData).toBe(expected);
		});
	});

	describe('router navigation', () => {
		it.each([
			{ method: 'reportNoCategoryFit', expected: [commonRoutingConstants.noneCategoryFit] },
			{ method: 'goBack', expected: [commonRoutingConstants.digidCategory] },
		])('should call router.navigate with $expected on $method', ({ method, expected }) => {
			const router = TestBed.inject(Router);
			const spy = jest.spyOn(router, 'navigate');
			(component as any)[method]();
			expect(spy).toHaveBeenCalledWith(expected);
		});
	});

	it('should set citizenGroupData on initCitizenGroups', () => {
		const citizenGroupsService = TestBed.inject(CitizenGroupsService);
		jest.spyOn(citizenGroupsService, 'getCitizenGroups').mockReturnValue(of([{ id: 2 } as any]));
		component['initCitizenGroups']();
		expect(component.citizenGroupData).toEqual([{ id: 2 }]);
	});

	it('should call initCitizenGroups on ngOnInit', () => {
		const spy = jest.spyOn(component as any, 'initCitizenGroups');
		component.ngOnInit();
		expect(spy).toHaveBeenCalled();
	});

	describe('confirmAssignedCategory', () => {
		it.each([
			{ currentCitizenGroupId: undefined, called: false },
			{ currentCitizenGroupId: 'group-123', called: true },
		])(
			'should call assignCitizenGroupToCitizen: $called when currentCitizenGroupId=$currentCitizenGroupId',
			({ currentCitizenGroupId, called }) => {
				const citizenGroupsService = TestBed.inject(CitizenGroupsService);
				const assignSpy = jest
					.spyOn(citizenGroupsService, 'assignCitizenGroupToCitizen')
					.mockReturnValue(of(undefined));
				component['currentCitizenGroupId'] = currentCitizenGroupId;
				component.confirmAssignedCategory();
				if (called) {
					expect(assignSpy).toHaveBeenCalledWith(currentCitizenGroupId);
				} else {
					expect(assignSpy).not.toHaveBeenCalled();
				}
			},
		);
	});

	describe('selectedCitizenGroupId', () => {
		it.each([
			{ currentCitizenGroupId: undefined, expected: undefined },
			{ currentCitizenGroupId: 'group-789', expected: 'group-789' },
		])(
			'should return $expected for selectedCitizenGroupId when currentCitizenGroupId is $currentCitizenGroupId',
			({ currentCitizenGroupId, expected }) => {
				(component as any).currentCitizenGroupId = currentCitizenGroupId;
				expect(component.selectedCitizenGroupId).toBe(expected);
			},
		);
	});

	describe('selectCurrentCategory', () => {
		it.each([
			{ initial: undefined, select: 'group-1', expected: 'group-1' },
			{ initial: 'group-1', select: 'group-1', expected: undefined },
			{ initial: 'group-1', select: 'group-2', expected: 'group-2' },
		])(
			'should set currentCitizenGroupId from $initial to $expected when selecting $select',
			({ initial, select, expected }) => {
				(component as any).currentCitizenGroupId = initial;
				component.selectCurrentCategory(select);
				expect((component as any).currentCitizenGroupId).toBe(expected);
			},
		);
	});

	describe('confirmAssignedCategory', () => {
		it.each([
			{ currentCitizenGroupId: undefined, called: false },
			{ currentCitizenGroupId: 'group-123', called: true },
		])(
			'should call assignCitizenGroupToCitizen: $called when currentCitizenGroupId=$currentCitizenGroupId',
			({ currentCitizenGroupId, called }) => {
				const citizenGroupsService = TestBed.inject(CitizenGroupsService);
				const assignSpy = jest
					.spyOn(citizenGroupsService, 'assignCitizenGroupToCitizen')
					.mockReturnValue(of(undefined));

				component['currentCitizenGroupId'] = currentCitizenGroupId;
				component.confirmAssignedCategory();

				if (called) {
					expect(assignSpy).toHaveBeenCalledWith(currentCitizenGroupId);
				} else {
					expect(assignSpy).not.toHaveBeenCalled();
				}
			},
		);

		it('should set startFlowPageValue and navigate after successful assignment', () => {
			const citizenGroupsService = TestBed.inject(CitizenGroupsService);
			const router = TestBed.inject(Router);

			jest.spyOn(citizenGroupsService, 'assignCitizenGroupToCitizen').mockReturnValue(of(undefined));
			const navSpy = jest.spyOn(router, 'navigate');

			component['currentCitizenGroupId'] = 'group-456';
			component.confirmAssignedCategory();

			expect(citizenGroupsService.startFlowPageValue).toBe(commonRoutingConstants.citizenGroupAssignment);
			expect(navSpy).toHaveBeenCalledWith([commonRoutingConstants.applyForPassSetup]);
		});
	});
});
