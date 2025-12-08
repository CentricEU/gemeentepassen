import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WarningDialogData } from '@frontend/common';
import { CustomDialogComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import DOMPurify from 'dompurify';
import { of } from 'rxjs';

import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { AppModule } from '../../app.module';
import { InviteSuppliersComponent } from './invite-suppliers.component';

jest.mock('dompurify', () => ({
	default: {
		sanitize: jest.fn((value: any) => value),
	},
}));

describe('InviteSuppliersComponent', () => {
	let component: InviteSuppliersComponent;
	let fixture: ComponentFixture<InviteSuppliersComponent>;
	let suppliersServiceMock: jest.Mocked<MunicipalitySupplierService>;
	let dialogService: DialogService;

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	const dialogRefStub = {
		close: () => undefined,
		afterClosed: jest.fn(() => of({})),
		backdropClick: jest.fn(() => of({})),
	};

	global.ResizeObserver = require('resize-observer-polyfill');
	beforeEach(async () => {
		const dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			alert: jest.fn(),
			afterClosed: jest.fn(() => of(true)),
		};

		(DOMPurify.sanitize as jest.Mock).mockImplementation((value: any) => value);

		suppliersServiceMock = {
			inviteSuppliers: jest.fn(() =>
				of({
					subscribe: () => jest.fn(),
				}),
			),
		} as any;

		await TestBed.configureTestingModule({
			declarations: [InviteSuppliersComponent],
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
				{ provide: MunicipalitySupplierService, useValue: suppliersServiceMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: MAT_DIALOG_DATA, useValue: null },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(InviteSuppliersComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should subscribe to backdropClick after creating', () => {
		jest.spyOn(dialogRefStub as any, 'backdropClick');

		expect((dialogRefStub as any).backdropClick).toHaveBeenCalled();
	});

	it('should close the dialog when close method is called and form has no data', () => {
		jest.spyOn(dialogRefStub, 'close');
		component.close();

		expect(dialogRefStub.close).toHaveBeenCalled();
	});

	it('should open the warning dialog when close method is called and form has data', () => {
		jest.spyOn(dialogRefStub, 'close');

		const invitationMessageControl = component.inviteSuppliersForm.get('invitationMessage');
		invitationMessageControl?.setValue('Invitation message.');

		component['openWarningModal'] = jest.fn();

		component.close();

		expect(component.openWarningModal).toHaveBeenCalled();
	});

	it('should create the correct warning dialog', () => {
		jest.spyOn(dialogService as any, 'message');

		component.openWarningModal();

		expect((dialogService as any).message).toHaveBeenCalledWith(CustomDialogComponent, {
			autoFocus: true,
			data: {
				acceptButtonText: 'general.button.cancel',
				acceptButtonType: 'high-emphasis-warning',
				cancelButtonText: 'general.button.stay',
				cancelButtonType: 'ghost-greyscale',
				comments: '',
				disableClosing: false,
				fileName: '',
				mainContent: '',
				modalTypeClass: 'warning',
				optionalText: new WarningDialogData(),
				secondaryContent: 'inviteSuppliers.leavingWarning',
				title: 'general.warning',
				tooltipColor: 'theme',
			},
			disableClose: false,
			width: '400px',
		});
	});

	it('should close the "Invite Suppliers" dialog after confirmation', () => {
		jest.spyOn(dialogService, 'message').mockReturnValue({
			afterClosed: jest.fn(() => of(true)),
		} as any);

		jest.spyOn(dialogRefStub, 'close');

		component.openWarningModal();

		expect(dialogRefStub.close).toHaveBeenCalled();
	});

	it('should add e-mail to list if it is valid when enter key is pressed', () => {
		const emailControl = component.inviteSuppliersForm.get('email');
		emailControl?.setValue('email@domain.com');

		component.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

		expect([...component.supplierEmails]).toEqual(['email@domain.com']);
	});

	it('should display an error when trying to add an e-mail that is already in the list', () => {
		component.supplierEmails.add('email@domain.com');

		const emailControl = component.inviteSuppliersForm.get('email');
		emailControl?.setValue('email@domain.com');

		component.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

		expect(component.emailError).toEqual('inviteSuppliers.emailAlreadyInList');
	});

	it('should display an error when trying to add an invalid e-mail', () => {
		const emailControl = component.inviteSuppliersForm.get('email');
		emailControl?.setValue('invalidemail@');

		component.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

		expect(component.emailError).toEqual('genericFields.email.validEmail');
	});

	it('should display an error when trying to add more than 50 emails', () => {
		const emailControl = component.inviteSuppliersForm.get('email');
		for (let i = 1; i <= 51; i++) {
			emailControl?.setValue(`email${i}@domain.com`);
			component.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
		}

		expect(component.emailError).toEqual('inviteSuppliers.emailsLimitReached');
	});

	it('should mark invitation message as invalid if empty', () => {
		const invitationMessageControl = component.inviteSuppliersForm.get('invitationMessage');
		invitationMessageControl?.setValue('');

		expect(invitationMessageControl?.valid).toBeFalsy();
	});

	it('should mark form as valid if there are emails provided and message is not empty', () => {
		const invitationMessageControl = component.inviteSuppliersForm.get('invitationMessage');
		invitationMessageControl?.setValue('Invitation message.');

		component.supplierEmails.add('email@domain.com');

		expect(component.isFormValid()).toBeTruthy();
	});

	it('should remove given email from list', () => {
		component.supplierEmails.add('email1@domain.com');
		component.supplierEmails.add('email2@domain.com');

		component.removeEmailFromList('email1@domain.com');

		expect([...component.supplierEmails]).toEqual(['email2@domain.com']);
	});

	it('should get the data from the form and return it as a dto', () => {
		const invitationMessageControl = component.inviteSuppliersForm.get('invitationMessage');
		invitationMessageControl?.setValue('Invitation message.');

		component.supplierEmails.add('email1@domain.com');

		const result = component['getFormValuesToInviteSuppliersDto']();

		expect(result.message).toBe('Invitation message.');
	});

	it('should send the invitations and close the dialog', () => {
		jest.spyOn(component as any, 'getFormValuesToInviteSuppliersDto');
		jest.spyOn(dialogRefStub, 'close');

		component.sendInvitations();

		expect(component['getFormValuesToInviteSuppliersDto']).toHaveBeenCalled();
		expect(suppliersServiceMock.inviteSuppliers).toHaveBeenCalled();
		expect(dialogRefStub.close).toHaveBeenCalled();
	});

	it('should add the email given as dialog data', () => {
		const dialogData = { email: 'test0@domain.com' };
		component.data = dialogData;

		jest.spyOn(component as any, 'addEmailToList');

		fixture.detectChanges();
		fixture.whenStable().then(() => {
			expect(component['addEmailToList']).toHaveBeenCalledWith(dialogData);
			expect([...component.supplierEmails]).toEqual(['test0@domain.com']);
		});
	});
});
