import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import {
	BenefitService,
	Breadcrumb,
	commonRoutingConstants,
	EligibleBenefitDto,
	OfferTableDto,
	PassholderViewDto,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { PassholdersService } from '../../_services/passholders.service';
import { PendingOffersService } from '../../pending-offers.service';
import { PassholderDetailsComponent } from './passholder-details.component';

describe('PassholderDetailsComponent', () => {
	let component: PassholderDetailsComponent;
	let fixture: ComponentFixture<PassholderDetailsComponent>;
	let offerServiceMock: jest.Mocked<PendingOffersService>;
	let passholderServiceMock: jest.Mocked<PassholdersService>;

	const mockOffers: OfferTableDto[] = [
		{
			id: '1',
			supplierName: 'Supplier 1',
			title: 'Offer 1',
			offerType: 'DISCOUNT',
			validity: '2026-12-31',
		} as OfferTableDto,
	];
	const passholderId = '123e4567-e89b-12d3-a456-426614174000';

	const mockPassholder: PassholderViewDto = {
		name: 'testName',
		id: passholderId,
		passNumber: '123456',
		address: '123 Test St',
		bsn: '987654321',
		residenceCity: 'Test City',
		citizenGroupName: 'Test Group',
	} as PassholderViewDto;

	const activatedRouteStub = {
		paramMap: of({
			get: (key: string) => (key === 'id' ? passholderId : null),
		}),
		snapshot: { data: {} },
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
		global.ResizeObserver = require('resize-observer-polyfill');

		offerServiceMock = {
			getOffersForPassholder: jest.fn(),
		} as unknown as jest.Mocked<PendingOffersService>;

		passholderServiceMock = {
			getPassholderDetails: jest.fn(),
		} as unknown as jest.Mocked<PassholdersService>;

		await TestBed.configureTestingModule({
			imports: [
				PassholderDetailsComponent,
				TranslateModule.forRoot(),
				CommonModule,
				BrowserAnimationsModule,
				WindmillModule,
			],
			providers: [
				{ provide: PendingOffersService, useValue: offerServiceMock },
				{ provide: BenefitService, useValue: benefitsServiceMock },
				{ provide: PassholdersService, useValue: passholderServiceMock },
				{
					provide: ActivatedRoute,
					useValue: activatedRouteStub,
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(PassholderDetailsComponent);
		component = fixture.componentInstance;
		offerServiceMock.getOffersForPassholder.mockReturnValue(of(mockOffers));
		passholderServiceMock.getPassholderDetails.mockReturnValue(of(mockPassholder));
		fixture.detectChanges();
		jest.clearAllMocks();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should subscribe to route params on init', () => {
		const spy = jest.spyOn(component as any, 'subscribeToRouteParam');

		component.ngOnInit();

		expect(spy).toHaveBeenCalled();
	});

	it('should set passholderId from route params', () => {
		component.ngOnInit();
		expect(component.passholderId).toBe(passholderId);
	});

	it('should call initBreadcrumbs on ngOnInit', () => {
		const initBreadcrumbsSpy = jest.spyOn(component as any, 'initBreadcrumbs');
		component.ngOnInit();
		expect(initBreadcrumbsSpy).toHaveBeenCalled();
	});

	it('should set breadcrumbs on ngOnInit', () => {
		const setBreadcrumbsSpy = jest.spyOn(component['breadcrumbService'], 'setBreadcrumbs');
		component.ngOnInit();

		const routerValue = `${commonRoutingConstants.passholders}/${mockPassholder.id}`;

		expect(setBreadcrumbsSpy).toHaveBeenCalledWith([
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.passholders', [commonRoutingConstants.passholders]),
			new Breadcrumb(mockPassholder.name, [routerValue]),
		]);
	});

	it('should call removeBreadcrumbs on ngOnDestroy', () => {
		const removeBreadcrumbsSpy = jest.spyOn(component['breadcrumbService'], 'removeBreadcrumbs');
		component.ngOnDestroy();
		expect(removeBreadcrumbsSpy).toHaveBeenCalled();
	});

	describe('isFullSize', () => {
		beforeEach(() => {
			component.offersCount = signal(0);
		});

		it.each([
			{ value: 0, tab: 0, expected: true },
			{ value: 2, tab: 0, expected: true },
			{ value: -5, tab: 0, expected: true },
			{ value: 0, tab: 1, expected: true },
			{ value: 2, tab: 1, expected: false },
			{ value: -5, tab: 1, expected: false },
		])('should return $expected when offersCount = $value', ({ value, tab, expected }) => {
			component.offersCount.set(value);
			component.tabIndex = tab;

			expect(component.isFullSize()).toBe(expected);
		});
	});

	it('should NOT call service when passholderId is missing', () => {
		component.passholderId = undefined as any;

		(component as any).getPassholderDetails();

		expect(passholderServiceMock.getPassholderDetails).not.toHaveBeenCalled();
	});

	it('should call service and set passholder when passholderId exists', () => {
		const mockPassholder = { id: '123', name: 'Test' } as PassholderViewDto;

		component.passholderId = passholderId;
		passholderServiceMock.getPassholderDetails.mockReturnValue(of(mockPassholder));

		(component as any).getPassholderDetails();

		expect(passholderServiceMock.getPassholderDetails).toHaveBeenCalledWith(passholderId);
		expect(component.passholder).toEqual(mockPassholder);
	});

	it('sets tabIndex from event index', () => {
		const event = { index: 2 } as any;

		component.tabChanged(event);

		expect(component.tabIndex).toBe(2);
	});

	it('should NOT call service if passholderId is undefined', () => {
		component.passholderId = undefined;

		(component as any).getOffersForPassholder();

		expect(offerServiceMock.getOffersForPassholder).not.toHaveBeenCalled();
	});

	it('should set offers and update count on success', () => {
		offerServiceMock.getOffersForPassholder.mockReturnValue(of(mockOffers));

		component['getOffersForPassholder']();

		expect(offerServiceMock.getOffersForPassholder).toHaveBeenCalled();
		expect(component.offers).toEqual(mockOffers);
		expect(component.offersCount()).toBe(1);
	});

	it('should reset offers and count on error', () => {
		offerServiceMock.getOffersForPassholder.mockReturnValue(throwError(() => new Error('error')));

		component['getOffersForPassholder']();

		expect(component.offers).toEqual([]);
		expect(component.offersCount()).toBe(0);
	});
});
