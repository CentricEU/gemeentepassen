import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SupplierProfileService } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill';
import { CentricCounterMessages } from '@windmill/ng-windmill';
import { of, Subject } from 'rxjs';

import { RejectSupplierDto } from '../../_models/reject-supplier-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { SupplierReviewPopupComponent } from './supplier-review-popup.component';

describe('SupplierReviewPopupComponent', () => {
	let component: SupplierReviewPopupComponent;
	let fixture: ComponentFixture<SupplierReviewPopupComponent>;
	let dialogRef: MatDialogRef<SupplierReviewPopupComponent>;
	let dialogService: DialogService;
	let supplierServiceMock: jest.Mocked<MunicipalitySupplierService>;
	let supplierProfileServiceMock: jest.Mocked<SupplierProfileService>;
	let translateServiceMock: jest.Mocked<TranslateService>;

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(async () => {
		translateServiceMock = {
			onLangChange: new Subject(),
			instant: jest.fn().mockImplementation((key: string) => {
				const translations: any = {
					'general.label.charactersLeft': 'Characters left',
					'general.label.charactersOverTheLimit': 'Characters over the limit',
				};
				return translations[key] || key;
			}),
		} as any;

		supplierServiceMock = {
			approveSupplier: jest.fn(() => of()),
			rejectSupplier: jest.fn(() => of()),
		} as any;

		supplierProfileServiceMock = {
			supplierProfileInformation: {
				supplierId: 'testSupplierId',
			},
		} as any;

		dialogRef = {
			disableClose: true,
			close: jest.fn(),
			backdropClick: jest.fn(() => of({})),
			updateSize: jest.fn(),
		} as unknown as MatDialogRef<SupplierReviewPopupComponent>;

		dialogService = {
			message: jest.fn(() => ({
				afterClosed: jest.fn(() => of(true)),
			})),
		} as unknown as DialogService;

		const environmentMock = {
			production: false,
			envName: 'dev',
			apiPath: '/api',
		};

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [SupplierReviewPopupComponent],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				HttpClientModule,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
				BrowserModule,
			],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: {} },
				{ provide: MatDialogRef, useValue: dialogRef },
				{ provide: DialogService, useValue: dialogService },
				{ provide: 'env', useValue: environmentMock },
				{ provide: MunicipalitySupplierService, useValue: supplierServiceMock },
				{ provide: SupplierProfileService, useValue: supplierProfileServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SupplierReviewPopupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('close method', () => {
		it('should close the dialog without warning when form is empty', () => {
			component.close();
			expect(dialogRef.close).toHaveBeenCalled();
		});

		it('should open the warning modal when form is touched', () => {
			jest.spyOn(component, 'openWarningModal');
			component.rejectSupplierForm.get('rejectionComments')?.setValue('comment');

			component.close();

			expect(component.openWarningModal).toHaveBeenCalled();
		});
	});

	describe('reject supplier method', () => {
		it('should call supplierService.rejectSupplier with the correct DTO if there is a supplier id', () => {
			component.rejectSupplierForm.get('rejectionComments')?.setValue('comment');
			component.rejectSupplierForm.get('rejectionReason')?.setValue('Not in region');

			const expectedDto = new RejectSupplierDto(
				component['mapRejectionStringToEnum']['Not in region'],
				'testSupplierId',
				'comment',
			);

			component.rejectSupplier();

			expect(supplierServiceMock.rejectSupplier).toHaveBeenCalledWith(expectedDto);
			expect(dialogRef.close).toHaveBeenCalled();
		});

		it('should not attempt to reject a supplier if there is no supplier id present', () => {
			supplierProfileServiceMock.supplierProfileInformation.supplierId = undefined;

			component.rejectSupplier();

			expect(supplierServiceMock.rejectSupplier).not.toHaveBeenCalled();
		});
	});

	describe('setIsRejecting method', () => {
		it.each([
			[false, '80%', false],
			[true, '790px', true],
		])(
			'should set isRejecting to %s and set the dialog width to %s when called with %s',
			(input, expectedSize, expectedIsRejecting) => {
				component.setIsRejecting(input);

				expect(component.isRejecting).toEqual(expectedIsRejecting);
				expect(dialogRef.updateSize).toHaveBeenCalledWith(expectedSize);
			},
		);
	});

	it('should not approve the supplier if supplierId is not available', () => {
		supplierProfileServiceMock.supplierProfileInformation.supplierId = undefined;

		component.approveSupplier();

		expect(supplierServiceMock.approveSupplier).not.toHaveBeenCalled();
	});

	it('should call supplierService.approveSupplier if supplierId is present', () => {
		component.approveSupplier();

		expect(supplierServiceMock.approveSupplier).toHaveBeenCalledWith('testSupplierId');
		expect(dialogRef.close).toHaveBeenCalled();
	});

	describe('dropdown with reasons', () => {
		test.each([
			['b', ['apple', 'banana', 'cherry', 'date'], ['banana']],
			['bAnAnA', ['Apple', 'Banana', 'Cherry', 'Date'], ['Banana']],
		])('should update the source when event is %s', (event, reasonDropdownSource, expectedUpdatedSource) => {
			component.reasonDropdownSource = reasonDropdownSource;
			component.onSearchValueChanged(event);

			expect(component.reasonUpdatedSource).toEqual(expectedUpdatedSource);
		});

		it('should not update the source on null input', () => {
			const reasonDropdownSource = ['tenant1', 'tenant2', 'tenent3', 'tenent4'];
			component.reasonDropdownSource = reasonDropdownSource;
			component.onSearchValueChanged(null);
			expect(component.reasonUpdatedSource).toEqual(reasonDropdownSource);
		});
	});

	it('should update counterMessages when language changes', () => {
		const newCounterMessages: CentricCounterMessages = {
			validLengthText: 'general.label.charactersLeft',
			invalidLengthText: 'general.label.charactersOverTheLimit',
		};

		translateServiceMock.instant = jest.fn().mockImplementation((key: string) => {
			const translations: any = {
				'general.label.charactersLeft': 'characters left',
				'general.label.charactersOverTheLimit': 'characters over the limit',
			};
			return translations[key] || key;
		});

		translateServiceMock.onLangChange.next({
			lang: 'en',
			translations: {},
		});

		expect(component.counterMessages).toEqual(newCounterMessages);
	});
});
