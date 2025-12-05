import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GrantDto, GrantHolder, GrantService } from '@frontend/common';
import { CustomDialogComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService, ToastrService } from '@windmill/ng-windmill';
import { of, throwError } from 'rxjs';

import { AppModule } from '../../../app.module';
import { CreateGrantFormFields } from '../../../enums/create-grant-form-field.enum';
import { CreateGrantComponent } from './create-grant.component';

describe('CreateGrantComponent', () => {
	let fixture: ComponentFixture<CreateGrantComponent>;

	const dialogRefStub = {
		close: () => undefined,
		afterClosed: () => undefined,
		backdropClick: jest.fn(() => of({})),
	};

	let grantServiceMock: any;
	let translateService: TranslateService;
	let dialogServiceMock: any;

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	const toastrServiceMock = {
		success: jest.fn(),
	};

	beforeEach(async () => {
		grantServiceMock = {
			createGrant: jest.fn().mockReturnValue(of(null)),
			editGrant: jest.fn().mockImplementation(() => throwError(new Error('Error saving grant'))),
		};

		dialogServiceMock = {
			message: jest.fn(),
			prompt: jest.fn(),
			afterClosed: jest.fn(() => of({})),
		};

		global.ResizeObserver = require('resize-observer-polyfill');
		await TestBed.configureTestingModule({
			declarations: [CreateGrantComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				HttpClientModule,
				AppModule,
			],
			providers: [
				FormBuilder,
				TranslateService,
				{ provide: MatDialogRef, useValue: dialogRefStub },
				{ provide: GrantService, useValue: grantServiceMock },
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: ToastrService, useValue: toastrServiceMock },
			],
		}).compileComponents();
	});

	function setup(matDialogDataValue?: any): any {
		TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: matDialogDataValue });
		fixture = TestBed.createComponent(CreateGrantComponent);
		const comp = fixture.componentInstance;
		translateService = TestBed.inject(TranslateService);
		fixture.detectChanges();
		return comp;
	}

	it('should create', () => {
		const component = setup(null);
		expect(component).toBeTruthy();
	});

	it('should show a success message and close the dialog when saveNewGrant is successful', () => {
		const component = setup(null);

		const toastText = 'grants.success';
		jest.spyOn(component['translateService'], 'instant').mockReturnValue(toastText);
		grantServiceMock.createGrant.mockReturnValue(of({}));

		const toastrSpy = jest.spyOn(toastrServiceMock, 'success');
		const dialogRefSpy = jest.spyOn(dialogRefStub, 'close');

		component.createGrantForm.controls['startDate'].setValue('2023-01-01');
		component.createGrantForm.controls['expirationDate'].setValue('2023-12-31');
		component.createGrantForm.controls['title'].setValue('Grant Title');
		component.createGrantForm.controls['description'].setValue('Grant Description');
		component.createGrantForm.controls['amount'].setValue('100');
		component.createGrantForm.controls['createFor'].setValue('grants.cardHolder');

		component.saveGrant();

		expect(toastrSpy).toHaveBeenCalledWith(toastText, '', { toastBackground: 'toast-light' });
		expect(dialogRefSpy).toHaveBeenCalled();
	});

	it('should close the dialog when close method is called', () => {
		const component = setup(null);
		jest.spyOn(dialogRefStub, 'close');

		component.close();

		expect(dialogRefStub.close).toHaveBeenCalled();
	});

	it('should mark title as invalid if empty', () => {
		const component = setup(null);
		const titleControl = component.createGrantForm.get('title');
		titleControl?.setValue('');
		expect(titleControl?.valid).toBeFalsy();
	});

	it('should clear expiration date if start date is after expiration date', () => {
		const component = setup(null);
		component.createGrantForm.controls['startDate'].setValue(new Date('2023-01-01'));
		component.createGrantForm.controls['expirationDate'].setValue(new Date('2022-12-31'));
		component.onStartDateChange();
		expect(component.createGrantForm.controls['expirationDate'].value).toBe('');
	});

	it('should return false when neither control is touched', () => {
		const component = setup(null);
		expect(component.displayValidityError()).toBeFalsy();
	});

	it('should return true when one control is touched and invalid and the other is untouched', () => {
		const component = setup(null);
		component.createGrantForm.controls['startDate'].setValue('');
		component.createGrantForm.controls['startDate'].markAsTouched();
		expect(component.displayValidityError()).toBeTruthy();
	});

	it('should return true when one control is touched and invalid and the other is untouched', () => {
		const component = setup(null);
		component.createGrantForm.controls['expirationDate'].setValue('');
		component.createGrantForm.controls['expirationDate'].markAsTouched();
		expect(component.displayValidityError()).toBeTruthy();
	});

	it('should return false when expirationDate is valid and touched, startDate is untouched', () => {
		const component = setup(null);
		component.createGrantForm.controls['expirationDate'].setValue('2023-12-31');
		component.createGrantForm.controls['expirationDate'].markAsTouched();

		expect(component.displayValidityError()).toBeFalsy();
	});

	it('should return false when startDate is valid and touched, expirationDate is untouched', () => {
		const component = setup(null);
		component.createGrantForm.controls['startDate'].setValue('2023-01-01');
		component.createGrantForm.controls['startDate'].markAsTouched();

		expect(component.displayValidityError()).toBeFalsy();
	});

	it('should return false when both controls are touched and valid', () => {
		const component = setup(null);
		component.createGrantForm.controls['startDate'].setValue('2023-01-01');
		component.createGrantForm.controls['startDate'].markAsTouched();

		component.createGrantForm.controls['expirationDate'].setValue('2023-12-31');
		component.createGrantForm.controls['expirationDate'].markAsTouched();

		expect(component.displayValidityError()).toBeFalsy();
	});

	it('should return true when both controls are touched and invalid', () => {
		const component = setup(null);
		component.createGrantForm.controls['startDate'].setValue('');
		component.createGrantForm.controls['startDate'].markAsTouched();
		component.createGrantForm.controls['startDate'].setErrors({ invalid: true });

		component.createGrantForm.controls['expirationDate'].setValue('');
		component.createGrantForm.controls['expirationDate'].markAsTouched();
		component.createGrantForm.controls['expirationDate'].setErrors({ invalid: true });

		expect(component.displayValidityError()).toBeTruthy();
	});

	it('should create form with expected form controls', () => {
		const component = setup(null);
		const form = component.createGrantForm;
		expect(form.contains('title')).toBeTruthy();
		expect(form.contains('description')).toBeTruthy();
		expect(form.contains('amount')).toBeTruthy();
		expect(form.contains('createFor')).toBeTruthy();
		expect(form.contains('startDate')).toBeTruthy();
		expect(form.contains('expirationDate')).toBeTruthy();
	});

	it('should return translated validity error message', () => {
		const component = setup(null);
		jest.spyOn(translateService, 'instant').mockReturnValue('validity error message');
		const errorMessage = component.getErrorMessageFormInputs(CreateGrantFormFields.validity);
		expect(errorMessage).toBe('validity error message');
		expect(translateService.instant).toHaveBeenCalledWith('grants.validityFormControlRequired');
	});

	it('should return null for an unrecognized form field', () => {
		const component = setup(null);
		const errorMessage = component.getErrorMessageFormInputs('unrecognizedField');
		expect(errorMessage).toBeNull();
	});

	it('should call createGrant with mapped data owner', () => {
		const component = setup(null);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component, 'close').mockImplementation(() => {});

		component.createGrantForm.setValue({
			title: 'Title',
			description: 'Description',
			amount: '123',
			createFor: component.typeOfHolder[0],
			startDate: new Date('2023-01-01'),
			expirationDate: new Date('2022-12-31'),
		});

		const expectedData = {
			title: 'Title',
			description: 'Description',
			amount: '123',
			createFor: GrantHolder.PASS_OWNER,
			startDate: '2023-01-01',
			expirationDate: '2022-12-31',
		};

		component.saveGrant();

		expect(grantServiceMock.createGrant).toHaveBeenCalledWith(expectedData);
	});

	it('should call createGrant with mapped data child', () => {
		const component = setup(null);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component, 'close').mockImplementation(() => {});

		component.createGrantForm.setValue({
			title: 'Title',
			description: 'Description',
			amount: '123',
			createFor: component.typeOfHolder[1],
			startDate: new Date('2023-01-01'),
			expirationDate: new Date('2022-12-31'),
		});

		const expectedData = {
			title: 'Title',
			description: 'Description',
			amount: '123',
			createFor: GrantHolder.PASS_CHILD,
			startDate: '2023-01-01',
			expirationDate: '2022-12-31',
		};

		component.saveGrant();

		expect(grantServiceMock.createGrant).toHaveBeenCalledWith(expectedData);
	});

	it('should return false if control is null', () => {
		const component = setup(null);
		component.createGrantForm = new FormGroup({});

		const result = component['isControlInvalid']('controlName');

		expect(result).toBe(undefined);
	});

	it('should return false if control is not touched', () => {
		const component = setup(null);
		const control = new FormControl('', [Validators.required]);
		component.createGrantForm = new FormGroup({
			controlName: control,
		});

		const result = component['isControlInvalid']('controlName');

		expect(result).toBe(false);
	});

	it('should return true if control is touched and invalid', () => {
		const component = setup(null);
		const control = new FormControl('', [Validators.required]);
		control.markAsTouched();
		component.createGrantForm = new FormGroup({
			controlName: control,
		});

		const result = component['isControlInvalid']('controlName');

		expect(result).toBe(true);
	});

	it('should call editGrant and update it with mapped data owner1', async () => {
		const component = setup(new GrantDto('1', 'title', 'desc', 10, GrantHolder.PASS_OWNER, new Date(), new Date()));

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component, 'close').mockImplementation(() => {});

		const expectedData = new GrantDto('1', 'title', 'desc', 10, GrantHolder.PASS_OWNER, new Date(), new Date());

		component.saveGrant();

		fixture.whenStable().then(() => {
			expect(grantServiceMock.editGrant).toHaveBeenCalledWith(expectedData);
		});
	});

	it('should call close and open warning modal', async () => {
		const component = setup(new GrantDto('1', 'title', 'desc', 10, GrantHolder.PASS_OWNER, new Date(), new Date()));

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		jest.spyOn(component, 'close').mockImplementation(() => {});
		component.isEditable = true;
		component.close('testValue');
		fixture.whenStable().then(() => {
			expect(component.close).toHaveBeenCalledWith('testValue');
		});
	});

	it('should call close and open warning modal', async () => {
		const component = setup(new GrantDto('1', 'title', 'desc', 10, GrantHolder.PASS_OWNER, new Date(), new Date()));

		jest.spyOn(component, 'close'); // Spy on the close method
		jest.spyOn(component.dialogRef, 'close'); // Spy on the dialogRef.close method
		jest.spyOn(component.dialogService, 'message').mockReturnValue({
			afterClosed: () => of(true), // Mock the dialogService message method to return observable
		});

		component.isEditable = true;
		component.close('testValue');

		fixture.whenStable().then(() => {
			expect(component.close).toHaveBeenCalledWith('testValue');
			expect(component.dialogService.message).toHaveBeenCalledWith(CustomDialogComponent, expect.any(Object));
			expect(component.dialogRef.close).toHaveBeenCalledWith('testValue');
		});
	});

	it('should show success toast when editGrant succeeds', () => {
		const mockGrantData = new GrantDto('1', 'title', 'desc', 10, GrantHolder.PASS_OWNER, new Date(), new Date());
		const component = setup(mockGrantData);

		jest.spyOn(component.toastrService, 'success');

		grantServiceMock.editGrant.mockReturnValue(of({ success: true }));

		component.saveGrant();

		expect(grantServiceMock.editGrant).toHaveBeenCalledWith(
			expect.objectContaining({
				id: '1',
				title: 'title',
			}),
		);

		expect(component.toastrService.success).toHaveBeenCalled();

		expect(component.toastrService.success).toHaveBeenCalledWith(
			component.translateService.instant('general.success.changesSavedText'),
			'',
			{ toastBackground: 'toast-light' },
		);
	});
});
