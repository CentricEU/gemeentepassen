import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService, TenantService } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { BankDetailsDialogComponent } from './bank-details-dialog.component';

describe('BankDetailsDialogComponent', () => {
	let component: BankDetailsDialogComponent;
	let fixture: ComponentFixture<BankDetailsDialogComponent>;
	let dialogRefMock: Partial<MatDialogRef<unknown>>;
	let authServiceMock: any;
	let navigationServiceMock: any;
	let tenantServcieMock: any;

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		dialogRefMock = {
			close: jest.fn(),
		};

		authServiceMock = {
			logout: jest.fn(),
		};

		tenantServcieMock = {
			saveBankInformation: jest.fn(),
		};

		navigationServiceMock = {
			reloadCurrentRoute: jest.fn(),
		};

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [BankDetailsDialogComponent],
			imports: [MatDialogModule, TranslateModule.forRoot()],
			providers: [
				{ provide: MatDialogRef, useValue: dialogRefMock },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: TenantService, useValue: tenantServcieMock },
				TranslateService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(BankDetailsDialogComponent);
		component = fixture.componentInstance;

		(component as any).authService = authServiceMock;
		(component as any).navigationService = navigationServiceMock;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call logout, close dialogRef, and reload current route', () => {
		const closeSpy = jest.spyOn((component as any).dialogRef, 'close');

		component.logout();

		expect(authServiceMock.logout).toHaveBeenCalled();
		expect(closeSpy).toHaveBeenCalled();
		expect(navigationServiceMock.reloadCurrentRoute).toHaveBeenCalled();
	});

	describe('openWarningModal', () => {
		let dialogServiceMock: any;

		beforeEach(() => {
			dialogServiceMock = {
				message: jest.fn(),
			};
			(component as any).dialogService = dialogServiceMock;
		});

		it('should open warning modal and close dialogRef when result is true', () => {
			const afterClosedMock = {
				subscribe: jest.fn((cb: (result: boolean) => void) => cb(true)),
			};
			dialogServiceMock.message.mockReturnValue({ afterClosed: () => afterClosedMock });
			const closeSpy = jest.spyOn((component as any).dialogRef, 'close');

			component.openWarningModal();

			expect(dialogServiceMock.message).toHaveBeenCalled();
			expect(closeSpy).toHaveBeenCalledWith(false);
		});

		it('should open warning modal and not close dialogRef when result is false', () => {
			const afterClosedMock = {
				subscribe: jest.fn((cb: (result: boolean) => void) => cb(false)),
			};
			dialogServiceMock.message.mockReturnValue({ afterClosed: () => afterClosedMock });
			const closeSpy = jest.spyOn((component as any).dialogRef, 'close');

			component.openWarningModal();

			expect(dialogServiceMock.message).toHaveBeenCalled();
			expect(closeSpy).not.toHaveBeenCalled();
		});

		it('should do nothing if message returns undefined', () => {
			dialogServiceMock.message.mockReturnValue(undefined);
			const closeSpy = jest.spyOn((component as any).dialogRef, 'close');

			component.openWarningModal();

			expect(dialogServiceMock.message).toHaveBeenCalled();
			expect(closeSpy).not.toHaveBeenCalled();
		});
	});

	describe('finishSetup', () => {
		it('should not call saveBankInformation or close dialog if form is invalid', () => {
			component.bankInformationForm.setErrors({ invalid: true });

			const saveSpy = jest.spyOn((component as any).tenantService, 'saveBankInformation');
			const closeSpy = jest.spyOn((component as any).dialogRef, 'close');

			component.finishSetup();

			expect(saveSpy).not.toHaveBeenCalled();
			expect(closeSpy).not.toHaveBeenCalled();
		});

		it('should call saveBankInformation and close dialog on successful save', () => {
			component.bankInformationForm.setValue({
				iban: 'NL91ABNA0417164300',
				bic: 'ABNANL2A',
			});

			expect(component.bankInformationForm.valid).toBe(true);

			(component as any).tenantService.saveBankInformation.mockReturnValue(of({}));

			const saveSpy = jest.spyOn((component as any).tenantService, 'saveBankInformation');
			const closeSpy = jest.spyOn((component as any).dialogRef, 'close');

			component.finishSetup();

			expect(saveSpy).toHaveBeenCalledWith(component.bankInformationForm.value);
			expect(closeSpy).toHaveBeenCalledWith(true);
		});
	});
});
