import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SupplierProfileService } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
import { of } from 'rxjs';

import { WindmillModule } from '../../windmil.module';
import { AddCashierModalComponent } from './add-cashier-modal';

describe('AddCashierModal', () => {
	let component: AddCashierModalComponent;
	let fixture: ComponentFixture<AddCashierModalComponent>;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const supplierProfileServiceMock = {
		addCashiersToProfile: jest.fn(() => of([])),
	} as unknown as jest.Mocked<SupplierProfileService>;

	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };

	beforeEach(async () => {
		const mockDialogData = {};
		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			afterClosed: jest.fn(() => of({})),
		};
		await TestBed.configureTestingModule({
			imports: [
				AddCashierModalComponent,
				WindmillModule,
				CommonModule,
				HttpClientModule,
				TranslateModule.forRoot(),
				BrowserAnimationsModule,
			],
			providers: [
				TranslateService,
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: MAT_DIALOG_DATA, useValue: mockDialogData },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: 'env', useValue: environmentMock },
				{ provide: SupplierProfileService, useValue: supplierProfileServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(AddCashierModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with empty cashier emails list', () => {
		expect(component.cashierEmailsList.size).toBe(0);
		expect(component.hasDuplicateEmailError).toBeFalsy();
		expect(component.emailError).toBeUndefined();
	});

	it('should close dialog with cashier emails list on addCashiers', () => {
		jest.spyOn(component['dialogRef'], 'close');
		component.cashierEmailsList.add('test@example.com');
		component.addCashiers();
		expect(component['dialogRef'].close).toHaveBeenCalledWith(component.cashierEmailsList);
	});

	it('should close dialog without data on close', () => {
		jest.spyOn(component['dialogRef'], 'close');
		component.close();
		expect(component['dialogRef'].close).toHaveBeenCalledWith();
	});


	it('should return true when cashier emails list is empty', () => {
		component.cashierEmailsList.clear();
		expect(component.isButtonDisalbed()).toBe(true);
	});

	it('should return false when cashier emails list has items', () => {
		component.cashierEmailsList.add('test1@example.com');
		expect(component.isButtonDisalbed()).toBe(false);
	});

	it('should return false when cashier emails list has multiple items', () => {
		component.cashierEmailsList.add('test1@example.com');
		component.cashierEmailsList.add('test2@example.com');
		expect(component.isButtonDisalbed()).toBe(false);
	});

	it('should return true after removing all emails from the list', () => {
		component.cashierEmailsList.add('test@example.com');
		component.cashierEmailsList.clear();
		expect(component.isButtonDisalbed()).toBe(true);
	});

	it('should handle Enter key and add valid email', () => {
		component.emailControl.setValue('test@example.com');
		const event = new KeyboardEvent('keydown', { key: 'Enter' });
		jest.spyOn(event, 'preventDefault');
		component.handleKeydown(event);
		expect(event.preventDefault).toHaveBeenCalled();
		expect(component.cashierEmailsList.has('test@example.com')).toBe(true);
	});

	it('should prevent default on Space key', () => {
		const event = new KeyboardEvent('keydown', { key: ' ' });
		jest.spyOn(event, 'preventDefault');
		component.handleKeydown(event);
		expect(event.preventDefault).toHaveBeenCalled();
	});

	it('should clear email error when input is empty', () => {
		component.emailError = 'some error';
		component.emailControl.setValue('');
		component.handleKeydown(new KeyboardEvent('keydown', { key: 'a' }));
		expect(component.emailError).toBe('');
	});

	it('should remove email from list and reset duplicate error', () => {
		component.cashierEmailsList.add('test@example.com');
		component.hasDuplicateEmailError = true;
		component.removeEmailFromList('test@example.com');
		expect(component.cashierEmailsList.has('test@example.com')).toBe(false);
		expect(component.hasDuplicateEmailError).toBe(false);
	});

	it('should set error for invalid email on Enter key', () => {
		component.emailControl.setValue('invalid-email');
		const event = new KeyboardEvent('keydown', { key: 'Enter' });
		component.handleKeydown(event);
		expect(component.emailError).toBe('genericFields.email.validEmail');
	});

	it('should set error for duplicate email', () => {
		component.cashierEmailsList.add('test@example.com');
		component.emailControl.setValue('test@example.com');
		const event = new KeyboardEvent('keydown', { key: 'Enter' });
		component.handleKeydown(event);
		expect(component.emailError).toBe('inviteSuppliers.emailAlreadyInList');
	});

	it('should add valid unique email and clear control', () => {
		component.emailControl.setValue('new@example.com');
		const event = new KeyboardEvent('keydown', { key: 'Enter' });
		component.handleKeydown(event);
		expect(component.cashierEmailsList.has('new@example.com')).toBe(true);
		expect(component.emailControl.value).toBe('');
		expect(component.emailError).toBe('');
	});

	describe('handleBlur', () => {
		it.each([
			[null, false],
			[undefined, false],
			['', false],
			['valid@email.com', true],
			[{ target: 'input' }, true],
			[0, true],
			[false, true],
		])('event: %p -> should call handleKeyPressed: %p', (event, shouldCall) => {
			const handleKeyPressedSpy = jest.spyOn(component as any, 'handleKeyPressed');

			component.handleBlur(event);

			if (shouldCall) {
				expect(handleKeyPressedSpy).toHaveBeenCalled();
			} else {
				expect(handleKeyPressedSpy).not.toHaveBeenCalled();
			}
		});
	});
});
