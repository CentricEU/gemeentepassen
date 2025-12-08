import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RegexUtil } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ValidatorService } from 'angular-iban';

import { WindmillModule } from '../../windmil.module';
import { BankInputComponent } from './bank-input.component';

describe('BankInputComponent', () => {
	let component: BankInputComponent;
	let fixture: ComponentFixture<BankInputComponent>;
	let translate: TranslateService;
	let mockRouter: { url: string };

	beforeEach(async () => {
		const environmentMock = {
			production: false,
			envName: 'dev',
			apiPath: '/api',
		};

		mockRouter = { url: '/some-url' };

		const formBuilder: FormBuilder = new FormBuilder();

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [BankInputComponent],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				HttpClientModule,
				TranslateModule.forRoot(),
				ReactiveFormsModule,
				BrowserAnimationsModule,
			],
			providers: [
				TranslateService,
				{ provide: 'env', useValue: environmentMock },
				{ provide: FormBuilder, useValue: formBuilder },
				{ provide: Router, useValue: mockRouter },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(BankInputComponent);
		component = fixture.componentInstance;
		translate = TestBed.inject(TranslateService);
		component.formGroup = formBuilder.group({
			iban: [
				Validators.required,
				ValidatorService.validateIban,
				Validators.pattern(RegexUtil.dutchIbanRegexPattern),
			],
			bic: [Validators.pattern(RegexUtil.dutchBicRegexPattern)],
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('getErrorMessageForBankInputs (parameterized)', () => {
		it('should return null if control does not exist', () => {
			const result = component.getErrorMessageForBankInputs('nonExisting');
			expect(result).toBeNull();
		});

		it('should return null if control has no errors', () => {
			const controlName = 'iban';
			component.formGroup.addControl(controlName, new FormControl('valid'));
			component.formGroup.get(controlName)?.setErrors(null);

			const result = component.getErrorMessageForBankInputs(controlName);
			expect(result).toBeNull();
		});

		describe('getErrorMessageForBankInputs', () => {
			test.each([
				[
					'returns required error message for IBAN',
					'iban',
					{ required: true },
					'generalInformation.ibanFormControlRequired',
				],
				['returns pattern error message for BIC', 'bic', { pattern: true }, 'generalInformation.bicInvalid'],
				['returns IBAN-specific error message', 'iban', { iban: true }, 'generalInformation.ibanInvalid'],
				['returns null when control does not exist', 'nonexistent', null, null],
				['returns null when control has unknown error type', 'bic', { minlength: true }, null],
				[
					'returns BIC-IBAN mismatch error message',
					'bic',
					{ ibanBicMismatch: true },
					'generalInformation.mismatchedBicIban',
				],
			])('%s', (_, controlName, errors, expectedTranslationKey) => {
				if (errors !== null) {
					component.formGroup.addControl(controlName, new FormControl('test'));
					if (errors !== undefined) {
						component.formGroup.get(controlName)?.setErrors(errors);
					}
				}

				if (expectedTranslationKey) {
					jest.spyOn(translate, 'instant').mockReturnValue(expectedTranslationKey);
				}

				const result = component.getErrorMessageForBankInputs(controlName);
				expect(result).toBe(expectedTranslationKey);
			});
		});
	});
});
