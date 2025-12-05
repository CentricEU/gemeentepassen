import 'resize-observer-polyfill';

import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GenericStatusEnum, GrantHolder } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { WindmillModule } from '../../windmil.module';
import { OfferInformationComponent } from './offer-information.component';

describe('OfferInformationComponent', () => {
	let component: OfferInformationComponent;
	let fixture: ComponentFixture<OfferInformationComponent>;
	let translate: TranslateService;
	const formBuilder: FormBuilder = new FormBuilder();

	beforeEach(async () => {
		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [OfferInformationComponent],
			imports: [
				WindmillModule,
				CommonModule,
				FormsModule,
				HttpClientModule,
				TranslateModule.forRoot(),
				ReactiveFormsModule,
				BrowserAnimationsModule,
			],
			providers: [TranslateService, { provide: FormBuilder, useValue: formBuilder }, DatePipe],
		}).compileComponents();

		fixture = TestBed.createComponent(OfferInformationComponent);
		component = fixture.componentInstance;
		translate = TestBed.inject(TranslateService);

		component.offerInformation = formBuilder.group({
			citizenOfferType: [''],
			title: [''],
			offerTypeId: [''],
			acceptedGrants: [''],
			description: [''],
			startDate: [''],
			expirationDate: [''],
		});

		component.offer = {
			citizenOfferType: 'CITIZEN_WITH_PASS',
			title: 'Test Offer',
			offerType: 'Test Offer Type',
			grants: [
				{
					title: 'Grant 1',
					description: 'description',
					amount: 12,
					createFor: GrantHolder.PASS_OWNER,
					startDate: new Date(),
					expirationDate: new Date(),
					selected: true,
					isCheckboxDisabled: false,
				},
				{
					title: 'Grant 2',
					description: 'description',
					amount: 12,
					createFor: GrantHolder.PASS_OWNER,
					startDate: new Date(),
					expirationDate: new Date(),
					selected: true,
					isCheckboxDisabled: false,
				},
			],
			description: 'Test Description',
			startDate: new Date('2024-02-12'),
			expirationDate: new Date('2024-02-15'),
			supplierId: 'test',
			status: GenericStatusEnum.PENDING,
			selected: true,
			isCheckboxDisabled: false,
			validity: 'test',
		};

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize form with correct values', () => {
		const datePipe = new DatePipe('en-US');

		const formValues = component.offerInformation.value;

		expect(formValues.citizenOfferType).toBe('offer.citizenWithPass');
		expect(formValues.title).toBe('Test Offer');
		expect(formValues.offerTypeId).toBe('Test Offer Type');
		expect(formValues.acceptedGrants).toBe('Grant 1, Grant 2');
		expect(formValues.description).toBe('Test Description');
		expect(datePipe.transform(formValues.startDate, 'yyyy-MM-dd')).toBe('2024-02-12');
		expect(datePipe.transform(formValues.expirationDate, 'yyyy-MM-dd')).toBe('2024-02-15');
	});

	describe('getAcceptedGrants', () => {
		it('should return an empty string when offer.grants is undefined', () => {
			const offer = {
				citizenOfferType: 'CITIZEN_WITH_PASS',
				title: 'Test Offer',
				offerType: 'Test Offer Type',
				grants: undefined,
				description: 'Test Description',
				startDate: new Date('2024-02-12'),
				expirationDate: new Date('2024-02-15'),
				supplierId: 'test',
				status: GenericStatusEnum.PENDING,
				selected: true,
				isCheckboxDisabled: false,
				validity: 'test',
			};
			const result = component['getAcceptedGrants'](offer);
			expect(result).toBe('');
		});

		it('should return concatenated titles separated by commas', () => {
			const offer = {
				citizenOfferType: 'CITIZEN_WITH_PASS',
				title: 'Test Offer',
				offerType: 'Test Offer Type',
				grants: [
					{
						title: 'Grant 1',
						description: 'description',
						amount: 12,
						createFor: GrantHolder.PASS_OWNER,
						startDate: new Date(),
						expirationDate: new Date(),
						selected: true,
						isCheckboxDisabled: false,
					},
					{
						title: 'Grant 2',
						description: 'description',
						amount: 12,
						createFor: GrantHolder.PASS_OWNER,
						startDate: new Date(),
						expirationDate: new Date(),
						selected: true,
						isCheckboxDisabled: false,
					},
				],
				description: 'Test Description',
				startDate: new Date('2024-02-12'),
				expirationDate: new Date('2024-02-15'),
				supplierId: 'test',
				status: GenericStatusEnum.PENDING,
				selected: true,
				isCheckboxDisabled: false,
				validity: 'test',
			};

			const result = component['getAcceptedGrants'](offer);
			expect(result).toBe('Grant 1, Grant 2');
		});

		it('should handle empty titles gracefully', () => {
			const offer = {
				citizenOfferType: 'CITIZEN_WITH_PASS',
				title: 'Test Offer',
				offerType: 'Test Offer Type',
				grants: [
					{
						title: '',
						description: 'description',
						amount: 12,
						createFor: GrantHolder.PASS_OWNER,
						startDate: new Date(),
						expirationDate: new Date(),
						selected: true,
						isCheckboxDisabled: false,
					},
					{
						title: 'Grant 2',
						description: 'description',
						amount: 12,
						createFor: GrantHolder.PASS_OWNER,
						startDate: new Date(),
						expirationDate: new Date(),
						selected: true,
						isCheckboxDisabled: false,
					},
				],
				description: 'Test Description',
				startDate: new Date('2024-02-12'),
				expirationDate: new Date('2024-02-15'),
				supplierId: 'test',
				status: GenericStatusEnum.PENDING,
				selected: true,
				isCheckboxDisabled: false,
				validity: 'test',
			};

			const result = component['getAcceptedGrants'](offer);
			expect(result).toBe(', Grant 2');
		});
	});
});
