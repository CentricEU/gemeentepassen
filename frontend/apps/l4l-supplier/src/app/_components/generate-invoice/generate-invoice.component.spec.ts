import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import * as moment from 'moment';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { DueDate } from '../../models/due-date.model';
import { GenerateInvoiceDto } from '../../models/generate-invoice-dto.model';
import { MonthYearEntry } from '../../models/month-year-entry.model';
import { InvoiceService } from '../../services/invoice-service/invoice.service';
import { GenerateInvoiceComponent } from './generate-invoice.component';

describe('GenerateInvoiceComponent', () => {
	let component: GenerateInvoiceComponent;
	let fixture: ComponentFixture<GenerateInvoiceComponent>;
	let dialogService: DialogService;
	let invoiceService: InvoiceService;
	let dialogRef: MatDialogRef<GenerateInvoiceComponent>;
	const dialogRefStub = {
		close: () => undefined,
		afterClosed: jest.fn(() => of({})),
		backdropClick: jest.fn(() => of({})),
	};

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	global.ResizeObserver = require('resize-observer-polyfill');

	beforeEach(async () => {
		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			alert: jest.fn(),
			afterClosed: jest.fn(() => of(true)),
		};

		const invoiceServiceMock = {
			generateInvoice: jest.fn(() => of(new Blob())),
		};

		await TestBed.configureTestingModule({
			declarations: [GenerateInvoiceComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				AppModule,
			],
			providers: [
				FormBuilder,
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: MAT_DIALOG_DATA, useValue: {} },
				{ provide: InvoiceService, useValue: invoiceServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(GenerateInvoiceComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);
		invoiceService = TestBed.inject(InvoiceService);
		dialogRef = TestBed.inject(MatDialogRef);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize form on ngOnInit', () => {
		component.ngOnInit();
		expect(component.generateInvoiceForm).toBeTruthy();
		expect(component.generateInvoiceForm.get('invoiceNumber')).toBeTruthy();
		expect(component.generateInvoiceForm.get('month')).toBeTruthy();
		expect(component.generateInvoiceForm.get('issueDate')).toBeTruthy();
		expect(component.generateInvoiceForm.get('dueDate')).toBeTruthy();
	});

	it('should close dialog if form is not dirty', () => {
		const spy = jest.spyOn(component['dialogRef'], 'close');
		component.generateInvoiceForm.markAsPristine();
		component.close();
		expect(spy).toHaveBeenCalledWith(false);
	});

	it('should return true if form is valid and not pristine', () => {
		component.data = new MonthYearEntry('transactions.months.january', 2023);

		component.generateInvoiceForm.markAsDirty();
		component.generateInvoiceForm.get('invoiceNumber')?.setValue('INV123');
		component.generateInvoiceForm.get('month')?.setValue('January 2023');
		component.generateInvoiceForm.get('issueDate')?.setValue(moment());
		component.generateInvoiceForm.get('dueDate')?.setValue('7 days');
		expect(component.isFormValid()).toBe(true);
	});

	it('should return false if form is invalid or pristine', () => {
		component.generateInvoiceForm.markAsPristine();
		expect(component.isFormValid()).toBe(false);
		component.generateInvoiceForm.markAsDirty();
		expect(component.isFormValid()).toBe(false);
	});

	it('should return correct error message for invoice number', () => {
		component.generateInvoiceForm.get('invoiceNumber')?.setErrors({ required: true });
		expect(component.getInvoiceNumberErrorMessage()).toBe('transactions.generateInvoice.invoiceNumberRequired');
		component.generateInvoiceForm.get('invoiceNumber')?.setErrors({ pattern: true });
		expect(component.getInvoiceNumberErrorMessage()).toBe('transactions.generateInvoice.invoiceNumberInvalid');
	});

	it('should initialize month and year if data is provided', () => {
		component.data = new MonthYearEntry('transactions.months.january', 1, 2023);

		component.ngOnInit();
		expect(component['monthLabel']).toBe('transactions.months.january');
		expect(component['year']).toBe(2023);
	});

	it('should initialize month and year if data is not provided', () => {
		component.ngOnInit();
		expect(component['monthLabel']).toContain('transactions.months.');
		expect(component['year']).toBe(new Date().getFullYear());
	});

	it('should close dialog on backdrop click', () => {
		const spy = jest.spyOn(component['dialogRef'], 'close');
		component.ngOnInit();
		component.generateInvoiceForm.markAsPristine();
		component['backdropClickClose']();
		expect(spy).toHaveBeenCalledWith(false);
	});

	it('should open warning modal when closing a dirty form', () => {
		const dialogServiceSpy = jest.spyOn(dialogService, 'message').mockReturnValue({
			afterClosed: jest.fn(() => of(true)),
		} as any);
		const dialogRefSpy = jest.spyOn(component['dialogRef'], 'close');

		component.generateInvoiceForm.markAsDirty();
		component.close();

		expect(dialogServiceSpy).toHaveBeenCalled();
		expect(dialogRefSpy).toHaveBeenCalledWith(false);
	});

	it('should close dialog with true after successful invoice generation', () => {
		const generateInvoiceFormValues = {
			invoiceNumber: 'INV123',
			month: 'January 2023',
			issueDate: moment(),
			dueDate: '1',
		};
		component.generateInvoiceForm.setValue(generateInvoiceFormValues);

		const downloadSpy = jest.spyOn(component as any, 'downloadInvoice');
		const serviceSpy = jest
			.spyOn(invoiceService, 'generateInvoice')
			.mockReturnValue(of(new Blob(['test'], { type: 'application/pdf' })));
		Object.defineProperty(global.URL, 'createObjectURL', {
			writable: true,
			value: jest.fn(() => 'blob:http://test-url'),
		});

		Object.defineProperty(global.URL, 'revokeObjectURL', {
			writable: true,
			value: jest.fn(),
		});
		const dialogCloseSpy = jest.spyOn(dialogRef, 'close');

		component.generateInvoice();

		expect(serviceSpy).toHaveBeenCalledWith(expect.any(GenerateInvoiceDto));
		expect(downloadSpy).toHaveBeenCalledWith(expect.any(Blob), 'INV123');
		expect(dialogCloseSpy).toHaveBeenCalledWith(true);
	});

	it('should filter due date source on onSearchValueChanged', () => {
		component['dueDateSource'] = [
			new DueDate('1', '7 days'),
			new DueDate('2', '14 days'),
			new DueDate('3', '30 days'),
		];

		component.onSearchValueChanged('7');
		expect(component.updatedDueDateSource).toEqual([new DueDate('1', '7 days')]);
	});

	it('should restore full dueDateSource when search input is empty', () => {
		component.updatedDueDateSource = [];
		component.onSearchValueChanged('');
		expect(component.updatedDueDateSource).toEqual(component['dueDateSource']);
	});

	it('should create and trigger file download in downloadInvoice', () => {
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

		component['downloadInvoice'](blob, 'INV123');

		expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
		expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://test-url');
		expect(anchorSpy).toHaveBeenCalledWith('a');
		expect(anchorClickSpy).toHaveBeenCalled();
	});
});
