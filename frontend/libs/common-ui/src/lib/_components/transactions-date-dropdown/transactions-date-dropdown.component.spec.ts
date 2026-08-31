import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { CommonUtil, FormUtil, TransactionDateDropdown } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { CommonUiModule } from '../../common-ui.module';
import { WindmillModule } from '../../windmil.module';
import { TransactionsDateDropdownComponent } from './transactions-date-dropdown.component';

describe('TransactionsDateDropdownComponent', () => {
	let component: TransactionsDateDropdownComponent;
	let fixture: ComponentFixture<TransactionsDateDropdownComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [WindmillModule, CommonUiModule, TranslateModule.forRoot(), MatMenuModule],
			providers: [],
		}).compileComponents();

		fixture = TestBed.createComponent(TransactionsDateDropdownComponent);
		component = fixture.componentInstance;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize rangeForm with default values', () => {
		expect(component.rangeForm.get('startDate')?.value).toBe('');
		expect(component.rangeForm.get('expirationDate')?.value).toBeInstanceOf(Date);
	});

	it("should return today's date from today getter", () => {
		const today = component.today;
		const now = new Date();
		expect(today.toDateString()).toBe(now.toDateString());
	});

	it('should update customDateRangeText when rangeForm values change', () => {
		const startDate = new Date(2024, 0, 1);
		const endDate = new Date(2024, 0, 31);

		component.rangeForm.patchValue({
			startDate: startDate,
			expirationDate: endDate,
		});

		expect(component['customDateRangeText']).toContain('01/01/2024');
		expect(component['customDateRangeText']).toContain('31/01/2024');
	});

	it('should not change selectedDate in ngOnChanges when selectedDate is already set', () => {
		const existingDate: TransactionDateDropdown = {
			translationLabel: 'existing',
			startDateInterval: new Date().toISOString(),
			endDateInterval: new Date().toISOString(),
		};
		component.selectedDate = existingDate;
		component.dateOptions = [
			{
				translationLabel: 'test1',
				startDateInterval: new Date().toISOString(),
				endDateInterval: new Date().toISOString(),
			},
		];

		component.ngOnChanges();

		expect(component.selectedDate).toEqual(existingDate);
	});

	it('should return new Date when expirationDateInit is called with empty date', () => {
		const result = component.expirationDateInit('', true);
		expect(result).toBeInstanceOf(Date);
	});

	it('should return customDateRangeText when getTranslationLabel is called with fromDropdown false and customDateRangeText exists', () => {
		component['customDateRangeText'] = 'Custom Range Text';
		const mockDate: TransactionDateDropdown = { translationLabel: 'test' };

		const result = component.getTranslationLabel(mockDate, false);

		expect(result).toBe('Custom Range Text');
	});

	it('should return translationLabel when getTranslationLabel is called with fromDropdown true', () => {
		component['customDateRangeText'] = 'Custom Range Text';
		const mockDate: TransactionDateDropdown = { translationLabel: 'test.label' };

		const result = component.getTranslationLabel(mockDate, true);

		expect(result).toBe('test.label');
	});

	it('should return empty string when getTranslationLabel is called with undefined value', () => {
		const result = component.getTranslationLabel(undefined as any, false);
		expect(result).toBe('');
	});

	it('should emit selectedDateRange and hide dropdown when applyCustomDateRange is called with valid form', () => {
		const startDate = new Date(2024, 0, 1);
		const endDate = new Date(2024, 0, 31);
		const emitSpy = jest.spyOn(component.selectedDateRange, 'emit');

		component.rangeForm.patchValue({
			startDate: startDate,
			expirationDate: endDate,
		});

		component.applyCustomDateRange();

		expect(emitSpy).toHaveBeenCalled();
		expect(component.showCustomDateRange).toBe(false);
	});

	it('should not emit when applyCustomDateRange is called with invalid form', () => {
		const emitSpy = jest.spyOn(component.selectedDateRange, 'emit');
		component.rangeForm.patchValue({ startDate: '', expirationDate: '' });

		component.applyCustomDateRange();

		expect(emitSpy).not.toHaveBeenCalled();
	});

	it('should set customDateRangeText when onMenuClosed is called with custom range', () => {
		const startDate = '2024-01-01';
		const endDate = '2024-01-31';
		component.lastSelectedInterval = {
			translationLabel: 'transactions.dateInterval.customRange',
			startDateInterval: startDate,
			endDateInterval: endDate,
		};

		component.onMenuClosed();

		expect(component['customDateRangeText']).toContain('01/01/2024');
		expect(component['customDateRangeText']).toContain('31/01/2024');
	});

	it('should set customDateRangeText to translationLabel when onMenuClosed is called with non-custom range', () => {
		component.lastSelectedInterval = { translationLabel: 'test.label' };

		component.onMenuClosed();

		expect(component['customDateRangeText']).toBe('test.label');
	});

	it('should show custom date range when selectDateRange is called with custom range option', () => {
		const mockEvent = {
			target: document.createElement('div'),
			stopPropagation: jest.fn(),
		} as any;
		const dropdownDiv = document.createElement('div');
		dropdownDiv.className = 'custom-dropdown';
		mockEvent.target.closest = jest.fn().mockReturnValue(dropdownDiv);

		const customRange: TransactionDateDropdown = {
			translationLabel: 'transactions.dateInterval.customRange',
		};

		component.selectDateRange(customRange, mockEvent);

		expect(component.showCustomDateRange).toBe(true);
		expect(mockEvent.stopPropagation).toHaveBeenCalled();
	});

	it('should emit selectedDateRange when selectDateRange is called with non-custom range', () => {
		const emitSpy = jest.spyOn(component.selectedDateRange, 'emit');
		const mockEvent = {
			target: document.createElement('div'),
			stopPropagation: jest.fn(),
		} as any;
		mockEvent.target.closest = jest.fn().mockReturnValue(null);

		const normalRange: TransactionDateDropdown = {
			translationLabel: 'transactions.dateInterval.last30days',
			startDateInterval: new Date().toISOString(),
			endDateInterval: new Date().toISOString(),
		};

		component.selectDateRange(normalRange, mockEvent);

		expect(emitSpy).toHaveBeenCalledWith(normalRange);
		expect(component.showCustomDateRange).toBe(false);
	});

	it('should call enforceStartDateBeforeExpiration when onStartDateChange is called', () => {
		const spy = jest.spyOn(CommonUtil, 'enforceStartDateBeforeExpiration');

		component.onStartDateChange();

		expect(spy).toHaveBeenCalledWith(component.rangeForm);
	});

	it('should adjust date by subtracting one day and call FormUtil.calculateExpirationDate (isEditable=true)', () => {
		const inputDate = '2024-02-10T00:00:00.000Z';
		const expectedAdjustedIso = new Date('2024-02-09T00:00:00.000Z').toISOString();
		const mockReturn = new Date('2024-03-01T00:00:00.000Z');

		const spy = jest.spyOn(FormUtil, 'calculateExpirationDate').mockReturnValue(mockReturn);

		const result = component.expirationDateInit(inputDate, true);

		expect(spy).toHaveBeenCalledWith(expectedAdjustedIso, true);
		expect(result).toBe(mockReturn);
		spy.mockRestore();
	});

	it('should adjust date by subtracting one day and call FormUtil.calculateExpirationDate (isEditable=false)', () => {
		const inputDate = '2024-12-25T12:00:00.000Z';

		const expectedAdjustedIso = new Date('2024-12-24T12:00:00.000Z').toISOString();
		const mockReturn = new Date('2025-01-01T00:00:00.000Z');

		const spy = jest.spyOn(FormUtil, 'calculateExpirationDate').mockReturnValue(mockReturn);

		const result = component.expirationDateInit(inputDate, false);

		expect(spy).toHaveBeenCalledWith(expectedAdjustedIso, false);
		expect(result).toBe(mockReturn);
		spy.mockRestore();
	});

	it('should remove the custom-date-range class when hideDropdown is called', () => {
		const dropdownElement = document.createElement('div');
		dropdownElement.classList.add('custom-date-range');

		jest.spyOn(document, 'querySelector').mockReturnValue(dropdownElement);

		component['hideDropdown']();

		expect(dropdownElement.classList.contains('custom-date-range')).toBe(false);
	});

	it('should remove the custom-date-range class inside selectDateRange when selecting a non-custom range', () => {
		const dropdownElement = document.createElement('div');
		dropdownElement.classList.add('custom-date-range');

		const mockEvent = {
			target: {
				closest: jest.fn().mockReturnValue(dropdownElement),
			},
			stopPropagation: jest.fn(),
		} as any;

		const normalRange: TransactionDateDropdown = {
			translationLabel: 'transactions.dateInterval.last30days',
			startDateInterval: new Date().toISOString(),
			endDateInterval: new Date().toISOString(),
		};

		const emitSpy = jest.spyOn(component.selectedDateRange, 'emit');

		component.selectDateRange(normalRange, mockEvent);

		expect(dropdownElement.classList.contains('custom-date-range')).toBe(false);
		expect(emitSpy).toHaveBeenCalledWith(normalRange);
	});

	it('should update overlayElement styles in updateModalPosition', () => {
		jest.useFakeTimers();

		const overlayElement = document.createElement('div');

		jest.spyOn(document, 'querySelector').mockReturnValue(overlayElement);

		component['updateModalPosition']();

		jest.runAllTimers();

		expect(overlayElement.style.right).toBe('33px');

		jest.useRealTimers();
	});

	it('should set customDateRangeText to empty string when lastSelectedInterval is null in onMenuClosed', () => {
		component.lastSelectedInterval = null as any;

		const hideSpy = jest.spyOn<any, any>(component, 'hideDropdown');

		component.onMenuClosed();

		expect(component['customDateRangeText']).toBe('');
		expect(hideSpy).toHaveBeenCalled();
	});

	it('should NOT set selectedDate when dateOptions is null', () => {
		component.selectedDate = null as any;
		component.dateOptions = null as any;

		component.ngOnChanges();

		expect(component.selectedDate).toBeNull();
	});

	it('should NOT set selectedDate when dateOptions is undefined', () => {
		component.selectedDate = null as any;
		component.dateOptions = undefined as any;

		component.ngOnChanges();

		expect(component.selectedDate).toBeNull();
	});

	it('should handle null startDate and expirationDate inside applyCustomDateRange without errors', () => {
		component.rangeForm.get('startDate')?.clearValidators();
		component.rangeForm.get('expirationDate')?.clearValidators();
		component.rangeForm.updateValueAndValidity();

		component.rangeForm.patchValue({
			startDate: null,
			expirationDate: null,
		});

		const emitSpy = jest.spyOn(component.selectedDateRange, 'emit');

		expect(() => component.applyCustomDateRange()).not.toThrow();

		expect(emitSpy).not.toHaveBeenCalled();

		expect(component.selectedDate).toBeUndefined();
	});

	it('should set customDateRangeText with undefined startDateInterval when startDateInterval is undefined', () => {
		component.lastSelectedInterval = {
			translationLabel: 'transactions.dateInterval.customRange',
			startDateInterval: undefined,
			endDateInterval: new Date(2024, 0, 31).toISOString(),
		};

		component.onMenuClosed();

		expect(component['customDateRangeText']).toContain('NaN/NaN/NaN');
		expect(component['customDateRangeText']).toContain('31/01/2024');
	});

	it('should set customDateRangeText with undefined endDateInterval when endDateInterval is null', () => {
		component.lastSelectedInterval = {
			translationLabel: 'transactions.dateInterval.customRange',
			startDateInterval: '2024-01-01',
			endDateInterval: null as any,
		};

		component.onMenuClosed();

		expect(component['customDateRangeText']).toContain('01/01/2024');
		expect(component['customDateRangeText']).toContain('NaN/NaN/NaN');
	});

	it('should return early if startDate or expirationDate is missing', () => {
		component.rangeForm.setValue({ startDate: null, expirationDate: null });

		const emitSpy = jest.spyOn(component.selectedDateRange, 'emit');

		component.applyCustomDateRange();

		expect(emitSpy).not.toHaveBeenCalled();
		expect(component.selectedDate).toBeUndefined();
	});

	it('should convert startDate and expirationDate when they are Date instances', () => {
		const s = new Date(2024, 0, 10);
		const e = new Date(2024, 0, 20);

		component.rangeForm.setValue({ startDate: s, expirationDate: e });

		const emitSpy = jest.spyOn(component.selectedDateRange, 'emit');

		component.applyCustomDateRange();

		expect(emitSpy).toHaveBeenCalled();
	});

	it('should call toDate() when values are Moment-like objects', () => {
		component.rangeForm.setValue({
			startDate: '2024-06-01' as any,
			expirationDate: '2024-06-05' as any,
		});

		const emitSpy = jest.spyOn(component.selectedDateRange, 'emit');

		component.applyCustomDateRange();

		expect(emitSpy).toHaveBeenCalled();
	});

	it('should set selectedDate to lastSelectedInterval when lastSelectedInterval exists', () => {
		const mockInterval: TransactionDateDropdown = {
			translationLabel: 'transactions.dateInterval.last7days',
			startDateInterval: '2024-01-01',
			endDateInterval: '2024-01-07',
		};

		component.lastSelectedInterval = mockInterval;
		component.ngOnChanges();

		expect(component.selectedDate).toEqual(mockInterval);
	});

	it('should clear customDateRangeText when lastSelectedInterval is not a custom range', () => {
		component['customDateRangeText'] = 'Some Text';
		component.lastSelectedInterval = {
			translationLabel: 'transactions.dateInterval.last30days',
			startDateInterval: new Date().toISOString(),
			endDateInterval: new Date().toISOString(),
		};

		component.ngOnChanges();

		expect(component['customDateRangeText']).toBe('');
	});

	it('should preserve customDateRangeText when lastSelectedInterval is a custom range', () => {
		component['customDateRangeText'] = 'Custom Range Text';
		component.lastSelectedInterval = {
			translationLabel: 'transactions.dateInterval.customRange',
			startDateInterval: '2024-01-01',
			endDateInterval: '2024-01-31',
		};

		component.ngOnChanges();

		expect(component['customDateRangeText']).toBe('Custom Range Text');
	});

	it('should not modify selectedDate when lastSelectedInterval is undefined', () => {
		const existingDate: TransactionDateDropdown = {
			translationLabel: 'existing',
			startDateInterval: new Date().toISOString(),
		};
		component.selectedDate = existingDate;
		component.lastSelectedInterval = undefined as any;

		component.ngOnChanges();

		expect(component.selectedDate).toEqual(existingDate);
	});

	it('should not modify selectedDate when lastSelectedInterval is null', () => {
		const existingDate: TransactionDateDropdown = {
			translationLabel: 'existing',
			startDateInterval: new Date().toISOString(),
		};
		component.selectedDate = existingDate;
		component.lastSelectedInterval = null as any;

		component.ngOnChanges();

		expect(component.selectedDate).toEqual(existingDate);
	});

	it.each([
		['', '', true],
		['', new Date(), false],
		[new Date(2024, 0, 1), '', false],
		['', new Date(2024, 0, 31), false],
		[new Date(2024, 0, 1), new Date(2024, 0, 31), false],
		[null, null, true],
	])('should return %p when startDate is %p and expirationDate is %p', (startDate, expirationDate, expected) => {
		component.rangeForm.patchValue({
			startDate,
			expirationDate,
		});

		if (expirationDate === new Date()) {
			component.rangeForm.get('expirationDate')?.reset();
		}

		expect(component.isClearButtonDisabled()).toBe(expected);
	});
});
