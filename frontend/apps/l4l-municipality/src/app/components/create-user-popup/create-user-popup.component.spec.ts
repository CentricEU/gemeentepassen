import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@frontend/common';
import { CreateUserDto } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { AppModule } from '../../app.module';
import { CreateUserPopupComponent } from './create-user-popup.component';

describe('CreateUserPopupComponent', () => {
	let component: CreateUserPopupComponent;
	let fixture: ComponentFixture<CreateUserPopupComponent>;
	let dialogService: DialogService;
	let userServiceMock: jest.Mocked<UserService>;

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

		userServiceMock = {
			createUser: jest.fn(() =>
				of({
					subscribe: () => jest.fn(),
				}),
			),
		} as any;

		await TestBed.configureTestingModule({
			declarations: [CreateUserPopupComponent],
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
				{ provide: UserService, useValue: userServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CreateUserPopupComponent);
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

	it('should open the warning dialog if the form is not dirty and close is called', () => {
		jest.spyOn(component, 'openWarningModal');
		jest.spyOn(component['dialogRef'] as any, 'close');

		component.close();
		expect(component.openWarningModal).not.toHaveBeenCalled();
		expect(component['dialogRef']['close']).toHaveBeenCalled();
	});

	it('should open the warning dialog if the form is marked as dirty and close is called', () => {
		component.createUserForm.get('firstName')?.setValue('FirstName');
		component.createUserForm.get('firstName')?.markAsDirty();

		jest.spyOn(component, 'openWarningModal');

		component.close();
		expect(component.openWarningModal).toHaveBeenCalled();
	});

	it('should close the dialog if the warning was confirmed', () => {
		jest.spyOn(dialogService, 'message').mockReturnValue({
			afterClosed: jest.fn(() => of(true)),
		} as any);

		jest.spyOn(dialogRefStub, 'close');

		component.openWarningModal();

		expect(dialogRefStub.close).toHaveBeenCalledWith(false);
	});

	it('should create the user and close the dialog', () => {
		component.createUserForm.get('firstName')?.setValue('First Name');
		component.createUserForm.get('lastName')?.setValue('Last Name');
		component.createUserForm.get('email')?.setValue('Email');

		jest.spyOn(dialogRefStub, 'close');
		jest.spyOn(component as any, 'formValuesToCreateUserDto');

		component.createUser();

		expect(component['formValuesToCreateUserDto']).toHaveReturnedWith(
			new CreateUserDto('First Name', 'Last Name', 'Email'),
		);

		expect(dialogRefStub.close).toHaveBeenCalledWith(true);
		expect(userServiceMock.createUser).toHaveBeenCalled();
	});
});
