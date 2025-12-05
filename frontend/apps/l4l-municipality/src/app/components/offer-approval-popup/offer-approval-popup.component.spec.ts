import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WarningDialogData } from '@frontend/common';
import { CustomDialogComponent, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CentricToastrModule, DialogService, ToastrService } from '@windmill/ng-windmill';
import { of } from 'rxjs';

import { RejectOfferDto } from '../../_models/reject-offer-dto.model';
import { PendingOffersService } from '../../pending-offers.service';
import { OfferApprovalPopupComponent } from './offer-approval-popup.component';

describe('OfferApprovalPopupComponent', () => {
	let component: OfferApprovalPopupComponent;
	let fixture: ComponentFixture<OfferApprovalPopupComponent>;
	let dialogRef: MatDialogRef<OfferApprovalPopupComponent>;
	let dialogService: DialogService;
	let toastrService: ToastrService;
	let translateService: TranslateService;
	let pendingOfferService: jest.Mocked<PendingOffersService>;

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		pendingOfferService = {
			approveOffer: jest.fn(() => of()),
			rejectOffer: jest.fn(() => of()),
		} as any;

		dialogRef = {
			close: jest.fn(),
			backdropClick: jest.fn(() => of({})),
			updateSize: jest.fn(),
		} as any;

		dialogService = {
			message: jest.fn(() => ({
				afterClosed: jest.fn(() => of(true)),
			})),
		} as unknown as DialogService;

		toastrService = {
			success: jest.fn(),
		} as any;

		const mockDialogData = {
			offer: { id: 'testOfferId' },
		};

		const environmentMock = {
			production: false,
			envName: 'dev',
			apiPath: '/api',
		};

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [OfferApprovalPopupComponent],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				HttpClientModule,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				CentricToastrModule.forRoot(),
				BrowserModule,
			],
			providers: [
				{ provide: 'env', useValue: environmentMock },
				ToastrService,
				TranslateService,
				{ provide: MAT_DIALOG_DATA, useValue: mockDialogData },
				{ provide: PendingOffersService, useValue: pendingOfferService },
				{ provide: DialogService, useValue: dialogService },
				{ provide: MatDialogRef, useValue: dialogRef },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(OfferApprovalPopupComponent);
		translateService = TestBed.inject(TranslateService);
		toastrService = TestBed.inject(ToastrService);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('close method', () => {
		it('should close dialog on close if rejection form is not filled', () => {
			component.close();
			expect(dialogRef.close).toHaveBeenCalled();
		});

		it('should open the warning dialog on close if rejection form is filled', () => {
			jest.spyOn(component, 'openWarningModal');
			component.rejectionForm.get('rejectionReason')?.setValue('reason');

			component.close();

			expect(component.openWarningModal).toHaveBeenCalled();
		});
	});

	describe('setIsRejecting method', () => {
		it.each([
			[true, '790px', true],
			[false, '80%', false],
		])(
			'should set isRejecting to %s and set the dialog width to %s when called with %s',
			(input, expectedSize, expectedIsRejecting) => {
				component.setIsRejecting(input);

				expect(component.isRejecting).toEqual(expectedIsRejecting);
				expect(dialogRef.updateSize).toHaveBeenCalledWith(expectedSize);
			},
		);
	});

	describe('offer rejection', () => {
		it('should reject the offer and display a success message', () => {
			component.rejectionForm.get('rejectionReason')?.setValue('reason');

			jest.spyOn(translateService, 'instant').mockReturnValue('Successful Rejection');
			jest.spyOn(pendingOfferService, 'rejectOffer').mockReturnValue(of(undefined));
			jest.spyOn(toastrService, 'success');
			jest.spyOn(component as any, 'createRejectOfferDto');

			component.rejectOffer();

			expect(component['createRejectOfferDto']).toHaveReturnedWith(new RejectOfferDto('testOfferId', 'reason'));
			expect(pendingOfferService.rejectOffer).toHaveBeenCalledWith(new RejectOfferDto('testOfferId', 'reason'));
			expect(toastrService.success).toHaveBeenCalledWith('Successful Rejection', '', {
				toastBackground: 'toast-light',
			});
			expect(dialogRef.close).toHaveBeenCalledWith(true);
		});

		it('should create the correct RejectOfferDto', () => {
			component.rejectionForm.get('rejectionReason')?.setValue('reason');

			const actualDto = component['createRejectOfferDto']();
			const expectedDto = new RejectOfferDto('testOfferId', 'reason');

			expect(expectedDto).toEqual(actualDto);
		});
	});

	describe('offer approval', () => {
		it('should call approve offer if id is present', () => {
			component.approveOffer();

			expect(pendingOfferService.approveOffer).toHaveBeenCalledWith('testOfferId');
		});

		it('should call approveOffer on approveOffer method', () => {
			jest.spyOn(translateService, 'instant').mockReturnValue('Successful Approval');
			jest.spyOn(pendingOfferService, 'approveOffer').mockReturnValue(of(undefined));
			jest.spyOn(toastrService, 'success');

			component.approveOffer();

			expect(pendingOfferService.approveOffer).toHaveBeenCalledWith('testOfferId');
			expect(toastrService.success).toHaveBeenCalledWith('Successful Approval', '', {
				toastBackground: 'toast-light',
			});
			expect(dialogRef.close).toHaveBeenCalledWith(true);
		});
	});

	describe('warning modal', () => {
		it('should display the warning dialog', () => {
			jest.spyOn(dialogService as any, 'message');

			component.openWarningModal();

			expect((dialogService as any).message).toHaveBeenCalledWith(CustomDialogComponent, {
				autoFocus: true,
				data: {
					acceptButtonText: 'general.button.cancel',
					acceptButtonType: 'button-warning',
					cancelButtonText: 'general.button.stay',
					cancelButtonType: 'button-link-dark',
					comments: '',
					disableClosing: false,
					fileName: '',
					mainContent: '',
					modalTypeClass: 'warning',
					optionalText: new WarningDialogData(),
					secondaryContent: 'rejectOffer.leavingWarning',
					title: 'general.warning',
					tooltipColor: 'theme',
				},
				disableClose: false,
				width: '400px',
			});
		});

		it('should close the "Review Offer" popup after confirmation', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue({
				afterClosed: jest.fn(() => of(true)),
			} as any);

			jest.spyOn(dialogRef, 'close');

			component.openWarningModal();

			expect(dialogRef.close).toHaveBeenCalledWith(false);
		});

		it('should not close the "Review Offer" popup if dismissed', () => {
			jest.spyOn(dialogService, 'message').mockReturnValue({
				afterClosed: jest.fn(() => of(false)),
			} as any);

			jest.spyOn(dialogRef, 'close');

			component.openWarningModal();

			expect(dialogRef.close).not.toHaveBeenCalledWith(false);
		});
	});
});
