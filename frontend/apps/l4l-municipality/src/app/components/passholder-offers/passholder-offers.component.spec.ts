import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnDataType, OfferTableDto, OfferUseDto } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CentricDataGridModule } from '@windmill/ng-windmill/data-grid';
import { of } from 'rxjs';

import { PendingOffersService } from '../../pending-offers.service';
import { PassholderOffersComponent } from './passholder-offers.component';

describe('PassholderOffersComponent', () => {
	let component: PassholderOffersComponent;
	let fixture: ComponentFixture<PassholderOffersComponent>;
	let offerServiceMock: jest.Mocked<PendingOffersService>;

	const mockOffers: OfferTableDto[] = [
		{
			id: '1',
			supplierName: 'Supplier 1',
			title: 'Offer 1',
			offerType: 'DISCOUNT',
			validity: '2026-12-31',
		} as OfferTableDto,
	];

	beforeEach(async () => {
		offerServiceMock = {
			downloadOffer: jest.fn(() => of(new Blob())),
		} as unknown as jest.Mocked<PendingOffersService>;

		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			imports: [
				PassholderOffersComponent,
				CentricDataGridModule,
				TranslateModule.forRoot(),
				CommonModule,
				WindmillModule,
			],
			providers: [{ provide: PendingOffersService, useValue: offerServiceMock }, TranslateService],
		}).compileComponents();

		fixture = TestBed.createComponent(PassholderOffersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call initializeColumns and getOffersForPassholder on init', () => {
		const initColumnsSpy = jest.spyOn(component as any, 'initializeColumns');

		component.ngOnInit();

		expect(initColumnsSpy).toHaveBeenCalled();
	});

	it('should initialize table columns correctly', () => {
		(component as any).initializeColumns();

		expect(component.allColumns.length).toBe(5);
		expect(component.fixedContentCols.length).toBe(5);

		expect(component.allColumns[2].columnDataType).toBe(ColumnDataType.TRANSLATION);
		expect(component.allColumns[4].columnDataType).toBe(ColumnDataType.ACTIONS);
	});

	it('should expose ColumnDataType enum', () => {
		expect(component.columnDataTypes).toBe(ColumnDataType);
	});

	it('should return a stable trackBy key', () => {
		const column = { property: 'title' } as any;

		const result = component.trackByMethod(1, column);

		expect(result).toBe('1title');
	});

	describe('hasData', () => {
		it.each([
			{ offers: undefined, expected: false },
			{ offers: null, expected: false },
			{ offers: [], expected: false },
			{ offers: [{}], expected: true },
			{ offers: [1, 2, 3], expected: true },
		])('should return $expected when offers = $offers', ({ offers, expected }) => {
			component.offers = offers as any;

			expect(component.hasData()).toBe(expected);
		});
	});

	it('should close dialog with true after successful offer generation', () => {
		const downloadSpy = jest.spyOn(component as any, 'downloadDiscountCode');
		component.passholderId = 'INV123';
		const serviceSpy = jest
			.spyOn(offerServiceMock, 'downloadOffer')
			.mockReturnValue(of(new Blob(['test'], { type: 'application/pdf' })));

		Object.defineProperty(global.URL, 'createObjectURL', {
			writable: true,
			value: jest.fn(() => 'blob:http://test-url'),
		});

		Object.defineProperty(global.URL, 'revokeObjectURL', {
			writable: true,
			value: jest.fn(),
		});

		component.downloadCode(mockOffers[0]);

		expect(serviceSpy).toHaveBeenCalledWith(expect.any(OfferUseDto));
		expect(downloadSpy).toHaveBeenCalledWith(expect.any(Blob), 'INV123');
	});

	it('should create and trigger file download in downloadDiscountCode', () => {
		const blob = new Blob(['test'], { type: 'application/pdf' });

		Object.defineProperty(global.URL, 'createObjectURL', {
			writable: true,
			value: jest.fn(() => 'blob:http://test-url'),
		});

		Object.defineProperty(global.URL, 'revokeObjectURL', {
			writable: true,
			value: jest.fn(),
		});

		const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL');
		const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL');

		const anchorClickSpy = jest.fn();
		const anchorSpy = jest.spyOn(document, 'createElement').mockImplementation(() => {
			return {
				click: anchorClickSpy,
			} as any;
		});

		component['downloadDiscountCode'](blob, 'INV123');

		expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
		expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://test-url');
		expect(anchorSpy).toHaveBeenCalledWith('a');
		expect(anchorClickSpy).toHaveBeenCalled();
	});
});
